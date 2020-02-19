using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSMHub
{
    public class GetRequest
    {
        public static string Param(HttpContext context, string name)
        {
            if (context.Request.QueryString[name] != null)
            {
                return context.Request.QueryString[name].ToString();
            }
            else if (context.Request.Form[name] != null)
            {
                return context.Request.Form[name].ToString();
            }
            else
            {
                return "";
            }
        }
    }
}