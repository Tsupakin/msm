using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using Newtonsoft.Json;

namespace MSMHub
{
    /// <summary>
    /// Summary description for agv
    /// </summary>
    public class agv : IHttpHandler
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
                    case "Update":
                        wrapper = new { result = Update(context) };
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

        private string Update(HttpContext context)
        {
            string status = GetRequest.Param(context, "status");
            string mach = GetRequest.Param(context, "mach");
            o.Execute(
                String.Format(
                    "UPDATE KPDBA.MACH_AGV_STATUS SET AGV_STATUS = '{0}', LAST_STATUS_UPDATE = SYSDATE, STATUS_UPDATE_BY = 'MSM' WHERE MACH_ID = '{1}'",
                    status, mach
                )
            );
            return status;
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