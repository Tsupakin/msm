using System;
using System.Web;
using System.Linq;
using System.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Globalization;

namespace MSMHub
{
    /// <summary>
    /// Summary description for actionCheck
    /// </summary>
    public class actionCheck : IHttpHandler
    {
        Oracle o = new Oracle("KPRPROD.KIMPAI.COM");
        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";

            context.Response.AppendHeader("Access-Control-Allow-Origin", "*");

            try
            {
                context.Response.ContentType = "text/plain";
                string fn = context.Request.Form["fn"];
                object wrapper = null;

                switch (fn)
                {
                    case "insertTime":
                        wrapper = insertTime(context);
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

        private DataTable insertTime(HttpContext context)
        {
            string JobID = context.Request.Form["JobID"];
            string WrkcID = context.Request.Form["WrkcID"];
            string WdeptID = context.Request.Form["WdeptID"];
            string ToolsID = context.Request.Form["ToolsID"];
            string WipDate = context.Request.Form["WipDate"];
            string WipPseq = context.Request.Form["WipPseq"];
            string WalType = context.Request.Form["WalType"];
            string WipUserID = context.Request.Form["WipUserID"];
            string TotDamageQty = context.Request.Form["TotDamageQty"];
            //ตัวจำนวนครั้ง
            string WalSeq = "0";
            string ORGUser = "";
            if (WipUserID != "")
            {                
                ORGUser = Sql.GetString(o.Execute("select ORG_ID from EMPLOYEE where EMP_ID = '" + WipUserID + "'"), 0);
            }

            if (JobID != "" && WrkcID != "" && WdeptID != "" && ToolsID != "" && WalType != "")
            {
                string check_em_row = Sql.GetString(o.Execute("select JobID from KPDBA.WIP_AWAITING_LOG where JOB_ID = '" + JobID + "' AND WRKC_ID = '" + WrkcID + "' AND WDEPT_ID = '" + WdeptID + "' AND TOOLS_ID = '" + ToolsID + "' AND WAL_TYPE = '" + WalType + "'"), 0);
                //เช็คว่าเคยมีค่าอยู่หรือไม่ ถ้าทีแล้ว
                if (check_em_row != "")
                {
                    WalSeq = Sql.GetString(o.Execute("select MAX( WAL_SEQ ) from KPDBA.WIP_AWAITING_LOG where JOB_ID = '" + JobID + "' AND WRKC_ID = '" + WrkcID + "' AND WDEPT_ID = '" + WdeptID + "' AND TOOLS_ID = '" + ToolsID + "' AND WAL_TYPE = '" + WalType + "'"), 0);
                    string check_end = Sql.GetString(o.Execute("select END_DATE from KPDBA.WIP_AWAITING_LOG where JOB_ID = '" + JobID + "' AND WRKC_ID = '" + WrkcID + "' AND WDEPT_ID = '" + WdeptID + "' AND TOOLS_ID = '" + ToolsID + "' AND WAL_TYPE = '" + WalType + "' AND WAL_SEQ = '" + WalSeq + "'"), 0);

                    if (check_end == null)
                    {
                        if (WalType == "001")
                        {
                            o.Execute("UPDATE KPDBA.WIP_AWAITING_LOG SET END_DATE = sysdate, END_ORG_ID = '" + ORGUser + "', END_USER_ID = '" + WipUserID + "' WHERE JOB_ID = '" + JobID + "' AND WRKC_ID = '" + WrkcID + "' AND WDEPT_ID = '" + WdeptID + "' AND TOOLS_ID = '" + ToolsID + "' AND WAL_TYPE = '" + WalType + "' AND WAL_SEQ = '" + WalSeq + "'");
                        }
                        else if ((WalType == "002" || WalType == "003" || WalType == "004") && TotDamageQty != "")
                        {
                            o.Execute("UPDATE KPDBA.WIP_AWAITING_LOG SET END_DATE = sysdate, END_ORG_ID = '" + ORGUser + "', END_USER_ID = '" + WipUserID + "' , TOT_DAMAGE_QTY = '" + TotDamageQty + "' WHERE JOB_ID = '" + JobID + "' AND WRKC_ID = '" + WrkcID + "' AND WDEPT_ID = '" + WdeptID + "' AND TOOLS_ID = '" + ToolsID + "' AND WAL_TYPE = '" + WalType + "' AND WAL_SEQ = '" + WalSeq + "'");
                        }
                    }
                    else {
                        int sum_WalSeq = Int32.Parse(WalSeq) + 1;
                        WalSeq = sum_WalSeq.ToString();
                    }
                }
                //ไม่มีข้อมูลอยู่
                else
                {
                    WalSeq = "1";
                    o.Execute("INSERT INTO KPDBA.WIP_AWAITING_LOG (JOB_ID,WRKC_ID,WDEPT_ID,TOOLS_ID,WIP_DATE,WIP_PSEQ,WAL_TYPE,WAL_SEQ,TOT_DAMAGE_QTY,START_DATE,START_ORG_ID,START_USER_ID,END_DATE,END_ORG_ID,END_USER_ID,CANCEL_FLAG,CANCEL_DATE,CANCEL_ORG_ID,CANCEL_USER_ID,CHK1ST_START_DATE,CHK1ST_START_ORG_ID,CHK1ST_START_USER_ID,CHK1ST_END_DATE,CHK1ST_END_ORG_ID,CHK1ST_END_USER_ID) VALUES ('" + JobID + "','" + WrkcID + "'," + WdeptID + ",'" + ToolsID + "','" + WipDate + "'," + WipPseq + ",'" + WalType + "'," + WalSeq + ",null, sysdate,'" + ORGUser + "','" + WipUserID + "',null,null,null,'F',null,null,null,null,null,null,null,null,null)");
                }
            }

            DataTable dt_sum = new DataTable("DT_SUM");
            dt_sum.Columns.Add("WAL_SEQ");

            dt_sum.Rows.Add(WalSeq);
            return dt_sum;

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