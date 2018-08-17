using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using Newtonsoft.Json;
using MongoDB;
using MongoDB.Driver;
using MongoDB.Driver.Core;
using MongoDB.Driver.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ac_predictor.MongoDB
{
    public class AccessLogDB
    {
        private string connectionString => ConfigurationManager.AppSettings["MongoDBConnection"];
        private static string DBName = "Predictor";
        private static string TableName = "AccessLog";

        private MongoClient client;
        private IMongoDatabase database;
        private IMongoCollection<LogObj> collection;

        public AccessLogDB()
        {
            client = new MongoClient(connectionString);
            database = client.GetDatabase(DBName);
            collection = database.GetCollection<LogObj>(TableName);
        }
        public void CreateLog(LogObj log) => collection.InsertOne(log);
    }

    public class LogObj
    {
        public BsonDateTime RequestedTime;
        public int Elapsedms;
        public string Url;
        public string Verb;
        public string Referrer;
        public string Addres;
        public string UserAgent;
    }
}