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

        public APrefs GetAPrefs(string contestName) => collection.Find(x => x.ContestID == contestName).First();

        public void CreateAPrefs(APrefs aprefs) => collection.InsertOne(aprefs);

        public void UpdateAPrefs(APrefs aprefs) => collection.UpdateOne(x => x.ContestID == aprefs.ContestID, new UpdateDefinitionBuilder<APrefs>().Set(x => x.APrefDic, aprefs.APrefDic));
    }

    public class APrefs
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string ContestID { get; set; }

        private Dictionary<string, double> _aprefdic;
        public Dictionary<string, double> APrefDic { get { return _aprefdic.ToDictionary(x => x.Key, x => x.Value); } set { _aprefdic = value.ToDictionary(x => x.Key, x => x.Value); } }

        [BsonConstructor]
        public APrefs(string _id,string contestID, Dictionary<string, double> aprefdic)
        {
            this._id = _id;
            ContestID = contestID;
            APrefDic = aprefdic;
        }
    }
}