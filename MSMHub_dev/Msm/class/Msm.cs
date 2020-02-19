using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.SessionState;
using System.Data;

namespace MSMHub
{
	public class Msm
    {
        private static Oracle o = new Oracle(WebConfigurationManager.AppSettings["OracleConnect"]);

        public static void UpdateAgvStatus()
        {
            MsmHub mh = new MsmHub();
            DoUpdateAgvStatus();

            EasyTimer.SetTimeout(() =>
            {
                UpdateAgvStatus();
            }, 10000);
        }
        public static void DoUpdateAgvStatus()
        {
            try
            {
                DataTable dt = o.Execute(@"SELECT * FROM KPDBA.MACH_AGV_STATUS");
                if (dt.Rows.Count > 0) { Data.dtAgv = dt; }
            }
            catch (Exception ex)
            {

            }
        }


        public static void UpdateCurrJob()
        {
            MsmHub mh = new MsmHub();
            DoUpdateCurrJob();
            //mh.SendCurrJob(Data.dtCurrJob);

            EasyTimer.SetTimeout(() =>
            {
                UpdateCurrJob();
            }, 30000);
        }
        public static void DoUpdateCurrJob()
        {
            try
            {
                DataTable dt = o.Execute(@"SELECT J.JOB_ID, J.JOB_DESC, WH.TOOLS_ID, SUBSTR(WH.TOOLS_ID, 1, 4) AS MACH_ID ,C.STEP_ID,C.STEP_SEQ,C.SEQ_RUN,C.WDEPT_ID
                                         FROM KPDBA.WIP_HEADER WH, KPDBA.JOB J ,KPDBA.JOB_STEP C
                                         WHERE WH.JOB_ID = J.JOB_ID 
                                         AND (WH.JOB_ID = C.JOB_ID) 
                                         AND (WH.WDEPT_ID = C.WDEPT_ID) 
                                         AND (WH.WRKC_ID = C.STEP_ID) 
                                         AND WH.RUN_REC_STATUS <> 'C' 
                                         AND TRUNC(WIP_DATE) >= TRUNC(SYSDATE - 1)");
//                DataTable dt = o.Execute(@"SELECT J.JOB_ID, J.JOB_DESC, SUBSTR(WH.TOOLS_ID, 1, 4) AS MACH_ID ,C.STEP_ID
//                                         FROM KPDBA.WIP_HEADER WH, KPDBA.JOB J ,KPDBA.MASTER_JOB_STEP C
//                                         WHERE WH.JOB_ID = J.JOB_ID 
//                                         AND (WH.WDEPT_ID = C.WDEPT_ID) 
//                                         AND (WH.WRKC_ID = C.STEP_ID) 
//                                         AND WH.RUN_REC_STATUS <> 'C' 
//                                         AND TRUNC(WIP_DATE) >= TRUNC(SYSDATE - 1)");
                if (dt.Rows.Count > 0) { Data.dtCurrJob = dt; }
            }
            catch (Exception ex)
            {

            }
        }

        public static void UpdateStatus()
        {
            MsmHub mh = new MsmHub();
            DoUpdateStatus();
            //mh.SendStatus(Data.dtStatus);

            EasyTimer.SetTimeout(() =>
            {
                UpdateStatus();
            }, 15000);
        }
        public static void DoUpdateStatus()
        {
            try
            {
                DataTable dt = Sql.Execute(@"SELECT DATEDIFF(S, '1970-01-01', LAST_GET) -15 AS LAST_SEC,INT_DT,CONVERT(VARCHAR,LAST_GET,120) AS LAST_GET,MACH_ID,STATUS,CURRENT_SPEED FROM dbo.MACH_HIS A
                                            WHERE (CONVERT(VARCHAR,LAST_GET,120) + MACH_ID)
                                            IN (SELECT CONVERT(VARCHAR,MAX(LAST_GET),120) + MACH_ID FROM dbo.MACH_HIS GROUP BY MACH_ID)");
                if (dt.Rows.Count > 0) { Data.dtStatus = dt; }

                dt = Sql.Execute("SELECT *, DATEDIFF(S, '1970-01-01', LAST_GET) -75 AS LAST_SEC FROM dbo.MACH_HIS");
                if (dt.Rows.Count > 0) { Data.dtHistory = dt; }
            }
            catch (Exception ex)
            {

            }
        }

        public static void SendCurrJobInfo()
        {
            MsmHub mh = new MsmHub();
            mh.SendCurrJobInfo();

            EasyTimer.SetTimeout(() =>
            {
                SendCurrJobInfo();
            }, 15000);
        }

        public static void UpdatePlan()
        {
            MsmHub mh = new MsmHub();
            DoUpdatePlan();

            EasyTimer.SetTimeout(() =>
            {
                UpdatePlan();
            }, 1000 * 60 * 10);
        }
        public static void DoUpdatePlan()
        {
            try
            {
                string[] _str = {"S_STATUS_FLAG","S_POST_FLAG","AD_DATE","S_COMP_ID","I_WDEPT_ID","S_MACH_ID","S_DAY","S_MODE"};
                object[] _val = {"%","T",DateTime.Now.ToString("dd/MM/yyyy"),"%",0,"%","%","MSM"};
                DataTable dt = o.Proc("KPDBA.SP_JS_PLAN", "CUR_TABLE", _str, _val);
//               DataTable  dt2 = o.Execute(String.Format(@"SELECT A.JOB_ID,F.JOB_DESC, A.STEP_ID,G.STEP_DESC, A.ACT_DATE, A.PLAN_DATE, A.START_TIME, A.END_TIME, A.USED_TIME, NVL(A.SETUP_TIME,0) + NVL(A.STD_COLOR_TIME,0) AS SETUP_TIME, A.USED_TIME - (NVL(A.SETUP_TIME,0) + NVL(A.STD_COLOR_TIME,0)) AS RUN_TIME, A.SPEED,  A.MACH_ID,TO_CHAR((A.START_TIME + (.000694 * (NVL(A.SETUP_TIME,0) + NVL(A.STD_COLOR_TIME,0) + 1))),'HH24:MI') AS SETUP_END
//                                                        FROM KPDBA.JS_PLAN_DETAIL A ,     
//                                                        (  SELECT COMP_ID, WDEPT_ID, MAX (ACT_DATE) AS ACT_DATE      
//                                                           FROM KPDBA.JS_PLAN_REVISION 
//                                                           WHERE POST_FLAG = 'T'  
//                                                           AND TRUNC(ACT_DATE) <= TO_DATE(TO_CHAR(SYSDATE,'YYYY-MM-DD'), 'YYYY-MM-DD')       
//                                                           GROUP BY COMP_ID, WDEPT_ID
//                                                        ) E,
//                                                        KPDBA.JOB F,
//                                                        KPDBA.MASTER_JOB_STEP G
//                                                        WHERE (G.STEP_ID = A.STEP_ID) AND (G.WDEPT_ID = A.WDEPT_ID) 
//                                                        AND (F.JOB_ID = A.JOB_ID) AND (A.COMP_ID = E.COMP_ID) AND (A.WDEPT_ID = E.WDEPT_ID) AND (A.ACT_DATE = E.ACT_DATE)
//                                                        AND (A.END_TIME >= TO_DATE(TO_CHAR(SYSDATE,'YYYY-MM-DD'), 'YYYY-MM-DD') + (7/24) OR A.START_TIME >= TO_DATE(TO_CHAR(SYSDATE,'YYYY-MM-DD'), 'YYYY-MM-DD') + (7/24))  
//                                                        AND A.START_TIME < TO_DATE(TO_CHAR(SYSDATE,'YYYY-MM-DD'), 'YYYY-MM-DD') + 1+(7/24) 
//                                                        ORDER BY A.START_TIME"));

//               dt.Merge(dt2);
//                DataTable dt = o.Execute(String.Format(@"SELECT B.JOB_ID,F.JOB_DESC,B.STEP_ID,G.STEP_DESC,B.WDEPT_ID,B.ACT_DATE,B.PLAN_DATE,B.START_TIME,B.END_TIME,B.USED_TIME,B.SETUP_TIME,B.RUN_TIME,B.SPEED,B.MACH_ID,B.SETUP_END
//                                                          FROM (SELECT B.JOB_ID,B.STEP_ID,B.WDEPT_ID,B.COMP_ID,B.ACT_DATE,B.PLAN_DATE,B.START_TIME,B.END_TIME,B.USED_TIME,B.SETUP_TIME,B.RUN_TIME,B.SPEED,B.MACH_ID,B.SETUP_END
//                                                                  FROM (SELECT B.*
//                                                                          FROM (SELECT ROW_NUMBER() OVER(PARTITION BY B.COMP_ID, B.JOB_ID, B.WDEPT_ID, B.STEP_ID 
//                                                                                    ORDER BY B.COMP_ID, B.JOB_ID, B.WDEPT_ID, B.STEP_ID, B.ACT_DATE DESC) ROW_ID,
//                                                                                       B.JOB_ID,B.STEP_ID,B.WDEPT_ID,B.COMP_ID,
//                                                                                       B.ACT_DATE,B.PLAN_DATE,B.START_TIME,B.END_TIME,B.USED_TIME,
//                                                                                       NVL(B.SETUP_TIME, 0) + NVL(B.STD_COLOR_TIME, 0) AS SETUP_TIME,
//                                                                                       B.USED_TIME - (NVL(B.SETUP_TIME, 0) +
//                                                                                       NVL(B.STD_COLOR_TIME, 0)) AS RUN_TIME,
//                                                                                       B.SPEED,B.MACH_ID,
//                                                                                       TO_CHAR((B.START_TIME +
//                                                                                               (.000694 *
//                                                                                               (NVL(B.SETUP_TIME, 0) +
//                                                                                               NVL(B.STD_COLOR_TIME, 0) + 1))),
//                                                                                               'HH24:MI') AS SETUP_END
//                                                                                  FROM KPDBA.JS_PLAN_DETAIL B
//                                                                                 WHERE B.POST_FLAG = N'T'
//                                                                                   AND B.STATUS = 'T'
//                                                                                   AND B.ACT_DATE BETWEEN TRUNC(SYSDATE - 2) AND
//                                                                                       TRUNC(SYSDATE)) B
//                                                                         WHERE B.ROW_ID = 1
//                                                                           AND (B.END_TIME >= TRUNC(SYSDATE) + (7 / 24) OR
//                                                                               B.START_TIME >= TRUNC(SYSDATE) + (7 / 24))
//                                                                           AND B.START_TIME < TRUNC(SYSDATE) + 1 + (7 / 24)) B) B
//                                                          JOIN KPDBA.JOB F
//                                                            ON F.JOB_ID = B.JOB_ID
//                                                          JOIN KPDBA.MASTER_JOB_STEP G
//                                                            ON G.STEP_ID = B.STEP_ID
//                                                           AND G.WDEPT_ID = B.WDEPT_ID
//                                                         ORDER BY B.START_TIME"));
                if (dt.Rows.Count > 0) { Data.dtPlan = dt; }
            }
            catch (Exception ex)
            {

            }
        }

        public static void UpdateWip()
        {
            MsmHub mh = new MsmHub();
            DoUpdateWip();

            EasyTimer.SetTimeout(() =>
            {
                UpdateWip();
            }, 15000);
        }

        public static void DoUpdateWip()
        {
            try
            {
                DataTable dt = o.Execute(String.Format(@"SELECT SUBSTR(A.TOOLS_ID,1,4) AS TOOLS_ID, 
                                                       A.JOB_ID,  
                                                       C.STEP_ID,
                                                       A.WDEPT_ID,
                                                       A.WRKC_ID,
                                                       A.TOOLS_ID AS WIP_TOOLS_ID,
                                                       A.WIP_DATE,
                                                       A.WIP_PSEQ,
                                                       TO_CHAR(A.START_JOB_TIME,'yyyyMMddHH24MI') AS INT_START_TIME,
                                                       TO_CHAR((A.START_JOB_TIME - date '1970-01-01')*24*60*60) AS TS_START_TIME,
                                                       TO_CHAR(A.START_JOB_TIME,'YYYY-MM-DD HH24:MI:SS') AS START_JOB_TIME,
                                                       A.START_JOB_TIME AS START_JOB,
                                                       A.SETUP_ENDING_TIME,
                                                       A.ENDING_JOB_TIME,
                                                       NVL(HOUR_SETUP,0)*60+NVL(MIN_SETUP,0) AS MIN_SETUP, 
                                                       DECODE(A.RUN_REC_STATUS,'C',ROUND(NVL(HOUR_ALL_JOB,0)*60+NVL(MIN_ALL_JOB,0)),ROUND(((SYSDATE - A.START_JOB_TIME) * 24 * 60))) AS MIN_ALL_JOB, 
                                                       A.RUN_REC_STATUS, 
                                                       '' AS STATUS
                                                FROM KPDBA.WIP_HEADER A, 
                                                     KPDBA.JOB B, 
                                                     KPDBA.MASTER_JOB_STEP C
                                                WHERE (A.JOB_ID = B.JOB_ID) 
                                                AND (A.WDEPT_ID = C.WDEPT_ID) 
                                                AND (A.WRKC_ID = C.STEP_ID) 
                                                AND A.START_JOB_TIME IS NOT NULL 
                                                AND TRUNC(A.WIP_DATE) >= TRUNC(SYSDATE)
                                                AND (A.BF_FLAG = 'F') 
                                                AND SUBSTR(A.TOOLS_ID,1,4) IN (SELECT MACH_ID FROM KPDBA.MACHINE WHERE OEE_FLAG = 'T')
                                                ORDER BY A.START_JOB_TIME"));

                if (dt.Rows.Count > 0)
                {
                    DataRow[] _dr = dt.Select("RUN_REC_STATUS<>'C'");

                    DataTable dtTemp = Data.dtHistory.Copy();
                    foreach (DataRow dr in _dr)
                    {
                        DataRow[] _dtChk = null;
                        DataRow[] _dtHis = dtTemp.Select("MACH_ID='" + dr["TOOLS_ID"].ToString() + "' AND (STATUS = 3) AND LAST_SEC > " + dr["TS_START_TIME"].ToString(), "LAST_SEC");
                        //if (_dtHis.Length > 0)
                        //{
                        //    _dtChk = dtTemp.Select("MACH_ID='" + dr["TOOLS_ID"].ToString() + "' AND (STATUS = 2) AND LAST_SEC > " + _dtHis[0]["LAST_SEC"].ToString(), "LAST_SEC");
                        //}
                        if (_dtHis.Length > 0)// && _dtChk.Length == 0)
                        {
                            DateTime dLastSt = Convert.ToDateTime(_dtHis[0]["LAST_GET"].ToString());
                            DateTime dStart = Convert.ToDateTime(dr["START_JOB"].ToString());
                            TimeSpan tp = dLastSt - dStart;
                            dr["STATUS"] = _dtHis[0]["STATUS"].ToString();
                            dr["MIN_SETUP"] = (tp.TotalMinutes > 3 ? tp.TotalMinutes : 0);
                        }
                        else
                        {
                            dr["MIN_SETUP"] = dr["MIN_ALL_JOB"];
                            dr["STATUS"] = "2";
                        }
                    }
                    dtTemp.Dispose();
                    dt.AcceptChanges();
                    Data.dtWip = dt;
                }
            }
            catch (Exception ex)
            {
                Log.Insert("MSM", ex.Message, "DoUpdateWip");
            }
        }

        public static void GetMach()
        {
            DataTable dt = o.Execute(String.Format(@"SELECT SUBSTR(A.TOOLS_ID,1,4) AS MACH_ID, 
                                                    A.TOOLS_GRP_DESC AS MACH_NAME, 
                                                    A.WDEPT_ID, B.WDEPT_DESC,A.UNIT_SPEED
                                                    FROM KPDBA.WIP_TOOLS A, KPDBA.WIP_DEPT B
                                                    WHERE A.WDEPT_ID = B.WDEPT_ID 
                                                    AND A.IDMC IS NOT NULL 
                                                    AND (A.CNN_MMS_FLAG = 'T' OR LENGTH(TRIM(A.IDMC)) = 4) 
                                                    AND A.CANCEL_FLAG = 'F'
                                                    GROUP BY  SUBSTR(A.TOOLS_ID,1,4) , 
                                                    A.TOOLS_GRP_DESC , 
                                                    A.WDEPT_ID, B.WDEPT_DESC,A.UNIT_SPEED
                                                    ORDER BY MACH_ID"));
            if (dt.Rows.Count > 0) { Data.dtMach = dt; }
        }

        public static object GetLastWorkStatus(string job, string mach, bool time = false, string startTime = "")
        {
            try
            {
                Oracle o = new Oracle(WebConfigurationManager.AppSettings["OracleConnect"]);
                string datetime = "";
                string result = "2";
                DataTable dt;
                if (startTime == "")
                {
                    string sql = @"SELECT TO_CHAR(START_JOB_TIME,'yyyy-MM-dd HH24:MI:SS') AS START_JOB_TIME
                                FROM KPDBA.WIP_HEADER A
                                WHERE SUBSTR(A.TOOLS_ID,1,4) = :AS_MACH_ID
                                AND A.JOB_ID = :AS_JOB_ID
                                AND A.BF_FLAG = 'F'
                                AND A.RUN_REC_STATUS <> 'C'";

                    sql = sql.Replace(":AS_JOB_ID", job.AddSingleQ());
                    sql = sql.Replace(":AS_MACH_ID", mach.AddSingleQ());


                    dt = o.Execute(sql);
                    if (dt.Rows.Count > 0)
                    {
                        datetime = dt.Rows[0][0].ToString();
                    }
                }
                datetime = startTime;
                dt = new DataTable();
                dt = Sql.Execute(String.Format(@"SELECT CONVERT(VARCHAR,MIN(LAST_GET),120) AS LAST_GET,STATUS
                                            FROM dbo.MACH_HIS 
                                            WHERE MACH_ID = '{0}'
                                            AND (STATUS <> 1)
                                            AND LAST_UPDATE > CONVERT(DATETIME,'{1}',120)
                                            GROUP BY STATUS
                                            ORDER BY LAST_GET",
                                                mach, datetime));
                if (dt.Rows.Count > 0)
                {
                    DataRow[] _dr = dt.Select("STATUS='3'", "LAST_GET");
                    if (_dr.Length > 0)
                    {
                        if (!time) { result = "3"; }
                        else
                        {
                            object[] _obj = { "3", _dr[0]["LAST_GET"].ToString() };
                            return _obj;
                        }
                    }
                    else
                    {
                        _dr = dt.Select("STATUS<>'0'", "LAST_GET DESC");
                        if (_dr.Length > 0)
                        {
                            if (!time) { result = (_dr[0]["STATUS"].ToString() != "3" ? "2" : _dr[0]["STATUS"].ToString()); }
                            else
                            {
                                object[] _obj = { (_dr[0]["STATUS"].ToString() != "3" ? "2" : _dr[0]["STATUS"].ToString()), _dr[0]["LAST_GET"].ToString() };
                                return _obj;
                            }
                        }
                        else
                        {
                            if (!time) { result = dt.Rows[0]["STATUS"].ToString(); }
                            else
                            {
                                object[] _obj = { dt.Rows[0]["STATUS"].ToString(), _dr[0]["LAST_GET"].ToString() };
                                return _obj;
                            }
                        }
                    }
                }
                if (!time)
                {
                    return result;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                return "0";
            }
        }

        public static string GetSpeedMaster(string job, string mach)
        {
            try
            {
                Oracle o = new Oracle(WebConfigurationManager.AppSettings["OracleConnect"]);


                string sql = ReadFile.Path(HttpContext.Current.Server.MapPath("../sql/SpeedMaster.sql"));
                sql = sql.Replace(":JOB_ID", job.AddSingleQ());
                sql = sql.Replace(":MACH_ID", mach.AddSingleQ());

                DataTable dt = o.Execute(sql);

                return (dt.Rows.Count > 0 ? dt.Rows[0][0].ToString() : "0");

            }
            catch (Exception ex)
            {
                return "0";
            }
        }

        public static DataTable GetPlanByJob(string job, string step, string wdept)
        {
            try
            {
                Oracle o = new Oracle(WebConfigurationManager.AppSettings["OracleConnect"]);

                DataTable dt = o.Execute(String.Format(@"SELECT A.PRODUCE_QTY, A.JOB_ID, A.STEP_ID, A.ACT_DATE, A.PLAN_DATE, A.START_TIME, A.END_TIME, A.USED_TIME, NVL(A.SETUP_TIME,0) + NVL(A.STD_COLOR_TIME,0) AS SETUP_TIME, A.USED_TIME - (NVL(A.SETUP_TIME,0) + NVL(A.STD_COLOR_TIME,0)) AS RUN_TIME, A.SPEED,  A.MACH_ID,TO_CHAR((A.START_TIME + (.000694 * (NVL(A.SETUP_TIME,0) + NVL(A.STD_COLOR_TIME,0) + 1))),'HH24:MI') AS SETUP_END
                                                        FROM KPDBA.JS_PLAN_DETAIL A ,     
                                                        ( SELECT COMP_ID, WDEPT_ID, MAX (ACT_DATE) AS ACT_DATE      
                                                          FROM KPDBA.JS_PLAN_REVISION 
                                                          WHERE POST_FLAG = 'T'
                                                          GROUP BY COMP_ID, WDEPT_ID
                                                        ) E WHERE (A.COMP_ID = E.COMP_ID) AND (A.WDEPT_ID = E.WDEPT_ID) AND (A.ACT_DATE = E.ACT_DATE)
                                                        AND JOB_ID = '{0}' AND STEP_ID = '{1}' AND A.WDEPT_ID = '{2}'
                                                        ORDER BY A.START_TIME", job, step, wdept));
//                DataTable dt = o.Execute(String.Format(@"SELECT B.* FROM (SELECT ROW_NUMBER() OVER(PARTITION BY B.COMP_ID, B.JOB_ID, B.WDEPT_ID, B.STEP_ID 
//                                                                       ORDER BY B.COMP_ID, B.JOB_ID, B.WDEPT_ID, B.STEP_ID, B.ACT_DATE DESC) ROW_ID,
//                                                                       B.JOB_ID,
//                                                                       B.STEP_ID,
//                                                                       B.WDEPT_ID,
//                                                                       B.COMP_ID,
//                                                                       B.ACT_DATE,
//                                                                       B.PLAN_DATE,
//                                                                       B.START_TIME,
//                                                                       B.END_TIME,
//                                                                       B.USED_TIME,
//                                                                       NVL(B.SETUP_TIME, 0) + NVL(B.STD_COLOR_TIME, 0) AS SETUP_TIME,
//                                                                       B.USED_TIME - (NVL(B.SETUP_TIME, 0) +
//                                                                       NVL(B.STD_COLOR_TIME, 0)) AS RUN_TIME,
//                                                                       B.SPEED,
//                                                                       B.MACH_ID,
//                                                                       TO_CHAR((B.START_TIME +
//                                                                               (.000694 *
//                                                                               (NVL(B.SETUP_TIME, 0) +
//                                                                               NVL(B.STD_COLOR_TIME, 0) + 1))),
//                                                                               'HH24:MI') AS SETUP_END
//                                                                  FROM KPDBA.JS_PLAN_DETAIL B
//                                                                 WHERE B.POST_FLAG = N'T'
//                                                                   AND B.STATUS = 'T'
//                                                                   AND B.ACT_DATE BETWEEN TRUNC(SYSDATE - 2) AND
//                                                                       TRUNC(SYSDATE)) B
//                                                        WHERE B.ROW_ID = 1
//                                                        AND B.JOB_ID = '{0}' 
//                                                        AND B.STEP_ID = '{1}' 
//                                                        AND B.WDEPT_ID = '{2}'
//                                                        ORDER BY B.START_TIME", job, step, wdept));

                return dt;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
    public class Data
    {
        public static DataTable dtReg { get; set; }
        public static DataTable dtCurrJob { get; set; }
        public static DataTable dtStatus { get; set; }
        public static DataTable dtHistory { get; set; }
        public static DataTable dtPlan { get; set; }
        public static DataTable dtWip { get; set; }
        public static DataTable dtLastUpdate { get; set; }
        public static DataTable dtMach { get; set; }
        public static DataTable dtAgv { get; set; }
    }
}