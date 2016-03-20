;(function($, window, undefined) {
  'use strict';

  var _;
  var pluginName = 'touchSlider';
  
  
  var onMouseDown = function(e) {
    //if (_.$holder.is(":animated")) return;
    
    e.preventDefault();
    _.$holder.stop(true, false);
    _.hasMouseDown = true;
    _.startCoord = _.initialCoord = e.pageX;
  }
  
  var onMouseMove = function(e) {
    if (_.hasMouseDown === true) {
      enableInfinite();
      if (_.$holder.is(":animated")) {
        _.$holder.stop(true, false);
      }
      
      var ePageX = e.pageX;
      _.$holder.css("margin-left", "+=" + (ePageX - _.startCoord) + "px");
      _.startCoord = ePageX;
    }
  }
  
  var onMouseUp = function(e) {
   // if (_.$holder.is(":animated")) return;
    if (_.hasMouseDown === false) return;
    
    
    _.hasMouseDown = false;
    var remainSlideWidth = parseInt(_.$holder.css("margin-left")) % _.slideWidth;
    if (remainSlideWidth < 0) {
      remainSlideWidth *= -1;
    }
    
    if (_.initialCoord < e.pageX) { // swipe left to right
      autoCompleteSwipe(remainSlideWidth, _.slideWidth - _.w);
    }
    else { // swipe right to left
      autoCompleteSwipe(remainSlideWidth, _.w);
    }
  }
  
  var onMouseOut = function(e) {
    if (_.hasMouseDown === true) {
      _.$slider.mouseup();
    }
  }
  
  
  var autoCompleteSwipe = function(remainSlideWidth, d) {
    var next;
    if (remainSlideWidth < d) {
      next = remainSlideWidth;
    }
    else {
      next = remainSlideWidth - _.slideWidth;
    }
    
    
    var marginLeft = parseInt(_.$holder.css("margin-left"));
    _.$holder.animate({
      "margin-left": marginLeft + next
    }, _.options.speed, function() {
      _.currentSlideIndex = parseInt(_.$holder.css("margin-left")) * -1 / _.slideWidth;
      enableInfinite();
    });
  }
  
  var enableInfinite = function() {
    var currentMarginLeft = parseInt(_.$holder.css("margin-left"));
    if (currentMarginLeft < 0) {
      currentMarginLeft *= -1;
    }
    //var currentSlide = parseInt(_.$holder.css("margin-left")) * -1 / _.slideWidth;
    //var lastIndex = _.$slides.size() - 1;
    if (currentMarginLeft > (_.$slides.size() - 2)*_.slideWidth) {
      console.log("move to head");
      //_.$holder.css("margin-left", _.initialMarginLeft - _.slideWidth);
      var v = (_.$slides.size() - 2) * _.slideWidth;
      _.$holder.css("margin-left", "+=" + v + "px");
    }
    else if (_.slideWidth - currentMarginLeft >= _.w) {
      console.log("move to tail");
      var v = (_.$slides.size() - 2)*_.slideWidth;
      _.$holder.css("margin-left", "-=" + v + "px");
    }
  } 
  
  var setUpInfinite = function() {
    _.$slides.last().clone().prependTo(_.$holder);
    _.$slides.first().clone().appendTo(_.$holder);
    
    _.$slides = _.$holder.children();
    _.$holder.css("width", _.$slides.size()*100 + "%");
    _.$holder.css("margin-left", _.initialMarginLeft - _.slideWidth);
  }

  var autoAnimate = function() {
    console.log("autoplay");
    _.$holder.animate(
        {"margin-left": "-=" + _.slideWidth + "px"},
        _.options.speed,
        enableInfinite());
  }

  function Plugin(element, options) {
    _ = this;
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      
      // Init variables
      _.hasMouseDown = false;
      _.startCoord = null;
      _.initialCoord = null;
      
      _.$slider = _.element;
      _.$holder = _.element.children(":first");
      _.$slides = _.$holder.children();
      
      _.w = 80;
      _.slideWidth = parseInt(_.$slider.css("width"));
      
      _.initialMarginLeft = parseInt(_.$holder.css("margin-left"));
      _.currentSlideIndex = 0;
      
      // Setup
      setUpInfinite();
      
      if (_.options.autoplay === true) {
        setInterval(autoAnimate, _.options.autoplayPauseTime);
      }
      else {
        // Bind events
        _.$slider.bind("drop dragstart", function(e) {
          e.preventDefault();
          return false;
        });
        
        _.$slider.mousedown(function(e) {
          onMouseDown(e);
        });
        
        _.$slider.mousemove(function(e) {
          onMouseMove(e);
        });
        
        _.$slider.mouseup(function(e) {
          onMouseUp(e);
        });
        
        _.$holder.mouseleave(function(e) {
          e.preventDefault();
          e.stopPropagation();
          onMouseUp(e);
        });
      }
      
      
      
      
      
    }
    
  };

  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      }
    });
  };

  $.fn[pluginName].defaults = {
    speed: 500,
    autoplay: true,
    autoplayPauseTime: 2000
  };

}(jQuery, window));