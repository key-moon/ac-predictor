//temporary source

//from: https://koba-e964.github.io/atcoder-rating-estimator/atcoder_rating.js
function bigf(n) {
    var num = 1.0;
    var den = 1.0;
    for (var i = 0; i < n; ++i) {
	num *= 0.81;
	den *= 0.9;
    }
    num = (1 - num) * 0.81 / 0.19;
    den = (1 - den) * 0.9 / 0.1;
    return Math.sqrt(num) / den;
}

function f(n) {
    var finf = bigf(400);
    return (bigf(n) - finf) / (bigf(1) - finf) * 1200.0;
}

// Returns unpositivized ratings.
function calc_rating(arr) {
    var n = arr.length;
    var num = 0.0;
    var den = 0.0;
    for (var i = n - 1; i >= 0; --i) {
	num *= 0.9;
	num += 0.9 * Math.pow(2, arr[i] / 800.0);
	den *= 0.9;
	den += 0.9;
    }
    var rating = Math.log2(num / den) * 800.0;
    rating -= f(n);
    return rating;
}

// Takes and returns unpositivized ratings.
function calc_rating_from_last(last, perf, n) {
    last += f(n);
    var wei = 9 - 9 * 0.9 ** n;
    var num = wei * (2 ** (last / 800.0)) + 2 ** (perf / 800.0) ;
    var den = 1 + wei;
    var rating = Math.log2(num / den) * 800.0;
    rating -= f(n + 1);
    return rating;
}

// (-inf, inf) -> (0, inf)
function positivize_rating(r) {
    if (r >= 400.0) {
	return r;
    }
    return 400.0 * Math.exp((r - 400.0) / 400.0);
}

// (0, inf) -> (-inf, inf)
function unpositivize_rating(r) {
    if (r >= 400.0) {
	return r;
    }
    return 400.0 + 400.0 * Math.log(r / 400.0);
}

