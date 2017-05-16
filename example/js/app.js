runApp = function(){
	
	
	 var selectorClicked = function(selector){
		console.log(selector.getOptions());
		return selector.getSelected();
   }
	
   var selectors = [
		new Circle({text: 'Ortofoto', image: "img/sat.png"}, selectorClicked),
		new Circle({text: 'Kaart', image: "img/sat2.png"}, selectorClicked),
		new Circle({text: 'Hübriid kaart', image: "img/terrain.png", selected: true}, selectorClicked),
		new Circle({text: 'd'}, selectorClicked),
		new Circle({text: 'e'}, selectorClicked),
		new MultiCircle({text: 'Info'}, [new Circle({text: 'a'}, selectorClicked), new Circle({text: 'b'}, selectorClicked), new MultiCircle({text: 'f'}, [new Circle({text: 'a'}, selectorClicked), new Circle({text: 'b'}, selectorClicked)])]),
   ];
	
  circleWheel = new CircleWheel("testwheel", selectors);
  circleWheel.init();

  
  }