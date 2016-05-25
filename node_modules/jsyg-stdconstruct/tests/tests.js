if (typeof require!= "undefined") {
    
    require.config({
        paths: {
            "jsyg-stdconstruct": '../JSYG.StdConstruct',
            "jquery":"../node_modules/jquery/dist/jquery",
            "jsyg-events":"../node_modules/jsyg-events/JSYG.Events"
        },
        urlArgs: "bust=" + (+new Date())
    });
}

(function(factory) {
    
    if (typeof define == 'function' && define.amd) define(["jsyg-stdconstruct"],factory);
    else factory(StdConstruct);
    
}(function(StdConstruct) {

    module("StdConstruct");

    test("Gestion des fonction standard", function() {     
        
        
        var obj = new StdConstruct();
        
        obj.enable();
        
        expect(2);
        
        equal(obj.enabled, true, "activation du plugin");
        
        equal(typeof obj.on, "function", "héritage de Events");
    });
    
}));
