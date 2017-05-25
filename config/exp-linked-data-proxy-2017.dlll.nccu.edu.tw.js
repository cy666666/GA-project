/**
 * 適用網頁：http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw:32543/directory_ming
 * 事件查詢表：
 * @author Pudding 20170203
 */

GA_TRACE_CODE = "UA-99869329-1";

var _local_debug = false;

if (_local_debug === true) {
    CSS_URL = "https://localhost/GA-project/config/www.travel.taipei.css";
    LIB_URL = "https://localhost/GA-project/ga_inject_lib.js";
    console.log("[LOCAL TEST MODE]");
}
else {
    CSS_URL = "https://cy666666.github.io/GA-project/config/exp-linked-data-proxy-2017.dlll.nccu.edu.tw.css";
    LIB_URL = "https://cy666666.github.io/GA-project/ga_inject_lib.js";
}


var exec = function () {
    //GL1-3 click
    //ga_mouse_click_event('a[title="臺北旅遊網"]', "GL1-3");
    ga_mouse_click_event('.autoanno_tooltip', "test123465");
    //ga_mouse_click_event('.tooltipstered', "test");
    ga_mouse_click_event('button[data-module="zh.wikipedia.org"]', "查詢維基");
    ga_mouse_click_event('button[data-module="www.moedict.tw"]', "查詢萌典");
    ga_mouse_click_event('button[data-module="cdict.net"]', "查詢字典");
    ga_mouse_click_event('button[data-module="cbdb.fas.harvard.edu"]', "查詢CBDB");
    ga_mouse_click_event('button[data-module="maps.cga.harvard.edu"]', "查詢TGAZ");
    //GL1-4 導覽列 click
   /* ga_mouse_click_event("#btn-open-menu","GL1-4");
    ga_mouse_click_event(".mobile-nav-close-mask","GL1-4");
    ga_mouse_click_event(".btn-back-all","GL1-4");*/

    
   

};

// --------------------------------------

$(function () {
    $.getScript(LIB_URL, function () {
        ga_setup(function () {
            exec();
        });
    });
});