using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace MSMHub
{
    /// <summary>
    /// Summary description for overtime
    /// </summary>
    public class overtime : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            context.Response.AppendHeader("Access-Control-Allow-Origin", "*");

            string mach = GetRequest.Param(context, "mach");
            DataTable dt = Sql.Execute(String.Format(@"SELECT COUNT(*) - 15
                                                        FROM dbo.MACH_HIS 
                                                        WHERE MACH_ID = '{0}'
                                                        AND LAST_GET > (SELECT MAX(LAST_GET)
                                                        FROM dbo.MACH_HIS 
                                                        WHERE MACH_ID = '{0}'
                                                        AND (STATUS = 2 OR STATUS = 3))", mach));
            context.Response.Write(dt.Rows[0][0].ToString());
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