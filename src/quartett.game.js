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

                var tempPlayer = new quartett.Player({name: value, game: that });

                that._playerStack[value] = tempPlayer;
                that._playerList.push(tempPlayer);

                that._giveTopmostFreeCardsToPlayer(tempPlayer, that._initialCardsPerPlayer)

                that['get' + value] = function(){
                        var player = that._playerStack[value];
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

        var otherPlayers = that._getInactivePlayerAndTheirTopmostCards()
                              .sort(unwrapAndCompare);

        var best = otherPlayers[otherPlayers.length - 1];

        var scoreAgainstTheBest = comparer(that._activePlayer.getTopmostCard()[property], best.topCard[property]);

        var giveTopmostCardsToPlayer = function(player){
            var cards = that._getAllTopMostCards();
            player.add(cards);
        };

        //Todo
        //handle the fact that there can be draws not only between the active player and the best other player
        //but also between the other players. E.g. the active player has a score of 3 on the property but two
        //other players both have a score of 4

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

                    this._dispatchEvent("drawHappened", this);
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
            this._dispatchEvent("activePlayerChanged", this);

        }
        else if (scoreAgainstTheBest === 0){
            //notify that we have a draw on this property. This basically means the active player
            //needs to play on another property
            this._dispatchEvent("drawHappened", this);
        }
        else{
            giveTopmostCardsToPlayer(this._activePlayer);
        }

        //notify progress of the game
        this._dispatchEvent("gameMoved", this);

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

    quartett.Game.prototype._getInactivePlayerAndTheirTopmostCards = function(){
        var that = this;
        return that._playerList
            .filter(function(player){
                return player !== that._activePlayer && !player.getTopmostCard()._blacklisted;
            })
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

    quartett.Game.prototype._dispatchEvent = function(eventName){
        if (quartett.Util.isFunction(this._options[eventName])){
            var args = Array.prototype.slice.call(arguments);
            args.splice(0,1);
            this._options[eventName].apply(this, args);
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
                this._dispatchEvent("gameFinished", this, {
                    winner: this._activePlayer
                });
            }
        }
    };


})(quartett);