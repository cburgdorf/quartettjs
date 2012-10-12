(function (quartett, undefined) {
    "use strict";

    quartett.Util = {
        //Todo Let's drop this and just depend on an es5-shim. We can distribute and es5-shim together with quartetjs
        //and let people decide whether they actually need it or not

        //this code is stolen from here: http://noteslog.com/post/how-to-force-jqueryextend-deep-recursion/
        extend: function () {
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
                            target[name] = deepExtend(true, target[name], options[name]);

                        else if (options[name] != undefined)
                            target[name] = options[name];
                    }

            return target;
        },
        isArray: function(value){
            return toString.call(value) === '[object Array]';
        },
        isFunction: function(value){
            return typeof value === 'function';
        },
        isString: function(value){
            return typeof  value === 'string';
        }
    };
})(quartett);