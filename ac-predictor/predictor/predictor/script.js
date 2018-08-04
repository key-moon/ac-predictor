//NameSpace
SideMenu.Predictor = {};
SideMenu.Predictor.historyJsonURL = `https://beta.atcoder.jp/users/${userScreenName}/history/json`
SideMenu.Predictor.standingsJsonURL = `https://beta.atcoder.jp/contests/${contestScreenName}/standings/json`
SideMenu.Predictor.aperfsJsonURL = `https://ac-predictor.azurewebsites.net/api/aperfs/${contestScreenName}`

var maxDic =
    [
        [/^abc\d{3}$/, 1600],
        [/^arc\d{3}$/, 3200],
        [/^soundhound2018-summer-qual$/, 2400],
        [/.*/, 8192]
    ];
SideMenu.Predictor.maxPerf = maxDic.filter(x => x[0].exec(contestScreenName))[0][1];

if (!SideMenu.Datas.History) SideMenu.Datas.Update.History();