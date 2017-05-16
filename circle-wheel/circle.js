Circle = function(options, callback){
	
	var element = null;

	this.getOptions = function(){
		return options;
	}
	
	this.getText = function(){
		return options.text;
	}
	
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
		return callback(selector, this.getElement());
	}
	
	return this;
};