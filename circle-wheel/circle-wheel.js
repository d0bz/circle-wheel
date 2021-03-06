CircleWheel = function(container, selectors, options) {

	this.circle = null;
	this.centerCircle = null;
	this.selectorElements = [];
	
	this.center = {};
	
	function hasClass(ele,cls) {
	  if(ele && ele.className) {
		  return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	  }
	  
	  return false;
	}
	
	function addClass(ele,cls) {
		if(ele instanceof Array){
			ele.forEach(function(e){
				addClass(e, cls);
			});
	  }else{
		if (!hasClass(ele,cls)) ele.className += " "+cls;
	  }
	}

	function removeClass(ele,cls) {
	  if(ele instanceof Array){
			ele.forEach(function(e){
				removeClass(e, cls);
			});
	  }else{
		  if (hasClass(ele,cls)) {
			var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
			ele.className=ele.className.replace(reg,' ');
		  }
	  }
	}
	
	this.setSelectedState = function(selector, state){
		selector.setSelected(state);
		
		var selected = selector.runCallback(selector);
		if(selected){
			addClass(selector.getElement(), "selected");
		}else{
			selector.setSelected(false);
			removeClass(selector.getElement(), "selected");
		}
	};
	
	this.addNewSelector = function(selector){
		createSelectorElement.call(this, selector);
		calculateCirclePositions.call(this);
		calculateCircleAngle.call(this);
	};

    this.init = function() {
		
		var self = this;
		
		if(!options){
			options = {};
		}
		
		var containerEl = null;
		if(typeof container === 'object'){
			containerEl = container;
		}else{
			containerEl = document.getElementById(container);
		}
		if(!containerEl){
			console.log("No element found with id " + container);
			return;
		}
		
		var previousInnerHTML = containerEl.innerHTML;
		containerEl.innerHTML = '<div class="circle-wheel-container">'+
		   '<div class="circle-wheel-activate">'+ previousInnerHTML +'</div>'+
		   '<div class="circle-wheel">'+
		   '</div>'+
		   '</div>';

        this.circle = containerEl.getElementsByClassName('circle-wheel')[0];
		
        selectors.forEach(function(e) {
            createSelectorElement.call(self, e);
        });

        /**
         * Get elements
         */
        var circleContainer = containerEl.getElementsByClassName('circle-wheel-container')[0],
            circleDimensions = circleContainer.getBoundingClientRect();
            
		self.transcludeDiv = containerEl.getElementsByClassName('circle-wheel')[0];
		self.centerCircle = containerEl.getElementsByClassName('circle-wheel-activate')[0];


        var mc = new Hammer(self.circle);
        mc.get('pan').set({
            direction: Hammer.DIRECTION_ALL
        });

		var mcCenterCircle = new Hammer(self.centerCircle);
		mcCenterCircle.on("tap", function() {
			if(panDisabled){
				return;
			}
			showCircle.call(self, hasClass(self.circle, "hidden"));
		});
		
		var showCircle = function(state){
			if(state){
				removeClass(self.circle, "hidden");
				addClass(self.centerCircle, "activated");
				circleDimensions = circleContainer.getBoundingClientRect();
				self.center = {
					x: circleDimensions.left + circleDimensions.width / 2,
					y: circleDimensions.top + circleDimensions.height / 2
				};
				togglePan(true);
			}else{
				addClass(self.circle, "hidden");
				removeClass(self.centerCircle, "activated");
				circleClosedEvent();
			}
		};
		
		calculateCirclePositions.call(self);

        /**
         * Rotate circle on drag
         */

        self.center = {
            x: circleDimensions.left + circleDimensions.width / 2,
            y: circleDimensions.top + circleDimensions.height / 2
        };

        self.updatedAngle = 0,
            self.originalAngle = 0,
            self.currentAngle = 0;
        var wheelMouseDown = false;

        mc.on("panleft panright panup pandown", function(e) {
			if(panDisabled){
				return;
			}
            if (!wheelMouseDown) {
                var pageX = e.center.x;
                var pageY = e.center.y;
                self.updatedAngle = getAngle.call(self, pageX, pageY);
                wheelMouseDown = true;
            }
			
			var pageX = e.center.x;
			var pageY = e.center.y;

			self.currentAngle = getAngle.call(self, pageX, pageY) - self.updatedAngle + self.originalAngle;			
            calculateCircleAngle.call(self, e);
        });

        mc.on("panend", function(event) {
            self.originalAngle = self.currentAngle;
            wheelMouseDown = false;
        });
		
		
		
		if(options.hidden){
			showCircle(false);
		}else{
			showCircle(true);
		}
		
    }
	
	var panDisabled = false;
	var togglePan = function(forceState, selectorElement){
		var self = this;
		if(typeof forceState !== 'undefined'){
			panDisabled = !forceState;
		}else{
			panDisabled = !panDisabled;
		}
		
		if(panDisabled){
			self.selectorElements.forEach(function(e){
				if(e != selectorElement){
					addClass(e, "pan-disabled");
				}
			});
			addClass(self.centerCircle, "pan-disabled");
		}else{
			removeClass(self.selectorElements, "pan-disabled");
			removeClass(self.centerCircle, "pan-disabled");
		}
	};
	
	var circleClosedCallbackFunction = null;
	this.circleClosedCallback = function(func){
		circleClosedCallbackFunction = func;
	};
	
	var circleClosedEvent = function(){
		if(typeof circleClosedCallbackFunction === 'function'){
			circleClosedCallbackFunction();
		}
	};
	
	var textTemplate = '<i title="%TEXT%">%TEXT%</i>';
	var imageTemplate = '<img class="img-circle" src="%IMAGESRC%" title="%TEXT%"/>%TEXT%';	
	var createSelectorElement = function(e){
		var self = this;
		var newSelector = document.createElement("div");
		e.setElement(newSelector);
		if(e instanceof MultiCircle){
			newSelector.className = "circle multi-circle";
		}else{
			newSelector.className = "circle";
		}
	
		var innerHTML = null;
		if(e.getImage()){
			innerHTML = imageTemplate.replaceAll("%IMAGESRC%", e.getImage()).replaceAll("%TEXT%", e.getText());
		}else{
			innerHTML = textTemplate.replaceAll("%TEXT%", e.getText());
		}
		
		newSelector.innerHTML = innerHTML;

		var mc = new Hammer(newSelector);
		mc.on("tap", function() {
			self.setSelectedState(e, !e.getSelected());
						
			if(e instanceof MultiCircle){
				togglePan.call(self, false, newSelector);
				e.addCloseCallback(function(){
					togglePan.call(self, true);
				});
			}
		});

		if(e.getSelected()){
			self.setSelectedState(e, true);
		}
		
		self.circle.appendChild(newSelector);
		self.selectorElements.push(newSelector);
		if(e instanceof MultiCircle){
			e.init();
		}
	};
	
	
	/**
	 * Position circles around parent circle
	 */

	var calculateCirclePositions = function(){
		var self = this;
		var theta = [];

		var n = self.selectorElements.length;

		var r = (window.getComputedStyle(self.transcludeDiv).height.slice(0, -2) / 2) - (window.getComputedStyle(self.selectorElements[0]).height.slice(0, -2) / 2);

		var frags = 360 / n;
		for (var i = 0; i <= n; i++) {
			theta.push((frags / 180) * i * Math.PI);
		}

		var mainHeight = parseInt(window.getComputedStyle(self.transcludeDiv).height.slice(0, -2)) / 1.2;

		for (var i = 0; i < self.selectorElements.length; i++) {
			self.selectorElements[i].posx = Math.round(r * (Math.cos(theta[i]))) + 'px';
			self.selectorElements[i].posy = Math.round(r * (Math.sin(theta[i]))) + 'px';
			self.selectorElements[i].style.top = ((mainHeight / 2) - parseInt(self.selectorElements[i].posy.slice(0, -2))) + 'px';
			self.selectorElements[i].style.left = ((mainHeight / 2) + parseInt(self.selectorElements[i].posx.slice(0, -2))) + 'px';
		}
	}
	
	var calculateCircleAngle = function(){
		var self = this;
		self.circle.style.transform = self.circle.style.webkitTransform = 'rotate(' + self.currentAngle + 'deg)';

		for (var i = 0; i < self.selectorElements.length; i++) {
			self.selectorElements[i].style.transform = self.selectorElements[i].style.webkitTransform = 'rotate(' + -self.currentAngle + 'deg)';
		}
	}	
	
	var getAngle = function(x, y) {
		var self = this;
		var deltaX = x - self.center.x,
			deltaY = y - self.center.y,
			angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

		if (angle < 0) {
			angle = angle + 360;
		}

		return angle;
	};

    /**
     *	HELPERS
     */
    String.prototype.replaceAll = function(find, replace) {
        var str = this;
        return str.replace(new RegExp(find, 'g'), replace);
    };

    /**
     *	HELPERS END
     */

    return this;
};