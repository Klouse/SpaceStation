// comet.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.Comet = (function(){
	function Comet(){
		this.setUpMesh();
		this.setUpParticleSystem();
		this.xSpeed = Math.random() * 10 - 5;
		this.ySpeed = Math.random() * 10 - 5;
		this.dead = false;
	};
	
	var p = Comet.prototype;
	
	p.setUpMesh = function(){
		var geo = new THREE.SphereGeometry(5, 16, 16);
		var mat = new THREE.MeshBasicMaterial({color:0x0000ff});
		this.mesh = new THREE.Mesh(geo, mat);
		this.mesh.receiveShadow = true;
	};
	
	p.setUpParticleSystem = function(){
		//vertexTexture = THREE.ImageUtils.loadTexture('textures/gradient_comet_vertex.jpg');
		this.pSystem = new THREE.ParticleSystem(new THREE.SphereGeometry(15, 16, 16));
	}
	
	p.setPosition = function(x, y, z){
		this.mesh.position.x = x;
		this.mesh.position.y = y;
		this.mesh.position.z = z;
		
		this.pSystem.position.x = x;
		this.pSystem.position.y = y;
		this.pSystem.position.z = z;
		
	};
	
	p.setColor = function(r, g, b){
		var c = new THREE.Color(r, g, b);
		this.mesh.material.color = c;
	}
	
	p.getMesh = function(){
		return this.mesh;
	};
	
	p.getPosition = function(){
		return this.mesh.position;
	}
	
	p.addToScene = function(scene){
		scene.add(this.mesh);
		scene.add(this.pSystem);
	};
	
	p.removeFromScene = function(scene){
		scene.remove(this.mesh);
		scene.remove(this.pSystem);
		this.dead = true;
	}
	
	p.update = function(){
		this.mesh.position.x += this.xSpeed;
		this.pSystem.position.x += this.xSpeed;
		
		this.mesh.position.y += this.ySpeed;
		this.pSystem.position.y += this.ySpeed;
	};
	
	return Comet;
}());