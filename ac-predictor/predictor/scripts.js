
//NameSpace
SideMenu = {};

//共有データセット(HistoryとかStandingsとか)
SideMenu.Datas = {};
//共有データセットそれぞれをUpdateする関数を入れておく
SideMenu.Datas.Update = {}
//Datas.Update内に関数を追加

//History
SideMenu.Datas.History = null;
SideMenu.Datas.Update.History = (() => {
	var d = $.Deferred();
	try {
		$.ajax({
			url: 'https://beta.atcoder.jp/users/${userScreenName}/history/json',
			type: "GET",
			dataType: "json"
		}).done(function (history) {
			SideMenu.Datas.History = history;
			d.resolve();
		})
	}
	catch {
		d.reject();
	}
	return d.promise();
});

//Standings
SideMenu.Datas.Standings = null;
SideMenu.Datas.Update.Standings = (() => {
	var d = $.Deferred();
	try {
		$.ajax({
			url: 'https://beta.atcoder.jp/contests/${contestScreenName}/standings/json',
			type: "GET",
			dataType: "json"
		}).done(function (standings) {
			SideMenu.Datas.Standings = standings;
			d.resolve();
		})
	}
	catch{
		d.reject();
	}
	return d.promise();
});

//APerfs
SideMenu.Datas.APerfs = null;
SideMenu.Datas.Update.APerfs = (() => {
	var d = $.Deferred();
	try {
		$.ajax({
			url: 'https://ac-predictor.azurewebsites.net/api/aperfs/${contestScreenName}',
			type: "GET",
			dataType: "json"
		}).done(function (aperfs) {
			SideMenu.Datas.APerfs = aperfs
			d.resolve();
		})
	}
	catch{
		d.reject();
	}
	return d.promise();
});

//サイドメニューを生成
(function () {
	var menuWidth = 350
	var keyWidth = 50
	var speed = 150
	var sideMenuScript =
		`<script>//参考:http://blog.8bit.co.jp/?p=12308
(() => {
const activeClass = 'sidemenu-active'
var menuWrap = '#menu_wrap'
var sideMenu = '#sidemenu'
var sideMenuKey = '#sidemenu-key'
var menuWidth = ${menuWidth}
var keyWidth = ${keyWidth}
var speed = ${speed}

var windowHeight = $(window).height();
$(sideMenu).height(windowHeight);

//メニュー開閉
$(sideMenuKey).click(function () {
	//ボタンの文言を変更する部分をCSSTransitionでやらせたい
	$(sideMenuKey).toggleClass('glyphicon-menu-left');
	$(sideMenuKey).toggleClass('glyphicon-menu-right');
	$(menuWrap).toggleClass(activeClass);
});

//画面リサイズ時にheightを読み直し
var timer = false;
$(window).resize(function () {
	if (timer !== false) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		windowHeight = $(window).height();
		$(sideMenu).height(windowHeight);
	}, 50);
});

//アコーディオンメニューのなんか
$('#sidemenu').on('click','.menu-header',(event) => {
	//$(event.target).parents('.menu-wrapper').find('.menu-content').toggleClass('menu-content-collapse')
	$(event.target).parents('.menu-wrapper').find('.menu-box').toggleClass('menu-box-collapse')
	$(event.target).find('.glyphicon').toggleClass('glyphicon-menu-down')
	$(event.target).find('.glyphicon').toggleClass('glyphicon-menu-up')
})
/*$('.menu-content').exResize((event) => {
	$(event.target).parents('.menu-box').css('height',event.target.clientHeight)
});*/

})();
</script>`
	var sideMenuStyle =
		`<style>#menu_wrap{
	display:block;
	position:fixed;
	top:0;
	width:${keyWidth + menuWidth}px;
	right:-${menuWidth}px;
	transition: all ${speed}ms 0ms ease;
	margin-top:50px;
}

#sidemenu{
	background:#000;
	opacity:0.85;
}
#sidemenu-key{
	border-radius:5px 0px 0px 5px;
	background:#000;
	opacity:0.75;
	color:#FFF;
	padding:30px 0;
	cursor:pointer;
	margin-top:100px;
	text-align: center;
}

#sidemenu{
	display:inline-block;
	width:${menuWidth}px;
	float:right;
}

#sidemenu-key{
	display:inline-block;
	width:${keyWidth}px;
	float:right;
}

.sidemenu-active{
	transform: translateX(-${menuWidth}px);
}

.sidemenu-txt{
	color: #DDD;
}
/*アコーディオンメニュー*/
.menu-wrapper{
	border-bottom: 1px solid #FFF;
}
.menu-header h4{
	user-select: none;
	
}
.menu-header{
	margin:10px 20px 10px 20px;
}

.menu-box{
	overflow: hidden;
	transition: all 300ms 0s ease;
}
.menu-box-collapse{
	height:0px !important;/**/
}

.menu-content{
	padding: 10px 20px 10px 20px;
	transition: all 300ms 0s ease;
}
.menu-box-collapse .menu-content{
	transform: translateY(-100%);
}
</style>`
	var ratingScript =
		`<script src="https://koba-e964.github.io/atcoder-rating-estimator/atcoder_rating.js"></script>`
	$('#main-div').append(`<div id="menu_wrap"><div id="sidemenu" class="container"></div><div id="sidemenu-key" class="glyphicon glyphicon-menu-left"></div>${ratingScript}${sideMenuScript}${sideMenuStyle}</div>`);
})();

//サイドメニュー追加(将来仕様変更が起きる可能性大です)
SideMenu.appendToSideMenu = function (match, title, elemFunc) {
	try {
		if (!match.test(location.href)) return;
		//アコーディオンメニュー
		var dom =
			`<div class="menu-wrapper">
	<div class="menu-header">
		<h4 class="sidemenu-txt">${title}<span class="glyphicon glyphicon-menu-up" style="float: right"></span></h4>
	</div>
	<div class="menu-box"><div class="menu-content">${elemFunc()}</div></div>
</div>`
		$('#sidemenu').append(dom);
		var contents = $('.menu-content');
		var contentElem = contents[contents.length - 1];
		$(contentElem).parents('.menu-box').css('height', contentElem.scrollHeight)
	}
	catch (e) {
		console.error(e);
	}
};

//ライブラリを追加するやつ
SideMenu.appendLibrary = function (source) {
	$('head').append(`<script src="${source}"></script>`);
};
