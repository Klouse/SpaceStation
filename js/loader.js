/*
loader.js
variable app is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of 
the bubbles game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

// CONSTANTS of app
app.KEYBOARD = {
	"KEY_LEFT": 37, 
	"KEY_UP": 38, 
	"KEY_RIGHT": 39, 
	"KEY_DOWN": 40,
	"KEY_SPACE": 32
};

// properties of app
app.animationID = undefined;
app.paused = false;

// key daemon array
app.keydown = [];

(function(){
	var queue = new createjs.LoadQueue(false);
	queue.on("fileload", handleFileLoad, this);
	queue.on("complete", complete, this);
	queue.loadFile("js/lib/three.min.js");
	queue.loadFile("js/lib/tween.min.js");
	queue.loadFile("js/loaders/OBJLoader.js");
	queue.loadFile("js/lib/FirstPersonControls.js");
	queue.loadFile("js/planet.js");
	queue.loadFile("js/comet.js");
	queue.loadFile("js/main.js");
	
	function handleFileLoad(e){
		console.log(e + " loaded");
	}
	
	function handleComplete(e){
		app.main.init();
	}
	
	// when the loading is complete, this function will be called
		 function complete(){
			
			// set up event handlers
			window.onblur = function(){
				app.paused = true;
				cancelAnimationFrame(app.animationID);
				app.keydown = []; // clear key daemon
				// call update() so that our paused screen gets drawn
				app.main.update();
			};
			
			window.onfocus = function(){
				app.paused = false;
				cancelAnimationFrame(app.animationID);
				// start the animation back up
				app.main.update();
			};
			
			// event listeners
			window.addEventListener("keydown",function(e){
				//console.log("keydown=" + e.keyCode);
				app.keydown[e.keyCode] = true;
			});
				
			window.addEventListener("keyup",function(e){
				//console.log("keyup=" + e.keyCode);
				app.keydown[e.keyCode] = false;
			});
			
			
			// start game
			app.main.init();
		} // end complete

}());



		
		
		

