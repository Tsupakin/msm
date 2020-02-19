using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSMHub
{
    /// <summary>
    /// Summary description for _ref
    /// </summary>
    public class _ref : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            MsmHub mh = new MsmHub();
            mh.Refresh("");
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