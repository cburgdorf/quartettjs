(function (quartett, undefined) {
    "use strict";
    //Card API

    quartett.Card = function(options){
        if (!quartett.Util.isArray(options)){
            throw new Error("options must be an array");
        }

        var me = this;

        options.forEach(function(value){

            var i = 0;
            for(var name in value){
                i++;
                if (i > 1){
                    throw new Error("misstructered data");
                }
            }

            var properties = value[name];

            me[name] = {
                value: properties.value,
                displayValue: me.getDisplayValueFor(name, properties.value),
                displayName: properties.displayName !== undefined ? properties.displayName : name
            };
        });
    };

    quartett.Card.prototype.defaultComparer = function(a, b){
        return a < b ? -1 : a === b ? 0 : 1;
    };

    //This method should be overriden for games implementing a card to fit their needs
    quartett.Card.prototype.getDisplayValueFor = function(propertyName, value){
        return value;
    };

})(quartett);