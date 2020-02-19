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
                        wrapper = new { result = insertTime(context) };
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

        private string insertTime(HttpContext context)
        {
            try
            {
                dynamic data = JsonConvert.DeserializeObject<dynamic>(context.Request.Form["data"]);
                
                o.Execute("");

                return "";
            }
            catch (Exception ex)
            {
                return ex.Message;
            }


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