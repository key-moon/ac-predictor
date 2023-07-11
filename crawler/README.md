## setup
```sh
# install
pip install -e .
# set repository path
export REPOSITORY_PATH=~/ghq/github.com/key-moon/ac-predictor-data
# login by your atcoder account
ac-predictor-crawler login
```
## usage

自動更新
```sh
ac-predictor-crawler-runner
```

crontab
```crontab
*/20 * * * * export REPOSITORY_PATH=/path/to/ac-predictor-data; export HEALTHCHECK_UUID=your-uuid; /path/to/healthcheck.sh
```

手動で更新
```sh
# コンテスト一覧の差分更新
ac-predictor-crawler contests
# コンテスト一覧の更新
ac-predictor-crawler contests --refresh
# 順位表を更新
ac-predictor-crawler standings [contestScreenName]
# 成績表を更新
ac-predictor-crawler results [contestScreenName]
# aperfs を計算して更新（ローカルの成績表を使用）
ac-predictor-crawler aperfs --use-results-cache [contestScreenName]
```
