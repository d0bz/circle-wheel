MultiCircle = function(options, subcircles){

	var circleWheel = false;
	var element = null;

	this.getOptions = function(){
		return options;
	};
	
	this.getText = function(){
		return options.text;
	};
		
	this.getImage = function(){
		return options.image;
	}
		
	this.getSelected = function(){
		return options.selected;
	}
	
	this.setSelected = function(state){
		options.selected = state;
	}
	
	this.setElement = function(elem){
		element = elem;
	}
	
	this.getElement = function(){
		return element;
	}	
	
	this.runCallback = function(selector){

	};
	
	this.init = function(){
		if(!circleWheel){		
			circleWheel = new CircleWheel(element, subcircles, {hidden: true});
			circleWheel.init();
		}
	}
	
	this.getCircleWheel = function(){
		return circleWheel;
	}
	
	this.addCloseCallback = function(func){
		circleWheel.circleClosedCallback(func);
	};
	
	return this;
};