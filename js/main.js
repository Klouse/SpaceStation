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
	
		// UPDATE
		//this.controls.update(this.dt);
		this.planet.rotation.y += 0.002;
		for(var i = 0; i < this.comets.length; i++){
			this.comets[i].update();
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

				//this.controls = new THREE.FirstPersonControls(this.camera);
				//this.controls.movementSpeed = 100;
				//this.controls.lookSpeed = 0.1;
				//this.controls.autoForward = false;
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
		
		/*
				var geo = new THREE.PlaneGeometry(2000, 2000, 40, 40);
				var mat = new THREE.MeshPhongMaterial({color: 0x9db3b5, overdraw: true});
				var floor = new THREE.Mesh(geo, mat);
				floor.rotation.x = -0.5 * Math.PI;
				floor.receiveShadow = true;
				this.scene.add(floor);
			
				// make a base cube geometry for all of the buildings
				var geometry = new THREE.CubeGeometry( 1, 1, 1 );
				// move pivot point to bottom of cube instead of center
				geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
			

				
				var cityGeometry = new THREE.Geometry();
				for (var i = 0; i < 300; i++) {
					var building = new THREE.Mesh(geometry.clone());
					building.position.x = Math.floor( Math.random() * 200 - 100 ) * 4;
					building.position.z = Math.floor( Math.random() * 200 - 100 ) * 4;
					building.scale.x  = Math.pow(Math.random(), 2) * 50 + 10;
					building.scale.y  = Math.pow(Math.random(), 3) * building.scale.x * 8 + 8;
					building.scale.z  = building.scale.x;
					// merge!
					// we have a single geometry, so it renders faster
					THREE.GeometryUtils.merge(cityGeometry, building);
				}
				
				
				var material = new THREE.MeshPhongMaterial({color: 0xffcccc});
				// uncomment these for a transparent city
				//material.transparent = true;
                //material.opacity = 0.8;
                
				var city = new THREE.Mesh(cityGeometry, material);
				city.castShadow = true;
				city.receiveShadow = true;
				this.scene.add(city);
				*/
				
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
	
	drawPauseScreen: function(){
		// do something pause-like if you want
	}
	
	
};