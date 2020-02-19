using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Configuration;

namespace MSMHub
{
    /// <summary>
    /// Summary description for init
    /// </summary>
    public class init : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            try
            {
                context.Response.ContentType = "text/plain";
                context.Response.AppendHeader("Access-Control-Allow-Origin", "*");

                DataSet ds = new DataSet("DataSet");
                string jobID = "",stepID="";

                string mach = GetRequest.Param(context, "mach");
                DataTable dt = Sql.Execute(String.Format(@"SELECT STATUS,CURRENT_SPEED , DATEDIFF(S, '1970-01-01', LAST_GET) -15 AS LAST_SEC
                                            FROM dbo.MACH_HIS 
                                            WHERE MACH_ID = '{0}'
                                            ORDER BY LAST_GET", mach));

                dt.TableName = "SPEED";

                ds.Tables.Add(dt);
                ds.Tables.Add(GetCurrJobInfo(mach, ref jobID, ref stepID));
                ds.Tables.Add(GetCurrJobPlan(mach, jobID, stepID));
                ds.Tables.Add(GetCurrJobReal(mach, jobID, stepID));
                ds.Tables.Add(GetPlan(mach));
                ds.Tables.Add(GetReal(mach));
                ds.Tables.Add(GetLastUpdate(mach));
                //WIP_AWAITING_LOG
                DataTable _dt = GetWipAwaitingLog(mach, jobID, stepID);
                DataRow[] _drs = _dt.Select("[WAL_TYPE] = '001'");
                DataTable _dt_sel = _drs.Length == 0 ? null : _drs.CopyToDataTable();
                if (_dt_sel != null)
                {
                    _dt_sel.TableName = "WAL_FIRST";
                    ds.Tables.Add(_dt_sel);
                }

                _drs = _dt.Select("[WAL_TYPE] = '002'");
                _dt_sel = _drs.Length == 0 ? null : _drs.CopyToDataTable();
                if (_dt_sel != null) 
                { 
                    _dt_sel.TableName = "WAL_TEST";
                    ds.Tables.Add(_dt_sel);
                }

                _drs = _dt.Select("[WAL_TYPE] = '003'");
                _dt_sel = _drs.Length == 0 ? null : _drs.CopyToDataTable();
                if (_dt_sel != null) 
                { 
                    _dt_sel.TableName = "WAL_PROOF";
                    ds.Tables.Add(_dt_sel);
                }

                _drs = _dt.Select("[WAL_TYPE] = '004'");
                _dt_sel = _drs.Length == 0 ? null : _drs.CopyToDataTable();
                if (_dt_sel != null)
                {
                    _dt_sel.TableName = "WAL_STD_COLOR";
                    ds.Tables.Add(_dt_sel);
                }

                context.Response.Write(JsonConvert.SerializeObject(ds));
            }
            catch (Exception ex)
            {

            }
        }

