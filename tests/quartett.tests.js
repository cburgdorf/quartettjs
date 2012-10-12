(function(){
    "use strict";

    var player1 = 'Stephan';
    var player2 = 'Christoph';
    var gameOptions = {
        player: [player1, player2],
        cards:[{ wheels: 4 }, { wheels: 2 }]
    };

    module("quartett.tests");

    test('can initialize quartettjs', function () {

        var game = new quartett.Game(gameOptions);
        ok(typeof game === 'object');
    });

    test('can get player handle', function () {
        var game = new quartett.Game(gameOptions);
        var stephan = game.getStephan();
        ok(stephan !== undefined);
        ok(stephan.getName() === player1)
    });

    test('player get their cards', function () {

        gameOptions.beforePlayerInitialized = function(game){
           //this is the moment before any player has gotten his cards
           ok(game.getCards().length === 2);
        };

        var game = new quartett.Game(gameOptions);
        var stephan = game.getStephan();
        var cardsStephan = stephan.getCards();

        ok(stephan !== undefined);
        ok(stephan.getName() === player1)
        ok(cardsStephan.length === 1)
        ok(cardsStephan[0].wheels === 2)

        var christoph = game.getChristoph();
        var cardsChristoph = christoph.getCards();

        ok(christoph !== undefined);
        ok(christoph.getName() === player2)
        ok(cardsChristoph.length === 1)
        ok(cardsChristoph[0].wheels === 4)

        //there shouldn't be any cards left now
        ok(game.getCards().length === 0);
    });

    test('Christoph wins the game', function () {

        gameOptions.gameFinished = function(game, results){
            //The game starts with Stephan asking to play on the "wheel" property. Bad luck!
            ok(results.winner.getName() === 'Christoph');
        };

        var game = new quartett.Game(gameOptions);
        game.start();
        game.playCard("wheels");
    });

    test('Christoph wins the game (more advanced)', function () {

        var gameOptions = {
            player: [player1, player2],
            cards:[{ wheels: 4 }, { wheels: 2 }, {wheels: 1}, {wheels: 1}]
        };

        var eventStack = [];

        //up front, hook up events
        gameOptions.gameFinished = function(game, results){
            eventStack.push("gameFinished")
            //The game starts with Stephan asking to play on the "wheel" property. Bad luck!
            ok(results.winner.getName() === 'Christoph');
        };

        gameOptions.gameMoved = function(game){
            eventStack.push("gameMoved");
        };

        gameOptions.activePlayerChanged = function(game){
            eventStack.push("activePlayerChanged");
        };

        var game = new quartett.Game(gameOptions);
        game.start("Stephan");

        //let's make sure the game begins as expected
        ok(game.getStephan().getCards().length === 2);
        ok(game.getChristoph().getCards().length === 2);

        //This is the move where Stephan looses and Christoph becomes the active player
        game.playCard("wheels");

        //let's make sure Christoph leads by 3:1 cards now
        ok(game.getStephan().getCards().length === 1);
        ok(game.getChristoph().getCards().length === 3);

        //Also make sure Christoph is the active player now
        ok(game.getActivePlayer().getName() === "Christoph");

        //bad luck again. At this point Christoph wins the game
        game.playCard("wheels");

        //let's make sure Christoph holds all cards now
        ok(game.getStephan().getCards().length === 0);
        ok(game.getChristoph().getCards().length === 4);

        //Also make sure Christoph is still the active player (even so the game is over!)
        ok(game.getActivePlayer().getName() === "Christoph");

        ok(eventStack[0] === "activePlayerChanged");
        ok(eventStack[1] === "gameMoved");
        ok(eventStack[2] === "gameMoved");
        ok(eventStack[3] === "gameFinished");
    });

})();

test('Christoph wins the game after a draw card', function () {

    var gameOptions = {
        player: ['Stephan', 'Christoph'],
        cards:[{ wheels: 4, speed: 140 }, { wheels: 2, speed: 120 }, {wheels: 4, speed: 130}, {wheels: 1, speed: 110}]
    };

    var eventStack = [];

    //up front, hook up events
    gameOptions.gameFinished = function(game, results){
        eventStack.push("gameFinished")
        //The game starts with Stephan asking to play on the "wheel" property. Bad luck!
        ok(results.winner.getName() === 'Christoph');
    };

    gameOptions.gameMoved = function(game){
        eventStack.push("gameMoved");
    };

    gameOptions.activePlayerChanged = function(game){
        eventStack.push("activePlayerChanged");
    };

    gameOptions.drawHappened = function(game){
        eventStack.push("drawHappened");
    };

    var game = new quartett.Game(gameOptions);
    game.start("Stephan");

    //let's make sure the game begins as expected
    ok(game.getStephan().getCards().length === 2);
    ok(game.getChristoph().getCards().length === 2);

    //This is the move where we have a draw because both cards have 4 wheels
    game.playCard("wheels");

    //check if the game noticed the draw
    ok(eventStack[eventStack.length - 1] === 'gameMoved');
    ok(eventStack[eventStack.length - 2] === 'drawHappened');

    //assume they still got their cards. Nothing happened after all
    ok(game.getStephan().getCards().length === 2);
    ok(game.getChristoph().getCards().length === 2);

    //Also make sure Stephan continues to be the active player
    ok(game.getActivePlayer().getName() === "Stephan");

    //we switch over to the speed property because of the draw
    game.playCard("speed");

    //At this point Christoph wins the card with the speed property
    ok(game.getStephan().getCards().length === 1);
    ok(game.getChristoph().getCards().length === 3);

    //Also make sure Christoph is the active player now
    ok(game.getActivePlayer().getName() === "Christoph");

    //Let's play on wheels again
    game.playCard("speed");

    //At this point Christoph wins the game
    ok(game.getStephan().getCards().length === 0);
    ok(game.getChristoph().getCards().length === 4);

    //Make sure the events appeared in the correct order
    ok(eventStack[0] === "drawHappened");
    ok(eventStack[1] === "gameMoved");
    ok(eventStack[2] === "activePlayerChanged");
    ok(eventStack[3] === "gameMoved");
    ok(eventStack[4] === "gameMoved");
    ok(eventStack[5] === "gameFinished");
});

