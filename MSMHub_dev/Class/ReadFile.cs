using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;

namespace MSMHub
{
    public class ReadFile
    {
        public static string Path(string path)
        {
            if (File.Exists(path))
            {
                return File.ReadAllText(path);
            }
            return "";
        }
    }
}