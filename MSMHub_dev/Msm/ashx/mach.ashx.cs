using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace MSMHub
{
    /// <summary>
    /// Summary description for mach
    /// </summary>
    public class mach : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            context.Response.AppendHeader("Access-Control-Allow-Origin", "*");
            context.Response.Write(JsonConvert.SerializeObject(Data.dtMach));
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