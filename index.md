---
title: Home
styles: [base.css, standingstable.css]
scripts: [main.bundle.js]
---

<div class="alert alert-warning" role="alert">Rated/Unrated 登録機能追加に伴い、現在 Web サイト版では不正確な結果を返すことが予測されています。<a href="/userscript">UserScript 版</a>で用いているアルゴリズムでは同等の問題が起こらないと考えられるため、正確な結果はそちらにてご確認下さい。この問題については、現在修正作業を行っています。お手数をおかけしてしまい申し訳ありません。</div>

<div class="my-2">
    <div class="form-row my-0">
        <select class="form-control col-sm-6 col-md-5 col-lg-4" id="contest-selector"></select>
        <button type="button" class="btn col-sm-3 col-md-2 btn-primary" id="confirm-btn">確定</button>
    </div>
    <div class="form-row my-0">
        <input class="form-control col-sm-6 col-md-5 col-lg-4" id="username-search-input">
        <button type="button" class="btn col-sm-3 col-md-2 btn-outline-secondary" id="username-search-button">ユーザーを検索</button>
        <div class="invalid-feedback" id="username-search-alert"></div>
    </div>
    <div class="form-group row">
        <div class="custom-control custom-checkbox my-1 mx-2">
            <input type="checkbox" class="custom-control-input" id="show-unrated">
            <label class="custom-control-label" for="show-unrated" data-toggle="tooltip" title="表示のみで、その人の存在は計算に反映されません。" id="show-unrated-description">unratedな参加者を表示する</label>
        </div>
    </div>
</div>
<div class="row my-2">
    <table class="table table-bordered table-striped table-hover th-center td-center td-middle" id="standings">
        <thead>
            <tr>
                <th style="width:3%;white-space:nowrap;">順位</th>
                <th>ユーザ</th>
                <th style="width:84px;min-width:84px">パフォ</th>
                <th style="width:168px;min-width:168px">レート変化</th>
            </tr>
        </thead>
        <tbody id="standings-body"></tbody>
    </table>
</div>
