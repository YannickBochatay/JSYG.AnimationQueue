if (typeof require!= "undefined") {
    
    require.config({
        paths: {
            "jsyg-point": '../JSYG.Point'
        },
        urlArgs: "bust=" + new Date()
    });
}

(function(factory) {
    
    if (typeof define == 'function' && define.amd) define(["jsyg-point"],factory);
    else factory(Point);
    
}(function(Point) {

    module("JSYG.Point");

    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');

    test("Création d'un point", function() {

        var point = new Point(5,10);

        expect(2);
        equal(point.x,5,"abcisse");
        equal(point.y,10,"ordonnée");
    });

    test("Translation d'un point", function() {

        var point = new Point(5,10);
        var mtx = svg.createSVGMatrix();

        mtx.e = 5;
        mtx.f = 10;

        point = point.mtx(mtx);

        expect(2);
        equal(point.x,10,"abcisse");
        equal(point.y,20,"ordonnée");

    });

    test("Echelle d'un point", function() {

        var point = new Point(5,10);
        var mtx = svg.createSVGMatrix();

        mtx.a = 2;
        mtx.d = 2;

        point = point.mtx(mtx);

        expect(2);
        equal(point.x,10,"abcisse");
        equal(point.y,20,"ordonnée");
    });
    
    
    test("Transformation en chaine", function() {
        
        var point = new Point(5,10);

        equal(point.toString(), '{"x":5,"y":10}', "Méthode toString" );
        equal(point.toJSON(), '{"x":5,"y":10}', "Méthode toJSON" );
    });
    
}));
