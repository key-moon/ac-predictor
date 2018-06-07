using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using MongoDB;
using MongoDB.Driver;
using MongoDB.Driver.Core;
using MongoDB.Driver.Linq;

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ac_predictor.MongoDB
{
    public class APrefsDB
    {
        private string connectionString => ConfigurationManager.AppSettings["MongoDBConnection"];
        private static string DBName = "Predictor";
        private static string TableName = "APrefs";

        private MongoClient client;
        private IMongoDatabase database;
        private IMongoCollection<APrefs> collection;
        public APrefsDB()
        {
            client = new MongoClient(connectionString);
            database = client.GetDatabase(DBName);
            collection = database.GetCollection<APrefs>(TableName);
        }
    }

    public class APrefs
    {
        [BsonRepresentation(BsonType.ObjectId)]
        private string _id;
        public string ContestID { get; set; }
        private Dictionary<string, double> aPrefs;

        public bool IsContainUsers(string userName) => aPrefs.ContainsKey(userName);
        public double GetAPref(string userName) => aPrefs[userName];
        public void AddAPref(string userName, double value) => aPrefs.Add(userName, value);
        public void UpdateAPref(string userName, double value) => aPrefs[userName] = value;

        [BsonConstructor]
        public APrefs(string _id,string contestID, Dictionary<string, double> APrefs)
        {
            this._id = _id;
            ContestID = contestID;
            aPrefs = APrefs;
        }
    }
}