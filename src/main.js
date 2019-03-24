import initializeID from '/libs/tabID';

initializeID();

//NameSpace
SideMenu = {};

//ライブラリを追加するやつ
SideMenu.appendLibrary = function (source) {
    var defferd = $.Deferred();
    $.ajax({
        url: source
    }).done(((src) => {
        $('head').append(`<script>${src}</script>`);
        defferd.resolve();
    })(() => {
        defferd.fail();
    }));
    return defferd.promise();
};

//モーダル関連
SideMenu.Modal = {}
$('body').append('<div class="modal-standing"></div>');
SideMenu.Modal.SetContent = ((content) => {
    $('#modal-standing').html = content;
});
SideMenu.Modal.Show = (() => {
    $('#modal-standing').modal('show');
});
SideMenu.Modal.Hide = (() => {
    $('#modal-standing').modal('hide');
});
SideMenu.Modal.Toggle = (() => {
    $('#modal-standing').modal('toggle');
});

//通知関連
SideMenu.Notifications = {};
SideMenu.Notifications.CanSend = false;
(async () => {
    if (Notification.permission === 'denied') return;
    if (Notification.permission === 'default') {
        await (async () => {
            var defferd = $.Deferred();
            Notification.requestPermission((permission) => {
                SideMenu.Notifications.CanSend = permission === 'granted';
                defferd.resolve();
            })();
            return defferd.promise();
        });
        if (!Notification.permission) return;
    }
})();

SideMenu.appendLibrary("https://koba-e964.github.io/atcoder-rating-estimator/atcoder_rating.js");

//サイドメニュー追加(将来仕様変更が起きる可能性大)
SideMenu.appendToSideMenu = async function (match, title, elemFunc) {
    var defferd = $.Deferred();
    try {
        if (!match.test(location.href)) return;
        //アコーディオンメニュー
        var dom =
            `<div class="menu-wrapper">
	<div class="menu-header">
		<h4 class="sidemenu-txt">${title}<span class="glyphicon glyphicon-menu-up" style="float: right"></span></h4>
	</div>
	<div class="menu-box"><div class="menu-content">${await elemFunc()}</div></div>
</div>`
        $('#sidemenu').append(dom);
        var contents = $('.menu-content');
        var contentElem = contents[contents.length - 1];
        $(contentElem).parents('.menu-box').css('height', contentElem.scrollHeight)
        defferd.resolve();
    }
    catch (e) {
        console.error(e);
        defferd.reject();
    }
    return defferd.promise();
};


//サイドメニューを生成
(() => {
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
        `<script>from: https://koba-e964.github.io/atcoder-rating-estimator/atcoder_rating.js
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
}</script>`;
    $('#main-div').append(`<div id="menu_wrap"><div id="sidemenu" class="container"></div><div id="sidemenu-key" class="glyphicon glyphicon-menu-left"></div>${ratingScript}${sideMenuScript}${sideMenuStyle}</div>`);
})();


SideMenu.Files = {};
SideMenu.Files.Save = (value, name) => {
    var blob = new Blob([value], { type: 'text/plain' })
    window.navigator.msSaveBlob(blob, name);
};
SideMenu.Files.Load = (async () => {
    //todo
})


//サイドメニュー要素の入れ物
SideMenu.Elements = {};
SideMenu.ViewOrder = ["Predictor", "Estimator"];

SideMenu.Colors = ["unrated", "gray", "brown", "green", "cyan", "blue", "yellow", "orange", "red"];
SideMenu.GetColor = (rating) => {
    var colorIndex = 0
    if (rating > 0) {
        colorIndex = Math.min(Math.floor(rating / 400) + 1, 8)
    }
    return SideMenu.Colors[colorIndex]
};

//%elements%

SideMenu.ViewOrder.forEach(async (elem) => {
    await SideMenu.Elements[elem]();
});