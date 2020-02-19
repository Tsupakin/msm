using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSMHub
{
    public static class Format
    {
        public static string AddSingleQ(this string str)
        {
            return "'" + str + "'";
        }
    }
}