$(() => {
    indexedDB.open("PredictorDB", 1).onupgradeneeded = function (event) {
        var db = event.target.result;
        db.createObjectStore("APerfs", { keyPath: "id" });
        db.createObjectStore("Standings", { keyPath: "id" });
    };

    var state = 0;

    $('#show-unrated-description').tooltip();

    if (localStorage.getItem('predictor-contests')) setItemToSelector(JSON.parse(localStorage.getItem('predictor-contests')));
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: '/api/aperfs'
    }).done(contests => {
        setItemToSelector(contests);
        localStorage.setItem('predictor-contests', JSON.stringify(contests));
    });

    //ユーザー名検索
    $('#username-search-button').click(() => {
        clearAlert();
        const searchName = $('#username-search-input').val();
        if (searchName === '') {
            setAlert("ユーザー名を入力してください");
            return;
        }

        let found = false;
        $('#standings-body a[class^=user]').each((_, elem) => {
            if (!found && $(elem).text() === searchName) {
                // 現在の枠線を削除
                $('#standings-body > tr').css('border', 'none');
                // 枠線をつける
                $(elem).parent().parent().css('border', 'solid 3px #dd289a');
                // スクロール
                $("html,body").animate({
                    scrollTop: $(elem).offset().top - $(window).height() / 2
                });
                found = true;
            }
        });

        if (!found) {
            setAlert("ユーザー名が見つかりませんでした");
        }
        
        function setAlert(val) {
            $('#username-search-input').addClass('is-invalid');
            $('#username-search-alert').text(val);
        }
        function clearAlert() {
            $('#username-search-input').removeClass('is-invalid');
            $('#username-search-alert').empty();
        }
    });
    $('#username-search-input').keypress(pressedKey => {
        if (pressedKey.which === 13) {
            // エンターキー
            $('#username-search-button').click();
        }
    });


    function setItemToSelector(items) {
        var selected = $("#contest-selector").val();
        $("#contest-selector").empty();
        items.forEach((item) => {
            $("#contest-selector").append(`<option>${item}</option>`);
        });
        $("#contest-selector").val(selected);
    }

    function toggleLoadingState() {
        if (state === 0) {
			state = 1;
            $('#confirm-btn').text('読み込み中…');
            $('#confirm-btn').prop("disabled", true);
        }
        else {
			state = 0;
            $('#confirm-btn').text('確定');
            $('#confirm-btn').prop("disabled", false);
        }
    }

    $('#confirm-btn').click(() => {
		var contestID = $("#contest-selector").val();
        toggleLoadingState();
        DrawTable(contestID).done(() => {
            toggleLoadingState();
        });
    });


    function DrawTable(contestID) {
        var table = $('#standings-body');

        var deffer = $.Deferred();

        $.when(
            getContestInfo("Standings"),
            getContestInfo("APerfs")
        )
        .done((standings, aPerfs) => {
            //確定していたらストレージに保存する
            for (var i = 0; i < standings.StandingsData.length; i++) {
                delete standings.StandingsData[i].TaskResults;
            }
            if (standings.Fixed) {
                setData('APerfs', contestID, aPerfs);
                setData('Standings', contestID, standings);
            }
            draw(standings.StandingsData, aPerfs, standings.Fixed, $("#show-unrated").prop("checked"));
            deffer.resolve();
        }).fail(x => {
            deffer.reject();
        });
        
        return deffer.promise();

        function getContestInfo(type) {
            var deffer = $.Deferred();

            //ストレージに存在していたらそっちを返す
            getData(type, contestID).done(aperfs => {
                deffer.resolve(aperfs);
            }).fail(() => {
                $.ajax({
                    type: 'GET', dataType: 'json', url: `/api/${type}/${contestID}`
                }).done(aperfs => {
                    deffer.resolve(aperfs);
                }).fail(() => {
                        deffer.reject();
                });
            });
            return deffer.promise();
        }

        //O(n + mR)
        //n := サブミットした人数(2500人くらい ?)
        //m := Ratedな人(これも2500人)
        //R := レートの幅(4000くらい)
        function draw(Standings, APerfs, isFixed, ContainUnrated) {
            //テーブルをクリア
			table.empty();

			var maxDic =
				[
					[/^abc12[6-9]$/, 2000],
					[/^abc1[3-9]\d$/, 2000],
					[/^abc\d{3}$/, 1200],
					[/^arc\d{3}$/, 2800],
					[/^agc\d{3}$/, Infinity],
					[/^apc\d{3}$/, Infinity],
					[/^cf\d{2}-final-open$/, Infinity],
					[/^soundhound2018-summer-qual$/, 2000],
					[/^caddi2018$/, 1800],
					[/^caddi2018b$/, 1200],
					[/^aising2019$/, 2000],
					[/^keyence2019$/, 2800],
					[/^nikkei2019-qual$/, 2800],
					[/^exawizards2019$/, 2800],
					[/^diverta2019/, 2800],
					[/^m\-solutions2019$/, 2800],
					[/.*/, Infinity]
				];

            //Perf計算時に使うパフォ(Ratedオンリー)
            var activePerf = [];
            var isAnyoneRated = false;
			const ratedLimit = maxDic.filter(x => x[0].exec(contestID))[0][1];
			//defaultPerfは基本的にコンテスト中しか出ないので過去のことは考えなくて良い(今後の評価基準にしました)
			const defaultAPerf =
				{
					1200: 800,
					2000: 800,
					2800: 1000,
					Infinity: 1200
				}[ratedLimit];

            Standings.forEach(function (element) {
                if (!element.IsRated || element.TotalResult.Count === 0) return;
                if (!APerfs[element.UserScreenName]) {
                    //ここで何も追加しないと下限RatedValueが人数を下回ってしまい、こわれる
                    activePerf.push(defaultAPerf);
                    return;
                }
                isAnyoneRated = true;
                activePerf.push(APerfs[element.UserScreenName]);
            });

            //要するにUnRatedコン
            if (!isAnyoneRated) {
                //レーティングは変動しないので、コンテスト中と同じ扱いをして良い。(逆にしないと)
                isFixed = false;

                //元はRatedだったと推測できる場合、通常のRatedと同じような扱い
                activePerf = [];
                for (var i = 0; i < Standings.length; i++) {
                    var element = Standings[i];
                    if (element.OldRating >= ratedLimit || element.TotalResult.Count === 0) continue;
                    if (!APerfs[element.UserScreenName]) {
                        activePerf.push(defaultAPerf);
                        continue;
                    }
                    //Ratedフラグをオンに
                    Standings[i].IsRated = true;
                    activePerf.push(APerfs[element.UserScreenName]);
                }
            }

            //限界パフォーマンス(上限なしの場合は一位の人のパフォ)
            var maxPerf = ratedLimit === Infinity ? getPerf(1) : ratedLimit + 400;

            //addRowを回すときのパフォ 0.5を引いているのは四捨五入が発生する境界に置くため
            var currentPerf = maxPerf - 0.5;
            var rankVal = calcRankVal(currentPerf);

            //タイの人を入れる(順位が変わったら描画→リストを空に)
            var tiedList = [];
            var rank = 1;
            var lastRank = 0;
            var ratedCount = 0;
            //全員回す
			Standings.forEach(function (element) {
				if (!ContainUnrated && !element.IsRated || element.TotalResult.Count === 0) return;
				if (lastRank !== element.Rank) {
					addRow();
					rank += ratedCount;
					ratedCount = 0;
					tiedList = [];
				}
				tiedList.push(element);
				lastRank = element.Rank;
				if (element.IsRated) ratedCount++;
			});
            //最後に更新してあげる
            addRow();

            //タイリストの人全員行追加
            function addRow() {
                var fixRank = rank + Math.max(0, ratedCount - 1) / 2;
                while (rankVal < fixRank - 0.5 && currentPerf >= -8192) {
                    currentPerf--;
                    rankVal = calcRankVal(currentPerf);
                }
                var perf = currentPerf + 0.5;
				tiedList.forEach(function (element) {
					var matches = element.Competitions - (isFixed && element.IsRated ? 1 : 0);
					var oldRate = isFixed ? element.OldRating : element.Rating;
					var newRate = Math.floor(positivize_rating(matches !== 0 ? calc_rating_from_last(unpositivize_rating(oldRate), perf, matches) : perf - 1200));
					var name = element.UserScreenName;
					var node = `<tr><td>${rank}</td><td><a class="user-${getColor(oldRate)}" href=http://atcoder.jp/users/${name} >${name}</a></td><td>${perf}</td><td>${getRatingChangeStr(oldRate, newRate)}</td></tr>`;
					table.append(node);

					function getRatingChangeStr(oldRate, newRate) {
						return element.IsRated ? `${ratingSpan(oldRate)} -> ${ratingSpan(newRate)}(${(newRate >= oldRate ? '+' : '')}${newRate - oldRate})` : `${ratingSpan(oldRate)}(unrated)`;

						function ratingSpan(rate) {
							return `<span class="user-${getColor(rate)}">${rate}</span>`;
						}
					}
				});
            }

            // O(mlogR) (二分探索)
            function getPerf(rank) {
				var upper = 8192;
				var lower = -8192;

                while (upper - lower > 0.5) {
					if (rank - 0.5 > calcRankVal(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2;
					else lower += (upper - lower) / 2;
                }

                return innerPerf = lower + (upper - lower) / 2;
            }
            // O(m)
            function calcRankVal(X) {
                var res = 0;
				activePerf.forEach(function (APerf) {
					res += 1.0 / (1.0 + Math.pow(6.0, (X - APerf) / 400.0));
				});
                return res;
            }
        }
    }

    function setData(store, key, value) {
        var defferd = $.Deferred();
        try {
			indexedDB.open('PredictorDB').onsuccess = (e) => {
				var db = e.target.result;
				var trans = db.transaction(store, 'readwrite');
				var objStore = trans.objectStore(store);
				var data = { id: key, data: value };
				var putReq = objStore.put(data);
				putReq.onsuccess = defferd.resolve;
			};
        }
        catch (e){
            defferd.reject(e);
        }
        return defferd.promise();
    }

    function getData(store, key) {
        var defferd = $.Deferred();
        try {
			indexedDB.open('PredictorDB').onsuccess = (e) => {
				var db = e.target.result;
				var trans = db.transaction(store, 'readwrite');
				var objStore = trans.objectStore(store);
				objStore.get(key).onsuccess = function (event) {
					var result = event.target.result;
					if (!result) defferd.reject("key was not found");
					else defferd.resolve(result.data);
				};
			};
        }
        catch{
            defferd.reject();
        }
        return defferd.promise();
    }
});