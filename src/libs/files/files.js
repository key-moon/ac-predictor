export function saveFile(content, name) {
    var bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    var blob = new Blob([bom, JSON.stringify(content)], { type: "text/plain" });

    var a = document.createElement("a");
    a.download = name;
    a.target = "_blank";
    a.href = window.URL.createObjectURL(blob);

    // for Firefox
    if (window.URL && window.URL.createObjectURL) {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    // for Chrome
    else if (window.webkitURL && window.webkitURL.createObject) {
        a.href = window.webkitURL.createObjectURL(blob);
        a.click();
    }
}
