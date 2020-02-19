using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.SessionState;

namespace MSMHub
{
    /// <summary>
    /// Summary description for sendJob
    /// </summary>
    public class sendJob : IHttpHandler, IRequiresSessionState
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            MsmHub mh = new MsmHub();

            DataRow[] _dr = Data.dtCurrJob.Select("MACH_ID='2025'");
            if (_dr.Length > 0)
            {
                //mh.SendCurrJob(_dr[0]["JOB_ID"].ToString(), _dr[0]["JOB_DESC"].ToString());
            }
            context.Response.Write("Hello World");
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