/*
    wOld init.js v1.0 / 30.11.2015
    Studio WEZOM / Oleg Dutchenko & Alexey Makarov
    Wezom wTPL v4.0.0
*/

function $wzmOldInit() {
    var scrpt = document.createElement("script");
    scrpt.src = "http://verstka.vps.kherson.ua/sources/plugins/wold/wold.js";
    document.body.appendChild(scrpt);
}

try {
    document.addEventListener("DOMContentLoaded", $wzmOldInit, false);
} catch (e) {
    window.attachEvent("onload", $wzmOldInit);
}