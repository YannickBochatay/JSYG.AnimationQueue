if (typeof require!= "undefined") {
    
    require.config({
        paths: {
            "jquery": '../bower_components/jquery/dist/jquery',
            "jsyg-wrapper": '../bower_components/jsyg-wrapper/JSYG-wrapper',
            "jsyg-point": '../bower_components/jsyg-point/JSYG.Point',
            "jsyg-vect": '../bower_components/jsyg-vect/JSYG.Vect',
            "jsyg-matrix": '../JSYG.Matrix'
        },
        urlArgs: "bust=" + (+new Date())
    });
}

(function(factory) {
    
    if (typeof define == 'function' && define.amd) define(["jsyg-matrix","jsyg-wrapper"],factory);
    else if (typeof JSYG != "undefined") factory(JSYG.Matrix);
    else factory(Matrix);
    
}(function(Matrix) {

    module("Matrix");

    test("Création d'une matrice", function() {     

        var mtx = new Matrix();
        
        expect(6);
        equal(mtx.a,1,"a");
        equal(mtx.b,0,"b");
        equal(mtx.c,0,"c");
        equal(mtx.d,1,"d");
        equal(mtx.e,0,"e");
        equal(mtx.f,0,"f");
    });
    
     test("Translation", function() {     

        var mtx = new Matrix();
        
        mtx = mtx.translate(5,10);
        
        expect(2);
        equal(mtx.e,5,"x");
        equal(mtx.f,10,"y");
    });
    
    test("Scale", function() {     

        var mtx = new Matrix();
        
        mtx = mtx.scale(2);
        
        expect(2);
        equal(mtx.a,2,"scale x");
        equal(mtx.d,2,"scale y");
    });
    
}));
