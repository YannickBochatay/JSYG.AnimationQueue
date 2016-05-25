(function(factory) {
  
  if (typeof module == "object" && typeof module.exports == "object") {
    
    module.exports = factory(
       require("jsyg"),
       require("jsyg-animation"),
       require("jsyg-stdconstruct")
    );
  }
  else if (typeof define != "undefined" && define.amd) {
    
    define("jsyg-animationqueue",[
      "jsyg",
      "jsyg-animation",
      "jsyg-stdconstruct"
    ],factory);
  }
  else if (typeof JSYG != "undefined") {
        
    if (JSYG.Janimation && JSYG.StdConstruct) {
      factory(JSYG,JSYG.Janimation, JSYG.StdConstruct);
    }
    else throw new Error("dependency is missing");
  }
  else throw new Error("JSYG is needed");
  
}(function(JSYG,Animation,StdConstruct) {
  
  "use strict";
  
  function getDuration(duration) {
    
    if ($.isNumeric(duration)) return duration;
    else if (duration == "slow") return 600;
    else if (duration == "fast") return 200;
    else throw new Error(duration+" : argument incorrect.");
  }
   
  /**
   * Gestion d'une file d'animations
   * @returns {AnimationQueue}
   */
  function AnimationQueue() {
    
    /**
     * file des animations
     */
    this.list = [];
    
  };
  
  AnimationQueue.prototype = {
    
    constructor : AnimationQueue,
    
    /**
     * indice de l'animation en cours
     */
    ind : -1,
    
    /**
     * définit si la file s'exécute en boucle ou non
     */
    loop : false,
    /**
     * Fonctions à exécuter au lancement de la file
     */
    onstart : null,
    /**
     * Fonctions à exécuter à la fin de l'exécution de la file
     */
    onend : null,
    /**
     * Fonctions a exécuter pendant l'exécution de la file
     */
    onanimate : null,
    /**
     * Fonctions à exécuter quand on lance la file (quelle que soit la position)
     */
    onplay : null,
    /**
     * Fonctions à exécuter quand on suspend la file (quelle que soit la position)
     */
    onpause : null,
    /**
     * Fonctions à exécuter quand on arrete la file.
     */
    onstop : null,
    
    /**
     * définition d'un écouteur d'évènement
     * @param evt
     * @param fct
     * @returns {AnimationQueue}
     * @see {StdConstruct}
     */
    on : StdConstruct.prototype.on,
    /**
     * 
     * @param evt
     * @param fct
     * @returns {AnimationQueue}
     * @see {StdConstruct}
     */
    off : StdConstruct.prototype.off,
    
    trigger : StdConstruct.prototype.trigger,
    
    set : StdConstruct.prototype.set,
    
    /**
     * Réinitialisation de la file et des options
     */
    reset : function() {
      StdConstruct.prototype.reset.call(this);
      this.list = [];
    },
    
    /**
     * stoppe l'animation en cours (dans l'état courant) et réinitialise la file et les options
     */
    clear : function() {
      this.pause();
      this.reset();
    },
    
    /**
     * Renvoie l'objet animation en cours
     * @returns {Animation}
     */
    current : function() { return this.list[this.ind]; },
    
    /**
     * Passe à l'animation précédente
     * @returns {AnimationQueue}
     */
    prev : function() {
      
      var current = this.current();
      current && current._currentTime > 0 && current.currentTime(0);
      
      if (this.ind === 0) {
        if (this.loop === false) return false;
        else {
          while (this.ind < this.list.length-1) this.next();
          current = this.list[this.list.length-1];
          current.currentTime( getDuration(current.duration) );
          return this;
        }
      }
      else this.ind--;
      
      current = this.current();
      current._currentTime = getDuration(current.duration);
      
      return this;
    },
    
    /**
     * Passe à l'animation suivante
     * @returns {AnimationQueue}
     */
    next : function() {
      
      var current = this.current(),
      duration = current && getDuration(current.duration);
      
      if (current && current._currentTime < duration) current.currentTime(duration);
      
      if (this.ind === this.list.length-1) {
        if (this.loop === false) return false;
        else {
          while (this.ind > 0) this.prev();
          this.list[0].currentTime(0);
          return this;
        }
      }
      else this.ind++;
      
      current = this.current();
      if (current) current._currentTime = 0;
      
      return this;
    },
    
    /**
     * Renvoie true si l'animation est en cours
     * @returns {Boolean}
     */
    inProgress : function() {
      var current = this.current();
      return !!(current && current.inProgress);
    },
    
    /**
     * Joue la file d'animations (là ou elle en est)
     * @returns {AnimationQueue}
     */
    play : function() {
      
      if (this.ind === -1) throw new Error("Aucune animation n'a été définie.");
      
      var current = this.current();
      
      if (current) {
        
        if (current.inProgress) return this;
        
        if (current._currentTime === 0 && this.ind === 0 && this._way === 1 ||
            current._currentTime === getDuration(current.duration) && this.ind === this.list.length-1 && this._way === -1
            ) this.trigger('start');
        
        this.trigger('play');
        
        current.play();
      }
      
      return this;
    },
    
    /**
     * Fige l'animation en cours
     * @returns {AnimationQueue}
     */
    pause : function() {
      
      var current = this.current();
      if (current && !current.inProgress) return this;
      this.trigger('pause');
      current && current.pause();
      return this;
    },
    
    /**
     * Joue ou suspend l'animation.
     * @returns {AnimationQueue}
     */
    toggle : function() {
      if (this.inProgress()) this.pause();
      else this.play();
      return this;
    },
    
    /**
     * Stoppe l'animation et revient à l'état initial de la file
     * @returns {AnimationQueue}
     */
    stop : function() {
      
      var current;
      current = this.current();
      
      if (this.ind === 0 && current._currentTime == 0) return this;
      
      current && current.stop();
      
      while (this.ind > 0) this.prev();
      
      current = this.current();
      current && current.currentTime(0);
      
      //on purge les états de départ au cas où l'élément est modifié entre 2 lancements d'animation.
      this.list.forEach(function(anim) { anim.from = null; });
      
      this.trigger('stop');
      
      return this;
    },	
    
    /**
     * récupère ou fixe la position dans le temps
     * @param ms optionnel, si défini fixe la position
     * @returns {AnimationQueue,Number} position (en millisecondes) ou objet lui-même.
     */
    currentTime : function(ms) {
      
      var i,currentTime,current,duration;
      
      if (ms == null) {
        ms=0;
        for (i=0;i<this.ind;i++) ms+= getDuration(this.list[i].duration);
        ms+= this.current()._currentTime;
        return ms;
      }
      else {
        
        currentTime = this.currentTime();
        ms = setCurrentTime( currentTime, ms );
        ms = JSYG.clip(ms,0,this.duration());
        
        if (currentTime == ms) return this;
        
        //RAZ par simplicité
        while (this.ind > 0) this.prev();
        
        current = this.current();
        current && current.currentTime(0);
        
        duration = getDuration(current.duration);
        
        while (ms > duration && this.next()) {
          ms-= duration;
          current = this.current();
          duration = getDuration(current.duration);
        }
        
        current.currentTime(ms);
        
        return this;
      }
    },
    
    /**
     * Renvoie la durée totale en millisecondes de la file.
     */
    duration : function() {
      var ms=0;
      for (var i=0,N=this.list.length;i<N;i++) ms+= getDuration(this.list[i].duration);
      return ms;
    },
    
    _way : 1,
    /**
     * définit ou récupère le sens d'exécution de la file et des animations
     * @param val optionnel, si défini fixe le sens de l'animation (1 sens normal, -1 sens inverse). La valeur spéciale "toogle" permet
     * d'inverser la valeur.
     * @returns {Number,AnimationQueue} le sens de l'animation si val est indéfini, l'objet lui-même sinon.
     */
    way : function(val) {
      
      var inProgress;
      
      if (val == null) return this._way;
      else {
        
        if (val == 'toggle') val = this._way * -1;
        
        if (val !== 1 && val !== -1) throw new Error("la valeur de 'way' doit être 1 ou -1");
        
        inProgress = this.inProgress();
        inProgress && this.pause();
        
        this._way = val;
        this.list.forEach(function(anim) { anim.way = val; });
        
        inProgress && this.play();
        
        return this;
      }
    },
    
    /**
     * Insert une animation à la file
     * @param animation instance de Animation
     * @param ind optionnel, indice où insérer l'animation
     * @returns {AnimationQueue}
     */
    add : function(animation,ind) {
      
      var anim;
      
      if (JSYG.isPlainObject(animation)) {
        anim = new Animation(animation.node);
        anim.set(animation);
        animation = anim;
      }
        
      if(!(animation instanceof Animation)) throw new Error("Argument incorrect pour la méthode AnimationQueue.add : "+animation);
      
      if (this.list.indexOf(animation) !== -1) throw new Error("l'animation est déjà dans la liste.");
      
      var that = this;
      
      animation.queueFunctions = {
        
        end : function() {
          if ((that._way === 1 && that.next()) || (that._way===-1 && that.prev())) {
            that.current().play();
          }
          else that.trigger('end');
        },
        
        animate : function() {
          that.trigger('animate');
        }
      };
      
      animation.on(animation.queueFunctions);
      
      if (ind == null) ind = this.list.length;
      this.list.splice(ind,0,animation);
      
      if (this.ind == -1) this.ind = 0;
      
      return this;
    },
    
    /**
     * Suppression d'une animation de la file
     * @param {Number} ind indice de l'animation (ou objet Animation)
     * @returns {AnimationQueue}
     */
    remove : function(ind) {
      
      if (ind instanceof Animation) ind = this.list.indexOf(ind);
      
      var animation = this.list[ind];
      animation.off(animation.queueFunctions);
      
      this.list.splice(ind,1);
      
      if (this.list.length === 0) this.ind = -1;
      
      return this;
    }
  };
  
  
  /**
   * Raccourci pour l'animation de la collection.
   * @param properties objet décrivant l'état d'arrivée.
   * @param options optionnel, objet décrivant les options de l'animation.
   * 
   * On peut aussi passer le tout dans un seul argument. L'état d'arrivée doit alors
   * être décrit dans une propriété nommée "to".
   * Pour insérer une pause, il faut passer "delay" en 1er argument, et le nombre
   * de ms en second argument.
   * 
   * @returns {JSYG}
   * @see AnimationQueue Animation
   * @example new JSYG('#divAnime').animate({left:"120px",top:"50px"});<br/>
   * new JSYG('#divAnime').animate({rotate:90,scale:3},{duration:1000});<br/>
   * new JSYG('#divAnime').animate({<br/>
   * 		to:{rotate:90,scale:3},<br/>
   * 		easing:'swing',<br/>
   * 		onend:function() { alert('terminé'); }<br/>
   * });<br/>
   * new JSYG(window).animate("delay",300).animate({scrollTop:80});
   */
  JSYG.prototype.janimate = function(properties,options) {

    var args = arguments,
    method = (typeof properties == 'string') ? properties : null,
    value,opt;

    if (!method) {

      if (options) {
        opt = JSYG.extend({},options);
        opt.to = properties;
      }
      else if (!('to' in properties)) {
        opt = {to: JSYG.extend({},properties) };
      }
      else opt = JSYG.extend({},properties);
    }

    this.each(function() {

      var $this = JSYG(this),
      queue = $this.data('AnimationQueue'),
      animation;

      if (!queue) {
        queue = new AnimationQueue();
        $this.data('AnimationQueue',queue);
      }

      if (method) {

        if (method == "get") {

          value = queue[args[1]];
          if (typeof value == "function") value =  queue[args[1]]();
          return false;
        }
        else if (queue[method] ) {

          if (method.substr(0,1) === '_') throw new Error("La méthode " +  method + " est privée.");
          else queue[method].apply(queue,Array.prototype.slice.call(args,1));
        }
        else if (method === 'destroy') {

          queue.clear();
          $this.dataRemove('AnimationQueue');
        }
        else if (method === 'delay') {
          $this.animate(null,args[1] && {duration:args[1]});
        }
        else {
          throw new Error("La méthode " +  method + " n'existe pas ");
        }
      }
      else {

        animation = new Animation(this);

        animation.set(opt); 

        if (!queue.inProgress()) queue.reset();

        queue.add(animation);

        if (!queue.inProgress()) queue.play();
      }

    });

    return method == "get" ? value : this;
  };
  
  JSYG.AnimationQueue = AnimationQueue;
  
  return AnimationQueue;
  
}));