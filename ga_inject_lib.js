/**
 * 預設GA_TRACE_CODE
 * @type String
 */
if (typeof(GA_TRACE_CODE) === "undefined") {
    GA_TRACE_CODE = "UA-99869329-1";
}

/**
 * 使用者ID的欄位 "dimension1"
 * @type String
 */
if (typeof(DIMENSION) === "undefined") {
    DIMENSION = "dimension1";
}

/**
 * 只有停留多久才記錄
 * 單位：秒
 * @type Integer
 */
if (typeof(STAY_SAVE_MIN_INTERVAL) === "undefined") {
    STAY_SAVE_MIN_INTERVAL = 3;
}

/**
 * 加上DEBUG的設定，以方便未來開關
 * @type Boolean
 * @author Pudding 20170203
 */ 
if (typeof(DEBUG) === "undefined") {
    DEBUG = true;
}

/**
 * 是否要載入額外的CSS
 * 沒事不需要做
 * @type String
 */
if (false) {
    CSS_URL = "";
}

// -------------------------------------------------

/**
 * 初始化載入ga
 * @param {function} _callback
 * @returns {undefined}
 */
window.ga_setup = function (_callback) {
    $.getScript("https://www.google-analytics.com/analytics.js", function () {
        
        var _user = get_user_id();
        ga('create', GA_TRACE_CODE, {'userId': _user});  
        ga('send', 'pageview');
        ga('require', 'displayfeatures');
        ga('set', 'userId', _user); // 使用已登入的 user_id 設定 User-ID。
        ga('set', 'dimension1', _user);
        
        /**
         * 初始化載入
         */
        _console_log("Google analytics injected. User: " + _user);
    
        if (typeof(_callback) === "function") {
            $(function () {
                setTimeout(function () {
                    setTimeout(function () {
                        //console.log("觸發一次捲動");
                        $(window).scroll();
                    }, 100);
                    _callback();
                }, 1000);
            });
        }
    });
};

/**
 * 取得使用者ID資料
 * 
 * 如果window.name沒有資料，則會回傳anonymous
 * 不然會回傳window.name的資料
 * 
 * @returns {window.name|window.get_user_id|DOMString|String}
 */
var get_user_id = function(){
    if (window.name === null 
            || window.name === undefined 
            || window.name.trim() === ""){
      return "anonymous";
    } 
    else {
        return window.name;
    }    
};

/**
 * 取得連線者IP資料
 * 
 * 
 * 
 */
var get_user_ip = function(){
    $.getJSON('http://ipinfo.io', function(data){
        //console.log(data['ip']);
        _console_log("get user ip: " + data['ip']);
        
        if(data != null){
            return String(data['ip']);
        }else if(data == null){
            return "no ip";
        }
    });
};

window.auto_set_user_id = function(){
    $.getJSON('http://ipinfo.io', function(data){
        set_user_id(String(data['ip']));    
        _console_log("Set user id in ip: " + data['ip']);
    });
}


/**
 * 將ID資訊記錄到視窗屬性中
 * @param {String} _customUserId
 */
