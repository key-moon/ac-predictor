"use strict";

export function fixTime() {
  $('time.fixtime').each(function(){
    var date = moment($(this).text());
    if ($(this).hasClass('fixtime-second')) {
      $(this).text(date.format('YYYY-MM-DD HH:mm:ss'));
    } else if ($(this).hasClass('fixtime-short')) {
      $(this).text(date.format('M/D(ddd) HH:mm'));
    } else {
      $(this).text(date.format('YYYY-MM-DD(ddd) HH:mm'));
    }
    $(this).removeClass('fixtime');
  });
}

$(function() {
  // timezone fixer
  moment.locale(LANG);
  fixTime();

  // server timer
  var DAY = 24*60*60*1000;
  var contestMode = (typeof startTime !== 'undefined');
  var serverTimeMode = false;
  var serverTimeOpacity = 1;
  var dayTexts = [' day & ',' days & '];
  if (LANG == 'ja') dayTexts = ['日と','日と'];
  function updateServerTime() {
    var serverTime = getServerTime();
    var text = moment(serverTime).locale(LANG).format('YYYY-MM-DD (ddd)<br>HH:mm:ss Z');
    if (contestMode) {
      if (!serverTimeMode) {
        if (serverTime.isBetween(startTime, endTime)) {
          var remainingMS = endTime.diff(serverTime);
          var days = Math.floor(remainingMS/DAY);
          remainingMS %= DAY;
          if (days < 100) {
            text = remainingText+'<br>';
            if (days == 1) text += days+dayTexts[0];
            if (days > 1) text += days+dayTexts[1];
            text += moment.utc(remainingMS).format('HH:mm:ss');
          }
        } else if (serverTime.isBetween(moment(startTime).subtract(30, 'd'), startTime)) {
          var countDownMS = startTime.diff(serverTime);
          var days = Math.floor(countDownMS/DAY);
          countDownMS %= DAY;
          text = countDownText+'<br>';
          if (days == 1) text += days+dayTexts[0];
          if (days > 1) text += days+dayTexts[1];
          text += moment.utc(countDownMS).format('HH:mm:ss');
        }
      }
      if (serverTime.isSame(startTime, 's')) $('#modal-contest-start').modal('show');
      if (serverTime.isSame(endTime, 's')) $('#modal-contest-end').modal('show');
    }
    if ($('#fixed-server-timer').text() != text) {
      $('#fixed-server-timer').html(text);
    }
  }
  updateServerTime();
  setInterval(updateServerTime, 30);
  if (contestMode) {
    $('#fixed-server-timer').click(function(){
      serverTimeMode = !serverTimeMode;
      updateServerTime();
    });
  } else {
    $('#fixed-server-timer').click(function(){
      serverTimeOpacity = 0.1/serverTimeOpacity;
      $(this).css('opacity', serverTimeOpacity);
    });
  }

  // span.lang
  $('span.lang').each(function(){
    if ($(this).children('span').size() > 1) {
      $(this).children('span.lang-'+LANG).show();
    } else {
      $(this).children('span').show();
    }
  });

  // select2
  if ($('select').length) {
    $.fn.select2.defaults.set('theme', 'bootstrap');
    $('select').select2();
  }

  // collapse
  if($(window).width()<768){$('.panel-collapse').removeClass('in').collapse('hide');}
  $('.panel-heading').click(function(){$($(this).data('target')).collapse('toggle');});

  // panel-filter
  $('.filter-title').click(function() {
    if ($(this).hasClass('show')) {
      $(this).removeClass('show');
    } else {
      $(this).addClass('show');
    }
    $($(this).data('target')).slideToggle("fast");
  });

  // tooltip
  $('.tooltip-unix').each(function() {
    var unix = parseInt($(this).attr('title'), 10);
    if (1400000000 <= unix && unix <= 5000000000) {
      var date = new Date(unix*1000);
      $(this).attr('title', date.toLocaleString());
    }
  });
  $('[data-toggle="tooltip"]').tooltip();

  // toggle buttons
  $('.toggle-btn-text').click(function(){
    var state = ($(this).text() == $(this).data('on-text'));
    if (state) {
      $(this).text($(this).data('off-text'));
    } else {
      $(this).text($(this).data('on-text'));
    }
    // source code expand
    if ($(this).hasClass('source-code-expand-btn')) {
      var id = '#'+$(this).data('target');
      if (state) {
        $(id).css('max-height','none');
      } else {
        $(id).css('max-height','350px');
      }
    }
  });

  // fav button
  if ($('.fav-btn').length) {
    {
      reloadFavs();
      $('.fav-btn').each(function() {
        var name = $(this).data('name');
        if (favSet.has(name)) {
          $(this).attr('src', '//img.atcoder.jp/assets/icon/fav.png');
          return;
        }
      });
    }
    $('.fav-btn').click(function() {
      var name = $(this).data('name');
      if (toggleFav(name)) {
        $(this).attr('src', '//img.atcoder.jp/assets/icon/fav.png');
      } else {
        $(this).attr('src', '//img.atcoder.jp/assets/icon/unfav.png');
      }
    });
  }

  // tr data-href
  $('tbody tr[data-href]').addClass('clickable').click(function(e) {
    if (e.ctrlKey || e.metaKey) window.open($(this).attr('data-href'), '_blank');
    else window.location = $(this).attr('data-href');
  }).find('a').click(function(e) {
    e.stopPropagation();
  });

  // scroll page top
  {
    var spt = $('#scroll-page-top');
    $(window).scroll(function() {
      if ($(this).scrollTop() > 500) {
        if (spt.is(':hidden')) spt.fadeIn();
      } else {
        if (!spt.is(':hidden')) spt.fadeOut();
      }
    });
    spt.click(function() {
      $('html,body').animate({scrollTop:0},200);
    });
  }

  // google analytics
  /// banner
  $('.ads-tracking').click(function() {
    ga('send', 'event', location.host+'::'+$(this).data('ads-segment'), 'click', $(this).attr('href'));
  });
});
