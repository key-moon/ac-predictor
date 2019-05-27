/**
 * サイドメニューに追加される要素のクラスです。
 * @property {RegExp} [match]
 */
export class SideMenuElement {

    /**
     * オブジェクト生成用のコンストラクタです
     * @param {string} [id] 要素のコンテナに付加されるIDです。
     * @param {string} [title] 要素に表示されるタイトルです。
     * @param {RegExp} [match] 表示されるページを指定するための正規表現です。
     * @param {string} [document] 要素のHTMLです。
     * @param {Function} [afterAppend] 要素が追加された後に実行される処理用の関数です。
     */
    constructor(id, title, match, document, afterAppend) {
        this.id = id;
        this.title = title;
        this.match = match;
        this.document = document;
        this.afterAppend = afterAppend;
    }

    shouldDisplayed(url) {
		return this.match.test(url);
    }

    GetHTML() {
        return `<div class="menu-wrapper">
    <div class="menu-header">
        <h4 class="sidemenu-txt">${this.title}<span class="glyphicon glyphicon-menu-up" style="float: right"></span></h4>
    </div>
    <div class="menu-box"><div class="menu-content" id="${this.id}">${this.document}</div></div>
</div>`;
    }
}
