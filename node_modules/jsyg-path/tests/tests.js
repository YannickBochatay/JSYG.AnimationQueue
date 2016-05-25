if (typeof require!= "undefined") {
    
    require.config({
        paths: {
            "jsyg-path": '../JSYG.Path',
            "jquery":"../bower_components/jquery/dist/jquery",
            "pathseg":"../bower_components/pathseg/pathseg",
            "jsyg":"../bower_components/jsyg/dist/JSYG"
        },
        urlArgs: "bust=" + (+new Date())
    });
}

(function(factory) {
    
    if (typeof define == 'function' && define.amd) define(["jsyg-path"],factory);
    else factory(JSYG.Path);
    
}(function(Path) {

    module("JSYG.Path");

    test("Création d'un chemin", function() {     

        var path = new Path();
        path.moveTo(0,0).lineTo(30,50).lineTo(80,80);
        
        equal( path.nbSegs(), 3 ,"nombre de segments");
    });
    
}));
