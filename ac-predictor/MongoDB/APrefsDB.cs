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
    public class APerfsDB
    {
        private string connectionString => ConfigurationManager.AppSettings["MongoDBConnection"];
        private static string DBName = "Predictor";
        private static string TableName = "APerfs";

        private MongoClient client;
        private IMongoDatabase database;
        private IMongoCollection<APerfs> collection;

        public List<string> ContestIDs => collection.Find(new FilterDefinitionBuilder<APerfs>().Empty).Project(x => x.ContestID).ToList();

        public APerfsDB()
        {
            client = new MongoClient(connectionString);
            database = client.GetDatabase(DBName);
            collection = database.GetCollection<APerfs>(TableName);
        }

        public APerfs GetAPerfs(string contestID) => collection.Find(x => x.ContestID == contestID).FirstOrDefault();

        public void CreateAPerfs(APerfs aperfs) => collection.InsertOne(aperfs);

        public void UpdateAPerfs(APerfs aperfs) => collection.UpdateOne(x => x.ContestID == aperfs.ContestID, new UpdateDefinitionBuilder<APerfs>().Set(x => x.APerfDic, aperfs.APerfDic));

        public void DeleteAPerfs(string contestID) => collection.DeleteOne(x => x.ContestID == contestID);
    }

    public class APerfs
    {
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonIgnore]
        public string _id { get; set; }

        public string ContestID { get; set; }

        private Dictionary<string, double> _aperfdic;
        public Dictionary<string, double> APerfDic { get { return _aperfdic.ToDictionary(x => x.Key, x => x.Value); } set { _aperfdic = value.ToDictionary(x => x.Key, x => x.Value); } }


        public APerfs(string contestID) : this(null, contestID, new Dictionary<string, double>()) { }

        [BsonConstructor]
        public APerfs(string _id,string contestID, Dictionary<string, double> aperfdic)
        {
            this._id = _id;
            ContestID = contestID;
            APerfDic = aperfdic;
        }
    }
}