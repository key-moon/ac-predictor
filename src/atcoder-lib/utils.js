"use strict";
// format
if (typeof String.prototype.format === 'undefined') {
  String.prototype.format = function(arg) {
    var rep_fn = undefined;
    if (typeof arg == "object") {
      rep_fn = function(m, k) { return arg[k];};
    } else {
      var args = arguments;
      rep_fn = function(m, k) { return args[parseInt(k)];};
    }
    return this.replace(/\{(\w+)\}/g, rep_fn);
  }
}

// array search
export function has(a, val) {
  return a.indexOf(val) != -1;
}

// other util
export function arrayToSet(a) {
  var s = new Set();
  for (var i in a) s.add(a[i]);
    return s;
}
export function setToArray(s) {
  var a = [];
  s.forEach(function(val) { a.push(val);});
  return a;
}


// cookie
var COOKIE_EXPIRES = 10000;
export function setCookie(key, val, expires) {
  Cookies.set(key, val, { expires: expires || COOKIE_EXPIRES});
}
export function getCookie(key) {
  return Cookies.getJSON(key);
}
export function getCookieBool(key) {
  return (Cookies.get(key) === 'true');
}
export function delCookie(key) {
  Cookies.remove(key);
}

// local storage
export function setLS(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch(error) {
    console.log(error);
  }
}
export function getLS(key) {
  var val = localStorage.getItem(key);
  return val?JSON.parse(val):val;
}
export function delLS(key) {
  localStorage.removeItem(key);
}

// migrate Cookie to LocalStorage
{
  var val;
  if (val = getCookie('fav')) {
    for (var i in val) favSet.add(val[i]);
    storeFavs();
    delCookie('fav');
  }
  var keys = ['plain_editor','auto_height','defaultLang',
    'show_affiliation','show_fav_btn','show_fav_only','show_rated_only'];
  for (var i = 0; i < keys.length; i++) {
    if (val = Cookies.get(keys[i])) {
      setLS(keys[i], val);
      delCookie(keys[i]);
    }
  }
}


// server time
export var timeDelta = getCookie('timeDelta');
if (typeof timeDelta === 'undefined') {
  timeDelta = 0;
  setCookie('timeDelta', 0, 1/24.0);
  $.ajax('/servertime?ts={}'.format(moment().unix())).done(function(serverTime) {
    serverTime = moment(serverTime);
    if (!serverTime.isValid()) return;
    timeDelta = serverTime.diff(moment());
    setCookie('timeDelta', timeDelta, 1/24.0);
  });
}
function getServerTime() { return moment().add(timeDelta);}

// escape
export function E(str) {
  return str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
}

// toRegExp
export function toRegExp(pattern) {
  pattern = pattern
  .replace(/[-\/\\^+.()|[\]{}]/g, '\\$&')
  .replace(/\?/g, '.')
  .replace(/\*/g, '.*');
  return new RegExp('^'+pattern);
}

// randint
export function rand(range) {
  return Math.floor(Math.random()*(range[1]-range[0]))+range[0];
}

// clipboard
export function copy(textVal){
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = textVal;
  var bodyElm = document.getElementsByTagName("body")[0];
  bodyElm.appendChild(copyFrom);
  copyFrom.select();
  var retVal = document.execCommand('copy');
  bodyElm.removeChild(copyFrom);
  return retVal;
}

// fit font size
(function($) {
  $.fn.fitFontSize = function(width, len, max) {
    $(this).css('font-size', Math.min(width/len, max)+'px');
  };
})(jQuery);

// user favs
export var favSet;
export function storeFavs() {
  setLS('fav', setToArray(favSet));
}
export function reloadFavs() {
  favSet = arrayToSet(getLS('fav') || []);
}
export function toggleFav(val) {
  reloadFavs();
  var res;
  if (favSet.has(val)) {
    favSet.delete(val);
    res = false;
  } else {
    favSet.add(val);
    res = true;
  }
  storeFavs();
  return res; // has val now
}



