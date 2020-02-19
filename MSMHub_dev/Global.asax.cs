using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Routing;
using Microsoft.AspNet.SignalR;
using System.Data;
using Newtonsoft.Json;

namespace MSMHub
{
    public class Global : System.Web.HttpApplication, IRequiresSessionState
    {

        protected void Application_Start(object sender, EventArgs e)
        {
            RouteTable.Routes.MapHubs(new HubConfiguration { EnableCrossDomain = true });


            Data.dtReg = Sql.Execute("SELECT '' AS SOCKET_ID, '' AS MACH_ID");
            Data.dtReg.Rows[0].Delete();
            Data.dtReg.AcceptChanges();

            Data.dtLastUpdate = Sql.Execute("SELECT '' AS LAST_UPDATE, '' AS MACH_ID");
            Data.dtLastUpdate.Rows[0].Delete();
            Data.dtLastUpdate.AcceptChanges();

            Msm.UpdateCurrJob();
            Msm.UpdateStatus();
            Msm.UpdatePlan();
            Msm.UpdateWip();
            Msm.UpdateAgvStatus();
            Msm.GetMach();

            EasyTimer.SetTimeout(() =>
            {
                Msm.SendCurrJobInfo();
            }, 20000);
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {

        }
    }
}