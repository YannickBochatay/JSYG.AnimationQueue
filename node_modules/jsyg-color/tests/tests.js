if (typeof require!= "undefined") {
    
    require.config({
        paths: {
            "jsyg-color": '../JSYG.Color'
        },
        urlArgs: "bust=" + (+new Date())
    });
}

(function(factory) {
    
    if (typeof define == 'function' && define.amd) define(["jsyg-color"],factory);
    else factory(Color);
    
}(function(Color) {

    module("color");

    test("Manipulation d'une couleur", function() {     
        
        var color = new Color({r:0,g:0,b:255});

        expect(1);
        
        equal( color.toHEX(), "0000ff" ,"hexa");
        
    });
    
}));
