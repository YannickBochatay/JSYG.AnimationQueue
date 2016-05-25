if (typeof require!= "undefined") {
    
    require.config({
        paths: {
            "jsyg-events": '../JSYG.Events',
            "jquery":"../node_modules/jquery/dist/jquery",
            "jsyg-wrapper":"../node_modules/jsyg-wrapper/JSYG-wrapper"
        },
        urlArgs: "bust=" + (+new Date())
    });
}

(function(factory) {
    
    if (typeof define == 'function' && define.amd) define(["jsyg-events"],factory);
    else factory(Events);
    
}(function(Events) {

    module("Events");

    test("Manipulation des événements", function() {     
        
        var cpt = 0;
        
        var events = new Events();
        
        function incremente() { cpt++; }
        
        events.ontest = null;
        
        expect(4);
        
        events.on("test",incremente);
        events.trigger("test");
        equal(cpt,1,"Déclenchement de l'événement");
        
        events.on("test",incremente);
        events.trigger("test");
        equal(cpt,2,"Non prise en compte des doublons");
        
        events.off("test",incremente);
        events.trigger("test");
        equal(cpt,2,"Suppression d'un événement");
        
        events.one("test",incremente);
        events.trigger("test");
        events.trigger("test");
        events.trigger("test");
        equal(cpt,3,"Méthode one qui retire aussitot l'événement");
        
    });
    
}));
