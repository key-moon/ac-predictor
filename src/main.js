import { initializeID } from './libs/tabID';

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

import { generateSideMenu } from './libs/sidemenu/generate'
generateSideMenu();

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

//%elements%

SideMenu.ViewOrder.forEach(async (elem) => {
    await SideMenu.Elements[elem]();
});
