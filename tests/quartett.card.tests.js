(function(){
    "use strict";

    module("quartett.card.tests");


    test('uses defaults if not specified', function () {

        var card = new quartett.Card([{price: { value: 10000 }}]);

        ok(card.price.value === 10000);
        ok(card.price.displayName === 'price');
        ok(card.price.displayValue === 10000);

    });

    test('uses custom displayValue and displayName', function () {

        var CarCard = function(options) {
            quartett.Card.prototype.constructor.call(this, options);
        };

        CarCard.prototype = Object.create(quartett.Card.prototype);

        CarCard.prototype.getDisplayValueFor = function(property, value){
            return value + ' €';
        };

        CarCard.prototype.getDisplayNameFor = function(property){
            return 'Price in €';
        };

        var card = new CarCard([{price: { value: 10000 }}]);

        ok(card.price.value === 10000);
        ok(card.price.displayValue === '10000 €');
        ok(card.price.displayName === 'Price in €');
    });

})();


