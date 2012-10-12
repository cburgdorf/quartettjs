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
        }
    };
})(quartett);