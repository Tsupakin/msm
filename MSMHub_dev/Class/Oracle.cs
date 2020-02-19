using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OracleClient;
using System.Linq;
using System.Web;
using wsLibrary;
namespace MSMHub
{
    public class Oracle
    {
        string conString = "";
        public Oracle(string dbName)
        {
            //
            // TODO: Add constructor logic here
            //
            conString = @"Data Source=" + dbName + ";User Id=KPRUSR;Password=kprusr;Integrated Security=no;";
        }

        private OracleConnection Con()
        {
            OracleConnection cn = new OracleConnection(conString);
            return cn;
        }

        public static string GetString(DataTable dtInput, int index)
        {
            try
            {
                if (dtInput != null && dtInput.Rows.Count > 0)
                {
                    if (dtInput.Columns.Count > index)
                    {
                        return dtInput.Rows[0][index].ToString();
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public OracleDataAdapter GatDataAdapter(string sql)
        {
            DataTable dt = new DataTable();
            OracleDataAdapter da = new OracleDataAdapter(sql, Con());
            OracleCommandBuilder cb = new OracleCommandBuilder(da);
            return da;
        }

        public DataTable Execute(string sql)
        {
            DataTable dt = new DataTable();

            OracleDataAdapter da = new OracleDataAdapter(sql, Con());
            da.Fill(dt);

            return dt;
        }

        public string ExecuteTran(params string[] _sql)
        {
            try
            {
                int i = 0, intRow = 0;
                OracleCommand cm;
                OracleTransaction tr;
                OracleConnection cn = Con();
                cn.Open();

                tr = cn.BeginTransaction();
                intRow = _sql.Length;

                for (i = 0; i < intRow; i++)
                {
                    cm = new OracleCommand();
                    cm.CommandTimeout = 1800;
                    cm.Connection = cn;
                    cm.Transaction = tr;
                    cm.CommandText = _sql[i];
                    cm.ExecuteNonQuery();
                }

                tr.Commit();
                cn.Close();

                return "T";
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }

        public DataTable ExecuteProc(string spName, string[] _paramName = null, object[] _paramValue = null)
        {
            try
            {
                DataTable dt = new DataTable();

                OracleConnection cn = Con();

                OracleCommand cmd = cn.CreateCommand();
                cmd.CommandText = spName;
                cmd.CommandType = CommandType.StoredProcedure;

                if (_paramName != null)
                {
                    for (int i = 0; i < _paramName.Length; i++)
                    {
                        cmd.Parameters.AddWithValue(_paramName[i], _paramValue[i]);
                    }
                }

                OracleDataAdapter da = new OracleDataAdapter(cmd);
                da.Fill(dt);

                return dt;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        public DataTable ExecuteProc2(string spName, string[] _paramName = null, object[] _paramValue = null)
        {
            try
            {
                DataTable dt = new DataTable();

                OracleConnection cn = Con();

                OracleCommand cmd = cn.CreateCommand();
                cmd.CommandText = spName;
                cmd.CommandType = CommandType.StoredProcedure;

                if (_paramName != null)
                {
                    for (int i = 0; i < _paramName.Length; i++)
                    {
                        cmd.Parameters.AddWithValue(_paramName[i], _paramValue[i]);
                    }
                }
                cmd.Parameters.Add("CUR_GET_PR", OracleType.Cursor).Direction = ParameterDirection.Output;

                OracleDataAdapter da = new OracleDataAdapter(cmd);
                da.Fill(dt);

                return dt;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public DataTable Proc(string spName, string curName = "", string[] _paramName = null, object[] _paramValue = null)
        {
            try
            {
                DataTable dt = new DataTable();

                OracleConnection cn = Con();

                OracleCommand cmd = cn.CreateCommand();
                cmd.CommandText = spName;
                cmd.CommandType = CommandType.StoredProcedure;

                if (_paramName != null)
                {
                    for (int i = 0; i < _paramName.Length; i++)
                    {
                        cmd.Parameters.AddWithValue(_paramName[i], _paramValue[i]);
                    }
                }
                cmd.Parameters.Add(curName, OracleType.Cursor).Direction = ParameterDirection.Output;

                OracleDataAdapter da = new OracleDataAdapter(cmd);
                da.Fill(dt);

                return dt;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public DataTable Proc2(string spName, string curName = "", string[] _paramName = null, object[] _paramValue = null)
        {
            try
            {
                DataTable dt = new DataTable();

                OracleConnection cn = Con();

                OracleCommand cmd = cn.CreateCommand();
                cmd.CommandText = spName;
                cmd.CommandType = CommandType.StoredProcedure;

                if (_paramName != null)
                {
                    for (int i = 0; i < _paramName.Length; i++)
                    {
                        cmd.Parameters.AddWithValue(_paramName[i], _paramValue[i]);
                    }
                }
                cmd.Parameters.Add(curName, OracleType.Cursor).Direction = ParameterDirection.Output;

                OracleDataAdapter da = new OracleDataAdapter(cmd);
                da.Fill(dt);

                return dt;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public DataSet ExecuteProcSet(string spName, string[] _paramName = null, object[] _paramValue = null, params string[] _curName)
        {
            try
            {
                DataSet ds = new DataSet();

                OracleConnection cn = Con();

                OracleCommand cmd = cn.CreateCommand();
                cmd.CommandText = spName;
                cmd.CommandType = CommandType.StoredProcedure;

                if (_paramName != null)
                {
                    for (int i = 0; i < _paramName.Length; i++)
                    {
                        cmd.Parameters.AddWithValue(_paramName[i], _paramValue[i]);
                    }
                }
                for (int i = 0; i < _curName.Length; i++)
                {
                    cmd.Parameters.Add(_curName[i], OracleType.Cursor).Direction = ParameterDirection.Output;
                }
                OracleDataAdapter da = new OracleDataAdapter(cmd);
                da.Fill(ds);

                return ds;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}