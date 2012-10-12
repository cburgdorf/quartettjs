(function(){
    "use strict";

    var player1 = 'Stephan';
    var player2 = 'Christoph';
    var gameOptions = {
        player: [player1, player2],
        cards:[{ wheels: 4 }, { wheels: 2 }]
    };

    module("quartett.cardstack.tests");


    test('can add items', function () {

        var cardstack = new quartett.Cardstack()
        var items = cardstack.getCards();

        cardstack.add({id: 1})
        ok(items[0].id === 1);

        //let's see if we can add arrays as well
        cardstack.add([{id: 2},{id: 3}]);

        ok(items[0].id === 1);
        ok(items[1].id === 2);
        ok(items[2].id === 3);
    });

    test('can pop out last card', function () {

        var cardstack = new quartett.Cardstack()
        cardstack.add({id: 1})
        cardstack.add({id: 2})
        cardstack.add({id: 3})

        var items = cardstack.getCards();

        //verify the initial state after adding is as expected
        ok(items[0].id === 1);
        ok(items[1].id === 2);
        ok(items[2].id === 3);

        var lastItem = cardstack.popOutTopmostCard();

        ok(lastItem.id === 3);

        ok(items.length === 2);

        ok(items[0].id === 1);
        ok(items[1].id === 2);
    });

})();


