// city.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.main = {
    	// CONSTANT properties
    	
		// variable properties
		renderer: undefined,
		scene: undefined,
		camera: undefined,
		myobjects: [],
		paused: false,
		dt: 1/60,
		controls: undefined,
		
		planet:undefined,
		comets: [],
		cometTimer: 0,
		nextComet: 100,
		
		
    	init : function() {
			console.log('init called');
			this.setupThreeJS();
			this.setupWorld();
			this.update();
    	},
    	
    	
    update: function(){
    	// schedule next animation frame
    	app.animationID = requestAnimationFrame(this.update.bind(this));
    	
		// PAUSED?
		if (app.paused){
			this.drawPauseScreen();
			return;
		 }
		 
		 this.cometTimer++;
		 if(this.cometTimer >= this.nextComet){
			this.spawnComet();
			this.cometTimer = 0;
			this.nextComet = Math.random() * 100 + 100;
		 }
	
		// UPDATE
		//this.controls.update(this.dt);
		this.planet.rotation.y += 0.002;
		for(var i = 0; i < this.comets.length; i++){
			var comet = this.comets[i];
			comet.update();
			if(comet.getPosition().x < -100){
				comet.removeFromScene(this.scene);
			}
			
			this.comets = this.comets.filter(function(o){
				if(!o.dead) return o;
			});
		}
		
		// DRAW	
		this.renderer.render(this.scene, this.camera);
		
	},
	
	setupThreeJS: function() {
				this.scene = new THREE.Scene();
				//this.scene.fog = new THREE.FogExp2(0x9db3b5, 0.002);

				this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
				this.camera.position.z = 400;
				this.camera.lookAt(new THREE.Vector3(0,0,0));
				//this.camera.rotation.y = -Math.PI;

				this.renderer = new THREE.WebGLRenderer({antialias: true});
				this.renderer.setSize( window.innerWidth, window.innerHeight );
				this.renderer.shadowMapEnabled = true;
				document.body.appendChild(this.renderer.domElement );

				this.controls = new THREE.FirstPersonControls(this.camera);
				this.controls.movementSpeed = 100;
				this.controls.lookSpeed = 0.1;
				this.controls.autoForward = false;
			},
			
	setupWorld: function() {
		var p_geo = new THREE.SphereGeometry(100, 32, 32);
		var p_mat = new THREE.MeshPhongMaterial({color:0xff0000});
		this.planet = new THREE.Mesh(p_geo, p_mat);
		this.planet.receiveShadow = true;
		this.planet.position.x = -100;
		this.planet.position.y = -50;
		this.planet.position.z = 300;
		this.scene.add(this.planet);
		
		var m_geo = new THREE.SphereGeometry(50, 32, 32);
		var m_mat = new THREE.MeshPhongMaterial({color:0x444444});
		var moon = new THREE.Mesh(m_geo, m_mat);
		moon.receiveShadow = true;
		moon.position.x = 200;
		moon.position.y = 0;
		moon.position.z = 100;
		this.scene.add(moon);
		
		var s_geo = new THREE.SphereGeometry(200, 32, 32);
		var s_mat = new THREE.MeshBasicMaterial({color:0xffff00});
		var sun = new THREE.Mesh(s_geo, s_mat);
		sun.position.x = -150;
		sun.position.y = 0;
		sun.position.z = -500;
		this.scene.add(sun);
		
		
		var comet1 = new app.Comet();
		comet1.setPosition(500, 0 ,0);
		comet1.addToScene(this.scene);
		this.comets.push(comet1);
		
		var comet2 = new app.Comet();
		comet2.setPosition(800, 200 ,0);
		comet2.addToScene(this.scene);
		this.comets.push(comet2);
				
		// the "sun"
		var light = new THREE.DirectionalLight(0xf9f1c2, 0.5);
		light.position.set(450, 100, 50);
		light.castShadow = true;
		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;
		var d = 1000;
		// "near" and "far" of shadows and camera
		light.shadowCameraLeft = d;
		light.shadowCameraRight = -d;
		light.shadowCameraTop = d;
		light.shadowCameraBottom = -d;
		light.shadowCameraFar = 2500;
		this.scene.add(light);
				
		// the "sun"
		var sunlight = new THREE.PointLight(0xffff00, 2);
		sunlight.position.set(-150, 0, -500);
		this.scene.add(sunlight);
	},
	
	spawnComet: function(){
		console.log("Comet Spawned");
		var comet = new app.Comet();
		comet.setPosition(600, 0, 0);
		comet.addToScene(this.scene);
		this.comets.push(comet);
	},
	
	drawPauseScreen: function(){
		// do something pause-like if you want
	}
	
	
};