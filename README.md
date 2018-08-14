# ac-predictor.user.js

[https://greasyfork.org/ja/scripts/369954-ac-predictor](ac-predictor)のビルド前ファイルです。ビルドは現状自作ツール(非公開)を使用していますが、いずれWebPack等に移行する予定です。

ルートディレクトリは/ac-predictor/predictor/とします。

# 構造

```
├ {要素名}
│　　　├ settings.txt
│　　　├ script.js
│　　　├ dom.css
│　　　├ dom.js
│　　　└ dom.html
├ {要素名}
│　　　└ (略)
│
├ jquery
├ header.js
└ scripts.js
```

# 説明
## ルート内
### jquery
補完を出すために入れています
### header.js
UserScriptヘッダです
### script.js
サイドメニューや名前空間といったスクリプトの初期化やファイナライズを行います。
%elements%部分が要素追加部に置換されます。
## 要素ファイル内
### settings.txt
要素名、要素の実行される場所(正規表現)が書かれています。
### script.js
要素を追加する前に行う処理です。名前空間内に空間やファイルを作成する目的が主です。
### dom.css
要素に適用されるスタイルです。
### dom.js
要素で実行される関数です。
### dom.html
要素のHTMLです。

# ビルド
これらは、以下のように纏められます。

#全体
```
[header.js]
[script.js]
```

要素追加部
```
// [settings.txt.name]
SideMenu.Elements.[settings.txt.name] = (async () => {
	SideMenu.appendToSideMenu(/[settings.txt.page]/,'[settings.txt.name]',getElem);
	async function getElem() {
	${script.js]
  var js = 
	`[dom.js]`;
		var style = 
	`[dom.css]`;
		var dom = 
	`[dom.html]`;
		return `${dom}
	<script>${js}</script>
	<style>${style}</style>`;
	}
});
```

# 名前空間・ライブラリ
## SideMenu
全てをまとめる名前空間です。
## SideMenu.Datas / SideMenu.Datas.Update
共有データセットを入れる名前空間です。要素間でリソースを共有したいなどはここに全て入れます。Updateにはそのデータセットを再取得する関数を入れます。
### SideMenu.Datas.History / SideMenu.Datas.Update.History
自分の過去のコンテスト履歴が入ります。
### SideMenu.Datas.Standings / SideMenu.Datas.Update.Standings
コンテストページを開いている場合、ここに順位表が入ります。
### SideMenu.Datas.APerfs / SideMenu.Datas.Update.APerfs 
コンテストページを開いている場合、ここに参加者のその時点でのAPerf一覧が入ります。(AGC001以前のコンテストを除く)
## SideMenu.Elements
要素を追加する関数がここに入ります。これをViewOrder順に同期的に実行することで、サイドメニューの順序を保ちます。

## SideMenu直下の関数
### SideMenu.appendLibrary
ライブラリをURLではなく平文として追加します。非同期的に動作します。
### SideMenu.appendToSideMenu
サイドメニューに要素を追加する関数です。

## SideMenu直下の変数
### SideMenu.ViewOrder
SideMenuに表示する順番です。ここによって無効化なども可能です。
