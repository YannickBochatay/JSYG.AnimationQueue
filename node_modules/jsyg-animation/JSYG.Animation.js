(function(factory) {
  
  if (typeof module == "object" && typeof module.exports == "object") {
    
    module.exports = factory(
      require("jquery"),
      require("jsyg"),
      require("jsyg-path"),
      require("jsyg-stdconstruct"),
      require("jsyg-matrix"),
      require("jsyg-color"),
      require("jquery.easing")
    );
  }
  else if (typeof define != "undefined" && define.amd) {
    
    define("jsyg-animation",[
      "jquery",
      "jsyg",
      "jsyg-path",
      "jsyg-stdconstruct",
      "jsyg-matrix",
      "jsyg-color",
      "jquery.easing"
    ],factory);
  }
  else if (typeof JSYG != "undefined") {
    
    if (jQuery && JSYG.Path && JSYG.StdConstruct && JSYG.Matrix && JSYG.Color) {
      
      factory(
        jQuery,
        JSYG,
        JSYG.Path,
        JSYG.StdConstruct,
        JSYG.Matrix,
        JSYG.Color
      );
    }
    else throw new Error("dependency is missing");
  }
  else throw new Error("JSYG is needed");
  
}(function($,JSYG,Path,StdConstruct,Matrix,Color) {
  
  "use strict";
  
  var regValAndUnits = /(-?\d*\.?\d+)(px|pt|em|%|deg)$/;
  
  var regOperator = /^ *(\+|-|\*|\/)=/;
  
  //@TODO à améliorer
  var regColorProp = /^(background(-c|C)olor|color|fill|stroke)$/;
  
  var listTransf = ['rotate','scale','scaleX','scaleY','skewX','skewY','translateX','translateY'];
  
  /**
   * Renvoie un nombre à partir d'un nombre, d'un chaîne numérique ou d'un "additionneur" ("+=20","-=20")
   * @param time temps initial
   * @param arg si c'est un nombre (ou chaîne numérique), il remplace time, si c'est une chaîne de la forme "+=20" "-=20" il s'aditionne à time.
   */
  function setCurrentTime(time,arg) {
    
    if (typeof arg == 'string' && !$.isNumeric(arg)) {
      
      var match = /(\+|-)=([0-9]+)/.exec(arg),
      signe = match && match[1],
      val = match && Number(match[2]);
      
      return time + (signe == '+' ? 1 : -1 ) * val;
      
    }
    else if ($.isNumeric(arg)) return Number(arg);
    else throw new Error(arg+" : argument incorrect.");
  }
  
  function getDuration(duration) {
    
    if ($.isNumeric(duration)) return duration;
    else if (duration == "slow") return 600;
    else if (duration == "fast") return 200;
    else throw new Error(duration+" : argument incorrect.");
  }
  
  function separateValAndUnits(str) {
    
    str = (str != null) ? str.toString() : "";
    
    var result = regValAndUnits.exec(str);
    
    return {
      value: (result && result[1]!=null) ? parseFloat(result[1]) : $.isNumeric(str) ? parseFloat(str) : str,
      units:result && result[2] || ''
    };
  }
  
  function getAbsValue(jNode,prop,str) {
    
    str = str.toString();
    
    var op = regOperator.exec(str) || '',
    donnee, transf, initialValue;
    
    if (op && op[1]) str = str.replace( op[1]+'=' ,'');
    
    donnee = separateValAndUnits(str);
    
    if (!op) return donnee.value+donnee.units;
    
    if (listTransf.indexOf(prop)!==-1) {
      
      if (prop === 'scale') prop = 'scaleX';
      transf = jNode.getTransf();
      initialValue = separateValAndUnits( transf[prop] );
      
    } else initialValue = separateValAndUnits( jNode.css(prop) );
    
    op = op[1]; //sous-chaîne trouvée
    
    if (!$.isNumeric(initialValue.value) || !$.isNumeric(donnee.value)) return initialValue.value+initialValue.units;
    
    switch (op) {
      case '+' : return initialValue.value + donnee.value + initialValue.units;
      case '-' : return initialValue.value - donnee.value + initialValue.units;
      case '*' : return initialValue.value * donnee.value + initialValue.units;
      case '/' : return initialValue.value / donnee.value + initialValue.units;
    }
  }
  
  
  
  
  
  /**
   * Animation d'un élément (html et svg, prise en compte des transformations 2d et de chemins).
   * @param arg argument JSYG, élément DOM à animer
   * @param {Object} opt options de l'animation. Si défini, l'animation est lancée immédiatement. 
   */
  function Animation(arg,opt) {
    
    /**
     * élément DOM à animer
     * @type Object dom
     * @private
     */
    if (arg) this.node = new JSYG(arg)[0];
    
    /**
     * Etat d'arrivée demandé
     */
    this.to = {};
    
    if (opt) this.play(opt);
  };
  
  function transfAnim(obj) {
    
    if (!JSYG.support.twoDimTransf) return false;
    
    for (var n in obj) {  if (listTransf.indexOf(n)!==-1) return true; }
    
    return false;
  }
  
  /**
   * Renvoie les deux points (d'affilée) d'un chemin les plus éloignés l'un de l'autre.
   * Cela permet d'ajouter un point sur la courbe là où il y a le plus de "place".
   */
  function indMaxDistance(jPath) {
    
    if (!jPath.isNormalized()) throw new Error("You must normalize the path : "+jPath.attr("d"));
    
    var max = 0,
    ind=-1,
    distance,
    i=1,N=jPath.nbSegs();
    
    for(;i<N;i++) {
      
      distance = jPath.getSegLength(i);
      
      if (distance > max) {
        max = distance;
        ind = i;
      }
    }
    
    return ind;
  };
  
  
  Animation.prototype = {
    
    constructor : Animation,
    
    setNode : StdConstruct.prototype.setNode,
    /**
     * durée de l'animation en millisecondes
     * @type Number ou chaîne ("fast" pour 200ms et "slow" pour 600ms)
     * @default 400
     */
    duration : 400,
    /**
     * pourcentage de l'animation en cours
     * @type Number
     * @private
     */
    _currentTime : 0,
    /**
     * style d'animation : voir Animation.easing pour la liste des choix possibles
     * @type String,Array
     */
    easing : 'linear',
    /**
     * Sens de l'animation
     * @type {Number} 1 ou -1 
     */
    way : 1,
    /**
     * Indique si l'animation est en cours
     * @type {Boolean}
     */
    inProgress : false,
    /**
     * Fonctions à exécuter au départ de l'animation
     */
    onstart : null,
    /**
     * Fonctions à exécuter à la fin de l'animation
     */
    onend : null,
    /**
     * Fonctions à exécuter pendant l'animation
     */
    onanimate : null,
    /**
     * Fonctions à exécuter quand on lance l'animation quelle que soit la position
     */
    onplay : null,
    /**
     * Fonctions à exécuter quand on suspend l'animation
     */
    onpause : null,
    /**
     * Fonctions à exécuter quand on stoppe l'animation
     */
    onstop : null,
    
    /**
     * Ajout d'un écouteur d'évènement
     * @param evt
     * @param fct
     * @returns {Animation}
     * @see JSYG.StdConstruct.prototype.on
     */
    on : StdConstruct.prototype.on,
    /**
     * Suppression d'un écouteur d'évènement
     * @param evt
     * @param fct
     * @returns {Animation}
     * @see JSYG.StdConstruct.prototype.off
     */
    off : StdConstruct.prototype.off,
    
    trigger : StdConstruct.prototype.trigger,
    
    set : function(opt) {
      
      for (var n in opt) {
        if (n in this && opt[n]!==undefined) this[n] = opt[n];
      }
      
      return this;
    },
    
    /**
     * Cas particulier pour la transformation des chemins
     */
    _setPathFromTo : function() {
      
      var pathFrom = new Path( JSYG(this.node).clone() ).toCubicCurve(),
          
      fromList = pathFrom.getSegList(),
      
      pathTo = (typeof this.to.d == 'string') ?
  
      new Path().attr('d',this.to.d).toCubicCurve() : new Path().setSegList(this.to.d),
          
      toList = pathTo.getSegList(),
      
      ind,subPath,
      
      target = fromList.length > toList.length ? pathTo : pathFrom;
  
      while (fromList.length != toList.length) {
        
        ind = indMaxDistance(target);
        subPath = target.splitSeg(ind);
        
        target.removeSeg(ind)
            .insertSeg(subPath.getSeg(1),ind)
            .insertSeg(subPath.getSeg(0),ind);
        
        fromList = pathFrom.getSegList();
        toList = pathTo.getSegList();
      }
      
      this._from.d = fromList;
      this._to.d = toList;
    },
    /**
     * Harmonisation de l'état d'arrivée
     * @private
     * @returns {Animation}
     */
    _setTo : function() {
      
      var jNode = new JSYG(this.node),
      to = Object.create(this.to),
      n,shift,decompose,value;
      
      this._to = {};
      
      if (jNode.length === 0) return this;
      
      if (!this.to) return this; //pour délai sans animation
      
      if (this.to instanceof Matrix) to = { mtx : this.to };
      
      if ("mtx" in to) {
        
        shift = jNode.getShift();
        decompose = to.mtx.decompose(shift.x,shift.y);
        
        for (n in decompose) {
          if (n != 'skew') to[n] = decompose[n];
        }
        
        delete to.mtx;
        
        this._transf = true;
      }
      else if (transfAnim(to)) {
        
        decompose = jNode.getTransf();
        
        if (to.scale && !to.scaleX && !to.scaleY) {
          to.scaleX = to.scaleY = to.scale;
        }
        
        for (n in decompose) {
          
          if (n != 'skew' && !this._to[n]) this._to[n] = (to[n] == null) ? decompose[n] : to[n];
        }
        
        this._transf = true;
      }
      
      for (n in to) {
        
        if (n == "d") continue;
        
        if (regColorProp.test(n)) {
          
          if (!Color) throw new Error("Il faut inclure le plugin JSYG.Color");
          if (!(to[n] instanceof Color)) this._to[n] = new Color(to[n]);
          
        } else {
          
          if (typeof to[n] !== 'object') {
            value = getAbsValue(jNode,n,to[n]);
            this._to[n] = separateValAndUnits(value);
          }
        }
      }
      
      return this;
    },
    
    /**
     * Réinitialisation de l'animation et des options
     */
    reset : function() {
      StdConstruct.prototype.reset.call(this);
      this._from = null;
      this._to = null;
      this.to = {};
      
      return this;
    },
    
    /**
     * En interne seulement, harmonisation de l'état de départ
     * @private
     */
    _setFrom : function() {
      
      var jNode = new JSYG(this.node),
      tag,isSVG,dim,n,decomposeMtx,isXY;
      
      this._from = {};
      
      if (!jNode.length) return this;
      
      isSVG = jNode.isSVG();
      dim = jNode.getDim();
      tag = jNode.getTag();
      
      if (this._transf) {
        decomposeMtx = jNode.getTransf();
        for (n in decomposeMtx) if (n!="skew") this._from[n] = decomposeMtx[n];
      }
      
      for (n in this._to) {
        
        if (n == "d") continue;
        
        isXY = (n == "x") || (n == "y");
        
        if (isXY && tag == "text") this._from[n] = jNode.attr(n);
        else if (isXY || isSVG && ['width','height'].indexOf(n)!==-1) this._from[n] = dim[n];
        else if (listTransf.indexOf(n) === -1) this._from[n] = jNode.css(n) || 0;
        
        if (regColorProp.test(n)) {
          
          try { this._from[n] = new Color(this._from[n]); }
          catch(e) { this._from[n] = new Color("white"); }
        }
        else {
          
          this._from[n] = separateValAndUnits(this._from[n]);
          
          if (!$.isNumeric(this._from[n].value)) this._from[n].value = 0;
          
          if (this._to[n].units === '') this._to[n].units = this._from[n].units;
        }
      }
      
      return this;
    },
    
    /**
     * récupère ou fixe la position dans l'animation (en millisecondes).
     * @param ms optionnel, si défini nombre de millisecondes théoriques dans l'animation où se placer.
     * @returns {Animation,Number} la position si ms est indéfini, l'objet lui-même sinon
     */				
    currentTime : function(ms) {
      
      if (ms == null) return this._currentTime;
      
      var duration = getDuration(this.duration),
      jNode = new JSYG(this.node),
      isSVG = jNode.isSVG(),
      val,coef,recompose={},
      n,shift,color,path,
      that = this;
      
      ms = setCurrentTime( this._currentTime , ms );
      ms = this._currentTime = JSYG.clip(ms,0,duration);
      
      if (!this._from) { //si l'animation n'est pas lancée par la méthode play
        
        this._setTo();
        this._setFrom();
        
        if (this.to && ('d' in this.to)) this._setPathFromTo();
      }
      
      coef = (this.easing != "linear" && $.easing[this.easing]) ? $.easing[this.easing](null,ms,0,100,duration) : 100 * ms/duration;
                  
      for (n in this._to){
        
        if (regColorProp.test(n)) {
          
          color = new Color();
          color.r = parseInt( (this._from[n].r * (100-coef) + this._to[n].r*coef) / 100 , 10);
          color.g = parseInt( (this._from[n].g * (100-coef) + this._to[n].g*coef) / 100 , 10);
          color.b = parseInt( (this._from[n].b * (100-coef) + this._to[n].b*coef) / 100 , 10);
          
          jNode.css(n,color.toString());
          
        } else if (n == "d") {
          
          path = new Path();
          
          this._from.d.forEach(function(segFrom,i) {
            
            var seg = {},
            segTo = that._to.d[i];
            
            ['x','y','x1','y1','x2','y2'].forEach(function(n) {
              if (segFrom[n]==null || segTo[n]==null) return;
              seg[n] = (segFrom[n] * (100-coef) + segTo[n] * coef) / 100;   
            });
            
            if (seg.x == null && segTo.pathSegTypeAsLetter.toUpperCase() == "Z") path.addSeg("Z");
            else if (seg.x1==null) path.addSeg(i==0 ? 'M' : 'L',seg.x,seg.y);
            else path.addSeg('C',seg.x,seg.y,seg.x1,seg.y1,seg.x2,seg.y2);
          });
          
          jNode.attr('d', path.attr('d') );
        }
        else {
          
          val = (this._from[n].value * (100-coef) + this._to[n].value*coef) / 100;
          
          if (['x','y'].indexOf(n)!==-1) {
            jNode.getTag() == "text" ? jNode.attr(n,val) : jNode.setDim(n,val);
          }
          else if (isSVG && ['width','height'].indexOf(n)!==-1) jNode.setDim(n,val);
          else if (listTransf.indexOf(n) !== -1) recompose[n] = val;
          else jNode.css(n,val+this._to[n].units);
        }
      }
      
      if (this._transf) {
        
        shift=jNode.getShift();
        jNode.setMtx(new Matrix().recompose(recompose,shift.x,shift.y));
      }
      
      return this;
    },
    
    _request : function() {
      
      var that = this,
      duration = getDuration(this.duration);
      
      this.inProgress = window.requestAnimationFrame(function() {
        
        if (that._currentTime === 0 && that.way === 1 || that._currentTime === duration && that.way === -1) that.trigger('start');
        
        that.currentTime( that._currentTime + that.way * (Date.now() - that._last) );
        
        that.trigger('animate');
        
        that._last = Date.now();
        
        if ((that._currentTime <= 0 && that.way===-1 || that._currentTime >= duration && that.way===1)) {
          that.inProgress = false;
          that.trigger('end');
        }
        else that._request();
        
      });
    },
    
    /**
     * Joue l'animation (là où elle en est)
     * @returns {Animation}
     */
    play : function(opt) {
      
      if (opt) this.set(opt);
      if (this.inProgress) return this;
      this.trigger("play");
      this._last = Date.now();
      this._request();
      return this;
    },
    
    /**
     * Fige l'animation
     * @returns {Animation}
     */
    pause : function() {
      
      if (!this.inProgress) return this;
      window.cancelAnimationFrame(this.inProgress);
      this.inProgress = false;
      this.trigger("pause");
      return this;
    },
    
    /**
     * Stoppe l'animation et retourne au point de départ
     * @returns {Animation}
     */
    stop : function() {
      
      if (!this.inProgress && this._currentTime === 0) return this;
      window.cancelAnimationFrame(this.inProgress);
      this.currentTime(0);
      this._from = null;
      this.inProgress = false;
      this.trigger("stop");
      return this;
    }
  };
  
  
  
  if (typeof JSYG != "undefined") {
    
    if (typeof JSYG.Animation != "undefined") JSYG.Janimation = Animation;
    else JSYG.Animation = Animation;
  }
  
}));