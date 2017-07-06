/*
    localStorage test v1.2 / 30.11.2015
    Studio WEZOM / Oleg Dutchenko
    Wezom wTPL v4.0.0
*/

(function(win) {
    function testLocal() {
        var ua = navigator.userAgent;
        var noSupport = !window.addEventListener || (ua.match(/(Android (2|3|4.0|4.1|4.2|4.3))|(Opera (Mini|Mobi))/) && !ua.match(/Chrome/));
        if (noSupport) {
            return false;
        }
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    win.localSupport = testLocal();
    win.localWrite = function(key, val) {
        try {
            localStorage.setItem(key, val);
        } catch (e) {
            if (e == QUOTA_EXCEEDED_ERR) {
                return false;
            }
        }
    };
})(window);