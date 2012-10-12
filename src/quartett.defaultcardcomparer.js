(function (quartett, undefined) {
    "use strict";

    //Default Card Comparer

    //A comparer returns a sorter function that can be handed to the standard Array.sort() function
    //Each property can have it's own sorter function. This way we can take into account.
    //Example: For one property you might want lesser numbers to score higher or the other way around
    //Or you have string properties where for example a "Porsche" has a higher score than a "BMW" or
    //something like that.

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