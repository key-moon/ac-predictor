$(() => {
    $('#username-search-button').click(() => {
        // 現在のメッセージを削除
        $('.username-search-alert').css('display', 'none');
        const searchName = $('#username-search-input').val();

        if (searchName === '') {
            $('.username-search-alert.no-input').css('display', 'block');
        } else {
            let found = false;
            $('#standings-body a[class^=user]').each((_, elem) => {  // :contains()ではダメ
                if ($(elem).text() === searchName) {
                    found = true;
                    // 現在の枠線を削除
                    $('#standings-body > tr').css('border', 'none');
                    // 枠線をつける
                    $(elem).parent().parent().css('border', 'solid 3px #dd289a');
                    // スクロール
                    $("html,body").animate({
                        scrollTop : $(elem).offset().top - $(window).height() / 2
                    });
                }
            });

            if (!found) {
                $('.username-search-alert.not-found').css('display', 'block');
            }
        }
    });

    $('#username-search-input').keypress(pressedKey => {
        if (pressedKey.which === 13) {
            // エンターキー
            $('#username-search-button').click();
        }
    });
});