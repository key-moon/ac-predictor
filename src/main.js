import { initializeID } from './libs/tabID';

initializeID();

/*//モーダル関連
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
})();*/


import {SideMenu} from "./libs/sidemenu/sidemenu";
import {predictor} from "./elements/predictor/script";
import {estimator} from "./elements/estimator/script";

let sidemenu = new SideMenu();

if (predictor.ElementShouldDisplayed(document.location.href)) sidemenu.AddElement(predictor);
if (estimator.ElementShouldDisplayed(document.location.href)) sidemenu.AddElement(estimator);
