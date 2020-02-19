using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using System.Data;
using Newtonsoft.Json;

namespace MSMHub
{
    public class MsmHub : Hub
    {
        public void Hello()
        {
            Clients.All.hello();
        }
        private static IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<MsmHub>();

        public void Refresh(string mach)
        {
            hubContext.Clients.All.refresh();
            //Groups.Add(
        }
        public void ClearAlert(string groupName,string lastUpdate)
        {
            DataRow[] _dr = Data.dtLastUpdate.Select("MACH_ID='" + groupName + "'");
            if (_dr.Length > 0)
            {
                _dr[0]["LAST_UPDATE"] = lastUpdate;
            }
            else
            {
                Data.dtLastUpdate.Rows.Add(lastUpdate, groupName);
            }
            Data.dtLastUpdate.AcceptChanges();

            _dr = Data.dtReg.Select("MACH_ID='" + groupName + "'");
            foreach (DataRow dr in _dr)
            {
                hubContext.Clients.Client(dr["SOCKET_ID"].ToString()).clearAlert(lastUpdate);
            }
        }
        public void JoinGroup(string groupName)
        {
            DataRow[] _dr = Data.dtReg.Select("SOCKET_ID='" + Context.ConnectionId + "'");
            if (_dr.Length == 0)
            {
                Groups.Add(Context.ConnectionId, groupName);
                Data.dtReg.Rows.Add(Context.ConnectionId, groupName);
            }
        }
        public void ClearGroup(string groupName)
        {
            DataRow[] _dr = Data.dtReg.Select("SOCKET_ID='" + Context.ConnectionId + "'");
            foreach (DataRow dr in _dr)
            {
                Groups.Remove(Context.ConnectionId, groupName);
                dr.Delete();
            }
            Data.dtReg.AcceptChanges();
        }

        public void SendCurrJobInfo()
        {
            try
            {
                foreach (DataRow dr in Data.dtReg.Rows)
                {
                    string jobID = "", jobDesc = "", statusID = "", currSpeed = "", timeStamp = "", jobStatusID = "", toolID = "";
                    object lastUpdate = null;
                    DataRow[] _dr = Data.dtCurrJob.Select("MACH_ID='" + dr["MACH_ID"].ToString() + "'");
                    if (_dr.Length > 0)
                    {
                        jobID = _dr[0]["JOB_ID"].ToString();
                        jobDesc = _dr[0]["JOB_DESC"].ToString();
                        toolID = _dr[0]["TOOLS_ID"].ToString();
                    }

                    _dr = Data.dtStatus.Select("MACH_ID='" + dr["MACH_ID"].ToString() + "'");
                    if (_dr.Length > 0)
                    {
                        statusID = _dr[0]["STATUS"].ToString();
                        currSpeed = _dr[0]["CURRENT_SPEED"].ToString();
                        lastUpdate = _dr[0]["LAST_GET"];
                        timeStamp = _dr[0]["LAST_SEC"].ToString();
                    }

                    object useTime = "", setTime = "", runTime = "", agvStatus = "";
                    _dr = Data.dtWip.Select("TOOLS_ID='" + dr["MACH_ID"].ToString() + "' AND JOB_ID='" + jobID + "'", "INT_START_TIME DESC");
                    if (_dr.Length > 0)
                    {
                        useTime = _dr[0]["MIN_ALL_JOB"];
                        setTime = _dr[0]["MIN_SETUP"];
                        runTime = Convert.ToInt16(_dr[0]["MIN_ALL_JOB"]) - Convert.ToInt16(_dr[0]["MIN_SETUP"]);
                        jobStatusID = _dr[0]["STATUS"].ToString();
                    }

                    _dr = Data.dtAgv.Select("MACH_ID='" + dr["MACH_ID"].ToString() + "'");
                    if (_dr.Length > 0)
                    {
                        agvStatus = _dr[0]["AGV_STATUS"];
                    }
                    
                    hubContext.Clients.Client(dr["SOCKET_ID"].ToString()).recCurrJobInfo(jobID,
                                                                                      jobDesc,
                                                                                      statusID,
                                                                                      jobStatusID,
                                                                                      currSpeed,
                                                                                      lastUpdate.ToString(),
                                                                                      timeStamp,
                                                                                      useTime.ToString(),
                                                                                      setTime.ToString(),
                                                                                      runTime.ToString(),
                                                                                      agvStatus.ToString(),
                                                                                      toolID);
                }
            }
            catch (Exception ex)
            {

            }
        }
    }
}