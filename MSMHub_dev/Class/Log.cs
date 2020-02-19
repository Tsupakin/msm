using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSMHub
{
    public class Log
    {
        public static void Insert(string user, string desc, string type)
        {
            object obj = Sql.Execute("INSERT INTO ACTION_LOG VALUES (GETDATE(),'" + user + "','" + desc + "','" + type + "')");
        }
    }
}