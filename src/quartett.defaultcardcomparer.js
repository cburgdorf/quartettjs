(function (quartett, undefined) {
    "use strict";

    //Default Card Comparer

    //Feel free to ship your own comparer

    quartett.DefaultCardComparer = function(){
    };

    quartett.DefaultCardComparer.prototype.getSortFuncForProperty = function(property) {
        //we don't care for the property here. We just return the standard comparer that works for all numbers
        //where the bigger number indicates a higher score
        return function(a, b){
            return a < b ? -1 : a === b ? 0 : 1;
        }
    };
})(quartett);