if (typeof require!= "undefined") {
    
    require.config({
        paths: {
            "jsyg-strutils": '../JSYG-strutils',
            "jquery":"../bower_components/jquery/dist/jquery",
            "jsyg-wrapper":"../bower_components/jsyg-wrapper/JSYG-wrapper"
        },
        urlArgs: "bust=" + (+new Date())
    });
}

(function(factory) {
    
    if (typeof define == 'function' && define.amd) define(["jsyg-wrapper","jsyg-strutils"],factory);
    else factory(JSYG,JSYG);
    
}(function(JSYG,strUtils) {

    module("strUtils");

    test("fonctions diverses", function() {
        
        expect(2);
        
        equal( strUtils.camelize("toto_tata_titi"), "totoTataTiti" ,"camelize");
        equal( strUtils.dasherize("totoTataTiti"), "toto-tata-titi" ,"camelize");
    });
    
}));
