$(() => {
    var state = 0;

    toggleLoadingState();
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: '/api/aperfs'
    }).done(contests => {
        console.log(contests);
        contests.forEach((element) => {
            $("#contest-selector").append(`<option>${element}</option>`);
        });
        toggleLoadingState();
    });

    function toggleLoadingState() {
        if (state == 0) {
            state = 1
            $('#confirm-btn').text('読み込み中…');
            $('#confirm-btn').prop("disabled", true);
        }
        else {
            state = 0
            $('#confirm-btn').text('確定');
            $('#confirm-btn').prop("disabled", false);
        }
    }

    $('#confirm-btn').click(() => {
        var contestID = $("#contest-selector").val()
        toggleLoadingState();
        DrawTable(contestID).done(() => {
            toggleLoadingState();
        });
    });


    function DrawTable(contestID) {
        var table = document.getElementById('standings-body');
        
        var deffer = $.Deferred();

        $.when(
            getContestInfo("Standings"),
            getContestInfo("APerfs")
        )
        .done((standings, aPerfs) => {
            //確定していたらローカルストレージに保存する
            if (standings.Fixed) {
                localStorage.setItem(`APerfs-${contestID}`, JSON.stringify(aPerfs));
                localStorage.setItem(`Standings-${contestID}`, JSON.stringify(standings));
            }
            draw(standings.StandingsData, aPerfs, standings.Fixed, false);
            deffer.resolve();
        }).fail(x => {
            deffer.reject();
        });

        return deffer.promise();
        
        function getContestInfo(type) {
            var deffer = $.Deferred();
            const lsKey = `${type}-${contestID}`;

            //ローカルストレージに存在してたらそっちを返す
            if (localStorage.getItem(lsKey)) {
                deffer.resolve(JSON.parse(localStorage.getItem(lsKey)));
            }
            else {
                $.ajax({
                    type: 'GET', dataType: 'json', url: `/api/${type}/${contestID}`
                }).done(aperfs => {
                    deffer.resolve(aperfs);
                }).fail(() => {
                    deffer.reject();
                });
            }
            return deffer.promise();
        }

        //O(n + mR)
        //n := サブミットした人数(2500人くらい ?)
        //m := Ratedな人(これも2500人)
        //R := レートの幅(4000くらい)
        function draw(Standings, APerfs, isFixed, ContainUnrated) {
            //テーブルをクリア
            table.textContent = null;

            //Perf計算時に使うパフォ(Ratedオンリー)
            var activePerf = []
            var rank = 1;
            var lastRank = 0;
            var ratedCount = 0;
            Standings.forEach(function (element) {
                if (element.IsRated && element.TotalResult.Count !== 0) {
                    if (!(APerfs[element.UserScreenName])) {
                        //存在しないユーザ
                        //console.log(element.UserScreenName)
                    }
                    else {
                        activePerf.push(APerfs[element.UserScreenName]);
                    }
                }
            });

            //限界パフォーマンス(上限なしの場合は一位の人のパフォ)
            var maxPerf = contestID ===
                ("SoundHound Inc. Programming Contest 2018 -Masters Tournament-" ? 2400 :
                (contestID.substr(0, 3) === "abc" ? 1600 : (contestID.substr(0, 3) === "arc" ? 3200 : Math.ceil(getPerf(0.5)))));
            
            //タイの人を入れる(順位が変わったら描画→リストを空に)
            var tiedList = []
            rank = 1;
            //全員回す
            Standings.forEach(function (element) {
                if ((ContainUnrated || !element.IsRated) || element.TotalResult.Count === 0) return;
                if (lastRank !== element.Rank) {
                    addRow();
                    rank += ratedCount;
                    tiedList = [];
                }
                tiedList.push(element);
                lastRank = element.Rank;
                if (element.IsRated) ratedCount++;
            })
            //最後に更新してあげる
            addRow();

            //現在のパフォ 0.5を引いているのは四捨五入が発生する境界に置くため
            var currentPerf = maxPerf - 0.5;
            var rankVal = calcRankVal(currentPerf);
            //タイリストの人全員行追加
            function addRow() {
                var fixRank = rank + (tiedList.length - 1) / 2;
                while (rankVal < fixRank) {
                    currentPerf--;
                    rankVal = calcRankVal(currentPerf);
                }
                var perf = currentPerf + 0.5;
                tiedList.forEach(function (element) {
                    var oldRate = (isFixed ? element.OldRating : element.Rating);
                    var matches = element.Competitions - (isFixed && element.IsRated ? 1 : 0);

                    var newRate = (isFixed ? Math.floor(positivize_rating(matches !== 0 ? calc_rating_from_last(oldRate, perf, matches) : perf - 1200)) : element.Rating);
                    var name = element.UserScreenName;
                    var point = element.TotalResult.Score / 100;
                    var node = `<tr><td>${rank}</td><td class="user-${getColor(oldRate)}"><a href=http://beta.atcoder.jp/users/${name} >${name}</a></td><td>${pointNode}</td><td>${getRatingChangeStr(oldrate, newRate)}</td></tr>`;
                    table.appendChild(node);
                    
                    function getRatingChangeStr(oldRate, newRate) {
                        return element.IsRated ? `${ratingSpan(oldRate)} -> ${ratingSpan(newRate)}(${(newRate >= oldRate ? '+' : '')}${newRate - oldRate})` : `${ratingSpan(oldRate)}(unrated)`;

                        function ratingSpan(rating) {
                            return `<span class="user-${getColor(rate)}">${rate}</span>`;
                        }
                    }
                })
            }

            // O(mlogR) (二分探索)
            function getPerf(rank) {
                var upper = 8192
                var lower = -8192

                while (upper - lower > 1) {
                    if (rank - 0.5 > calcRankVal(lower + (upper - lbower) / 2)) upper -= (upper - lower) / 2
                    else lower += (upper - lower) / 2
                }

                var innerPerf = Math.ceil(lower + (upper - lower) / 2)

                return Math.min(innerPerf, maxPerf)
            }
            // O(m)
            function calcRankVal(X) {
                var res = 0;
                activePerf.forEach(function (APerf) {
                    res += 1.0 / (1.0 + Math.pow(6.0, ((X - APerf) / 400.0)))
                })
                return res;
            }
        }
    }
})();