(function (quartett, undefined) {
    "use strict";

    quartett.Util = {
        isArray: function(value){
            return toString.call(value) === '[object Array]';
        },
        isFunction: function(value){
            return typeof value === 'function';
        },
        isString: function(value){
            return typeof  value === 'string';
        },
        deepExtend: function () {
            var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

            if (target.constructor == Boolean) {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }

            if (typeof target != "object" && typeof target != "function")
                target = {};

            if (length == 1) {
                target = this;
                i = 0;
            }

            for (; i < length; i++)
                if ((options = arguments[i]) != null)
                    for (var name in options) {
                        if (target === options[name])
                            continue;

                        if (deep && options[name] && typeof options[name] == "object" && target[name] && !options[name].nodeType)
                            target[name] = this.deepExtend(true, target[name], options[name]);

                        else if (options[name] != undefined)
                            target[name] = options[name];
                    }

            return target;
        },
        shuffleArray: function (arr) {
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = arr[i];
                arr[i] = arr[j];
                arr[j] = tmp;
            }

            return arr;
        }
    };
})(quartett);