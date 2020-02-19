using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;

namespace MSMHub
{
    /// <summary>
    /// Summary description for dash
    /// </summary>
    public class dash : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            try
            {
                context.Response.ContentType = "text/plain";
                context.Response.AppendHeader("Access-Control-Allow-Origin", "*");
                string mode = context.Request.Form["mode"];
                if (mode == null) { mode = HttpContext.Current.Request.QueryString["mode"]; }
                object wrapper = null;
                switch (mode)
                {
                    case "GetData":
                        wrapper = GetData(context);
                        break;
                    case "Execute":
                        wrapper = Execute(context);
                        break;
                    case "OracleExecute":
                        wrapper = OracleExecute(context);
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

        private string getSql(string num)
        {
            DataTable dt = Sql.Execute("SELECT * FROM SQL_TAB WHERE SQL_ID = '" + num + "'");
            if (dt.Rows.Count > 0)
            {
                return dt.Rows[0]["SQL"].ToString();
            }
            return "";
        }

        public DataTable GetData(HttpContext context)
        {
            string cal = context.Request.Form["cal"] == null ? HttpContext.Current.Request.QueryString["cal"] : context.Request.Form["cal"];
            string mach = context.Request.Form["mach"] == null ? HttpContext.Current.Request.QueryString["mach"] : context.Request.Form["mach"];
            string num = context.Request.Form["num"] == null ? HttpContext.Current.Request.QueryString["num"] : context.Request.Form["num"];
            string year = context.Request.Form["year"] == null ? HttpContext.Current.Request.QueryString["year"] : context.Request.Form["year"];
            string month = context.Request.Form["month"] == null ? HttpContext.Current.Request.QueryString["month"] : context.Request.Form["month"];

            DataTable dt = Sql.Execute(String.Format(@"SELECT D AS DAY,null AS ACTUAL,null AS TARGET FROM  PORTAL_PROD..YMD WHERE M = {0} AND Y= {1};", month, year));

            DataTable dtAct = Sql.Execute(String.Format(getSql("MSMD"+num), month, year, mach));

            foreach (DataRow dr in dtAct.Rows)
            {
                DataRow[] _dr = dt.Select("DAY=" + dr["DAY"].ToString());
                if (_dr.Length > 0)
                {
                    _dr[0]["ACTUAL"] = dr["ACTUAL"];
                }
            }

            DataTable dtTarget = Sql.Execute(String.Format(@"SELECT V{0} AS TARGET FROM KPI_KPR..KPI_TARGET
                                                                WHERE KPI_ID = {2}
                                                                AND TARGET_LEVEL = 'M'
                                                                AND LEVEL_ID = '{3}'
                                                                AND KPI_YEAR = {1};",
                                                                    Convert.ToInt16(month).ToString("00"),
                                                                    year,
                                                                    num,
                                                                    mach));

            if (dtTarget.Rows.Count > 0)
            {
                double target = Convert.ToDouble(dtTarget.Rows[0]["TARGET"].ToString());
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    if (cal == "SUM")
                    {
                        dt.Rows[i]["TARGET"] = (target / dt.Rows.Count) * (i + 1);
                    }
                    else
                    {
                        dt.Rows[i]["TARGET"] = dtTarget.Rows[0]["TARGET"];
                    }
                }
            }

            return dt;
        }

        public DataTable Execute(HttpContext context)
        {
            string mach = context.Request.Form["mach"] == null ? HttpContext.Current.Request.QueryString["mach"] : context.Request.Form["mach"];
            string num = context.Request.Form["num"] == null ? HttpContext.Current.Request.QueryString["num"] : context.Request.Form["num"];
            string year = context.Request.Form["year"] == null ? HttpContext.Current.Request.QueryString["year"] : context.Request.Form["year"];
            string month = context.Request.Form["month"] == null ? HttpContext.Current.Request.QueryString["month"] : context.Request.Form["month"];

            return Sql.Execute(String.Format(getSql(num), mach, year, month));
        }
        public DataTable OracleExecute(HttpContext context)
        {
            Oracle o = new Oracle("KPRPROD.KIMPAI.COM");
            string mach = context.Request.Form["mach"] == null ? HttpContext.Current.Request.QueryString["mach"] : context.Request.Form["mach"];
            string num = context.Request.Form["num"] == null ? HttpContext.Current.Request.QueryString["num"] : context.Request.Form["num"];
            string year = context.Request.Form["year"] == null ? HttpContext.Current.Request.QueryString["year"] : context.Request.Form["year"];
            string month = context.Request.Form["month"] == null ? HttpContext.Current.Request.QueryString["month"] : context.Request.Form["month"];

            return o.Execute(String.Format(getSql(num), mach, year, month));
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