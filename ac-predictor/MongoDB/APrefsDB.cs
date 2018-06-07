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
        private IMongoCollection<Dictionary<string, double>> collection;
        public APrefsDB()
        {
            client = new MongoClient(connectionString);
            database = client.GetDatabase(DBName);
            collection = database.GetCollection<Dictionary<string, double>>(TableName);
        }
    }

    public class APrefs
    {
        [BsonRepresentation(BsonType.ObjectId)]
        private string _id;
        private Dictionary<string, double> aPrefs;

        [BsonConstructor]
        public APrefs(string _id, Dictionary<string, double> APrefs)
        {
            this._id = _id;
            aPrefs = APrefs;
        }
    }
}