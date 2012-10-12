(function (quartett, undefined) {
    "use strict";

    //Cardstack API

    quartett.Cardstack = function(options){
        var that = this;
        that._stack = options && options.cards ? options.cards : [];
    };

    quartett.Cardstack.prototype.rotateForward = function() {
        quartett.Util.moveInArray(this._stack,-1, 0);
    };

    quartett.Cardstack.prototype.add = function(value){
        var that = this;
        if (quartett.Util.isArray(value)){
            value.forEach(function(item){
                that._stack.push(item);
            });
        }
        else{
            this._stack.push(value);
        }
    };

    quartett.Cardstack.prototype.getCards = function(){
        return this._stack;
    };

    quartett.Cardstack.prototype.getLength = function(){
        return this._stack.length;
    };

    quartett.Cardstack.prototype.popOutTopmostCard = function(){
        return this._stack.pop();
    };

    quartett.Cardstack.prototype.getTopmostCard = function(){
        return this._stack[this._stack.length - 1];
    };

})(quartett);