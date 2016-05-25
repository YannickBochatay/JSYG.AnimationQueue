if (typeof require!= "undefined") {
    
    require.config({
        paths: {
            "jsyg-point": '../bower_components/jsyg-point/JSYG.Point',
            "jsyg-vect": '../JSYG.Vect'
        },
        urlArgs: "bust=" + (+new Date())
    });
}

(function(factory) {
    
    if (typeof define == 'function' && define.amd) define(["jsyg-vect"],factory);
    else factory(Vect);
    
}(function(Vect) {

    module("Vect");
    
    test("Création d'un vecteur", function() {
        
        var vect = new Vect(2,5);

        expect(2);
        ok(vect instanceof Vect,"instance de Vect");
        ok(vect instanceof Vect.prototype.constructor,"instance de Point");
    });
    
    test("Longueur d'un vecteur", function() {
        
        var vect = new Vect(5,5);

        expect(1);
        
        equal( Math.round(vect.length()) , 7 ,"longueur de vect");
    });
    
}));