window.set_user_id = function (_customUserId){
    
    var date = new Date();
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();

    date = [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
    
    if (typeof(_customUserId) === "undefined") {
        _customUserId = get_user_id();
    }
    _customUserId = _customUserId.trim();
    _customUserId = _customUserId + "-" + date;
    
    _console_log("Set user id: " + _customUserId);
   
    window.name = _customUserId;
    
    ga('create', GA_TRACE_CODE, {'userId': _customUserId});
    ga('set', 'userId', _customUserId); // 使用已登入的 user_id 設定 User-ID。
    ga('set', DIMENSION, _customUserId); 
    
    ga("send", "event", "set_user_id", _customUserId);
};

// -------------------------------------------------------------

/**
 * 偵測滑鼠移上去的事件
 * @param {String} _selector
 * @param {String} _event_type
 * @param {String|Function} _name
 */
window.ga_mouse_over_event = function (_selector, _event_type, _name) {
    var _event_key = 'mouse_over';
    $(_selector).mouseover(function () {
        var _name_data = _get_element_name($(this), _event_type, _name);
        
        _console_log([_event_type, _name_data, _event_key]);
        ga("send", "event", _event_type, _name_data, _event_key);   
    });
};

/**
 * 滑鼠移入跟移除的功能
 * @param {String} _selector
 * @param {String} _event_type
 * @param {String} _name
 */
window.ga_mouse_over_out_event = function(_selector, _event_type, _name) {
    if ($(_selector).length === 0) {
        setTimeout(function () {
            window.ga_mouse_over_out_event(_selector, _event_type, _name);
        }, 1000);
        return;
    }
    
    if (_selector_length_caller(_selector, window.ga_mouse_over_out_event, _event_type, _name) === false) {
        return;
    }
    
    var _id = GA_TIMER.length;
    GA_TIMER.push(false);
    var _event_key = "mouse_over_out";
    var _classname = _event_key + _event_type;

    var _obj = $(_selector + ":not(." + _classname + ")");
    _obj.mouseover(function() {
        var _name_data = _get_element_name(_obj, _selector, _name);
        GA_TIMER[_id] = (new Date()).getTime();
        _console_log([_event_type, _event_key + ": start", _name_data, GA_TIMER[_id]]);
    });
    
    _obj.mouseout(function() {
        var _name_data = _get_element_name(_obj, _selector, _name);
        //_name_data = window.location.pathname + ": " + _name_data;
        var _interval = ((new Date()).getTime() - GA_TIMER[_id])/1000;
        if (_interval > STAY_SAVE_MIN_INTERVAL) {
            _console_log([_event_type, _event_key +  + ": end", _name_data, _interval, "記錄"]);
            ga("send", "event", _event_type, _name_data, _event_key, _interval);
        }
        else {
            _console_log([_event_type, _event_key + ": end", _name_data, _interval, "不記錄"]);
        }
        GA_TIMER[_id] = false;
    });
};

/**
 * 滑鼠抓起跟放開的功能
 * https://www.w3schools.com/jsref/event_ondrag.asp
 * @param {String} _selector
 * @param {String} _event_type
 * @param {String} _name
 */
window.ga_mouse_drag_event = function(_selector, _event_type, _name) {
    if ($(_selector).length === 0) {
        setTimeout(function () {
            window.ga_mouse_drag_event(_selector, _event_type, _name);
        }, 1000);
        return;
    }
    
    if (_selector_length_caller(_selector, window.ga_mouse_drag_event, _event_type, _name) === false) {
        return;
    }
    
    var _id = GA_TIMER.length;
    GA_TIMER.push(false);
    var _event_key = "drag";
    var _classname = _event_key + _event_type;
    
    var _obj = $(_selector + ":not(." + _classname + ")");
    _obj.on("dragstart", function() {
        var _name_data = _get_element_name(_obj, _selector, _name);
        GA_TIMER[_id] = (new Date()).getTime();
        _console_log([_event_type, _event_key + ": start", _name_data, GA_TIMER[_id]]);
    });
    
    _obj.on("dragend", function() {
        var _name_data = _get_element_name(_obj, _selector, _name);
        var _interval = (new Date()).getTime() - GA_TIMER[_id];
        _console_log([_event_type, _event_key +  + ": end", _name_data, _interval/1000, "記錄"]);
        ga("send", "event", _event_type, _name_data, _event_key, _interval/1000);
        GA_TIMER[_id] = false;
    });
};

/**
 * 偵測滑鼠點擊的事件
 * @param {String} _selector
 * @param {String} _event_type
 * @param {String} _name
 */
window.ga_mouse_click_event = function (_selector, _event_type, _name) {
    
    try {
        if ($(_selector).length === 0) {
            setTimeout(function () {
                window.ga_mouse_click_event(_selector, _event_type, _name);
            }, 1000);
            return;
        }
    }
    catch (e) {
        console.log("ERROR SELECTOR: " + _selector);
    }
    
    var _event_key = 'mouse_click';
    var _classname = _event_key + _event_type;
    
    $(_selector + ":not(." + _classname + ")").click(function () {
        var _name_data = _get_element_name(this, _selector, _name);
        _console_log([_event_type, _name_data, _event_key]);
        ga("send", "event", _event_type, _name_data, _event_key);
    }).addClass(_classname);
    
};
/**
 * 偵測滑鼠按下的事件
 * @param {String} _selector
 * @param {String} _event_type
 * @param {String} _name
 */
window.ga_mouse_down_event = function (_selector, _event_type, _name) {
    if ($(_selector).length === 0) {
        setTimeout(function () {
            window.ga_mouse_down_event(_selector, _event_type, _name);
        }, 1000);
        return;
    }
    
    var _event_key = 'mouse_down';
    var _classname = _event_key + _event_type;

    $(_selector + ":not(." + _classname + ")").mousedown(function () {
        var _name_data = _get_element_name(this, _selector, _name);
        _console_log([_event_type, _name_data, _event_key]);
        ga("send", "event", _event_type, _name_data, _event_key);
    });
};

/**
 * 偵測滑鼠按下的事件
 * @param {String} _selector
 * @param {String} _event_type
 * @param {String} _name
 */
window.ga_mouse_touch_event = function (_selector, _event_type, _name) {
    if ($(_selector).length === 0) {
        setTimeout(function () {
            window.ga_mouse_touch_event(_selector, _event_type, _name);
        }, 1000);
        return;
    }
    
    var _event_key = 'touch';
    var _classname = _event_key + _event_type;

      $(_selector + ":not(." + _classname + ")").on("touchstart",function () {
          var _name_data = _get_element_name(this, _selector, _name);

          _console_log([_event_type, _name_data, _event_key]);
          ga("send", "event", _event_type, _name_data, _event_key);
      });
};

/**
 * 偵測表單改變的事件
 * @param {String} _selector
 * @param {String} _event_type
 * @param {String} _name
 */
window.ga_input_change_event = function (_selector, _event_type, _name) {
    if ($(_selector).length === 0) {
        setTimeout(function () {
            window.ga_input_change_event(_selector, _event_type, _name);
        }, 1000);
        return;
    }
    
    var _event_key = 'input_change';
    var _classname = _event_key + _event_type;

    $(_selector + ":not(." + _classname + ")").change(function () {
        var _name_data = _get_element_name(this, _selector, _name);
        
        _console_log([_event_type, _name_data, _event_key]);
        ga("send", "event", _event_type, _name_data, _event_key);
    });
};

/**
 * 偵測表單送出的事件
 * @param {String} _selector
 * @param {String} _event_type
 * @param {String} _name
 */
window.ga_submit_event = function (_selector, _event_type, _name) {
    if ($(_selector).length === 0) {
        setTimeout(function () {
            window.ga_submit_event(_selector, _event_type, _name);
        }, 1000);
        return;
    }
    
    if (_selector_length_caller(_selector, window.ga_submit_event, _event_type, _name) === false) {
        return;
    }
    var _event_key = "form_submit";
    var _classname = _event_key + _event_type;
    
    var _obj = $(_selector);
    var _tag_name = _obj.prop("tagName").toLowerCase();
    
    if (_tag_name !== "form") {
        var _form = _obj.parents("form:first");
        if (_form.length === 0) {
            return;
        }
        else {
            _obj = _form;
        }
    }
    
    window.DENY_SUBMIT = true;
    _obj.submit(function () {
        if (window.DENY_SUBMIT === false) {
          return true;
        }

        // 蒐集form裡面的資料
        if (_name === undefined) {
            _name = JSON.stringify( _obj.serializeArray() ).trim();
            
            if (_name === "") {
                _name = undefined;
            }
        }
        
        var _name_data = _get_element_name(this, _selector, _name);
        
        _console_log([_event_type, _name_data, _event_key]);
        ga("send", "event", _event_type, _name_data, _event_key);
        var _form = $(this);
        setTimeout(function () {
            window.DENY_SUBMIT = false;
            _form.submit();
        }, 100);
        return false;

    });        
};



/**
 * 偵測畫面捲動的事件
 * 可偵測物件是否出現在畫面中，並計算時間
 * @param {String} _selector
 * @param {String} _event_type
 * @param {String} _name
 */
window.ga_mouse_scroll_in_out_event = function(_selector, _event_type, _name) {
    if ($(_selector).length === 0) {
        setTimeout(function () {
            window.ga_mouse_scroll_in_out_event(_selector, _event_type, _name);
        }, 1000);
        return;
    }
    
    if (_selector_length_caller(_selector, window.ga_mouse_scroll_in_out_event, _event_type, _name) === false) {
        return;
    }
    
    var _event_key = 'scroll_in_out';
    var _classname = _event_key + _event_type;

    var _id = GA_TIMER.length;
    GA_TIMER.push(false);
    
    var _window = $(window);
    
    // 捲動時偵測
    _window.scroll(function() {
        //console.log(["觸發", _selector]);
        var _obj = $(_selector);
        var _name_data = _get_element_name(_obj, _selector, _name);
        
        var _obj_top = _obj.offset().top;
        var _obj_bottom = _obj_top + _obj.height();
        var _scroll_top_border = _window.scrollTop();
        var _scroll_bottom_border = _scroll_top_border + _window.height();
        
        var _is_obj_under_scorll_top = (_obj_top > _scroll_top_border);
        var _is_obj_above_scorll_bottom = (_obj_bottom < _scroll_bottom_border);
        
        var _is_obj_display_in_window = (_is_obj_under_scorll_top && _is_obj_above_scorll_bottom);
        
        if (_is_obj_display_in_window === false && GA_TIMER[_id] === false) {
            // 沒事
        }
        else if (_is_obj_display_in_window === true && GA_TIMER[_id] === false) {
            // 進入了，開始記錄事件
            GA_TIMER[_id] = (new Date()).getTime();
            _console_log([_event_type, _event_key + ": start", _name_data, GA_TIMER[_id]]);
        }
        else if (_is_obj_display_in_window === true && GA_TIMER[_id] !== false) {
            // 沒事
        }
        else if (_is_obj_display_in_window === false && GA_TIMER[_id] !== false) {
            // 離開了
            var _interval = ((new Date()).getTime() - GA_TIMER[_id])/1000;
            if (_interval > STAY_SAVE_MIN_INTERVAL) {
                _console_log([_event_type, _event_key + ": end", _name_data, _interval, "記錄"]);
                ga("send", "event", _event_type, _name_data, "scroll_in", _interval);
            }
            else {
                _console_log([_event_type, _event_key + ": end", _name_data, _interval, "不記錄"]);
            }
            GA_TIMER[_id] = false;
        }
    });
};

// ------------------------------------

/**
 * 讀取CSS
 * @param {String} _css_url
 */
var _load_css = function (_css_url) {
    //console.log([typeof(_css_url), _css_url ]);
    if (typeof(_css_url) !== "string" || _css_url.trim() === "") {
        return;
    }
    else {
        _css_url = _css_url.trim(); 
    }
    if (DEBUG === true){
        console.log("include CSS: " + _css_url);
    }
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    //link.id   = cssId;
    link.rel  = "stylesheet";
    link.type = "text/css";
    link.href = _css_url + "?_=" + (new Date()).getTime();
    //link.media = 'all';

    head.appendChild(link);
};

_load_css(CSS_URL);

/**
 * 取得元素的可讀取元素
 * @param {String} _ele
 * @param {String} _event_type
 * @param {String} _name
 * @returns {String|get_element_name._name}
 * 
 * window.location.pathname + ": " + 
 */
var _get_element_name = function (_ele, _event_type, _name) {
    _ele = $(_ele);
    
    if (typeof(_name) === "string") {
        return  window.location.pathname + ": " + _name;
    }
    else if (typeof(_name) === "function") {
        return window.location.pathname + ": " + _name(_ele);
    }
    
    try {
        if(_ele.attr("title")){
          _name = _ele.attr("title");
        } else if (_ele.text()) {
          _name = _ele.text(); 
        } else if (_ele.attr("alt")){
          _name = _ele.attr("alt");
        } else if (_ele.attr("src")){
          _name = _ele.attr("src"); 
        } else if (_ele.attr("data-src")){
          _name = _ele.attr("data-src");
        } else if (_ele.attr("className")){
          _name = _ele.attr("className");
        } else{
          _name = _event_type;
        }
    }
    catch (e) {}

    if (typeof(_name) === "string") {
        _name = _name.trim();
    }
    
    _name = window.location.pathname + ": " + _name;
    
    return _name;
};

/**
 * 偵測物件數量
 * 0個不執行
 * 2個以上，變成for loop執行
 * @param {type} _selector
 * @param {type} _callback
 * @returns {Boolean}
 */
var _selector_length_caller = function (_selector, _function, _event_type, _name) {
    var _obj_list = $(_selector);
    if (_obj_list.length === 0) {
        return false;
    }
    else if (_obj_list.length > 1) {
        // 如果要鎖定的物件很多個，應該用這種方式來避免重複
        if (typeof(_function) === "function") {
            for (var _i = 0; _i < _obj_list.length; _i++) {
                _function(_obj_list.eq(_i), _event_type, _name);
            }
        }
        return false;
    }
    return true;
};

/**
 * 顯示偵錯訊息: 簡易資訊
 * @param {String} _message
 */
var _console_log = function (_message) {
    if (DEBUG === true){
        if (typeof(_message) === "object" && typeof(_message.length) === "number") {
            _message = _message.join(", ");
        }
        CONSOLE_LOG.push(_message);
        
        setTimeout(function () {
            if (CONSOLE_LOG.length > 0) {
                var _m = CONSOLE_LOG.join("\n");
                var _d = new Date();
                _m = "[" + _d.getHours() + ":" + _d.getMinutes() + ":"+ _d.getSeconds() + "]\n" + _m;
                console.log(_m);
                CONSOLE_LOG = [];
            }
        }, 1);
        //console.log(_message);
    }
};

CONSOLE_LOG = [];

/**
 * 顯示偵錯訊息: 詳細資訊
 * @param {String} _message
 */
var _console_trace = function (_message) {
    if (DEBUG === true){
        console.trace(_message);
    }
};

/**
 * 搭配 各種技術器使用
 * @type Array
 */
var GA_TIMER = [];