// main.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.main = {
    	// CONSTANT properties
		ViewMode: {
			FLY: 0,
			PLANET: 1,
			mode: 0
		},
		
		MIN_X: -100,
		MAX_X: 20000,
		MIN_Y: -500, 
		MAX_Y: 500,
		MIN_Z: -2000,
		MAX_Z: 2000,
    	
		// variable properties
		renderer: undefined,
		scene: undefined,
		camera: undefined,
		myobjects: [],
		paused: false,
		dt: 1/60,
		controls: undefined,
		
		startPosition:undefined,
		
		infoBox:undefined,
		instrBox:undefined,
		
		planet:undefined,
		planets: [],
		planetIndex: 0,
		comets: [],
		cometTimer: 0,
		nextComet: 100,
		
		textureFlare0:undefined,
		textureFlare2:undefined,
		textureFlare3:undefined,

		manager:undefined,
		objLoader:undefined,
		imgLoader:undefined,
		
		
		
    	init : function() {
			console.log('init called');
			this.loadData();
			this.setupThreeJS();
			this.infoBox = document.createElement('div');
			this.infoBox.className = 'infoBox';
			document.body.appendChild(this.infoBox);
			this.instrBox = document.createElement('div');
			this.instrBox.className = 'instrBox';
			document.body.appendChild(this.instrBox);
			this.changeInstructions();

			//OBJ manager and loader
			this.manager = new THREE.LoadingManager();
			this.manager.onProgress = function ( item, loaded, total ) {
				console.log( item, loaded, total );
			};
			this.imgLoader = new THREE.ImageLoader(this.manager);
			this.objLoader = new THREE.OBJLoader(this.manager);
			//createjs.Sound.addEventListener("loadComplete", playBackground);
			//createjs.Sound.registerManifest(this.manifest, this.audioPath);

			this.setupWorld();
			this.update();
			
			var self = this;
			
			//Raycast and see if it hits a planet
			$(document).mousedown(function(e){
				e.preventDefault();
			
				var projector = new THREE.Projector();
			
				var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
				
				projector.unprojectVector(vector, self.camera);
			
				var raycaster = new THREE.Raycaster(self.camera.position, vector.sub(self.camera.position).normalize());
				var meshes = [];
				for(var i = 0; i < self.planets.length; i++){
					meshes.push(self.planets[i].getMesh());
				}
				var intersects = raycaster.intersectObjects(meshes);
				//console.log(intersects);
				if(intersects.length > 0){
					for(var i = 0; i < self.planets.length; i++){
						var p = self.planets[i];
						var  p_mesh = p.getMesh();
						if(p_mesh.id == intersects[0].object.id){
							self.displayData(p);
							self.moveTo(p.cameraPoint);
							self.ViewMode.mode = self.ViewMode.PLANET;
							self.changeInstructions();
							self.planetIndex = i;
						}
					}
				}
			});
			
			/*
			window.addEventListener( 'resize', function(){
				self.camera.aspect = window.innerWidth / window.innerHeight;
				self.camera.updateProjectionMatrix();

				self.renderer.setSize( window.innerWidth, window.innerHeight );
			});
			*/
    	},
    	
    	
    update: function(){
    	// schedule next animation frame
    	app.animationID = requestAnimationFrame(this.update.bind(this));
		
		//Update any tweens currently happening
		TWEEN.update();
    	
		// PAUSED?
		if (app.paused){
			this.drawPauseScreen();
			return;
		 }
		
		//Reset camera position
		if(app.keydown[app.KEYBOARD.KEY_SPACE]){
			$('.infoBox').empty();
			this.moveTo(this.startPosition);
			this.ViewMode.mode = this.ViewMode.FLY;
			this.changeInstructions();
		}
		
		//Cycle between planets when in planet viewing mode
		if(app.keydown[app.KEYBOARD.KEY_LEFT] && this.ViewMode.mode == this.ViewMode.PLANET){
			if(!app.pkeydown[app.KEYBOARD.KEY_LEFT]){
				if(this.planetIndex > 0){
					this.planetIndex--;
					this.moveTo(this.planets[this.planetIndex].cameraPoint);
					this.displayData(this.planets[this.planetIndex]);
				}
			}
		}
		if(app.keydown[app.KEYBOARD.KEY_RIGHT] && this.ViewMode.mode == this.ViewMode.PLANET){
			if(!app.pkeydown[app.KEYBOARD.KEY_RIGHT]){
				if(this.planetIndex < this.planets.length - 1){
					this.planetIndex++;
					this.moveTo(this.planets[this.planetIndex].cameraPoint);
					this.displayData(this.planets[this.planetIndex]);
				}
			}
		}
		
		//Keep the camera from going too far
		this.constrainCamera(this.MIN_X, this.MAX_X, this.MIN_Y, this.MAX_Y, this.MIN_Z, this.MAX_Z);
		
		//Spawn comets
		this.cometTimer++;
		if(this.cometTimer >= this.nextComet){
			this.spawnComet();
			this.cometTimer = 0;
			this.nextComet = Math.random() * 100 + 100;
		}
	
		//Update controls
		if(this.ViewMode.mode == this.ViewMode.FLY)
			this.controls.update(this.dt);
		
		//Update and clean comets array
		for(var i = 0; i < this.comets.length; i++){
			var comet = this.comets[i];
			comet.update();
			if(comet.getPosition().x < this.MIN_X || comet.getPosition().x > this.MAX_X){
				comet.removeFromScene(this.scene);
			}
			if(comet.getPosition().y < this.MIN_Y || comet.getPosition().y > this.MAX_Y){
				comet.removeFromScene(this.scene);
			}
			if(comet.getPosition().z < this.MIN_Z || comet.getPosition().z > this.MAX_Z){
				comet.removeFromScene(this.scene);
			}
		}
		
		for(var i = 0; i < this.planets.length; i++){
			var planet = this.planets[i];
			planet.update();
		}
		
		this.comets = this.comets.filter(function(o){
				if(!o.dead) return o;
		});
		
		// Render
		this.renderer.render(this.scene, this.camera);
		
		app.pkeydown = app.keydown.slice(0);
	},
	
	//Load the json with the planet data and create the planets
	loadData: function(){
		var self = this;
		var data = $.getJSON("data/planets.json", function(json){
			self.setUpPlanets(json);
		});
		//console.log(data);
	},
	
	//Set up the Scene, Camera, Controls, and Renderer
	setupThreeJS: function() {
		this.scene = new THREE.Scene();
		//this.scene.fog = new THREE.FogExp2(0x9db3b5, 0.002);
		
		this.startPosition = new THREE.Vector3(200, 0, 1000);

		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 55000 );
		this.camera.position.x = this.startPosition.x;
		this.camera.position.z = this.startPosition.z;
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		//this.camera.rotation.y = -Math.PI;

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.shadowMapEnabled = true;
		document.body.appendChild(this.renderer.domElement );

		this.controls = new THREE.FirstPersonControls(this.camera);
		this.controls.movementSpeed = 500;
		this.controls.lookSpeed = 0.1;
		this.controls.autoForward = false;
	},
	
	//Create the planets based on json data
	setUpPlanets: function(data){
		var planetData = data.planets;
		for(var i = 0; i < planetData.length; i++){
			var p = new app.Planet(planetData[i]);
			p.addToScene(this.scene);
			this.planets.push(p);
		}
	},
	
	//Create everything in the solar system	
	setupWorld: function() {
		/*
		var p_geo = new THREE.SphereGeometry(100, 32, 32);
		var p_mat = new THREE.MeshPhongMaterial({color:0xff0000});
		this.planet = new THREE.Mesh(p_geo, p_mat);
		this.planet.receiveShadow = true;
		this.planet.position.x = -100;
		this.planet.position.y = -50;
		this.planet.position.z = 300;
		this.scene.add(this.planet);
		*/
		/*
		var self = this;
		loader.load('Models/planet.obj', function(object){
			object.traverse(function(child){
				if(child instanceof THREE.Mesh){
					child.material.map = planet_t;
				}
			});
			
			object.position.y = -80;
			self.scene.add(object);
		});
		
		var m_geo = new THREE.SphereGeometry(50, 32, 32);
		var m_mat = new THREE.MeshPhongMaterial({color:0x444444});
		var moon = new THREE.Mesh(m_geo, m_mat);
		moon.receiveShadow = true;
		moon.position.x = 200;
		moon.position.y = 0;
		moon.position.z = 100;
		this.scene.add(moon);
		*/
		
		//Create the sun
		var s_geo = new THREE.SphereGeometry(100, 32, 32);
		var s_mat = new THREE.MeshBasicMaterial({color:0xffff00});
		var sun = new THREE.Mesh(s_geo, s_mat);
		sun.position.x = 0;
		sun.position.y = 0;
		sun.position.z = 0;
		this.scene.add(sun);
				
		//Add a directional light so not too dark
		var light = new THREE.DirectionalLight(0x333377, 1.0);
		light.position.set(450, 100, 50);
		light.castShadow = true;
		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;
		var d = 1000;
		//"near" and "far" of shadows and camera
		light.shadowCameraLeft = d;
		light.shadowCameraRight = -d;
		light.shadowCameraTop = d;
		light.shadowCameraBottom = -d;
		light.shadowCameraFar = 2500;
		this.scene.add(light);
				
		//The light coming from the sun
		var sunlight = new THREE.PointLight(0xffcc66, 1.0);
		sunlight.position.set(0, 0, 0);
		this.scene.add(sunlight);

		//skybox function call
		//creates skybox within function
		this.skyBox();

		//create space station
		this.spaceStation();
		
		//lens flare
		//this.textureFlare0 = THREE.ImageUtils.loadTexture("textures/lensflare0.png");
		//this.textureFlare2 = THREE.ImageUtils.loadTexture("textures/lensflare2.png");
		//this.textureFlare3 = THREE.ImageUtils.loadTexture("textures/lensflare3.png");
		
		//this.addLight(0.55, 0.9, 0.5, -150, 0, -500);
		
		
	},

	playBackground: function(){
		//play background music
		createjs.Sound.play(event.src);
	},
	
	/*
	addLight: function(h, s, l, x, y, z){
		var light = new THREE.PointLight(0xffffff, 1.5, 4500);
		light.color.setHSL(h, s, l);
		light.position.set(x, y, z);
		this.scene.add(light);
		
		var flareColor = new THREE.Color(0xffffff);
		flareColor.setHSL(h, s, l + 0.5);
		
		var lensFlare = new THREE.LensFlare(this.textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);
		
		lensFlare.add(this.textureFlare2, 512, 0.0, THREE.AdditiveBlending);
		lensFlare.add(this.textureFlare2, 512, 0.0, THREE.AdditiveBlending);
		lensFlare.add(this.textureFlare2, 512, 0.0, THREE.AdditiveBlending);
		lensFlare.add(this.textureFlare3, 60, 0.6, THREE.AdditiveBlending);
		lensFlare.add(this.textureFlare3, 70, 0.7, THREE.AdditiveBlending);
		lensFlare.add(this.textureFlare3, 120, 0.9, THREE.AdditiveBlending);
		lensFlare.add(this.textureFlare3, 70, 1.0, THREE.AdditiveBlending);
		
		lensFlare.customUpdateCallback = this.lensFlareUpdateCallback;
		lensFlare.position = light.position;
		this.scene.add(lensFlare);
		
	},
	*/
	skyBox: function(){
		//load the six different side of the box
		var urls = [
		'textures/SkyBox/pos-x.png',
		'textures/SkyBox/neg-x.png',
		'textures/SkyBox/pos-y.png',
		'textures/SkyBox/neg-y.png',
		'textures/SkyBox/pos-z.png',
		'textures/SkyBox/neg-z.png'
		];

		//wrap the cube texture
		var cubemap = THREE.ImageUtils.loadTextureCube(urls); // load textures
		cubemap.format = THREE.RGBFormat;

		var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
		shader.uniforms['tCube'].value = cubemap; // apply textures to shader

		// create shader material for box
		var skyBoxMaterial = new THREE.ShaderMaterial( {
		  fragmentShader: shader.fragmentShader,
		  vertexShader: shader.vertexShader,
		  uniforms: shader.uniforms,
		  depthWrite: false,
		  side: THREE.BackSide
		});
		//create skybox and add to scene
		var skyBox = new THREE.Mesh( new THREE.CubeGeometry(50000, 50000, 50000), skyBoxMaterial);
		this.scene.add(skyBox);
	},

	spaceStation: function(){
		//texture load
		var stationTexture = new THREE.Texture();
		this.imgLoader.load( 'textures/station_UV.jpg', function(image){
			stationTexture.image = image;
			stationTexture.needsUpdate = true;

		});
		var self = this;

		//model load
		this.objLoader.load('models/station.obj', function(object){
			object.traverse(function(child){
				if (child instanceof THREE.Mesh){
					child.material.map = stationTexture;
				}
			});
			self.scene.add(object);
		})


	},

	lensFlareUpdateCallback: function(object){
		var f, fl = object.lensFlares.length;
		var flare;
		var vecX = -object.positionScreen.x * 2;
		var vecY = -object.positionScreen.y * 2;
		
		for(f = 0; f < fl; f++){
			flare = object.lensFlares[f];
			flare.x = object.positionScreen.x + vecX * flare.distance;
			flare.y = object.positionScreen.y * vecY * flare.distance;
			flare.rotation = 0;
		}
		
		object.lensFlares[2].y += 0.025;
		object.lensFlares[3].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
	},
	
	//Create a new comet at a random position in the scene
	spawnComet: function(){
		var comet = new app.Comet(this.imgLoader, this.objLoader);
		var c_x = (Math.random() * (this.MAX_X - this.MIN_X)) + this.MIN_X;
		var c_y = (Math.random() * (this.MAX_Y - this.MIN_Y)) + this.MIN_Y;
		var c_z = (Math.random() * (this.MAX_Z - this.MIN_Z)) + this.MIN_Z;
		comet.setPosition(c_x, c_y, c_z);
		comet.addToScene(this.scene);
		this.comets.push(comet);
	},
	
	//Tweens the camera to a specified position
	moveTo: function(point){
		new TWEEN.Tween(this.camera.position)
			.to({x:point.x, y:point.y, z:point.z}, 2000)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();
		new TWEEN.Tween(this.camera.rotation)
			.to({x:0, y:0, z:0}, 2000)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();
	},
	
	//Keeps the camera from travelling too far in the scene
	constrainCamera: function(minX, maxX, minY, maxY, minZ, maxZ){
		if(this.camera.position.x < minX) this.camera.position.x = minX;
		if(this.camera.position.x > maxX) this.camera.position.x = maxX;
		if(this.camera.position.y < minY) this.camera.position.y = minY;
		if(this.camera.position.y > maxY) this.camera.position.y = maxY;
		if(this.camera.position.z < minZ) this.camera.position.z = minZ;
		if(this.camera.position.z > maxZ) this.camera.position.z = maxZ;
	},
	
	//Displays a div with all the planet data
	displayData: function(p){
		$('.infoBox').empty();
		var info = p.info;
		for(var i = 0; i < 11; i++){
			var text = document.createElement('div');
			text.style.position = 'absolute';
			text.style.width = 300;
			text.style.height = 100;
			text.style.color = 'white';
			text.style.fontFamily = 'Verdana';
			switch(i){
				case 0:
					text.innerHTML = 'Name --- ' + info.name;
					break;
				case 1:
					text.innerHTML = 'Diameter --- ' + info.diameter + 'km';
					break;
				case 2:
					text.innerHTML = 'Distance From Sun --- ' + info.distance + 'AU';
					break;
				case 3:
					text.innerHTML = 'Orbital Eccentricity --- ' + info.eccentricity;
					break;
				case 4:
					text.innerHTML = 'Number of Moons --- ' + info.numMoons;
					break;
				case 5:
					text.innerHTML = 'Orbital Period --- ' + info.orbPeriod + ' years';
					break;
				case 6:
					text.innerHTML = 'Rotational Period --- ' + info.rotPeriod + ' days';
					break;
				case 7:
					text.innerHTML = 'Max Temperature --- ' + info.tempMax + 'C';
					break;
				case 8:
					text.innerHTML = 'Min Temperature --- ' + info.tempMin + 'C';
					break;
			}
			text.style.top = ((24 * i) + 100) + 'px';
			text.style.right = 100 + 'px';
			this.infoBox.appendChild(text);
		}
	},
	
	changeInstructions: function(){
		$('.instrBox').empty();
		if(this.ViewMode.mode == this.ViewMode.FLY){
			var text = document.createElement('div');
			text.style.position = 'absolute';
			text.style.width = 500;
			text.style.height = 100;
			text.style.color = 'white';
			text.style.fontFamily = 'Verdana';
			text.innerHTML = 'Click on a planet to show info.  Space to reset camera';
			text.style.top = (window.innerHeight - 50) + 'px';
			text.style.right = (window.innerWidth / 2 - 250) + 'px';
			this.instrBox.appendChild(text);
		}
		if(this.ViewMode.mode == this.ViewMode.PLANET){
			var text = document.createElement('div');
			text.style.position = 'absolute';
			text.style.width = 500;
			text.style.height = 100;
			text.style.color = 'white';
			text.style.fontFamily = 'Verdana';
			text.innerHTML = 'Arrow keys to switch planets.  Space to reset camera';
			text.style.top = (window.innerHeight - 50) + 'px';
			text.style.right = (window.innerWidth / 2 - 250) + 'px';
			this.instrBox.appendChild(text);
		}
	},
	
	drawPauseScreen: function(){
		// do something pause-like if you want
	}
	
	
};