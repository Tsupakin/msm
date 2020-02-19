using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Configuration;

namespace MSMHub
{
    /// <summary>
    /// Summary description for laststatus
    /// </summary>
    public class laststatus : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            context.Response.AppendHeader("Access-Control-Allow-Origin", "*");

            string mach = GetRequest.Param(context, "mach");
            string job = GetRequest.Param(context, "job");



            context.Response.Write(Msm.GetLastWorkStatus(job,mach));
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