        public static DataTable GetWipAwaitingLog(string mach, string jobID, string stepID)
        {
            try
            {
                DataRow[] _dr = Data.dtWip.Select("TOOLS_ID='" + mach + "' AND JOB_ID='" + jobID + "'  AND STEP_ID='" + stepID + "'", "INT_START_TIME DESC");
                if (_dr.Length > 0)
                {
                    Oracle o = new Oracle(WebConfigurationManager.AppSettings["OracleConnect"]);
                    string sql = String.Format(@"SELECT JOB_ID, WRKC_ID , TOOLS_ID , WAL_TYPE, WAL_STD_MIN, WDEPT_ID,WIP_DATE, WIP_PSEQ , WAL_SEQ ,  TOT_DAMAGE_QTY , START_DATE  , END_DATE , CHK1ST_START_DATE ,CHK1ST_END_DATE,
                                                   DECODE( WAL_TYPE, '001' , 
                                                  DECODE(CHK1ST_END_DATE , NULL , ROUND ( (SYSDATE - CHK1ST_START_DATE) *24 * 60 )   , ROUND ( (CHK1ST_END_DATE - CHK1ST_START_DATE) *24 * 60 )  
                                                    )  , 
                                                    DECODE(END_DATE , NULL , ROUND ( (SYSDATE - START_DATE) *24 * 60 )  ,ROUND ( (END_DATE - START_DATE) *24 * 60 ) 
                                                     ) )  MIN_ALL_TIME
                                                FROM KPDBA.WIP_AWAITING_LOG JOIN KPDBA.WIP_AWAITING_STD USING (WAL_TYPE)                                                   
                                                WHERE JOB_ID = '{0}' AND WRKC_ID = '{1}' AND WDEPT_ID = '{2}' AND TOOLS_ID = '{3}' AND WIP_DATE = TO_DATE('{4}','dd/mm/yyyy')",
                                                           _dr[0]["JOB_ID"].ToString(), _dr[0]["WRKC_ID"].ToString(), _dr[0]["WDEPT_ID"].ToString(), _dr[0]["WIP_TOOLS_ID"].ToString(), _dr[0]["WIP_DATE"].ToString().Substring(0,10));
                    DataTable dt = o.Execute(sql);
                    dt.TableName = "WIP_AWAITING_LOG";
                    dt.Columns.Add("START_POINT");
                    foreach (DataRow dr in dt.Rows) 
                    { 
                         TimeSpan tp;
                        if (dr["WAL_TYPE"].ToString() == "001")
                            tp = Convert.ToDateTime(dr["CHK1ST_START_DATE"].ToString()) - Convert.ToDateTime(_dr[0]["START_JOB_TIME"].ToString());
                        else
                            tp = Convert.ToDateTime(dr["START_DATE"].ToString()) - Convert.ToDateTime(_dr[0]["START_JOB_TIME"].ToString());
                        dr["START_POINT"] = tp.TotalMinutes;
                    }
                    return dt;
                }
                else
                {
                    return null;
                }
             
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        private static DataTable GetCurrJobReal(string mach, string jobID, string stepID)
        {
            try
            {
                string setupEnd = "";
                object useTime = "", setTime = "", runTime = "", status = "", startJobTime ="";

                DataRow[] _dr = Data.dtWip.Select("TOOLS_ID='" + mach + "' AND JOB_ID='" + jobID + "'  AND STEP_ID='" + stepID + "'", "INT_START_TIME DESC");
                if (_dr.Length > 0)
                {
                    useTime = _dr[0]["MIN_ALL_JOB"];
                    setTime = _dr[0]["MIN_SETUP"];
                    runTime = Convert.ToInt32(_dr[0]["MIN_ALL_JOB"]) - Convert.ToInt32(_dr[0]["MIN_SETUP"]);
                    status = _dr[0]["STATUS"].ToString();
                    startJobTime = _dr[0]["START_JOB_TIME"].ToString();


                    DataRow[] _drPlan = Data.dtPlan.Select("MACH_ID='" + mach + "' AND JOB_ID='" + jobID + "' AND STEP_ID='" + _dr[0]["STEP_ID"].ToString() + "'");
                    if (_drPlan.Length > 0)
                    {
                        setupEnd = Convert.ToDateTime(_dr[0]["START_JOB_TIME"].ToString()).AddMinutes(Convert.ToDouble(_drPlan[0]["SETUP_TIME"])).ToString("HH:mm");
                    }
                    // jobSpeed = _dr[0]["SPEED"];
                }
                DataTable dt = new DataTable("JOB_REAL");
                dt.Columns.Add("USED_TIME");
                dt.Columns.Add("SETUP_TIME");
                dt.Columns.Add("RUN_TIME");
                dt.Columns.Add("STATUS");
                dt.Columns.Add("END_TIME");
                dt.Columns.Add("START_JOB_TIME");

                dt.Rows.Add(useTime, setTime, runTime, status, setupEnd, startJobTime);
                return dt;
            }
            catch (Exception ex)
            {
                Log.Insert("MSM", ex.Message, "GetCurrJobReal");
                return null;
            }
        }
        private static DataTable GetCurrJobPlan(string mach, string jobID, string stepID)
        {
            string jobStart = "", jobEnd = "",setupEnd = "";
            object useTime = "", setTime = "", runTime = "", spdFlag = "*";
            int qty = 0;
            decimal jobSpeed = 0, prod_qty = 0; 
            decimal planSpeed = 0;

            DataRow[] _dr = Data.dtPlan.Select("MACH_ID='" + mach + "' AND JOB_ID='" + jobID + "' AND STEP_ID='" + stepID + "'");
            if (_dr.Length > 0)
            {
                jobStart = _dr[0]["START_TIME"].ToString();
                jobEnd = _dr[0]["END_TIME"].ToString();
                setupEnd = _dr[0]["SETUP_END"].ToString();
                useTime = _dr[0]["USED_TIME"];
                setTime = _dr[0]["SETUP_TIME"];
                runTime = _dr[0]["RUN_TIME"];
                planSpeed = jobSpeed = Convert.ToDecimal(_dr[0]["SPEED"]);
                prod_qty = Convert.ToDecimal(_dr[0]["PRODUCE_QTY"]);
            }
            else
            {
                DataRow[] _drWip = Data.dtWip.Select("TOOLS_ID='" + mach + "' AND JOB_ID='" + jobID + "' AND STEP_ID='" + stepID + "'", "");
                if (_drWip.Length > 0)
                {
                    DataTable dtPlan = Msm.GetPlanByJob(jobID, _drWip[0]["STEP_ID"].ToString(), _drWip[0]["WDEPT_ID"].ToString());
                    if (dtPlan.Rows.Count > 0)
                    {
                        jobStart = dtPlan.Rows[0]["START_TIME"].ToString();
                        jobEnd = dtPlan.Rows[0]["END_TIME"].ToString();
                        setupEnd = dtPlan.Rows[0]["SETUP_END"].ToString();
                        useTime = dtPlan.Rows[0]["USED_TIME"];
                        setTime = dtPlan.Rows[0]["SETUP_TIME"];
                        runTime = dtPlan.Rows[0]["RUN_TIME"];
                        planSpeed = jobSpeed = Convert.ToDecimal(dtPlan.Rows[0]["SPEED"]);
                        prod_qty = Convert.ToDecimal(dtPlan.Rows[0]["PRODUCE_QTY"]);
                    }
                }
            }
            
            Oracle o = new Oracle(WebConfigurationManager.AppSettings["OracleConnect"]);
            DataTable spb = o.Execute(String.Format(@"SELECT SPEED
                                        FROM (SELECT * FROM KPDBA.JOB_DETAIL WHERE JOB_ID = '{0}' AND ROWNUM = 1) J
                                                ,KPDBA.BOM_STEP S
                                        WHERE J.PROD_ID = S.PROD_ID
                                        AND J.REVISION = S.PROD_REVISION
                                        AND S.STEP_ID = '{1}'", jobID, stepID));

            if (spb.Rows.Count > 0)
            {
                if (spb.Rows[0]["SPEED"].ToString().Length > 0)
                {
                    planSpeed = jobSpeed = Convert.ToDecimal(spb.Rows[0]["SPEED"]);
                    spdFlag = "";
                }
            }
            //jobSpeed = 99999;

            string m = mach.Length > 4 ? mach.Substring(0, 4) : mach;
            if (mach.Length > 0 && mach.Substring(0, 1) == "2")
            {
                DataTable dtSetup = o.Execute("select kpdba.df_get_target_setup('"+ m +"') AS VAL from dual");
                DataTable dtSpeed = o.Execute("select kpdba.df_get_target_speed('" + m + "','" + jobID + "') AS VAL from dual ");

                if (dtSetup.Rows.Count > 0)
                {
                    setTime = Convert.ToInt32(dtSetup.Rows[0][0]);
                }
                if (dtSpeed.Rows.Count > 0)
                {
                    jobSpeed = Convert.ToInt32(dtSpeed.Rows[0][0]);
                    spdFlag = "";
                }

                if (jobSpeed < 0)
                {
                    jobSpeed = Convert.ToInt32(planSpeed);
                    spdFlag = "*";
                }

                runTime = Convert.ToInt32((prod_qty / jobSpeed) * 60);

                //string gb = "2021,2024,2025";
                //string gB = "2026,2027,2029,2030,2101,2102,2103,2104,2105";
                //string gc = "2028";
                //if (gb.IndexOf(m) > -1) { setTime = 50; }
                //if (gB.IndexOf(m) > -1) { setTime = 40; }
                //if (gc.IndexOf(m) > -1) { setTime = 35; }

                //string[] ma = new string[] { "2021", "2024", "2025", "2026", "2027", "2028", "2029", "2030", "2101", "2102", "2103", "2104", "2105" };
                //int[] msp = new int[] { 10000, 13000, 13000, 16000, 15000, 13000, 16500, 16000, 16000, 15000, 16000, 16000, 16000 };
                //if (Array.IndexOf(ma, m) > -1) {
                //    jobSpeed = msp[Array.IndexOf(ma, m)];
                //    runTime = Convert.ToInt32((prod_qty / jobSpeed) * 60);
                //}

            }

            DataTable dt = new DataTable("JOB_PLAN");
            dt.Columns.Add("START_TIME");
            dt.Columns.Add("END_TIME");
            dt.Columns.Add("USED_TIME");
            dt.Columns.Add("SETUP_TIME");
            dt.Columns.Add("RUN_TIME");
            dt.Columns.Add("SPEED");
            dt.Columns.Add("SETUP_END");
            dt.Columns.Add("SPEED_FLAG");

            dt.Rows.Add(jobStart, jobEnd, useTime, setTime, runTime, jobSpeed, setupEnd, spdFlag);
            return dt;
        }
        private static DataTable GetCurrJobInfo(string mach, ref string jobID, ref string stepID)
        {
            string jobDesc = "", statusID = "", currSpeed = "", timeStamp = "", step_seq = "", wdept_id = "", seq_run = "";
            object lastUpdate = null;

            DataRow[] _dr = Data.dtCurrJob.Select("MACH_ID='" + mach + "'");
            if (_dr.Length > 0)
            {
                jobID = _dr[0]["JOB_ID"].ToString();
                jobDesc = _dr[0]["JOB_DESC"].ToString();
                stepID = _dr[0]["STEP_ID"].ToString();
                step_seq = _dr[0]["STEP_SEQ"].ToString();
                wdept_id = _dr[0]["WDEPT_ID"].ToString();
                seq_run = _dr[0]["SEQ_RUN"].ToString();
            }

            _dr = Data.dtStatus.Select("MACH_ID='" + mach + "'");
            if (_dr.Length > 0)
            {
                statusID = _dr[0]["STATUS"].ToString();
                currSpeed = _dr[0]["CURRENT_SPEED"].ToString();
                lastUpdate = _dr[0]["LAST_GET"];
                timeStamp = _dr[0]["LAST_SEC"].ToString();
            }

            DataTable dt = new DataTable("JOB_INFO");
            dt.Columns.Add("CURR_JOB_ID");
            dt.Columns.Add("CURR_JOB_DESC");
            dt.Columns.Add("SPEED_STD");
            dt.Columns.Add("CURR_SPEED");
            dt.Columns.Add("CURR_STATUS");
            dt.Columns.Add("CURR_STEP_ID");
            dt.Columns.Add("CURR_STEP_SEQ");
            dt.Columns.Add("CURR_WDEPT_ID");
            dt.Columns.Add("CURR_SEQ_RUN");

            dt.Rows.Add(jobID, jobDesc, Msm.GetSpeedMaster(jobID, mach), currSpeed, statusID, stepID, step_seq, wdept_id, seq_run);
            return dt;
        }
        private static DataTable GetPlan(string mach)
        {
            DataTable dt = new DataTable("PLAN");
            dt.Columns.Add("JOB_ID");
            dt.Columns.Add("USED_TIME");
            dt.Columns.Add("JOB_DESC");
            dt.Columns.Add("STEP_ID");
            dt.Columns.Add("STEP_DESC");
            dt.Columns.Add("SETUP_TIME");
            dt.Columns.Add("RUN_TIME");

            DataRow[] _dr = Data.dtPlan.Select("MACH_ID='" + mach + "'");
            foreach (DataRow dr in _dr)
            {
                dt.Rows.Add(dr["JOB_ID"].ToString(),
                            dr["USED_TIME"],
                            dr["JOB_DESC"].ToString(),
                            dr["STEP_ID"].ToString(),
                            dr["STEP_DESC"].ToString(),
                            dr["SETUP_TIME"].ToString(),
                            dr["RUN_TIME"].ToString());
            }

            return dt;
        }
        private static DataTable GetReal(string mach)
        {
            DataTable dt = new DataTable("REAL");
            dt.Columns.Add("JOB_ID");
            dt.Columns.Add("USED_TIME");
            dt.Columns.Add("REAL_USED_TIME");
            dt.Columns.Add("STEP_ID");
            DataRow[] _dr = Data.dtWip.Select("TOOLS_ID='" + mach + "'", "START_JOB_TIME");
            foreach (DataRow dr in _dr)
            {
                DataRow[] _drPlan = Data.dtPlan.Select("MACH_ID='" + mach + "' AND JOB_ID='" + dr["JOB_ID"].ToString() + "' AND STEP_ID='" + dr["STEP_ID"].ToString() + "'");
                if (_drPlan.Length > 0)
                {
                    dt.Rows.Add(dr["JOB_ID"].ToString(),
                                _drPlan[0]["USED_TIME"],
                                dr["MIN_ALL_JOB"],
                                dr["STEP_ID"].ToString());
                }
                else
                {
                    DataTable dtPlan = Msm.GetPlanByJob(dr["JOB_ID"].ToString(), dr["STEP_ID"].ToString(), dr["WDEPT_ID"].ToString());
                    if (dtPlan.Rows.Count > 0)
                    {
                        dt.Rows.Add(dr["JOB_ID"].ToString(),
                                    dtPlan.Rows[0]["USED_TIME"],
                                    dr["MIN_ALL_JOB"],
                                    dr["STEP_ID"].ToString());
                    }
                    //else
                    //{
                    //    dt.Rows.Add(dr["JOB_ID"].ToString(),
                    //                0,
                    //                dr["MIN_ALL_JOB"]);
                    //}
                }
            }
            return dt;
        }
        private static DataTable GetLastUpdate(string mach)
        {
            DataTable dt = new DataTable("SPEED_LAST");
            dt.Columns.Add("LAST_UPDATE");

            DataRow[] _dr = Data.dtLastUpdate.Select("MACH_ID='" + mach + "'");
            if (_dr.Length > 0)
            {
                dt.Rows.Add(_dr[0]["LAST_UPDATE"].ToString());
            }
            else
            {
                dt.Rows.Add("0");
            }
            return dt;
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