(function (quartett, undefined) {
    "use strict";
    //Player API

    quartett.Player = function(options){
        var that = this;
        that._name = options.name;
        that._game = options.game;
        that._cardStack = new quartett.Cardstack();
    };

    quartett.Player.prototype.getName = function(){
        return this._name;
    };

    quartett.Player.prototype.getCards = function(){
        return this._cardStack.getCards();
    };

    quartett.Player.prototype.getTopmostCard = function(){
        return this._cardStack.getTopmostCard();
    };

    quartett.Player.prototype.popOutTopmostCard = function(){
        return this._cardStack.popOutTopmostCard();
    };

    quartett.Player.prototype.add = function(card){
        this._cardStack.add(card);
    };

})(quartett);