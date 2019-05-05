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

import { generateSideMenu } from './libs/sidemenu/generate'
generateSideMenu();



//サイドメニュー要素の入れ物
SideMenu.Elements = {};
SideMenu.ViewOrder = ["Predictor", "Estimator"];

//%elements%

SideMenu.ViewOrder.forEach(async (elem) => {
    await SideMenu.Elements[elem]();
});
