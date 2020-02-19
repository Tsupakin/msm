using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.OracleClient;
using System.Web.Configuration;

namespace MSMHub
{
    public class issue : IHttpHandler
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
                    case "GetWip":
                        wrapper = GetWip(context);
                        break;
                    case "Get":
                        wrapper = Get(context);
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

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        private DataTable Get(HttpContext context)
        {

            String job = GetRequest.Param(context, "job");//dt.Rows[0]["JOB_ID"].ToString();
            String step = GetRequest.Param(context, "step");//
            String wdept = GetRequest.Param(context, "wdept");//
            String tool = GetRequest.Param(context, "tool");//


            DataTable dt = o.Execute(String.Format(@"SELECT JOB_ID FROM KPDBA.MSM_WIP_DETAIL  
                                           WHERE JOB_ID = '{0}'
                                           AND WRKC_ID = '{1}'
                                           AND WDEPT_ID = '{2}'
                                           AND TOOLS_ID = '{3}'
                                           AND TO_CHAR(WIP_DATE, 'DD/MM/YYYY') = TO_CHAR(SYSDATE, 'DD/MM/YYYY') 
                                           AND END_TIME IS NULL
                                           ORDER BY SEQ_NO DESC", job, step, wdept, tool));
            dt.TableName = "END_TIME";


            return dt;
        }

        private DataSet GetWip(HttpContext context)
        {
            DataSet ds = new DataSet();

            string mach = GetRequest.Param(context, "mach");
            DataTable dt = o.Execute(@"SELECT J.JOB_ID, J.JOB_DESC, WH.TOOLS_ID, SUBSTR(WH.TOOLS_ID, 1, 4) AS MACH_ID ,C.STEP_ID,C.STEP_SEQ,C.SEQ_RUN,C.WDEPT_ID, WH.CR_USER_ID
                                         FROM KPDBA.WIP_HEADER WH, KPDBA.JOB J ,KPDBA.JOB_STEP C
                                         WHERE WH.JOB_ID = J.JOB_ID 
                                         AND (WH.JOB_ID = C.JOB_ID) 
                                         AND (WH.WDEPT_ID = C.WDEPT_ID) 
                                         AND (WH.WRKC_ID = C.STEP_ID) 
                                         AND WH.RUN_REC_STATUS <> 'C' 
                                         AND TRUNC(WIP_DATE) >= TRUNC(SYSDATE - 1)
                                         AND SUBSTR(WH.TOOLS_ID, 1, 4) = '" + mach + "'");
            dt.TableName = "WIP_HEADER";
            ds.Tables.Add(dt);

            if (dt.Rows.Count > 0)
            {
                String job = dt.Rows[0]["JOB_ID"].ToString();
                String step = dt.Rows[0]["STEP_ID"].ToString();
                String wdept = dt.Rows[0]["WDEPT_ID"].ToString();
                String tool = dt.Rows[0]["TOOLS_ID"].ToString();

                dt = GetWipAct(wdept);
                dt.TableName = "WIP_ACT";
                ds.Tables.Add(dt);

                dt = o.Execute(String.Format(@"SELECT JOB_ID FROM KPDBA.MSM_WIP_DETAIL  
                                           WHERE JOB_ID = '{0}'
                                           AND WRKC_ID = '{1}'
                                           AND WDEPT_ID = '{2}'
                                           AND TOOLS_ID = '{3}'
                                           AND TO_CHAR(WIP_DATE, 'DD/MM/YYYY') = TO_CHAR(SYSDATE, 'DD/MM/YYYY') 
                                           AND END_TIME IS NULL
                                           ORDER BY SEQ_NO DESC", job, step, wdept, tool));
                dt.TableName = "END_TIME";
                ds.Tables.Add(dt);
            }

            return ds;
        }
        private DataTable GetWipAct(string wdept)
        {
            //string wdept = GetRequest.Param(context, "wdept");
            //DataTable dt = o.Execute(String.Format("SELECT ACT_ID, ACT_DESC FROM KPDBA.WIP_ACT WHERE CANCEL_FLAG = 'F' AND WDEPT_ID = '{0}' ORDER BY ACT_DESC ASC", wdept));
            DataTable dt = o.Execute(String.Format("SELECT ACT_ID, ACT_DESC, MSM_UNIT FROM KPDBA.MSM_WIP_ACT WHERE WDEPT_ID = '{0}' ORDER BY ACT_DESC ASC", wdept));
            return dt;
        }
        private string UpdateWipAct(HttpContext context)
        {
            string job = GetRequest.Param(context, "job");
            string step = GetRequest.Param(context, "step");
            string wdept = GetRequest.Param(context, "wdept");
            string tool = GetRequest.Param(context, "tool");

            OracleDataAdapter da = o.GatDataAdapter(String.Format(@"SELECT * FROM KPDBA.MSM_WIP_DETAIL  
                                                                    WHERE JOB_ID = '{0}'
                                                                    AND WRKC_ID = '{1}'
                                                                    AND WDEPT_ID = '{2}'
                                                                    AND TOOLS_ID = '{3}'
                                                                    AND END_TIME IS NULL
                                                                    AND TO_CHAR(WIP_DATE, 'dd/MM/yyyy') = TO_CHAR(SYSDATE, 'dd/MM/yyyy') ORDER BY SEQ_NO DESC", job, step, wdept, tool));
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
                dt.Rows[0]["WIP_FLAG"] = "F";
            }
            da.Update(dt);

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
            string unit = GetRequest.Param(context, "unit");

            OracleDataAdapter da = o.GatDataAdapter(String.Format(@"SELECT * FROM KPDBA.MSM_WIP_DETAIL  
                                                                    WHERE JOB_ID = '{0}'
                                                                    AND WRKC_ID = '{1}'
                                                                    AND WDEPT_ID = '{2}'
                                                                    AND TOOLS_ID = '{3}'
                                                                    AND TO_CHAR(WIP_DATE, 'DD/MM/YYYY') = TO_CHAR(SYSDATE, 'DD/MM/YYYY') ORDER BY SEQ_NO DESC", job, step, wdept, tool));
            DataTable dt = new DataTable();
            da.Fill(dt);

            int seq = 0;
            if (dt.Rows.Count > 0) { seq = Convert.ToInt16(dt.Rows[0]["SEQ_NO"].ToString()); seq++; }

            DataRow dr = dt.NewRow();
            dr["JOB_ID"] = job;
            dr["WRKC_ID"] = step;
            dr["WDEPT_ID"] = Convert.ToInt16(wdept);
            dr["TOOLS_ID"] = tool;
            dr["WIP_DATE"] = DateTime.Today;// Convert.ToDateTime(DateTime.Now.ToString("DD/MM/YYYY"));
            dr["ACT_ID"] = act;
            dr["START_TIME"] = DateTime.Now;
            //dr["END_TIME"] = "";
            dr["ACT_TYPE"] = type;
            dr["CR_DATE"] = DateTime.Now;
            dr["CR_ORG_ID"] = "KPR";
            dr["CR_USER_ID"] = user;
            dr["SEQ_NO"] = seq;
            dr["UNIT_RES"] = unit;

            dt.Rows.Add(dr);
            da.Update(dt);

            return "";
        }
    }
}