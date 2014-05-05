// comet.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.Comet = (function(){
	function Comet(){
		this.setUpMesh();
		this.setUpParticleSystem();
	};
	
	var p = Comet.prototype;
	
	p.setUpMesh = function(){
		var geo = new THREE.SphereGeometry(20, 16, 16);
		var mat = new THREE.MeshPhongMaterial({color:0x0000ff});
		this.mesh = new THREE.Mesh(geo, mat);
		this.mesh.receiveShadow = true;
	};
	
	p.setUpParticleSystem = function(){
		this.pSystem = new THREE.ParticleSystem(new THREE.SphereGeometry(24, 16, 16));
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
	
	p.addToScene = function(scene){
		scene.add(this.mesh);
		scene.add(this.pSystem);
	}
	
	return Comet;
}())