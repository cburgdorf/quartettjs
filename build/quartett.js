/*
The MIT License

Copyright (c) 2012 Christoph Burgdorf

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function (window) {
    window.quartett = { };
})(window);
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
        }
    };
})(quartett);
(function (quartett, undefined) {
    "use strict";

    //Cardstack API

    quartett.Cardstack = function(options){
        var that = this;
        that._stack = options && options.cards ? options.cards : [];
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
(function (quartett, undefined) {
    "use strict";
    // Game API

    quartett.Game = function Game(options){
        var that = this;
            that._cardStack = new quartett.Cardstack();
            that._playerStack = {};
            that._playerList = [];
            that._playerCount = 0;

        var assertConfig = function(config){
            if (!config){
                throw new Error("options are mandatory")
            }

            //Todo: Let's make that more sophisticated. If the user provides an object instead of strings, extend
            //the final player by each property of the object that the user provided.
            if (!config.player){
                throw new Error('options.player must be an array of player names')
            }

            if (!config.cards){
                throw new Error('options.cards can either be an array of cards, an url that returns cards or a function that returns cards');
            }

            config.cardComparer = config.cardComparer || quartett.DefaultCardComparer;
        };

        var createPlayer = function(player){
            player.forEach(function(value){

                var tempPlayer;
                if (value.name !== undefined){
                    tempPlayer = quartett.Util.deepExtend({}, new quartett.Player({name: value.name, game: that }), value);
                }
                else{
                    tempPlayer = new quartett.Player({name: value, game: that });
                }
                var rawName = tempPlayer.getName();

                that._playerStack[rawName] = tempPlayer;
                that._playerList.push(tempPlayer);

                that._giveTopmostFreeCardsToPlayer(tempPlayer, that._initialCardsPerPlayer)

                that['get' + rawName] = function(){
                        var player = that._playerStack[rawName];
                        if (!player){
                            throw new Error('Player ' + player + ' does not exist');
                        }
                        return player;
                }
            });
        };

        assertConfig(options);
        //Todo handle transformation of card types. For now let's assume we get an array of cards
        that._cardStack.add(options.cards);
        that._gameCardCount = options.cards.length;

        that._playerCount = options.player.length;
        that._initialCardsPerPlayer = that._cardStack.getLength() / that._playerCount;

        if (quartett.Util.isFunction(options.beforePlayerInitialized)){
            options.beforePlayerInitialized(this);
        }

        createPlayer(options.player);

        that._cardComparer = new options.cardComparer();
        that._options = options;
    };

    //PUBLIC METHODS

    quartett.Game.prototype.start = function(playerName){
        this._activePlayer = playerName ? this._playerStack[playerName] : this._playerList[0];
    };

    quartett.Game.prototype.playCard = function(property){

        //get an array of objects with all other players and their top card
        //give all cards to the player with the best score on that property
        //if it's a draw do nothing and let the active player play another property

        var that = this;

        that._raiseErrorIfFinished();

        //get the comparer for the property we currently play on
        var comparer = that._cardComparer.getSortFuncForProperty(property);

        var unwrapAndCompare = function(a, b){
            return comparer(a.topCard[property], b.topCard[property]);
        };

        var otherPlayers = that._getPlayerAndTheirTopmostCards(function(player){
                                  return player !== that._activePlayer && !player.getTopmostCard()._blacklisted;
                              })
                              .sort(unwrapAndCompare);

        var best = otherPlayers[otherPlayers.length - 1];

        var scoreAgainstTheBest = comparer(that._activePlayer.getTopmostCard()[property], best.topCard[property]);

        var giveTopmostCardsToPlayer = function(player){

            var losers = that._playerList.filter(function(p){
                return p !== player;
            });

            losers.forEach(function(loser){
                that._dispatchEventOn(loser, 'cardLost', loser.getTopmostCard());
            });

            //this would be more natural, however, it breaks the tests. I guess that's because with this code,
            //the winner card isn't shuffled around the same way. Need to look deeper into this
            //var cards = losers.map(function(looser){
            //    return looser.popOutTopmostCard();
            //})
            var cards = that._getAllTopMostCards();
            player.add(cards);
        };

        if (scoreAgainstTheBest === -1){

            //figure out if the best other player is the *only* winner or if there is a draw between other players going on
            if(otherPlayers.length > 1){
                var second = otherPlayers[otherPlayers.length - 2];
                var scoreAgainstSecond = comparer(best.topCard[property], second.topCard[property]);

                if (scoreAgainstSecond === 0){
                    //there's a draw between the best other player and at least the second best other player
                    //notify the draw, change the active player and let him play on another property

                    //We need to blacklist this card so that the active player can't win the pot on another property
                    //because he already lost on this property but the card continues beeing played
                    this._activePlayer.getTopmostCard()._blacklisted = true;

                    this._dispatchGameEvent("drawHappened", this);
                }
                else{
                    //there's no draw between the best and the second. Hand over the cards!
                    giveTopmostCardsToPlayer(best.player);
                }
            }
            else{
                //there is just on clear winner, hand the cards over to him/her
                giveTopmostCardsToPlayer(best.player);
            }

            //in any case, the active player changed
            this._activePlayer = best.player;
            //notify that the active user has changed
            this._dispatchGameEvent("activePlayerChanged", this);

        }
        else if (scoreAgainstTheBest === 0){
            //notify that we have a draw on this property. This basically means the active player
            //needs to play on another property
            this._dispatchGameEvent("drawHappened", this);
        }
        else{
            giveTopmostCardsToPlayer(this._activePlayer);
        }

        //notify progress of the game
        this._dispatchGameEvent("gameMoved", this);

        that._figureOutIfGameIsFinished();
    };

    quartett.Game.prototype.getActivePlayer = function(){
        return this._activePlayer;
    };

    quartett.Game.prototype.getCards = function(){
        return this._cardStack.getCards();
    };

    //PRIVATE METHODS

    quartett.Game.prototype._giveTopmostFreeCardsToPlayer = function(player, nCards){
        nCards = !nCards ? 1 : nCards;

        while(nCards > 0){
            var topmostCard = this._cardStack.popOutTopmostCard();
            //remove the blacklist marker that might be on the card
            topmostCard._blacklisted = false;
            player.add(topmostCard);

            nCards--;
        }
    };

    quartett.Game.prototype._getPlayerAndTheirTopmostCards = function(filterPredicate){
        var that = this;
        return that._playerList
            .filter(filterPredicate)
            .map(function(player){
                return {
                    player: player,
                    topCard: player.getTopmostCard()
                };
            });
    };

    quartett.Game.prototype._raiseErrorIfFinished = function(){
        if (this._finished) {
            throw new Error("Game already finished");
        }
    };

    quartett.Game.prototype._dispatchGameEvent = function(eventName){
        var args = Array.prototype.slice.call(arguments);
        args.splice(0,0, this._options);
        this._dispatchEventOn.apply(this, args);
    };

    quartett.Game.prototype._dispatchEventOn = function(host, eventName){
        if (quartett.Util.isFunction(host[eventName])){
            var args = Array.prototype.slice.call(arguments);
            args.splice(0,2);
            host[eventName].apply(this, args);
        }
    };

    quartett.Game.prototype._getAllTopMostCards = function(){
        return this._playerList.map(function(player){
            return player.popOutTopmostCard();
        });
    };

    quartett.Game.prototype._figureOutIfGameIsFinished = function(){
        if(this._activePlayer.getCards().length === this._gameCardCount){
            this._finished = true;
            if (quartett.Util.isFunction(this._options.gameFinished)){
                this._dispatchGameEvent("gameFinished", this, {
                    winner: this._activePlayer
                });
            }
        }
    };


})(quartett);
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

    quartett.Player.prototype.getCardCount = function(){
        return this._cardStack.getLength();
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