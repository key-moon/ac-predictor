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
        const StandingsURL = `/api/standings/${contestID}`;
        const APerfsURL = `/api/aperfs/${contestID}`;

        var table = document.getElementById('standings-body');
        
        var deffer = $.Deferred();

        $.when(
            $.ajax({
                type: 'GET', dataType: 'json', url: StandingsURL
            }),
            $.ajax({
                type: 'GET', dataType: 'json', url: APerfsURL
            }))
        .done((standings, aPerfs) => {
            if (standings[1] !== 'success' || aPerfs[1] !== 'success') {
                //例外処理
                deffer.fail();
                return;
            }
            draw(standings[0].StandingsData, aPerfs[0], standings[0].Fixed);
            deffer.resolve();
        });

        return deffer.promise();

        function draw(Standings, APerfs, isFixed) {
            //テーブルをクリア
            table.textContent = null;

            //Perf計算時に使うパフォ(Ratedオンリー)
            var activePerf = []
            Standings.forEach(function (element) {
                if (element.IsRated && element.TotalResult.Count !== 0) {
                    if (!(APerfs[element.UserScreenName])) {
                        console.log(element.UserScreenName)
                    }
                    else {
                        activePerf.push(APerfs[element.UserScreenName])
                    }
                }
            });

            var rank = 1
            var maxPerf = (contestID.substr(0, 3) === "abc" ? 1600 : (contestID.substr(0, 3) === "arc" ? 3200 : 8192))
            var lastRank = 0

            //タイの人を入れる(順位が変わったら描画→リストを空に)
            var tiedList = []

            //全員回す
            Standings.forEach(function (element) {
                if (!element.IsRated || element.TotalResult.Count === 0) return;
                if (lastRank !== element.Rank) {
                    addRow()
                    rank += tiedList.length;
                    tiedList = []
                }
                tiedList.push(element)
                lastRank = element.Rank;
            })
            //最後に更新してあげる
            addRow()

            //タイリストの人全員分行追加
            function addRow() {
                tiedList.forEach(function (element) {
                    var oldRate = (isFixed ? element.OldRating : element.Rating)
                    var matches = element.Competitions - (isFixed ? 1 : 0)

                    var fixRank = rank + (tiedList.length - 1) / 2
                    var perf = getPerf(fixRank)
                    var newRate = Math.min(maxPerf, Math.floor(positivize_rating(calc_rating_from_last(oldRate, perf, matches))))
                    var node = genNode(rank, element.UserScreenName, element.TotalResult.Score / 100, perf, oldRate, newRate)
                    table.appendChild(node)

                    //追加する一行分のノードを取得
                    function genNode(rank, name, point, perf, oldrate, newrate) {
                        return `<tr><td>${rank}</td><td class="user-${getColor(oldrate)}"><a href=http://beta.atcoder.jp/users/${name}>${name}</a></td><td>${pointNode}</td><td>${getChangeNode(oldrate, newrate)}</td></tr>`;
                        function getChangeNode(oldRate, newRate) {
                            return `${ratingSpan(oldRate)} -> ${ratingSpan(newRate)}(${z(newRate >= oldRate ? '+' : '')}${newRate - oldRate})`;

                            function ratingSpan(rating) {
                                return `<span class="user-${getColor(rate)}">${rate}</span>`;
                            }
                        }
                    }
                })
            }

            // O(nlogn)
            function getPerf(rank) {
                var upper = 8192
                var lower = -8192

                while (upper - lower > 0.5) {
                    if (rank - 0.5 > calcPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
                    else lower += (upper - lower) / 2
                }

                var innerPerf = Math.round(lower + (upper - lower) / 2)

                return Math.min(innerPerf, maxPerf)

                // O(n)
                function calcPerf(X) {
                    var res = 0;
                    activePerf.forEach(function (APerf) {
                        res += 1.0 / (1.0 + Math.pow(6.0, ((X - APerf) / 400.0)))
                    })
                    return res;
                }
            }
        }
    }
})();