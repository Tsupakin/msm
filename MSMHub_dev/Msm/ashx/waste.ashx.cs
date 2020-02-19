using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OracleClient;
using System.Linq;
using System.Web;
using System.Web.Configuration;

namespace MSMHub
{
    /// <summary>
    /// Summary description for waste
    /// </summary>
    public class waste : IHttpHandler
    {
        private Oracle o = new Oracle(WebConfigurationManager.AppSettings["OracleConnect"]);
        public void ProcessRequest(HttpContext context)
        {
            try
            {
                context.Response.ContentType = "text/plain";
                context.Response.AppendHeader("Access-Control-Allow-Origin", "*");

                string fn = GetRequest.Param(context, "fn");
                object wrapper = null;
                switch (fn)
                {
                    case "GetWasteForm":
                        wrapper = new { result = GetWasteForm(context) };
                        break;
                    case "SaveWaste":
                        wrapper = new { result = SaveWaste(context) };
                        break;
                    case "DelWaste":
                        wrapper = new { result = DelWaste(context) };
                        break;
                    case "SaveWipAct":
                        wrapper = new { result = SaveWipAct(context) };
                        break;
                    case "UpdateWipAct":
                        wrapper = new { result = UpdateWipAct(context) };
                        break;
                }
                context.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(wrapper));
            }
            catch (Exception ex)
            {
                var wrapper = new { result = ex.Message };
                context.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(wrapper));
            }
        }
        private string UpdateWipAct(HttpContext context)
        {
            string job = GetRequest.Param(context, "job");
            string step = GetRequest.Param(context, "step");
            string wdept = GetRequest.Param(context, "wdept");
            string tool = GetRequest.Param(context, "tool");

            OracleDataAdapter da = o.GatDataAdapter(String.Format(@"SELECT * FROM KPDBA.MSM_WIP_DETAIL  
                                                                    WHERE JOB_ID = '{0}', 
                                                                    AND WRKC_ID = '{1}', 
                                                                    AND WDEPT_ID = '{2}', 
                                                                    AND TOOLS_ID = '{3}', 
                                                                    AND WIP_DATE = TO_DATE(SYSDATE, 'DD/MM/YYYY') ORDER BY SEQ_NO DESC", job, step, wdept, tool));
            DataTable dt = new DataTable();
            da.Fill(dt);

            if (dt.Rows.Count > 0)
            {
                DateTime d = Convert.ToDateTime(dt.Rows[0]["START_TIME"]);
                DateTime dtn = DateTime.Now;

                TimeSpan span = dtn.Subtract(d);

                dt.Rows[0]["END_TIME"] = dtn;
                dt.Rows[0]["HOUR_USED"] = span.Hours;
                dt.Rows[0]["MIN_USED"] = span.Minutes;
            }

            return "";
        }
        private string SaveWipAct(HttpContext context)
        {
            string job = GetRequest.Param(context, "job");
            string step = GetRequest.Param(context, "step");
            string wdept = GetRequest.Param(context, "wdept");
            string tool = GetRequest.Param(context, "tool");
            string act = GetRequest.Param(context, "act");
            string type = GetRequest.Param(context, "type");
            string user = GetRequest.Param(context, "user");
            string status = GetRequest.Param(context, "status");

            OracleDataAdapter da = o.GatDataAdapter(String.Format(@"SELECT * FROM KPDBA.MSM_WIP_DETAIL  
                                                                    WHERE JOB_ID = '{0}'
                                                                    AND WRKC_ID = '{1}'
                                                                    AND WDEPT_ID = '{2}'
                                                                    AND TOOLS_ID = '{3}'
                                                                    AND WIP_DATE = TO_DATE(SYSDATE, 'DD/MM/YYYY') ORDER BY SEQ_NO DESC", job, step, wdept, tool));
            DataTable dt = new DataTable();
            da.Fill(dt);

            int seq = 0;
            if (dt.Rows.Count > 0) { seq = Convert.ToInt16(dt.Rows[0]["SEQ_NO"].ToString()); }

            DataRow dr = dt.NewRow();
            dr["JOB_ID"] = job;
            dr["WRKC_ID"] = step;
            dr["WDEPT_ID"] = Convert.ToInt16(wdept);
            dr["TOOLS_ID"] = tool;
            dr["WIP_DATE"] = Convert.ToDateTime(DateTime.Now.ToString("DD/MM/YYYY"));
            dr["ACT_ID"] = act;
            dr["START_TIME"] = DateTime.Now;
            //dr["END_TIME"] = "";
            dr["ACT_TYPE"] = status;
            dr["CR_DATE"] = DateTime.Now;
            dr["CR_ORG_ID"] = "KPR";
            dr["CR_USER_ID"] = user;
            dr["SEQ_NO"] = seq;

            dt.Rows.Add(dr);
            da.Update(dt);

            return "";
        }
        private string DelWaste(HttpContext context)
        {
            string json = GetRequest.Param(context, "param");
            dynamic d = JsonConvert.DeserializeObject<dynamic>(json);
            o.Execute(
                String.Format(
                    "UPDATE KPDBA.MSM_WASTE SET CANCEL_FLAG = 'T' WHERE GEN_PK = '{0}' AND IN_MACH_ID = '{1}' AND IN_JOB_ID = '{2}' AND IN_STEP_ID = '{3}'",
                    d.gen_pk, d.in_mach_id, d.in_job_id, d.in_step_id
                )
            );
            return "";
        }

        private string SaveWaste(HttpContext context)
        {
            string json = GetRequest.Param(context, "param");
            dynamic d = JsonConvert.DeserializeObject<dynamic>(json);
            string pk = GenChar(15);
            o.Execute(
                String.Format(
                    "INSERT INTO KPDBA.MSM_WASTE VALUES ('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}','{9}','{10}','{11}','{12}','{13}','{14}','{15}','{16}','','F')",
                    pk, d.in_mach_id, d.in_job_id, d.in_step_id, d.unit_id, d.step_id, d.tools_id, d.waste_code, d.split_job_qty, d.retsub_flag, d.expect_unit, d.reject_qty, d.cal_id, d.pallet, d.sub_pallet, d.reject_height, d.split_job_per100
                )
            );

            return pk;
        }

        private DataSet GetWasteForm(HttpContext context)
        {
            string jobID = GetRequest.Param( context,"id");
            string seq = GetRequest.Param(context, "seq");
            string mach = GetRequest.Param(context, "mach");
            string step = GetRequest.Param(context, "step");
            string wdept = GetRequest.Param(context, "wdept");
            DataTable dt = new DataTable();
            DataSet ds = new DataSet();

            dt = o.Execute(String.Format("SELECT  DISTINCT A.STEP_ID, B.STEP_DESC, A.STEP_SEQ, A.SEQ_RUN, A.WDEPT_ID, C.WDEPT_DESC FROM KPDBA.JOB_STEP A, KPDBA.MASTER_JOB_STEP B, KPDBA.WIP_DEPT C WHERE (A.STEP_ID = B.STEP_ID) AND (A.WDEPT_ID = B.WDEPT_ID) AND (A.WDEPT_ID = C.WDEPT_ID) AND (A.JOB_ID = '{0}') ORDER BY A.STEP_SEQ",jobID));
            dt.TableName = "JOB_STEP";  ds.Tables.Add(dt);

            dt = o.Execute(String.Format("SELECT DISTINCT B.WDEPT_ID, A.WDEPT_DESC, A.UNIT_ID FROM KPDBA.WIP_DEPT A, KPDBA.WIP_HEADER B, KPDBA.JOB_STEP C WHERE (A.WDEPT_ID = B.WDEPT_ID) AND (B.WDEPT_ID = C.WDEPT_ID) AND (B.JOB_ID = C.JOB_ID) AND (B.WRKC_ID = C.STEP_ID) AND (B.SEQ_RUN = C.SEQ_RUN) AND (B.JOB_ID = '{0}') AND (C.STEP_SEQ <= '{1}') AND (B.BF_FLAG = 'F') ORDER BY B.WDEPT_ID", jobID,seq));
            dt.TableName = "WIP_DEPT"; ds.Tables.Add(dt);
            string inUnit = "";
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                inUnit += (i == dt.Rows.Count-1 ? "'" + dt.Rows[i]["UNIT_ID"].ToString() + "'" : "'" + dt.Rows[i]["UNIT_ID"].ToString() + "',");
            }

            dt = o.Execute(String.Format("SELECT DISTINCT B.WRKC_ID, A.STEP_DESC, B.WDEPT_ID, B.SEQ_RUN FROM KPDBA.MASTER_JOB_STEP A, KPDBA.WIP_HEADER B, KPDBA.JOB_STEP C WHERE (A.WDEPT_ID = B.WDEPT_ID) AND (A.STEP_ID = B.WRKC_ID) AND (A.WDEPT_ID = C.WDEPT_ID) AND (A.STEP_ID = C.STEP_ID) AND (B.WDEPT_ID = C.WDEPT_ID) AND (B.JOB_ID = C.JOB_ID) AND (B.WRKC_ID = C.STEP_ID) AND (B.SEQ_RUN = C.SEQ_RUN) AND (B.JOB_ID = '{0}') AND (C.STEP_SEQ <= '{1}') AND (B.BF_FLAG = 'F') ORDER BY B.WRKC_ID", jobID, seq));
            dt.TableName = "MASTER_JOB_STEP"; ds.Tables.Add(dt);

            dt = o.Execute(String.Format("SELECT DISTINCT B.TOOLS_ID, A.TOOLS_DESC, B.WDEPT_ID, B.WRKC_ID FROM KPDBA.WIP_TOOLS A, KPDBA.WIP_HEADER B, KPDBA.JOB_STEP C WHERE (A.TOOLS_ID = B.TOOLS_ID) AND (B.WDEPT_ID = C.WDEPT_ID) AND (B.JOB_ID = C.JOB_ID) AND (B.WRKC_ID = C.STEP_ID) AND (B.SEQ_RUN = C.SEQ_RUN) AND (B.JOB_ID = '{0}') AND (C.STEP_SEQ <= '{1}') AND (B.BF_FLAG = 'F') ORDER BY B.TOOLS_ID", jobID, seq));
            dt.TableName = "WIP_TOOLS"; ds.Tables.Add(dt);

            dt = o.Execute(String.Format("SELECT CAUSE_ID, CAUSE_DESC, UNIT_ID FROM KPDBA.RPRS_WASTE_CAUSE WHERE UNIT_ID IN ({0}) ORDER BY CAUSE_ID", inUnit));
            dt.TableName = "RPRS_CAUSE_GRP"; ds.Tables.Add(dt);

            dt = o.Execute(String.Format("SELECT WASTE_CODE, WASTE_DESC, UNIT_ID, CAUSE_ID FROM KPDBA.RPRS_WASTE_CODE WHERE UNIT_ID IN ({0}) ORDER BY WASTE_CODE", inUnit));
            dt.TableName = "RPRS_CAUSE"; ds.Tables.Add(dt);

            dt = o.Execute("SELECT CAL_ID, CAL_DESC, SHEET FROM KPDBA.CALCULATE_STANDARD WHERE CANCEL_FLAG = 'F' ORDER BY CAL_DESC");
            dt.TableName = "CAL_STD"; ds.Tables.Add(dt);

            dt = o.Execute(String.Format("SELECT KPDBA.DF_CALC_UNIT_PER_PAPER ('{0}') AS UNIT_PER_PAPER FROM KPDBA.PROFILE WHERE TOPIC_NAME = 'SYSTEMMODE'", jobID));
            dt.TableName = "PER_PAPER"; ds.Tables.Add(dt);

            dt = o.Execute(String.Format("SELECT GEN_PK, IN_MACH_ID, IN_JOB_ID, IN_STEP_ID, UNIT_ID, STEP_ID, TOOLS_ID, WASTE_CODE, SPLIT_JOB_QTY, RETSUB_FLAG, EXPECT_UNIT, REJECT_QTY, CAL_ID, PALLET, SUB_PALLET, REJECT_HEIGHT, SPLIT_JOB_PER100 FROM KPDBA.MSM_WASTE WHERE IN_MACH_ID = '{0}' AND IN_JOB_ID = '{1}' AND IN_STEP_ID = '{2}' AND CANCEL_FLAG = 'F'",mach, jobID, step));
            foreach (DataColumn dc in dt.Columns) {  dc.ColumnName = dc.ColumnName.ToLower(); }
            dt.TableName = "WASTE_DATA"; ds.Tables.Add(dt);

            dt = o.Execute(String.Format("SELECT ACT_ID, ACT_DESC FROM KPDBA.WIP_ACT WHERE CANCEL_FLAG = 'F' AND WDEPT_ID = '{0}' ORDER BY ACT_DESC ASC", wdept));
            dt.TableName = "WIP_ACT"; ds.Tables.Add(dt);

            return ds;
        }

        private string GenChar(int size)
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            var result = new string(
                Enumerable.Repeat(chars, size)
                          .Select(s => s[random.Next(s.Length)])
                          .ToArray());
            return result;
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}