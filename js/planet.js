// planet.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.Planet = (function(){
	function Planet(data){
		this.info = data;
		this.setUpMesh();
		var scaledDiam = data.diameterScale;
		this.setScale(scaledDiam);
		var scaledX = 400 * data.distance;
		this.setPosition(scaledX, 0, 0);
		this.cameraPoint = new THREE.Vector3(this.getPosition().x, this.getPosition().y, this.getPosition().z + 100 * scaledDiam / 2);
	};
	
	var p = Planet.prototype;
	
	p.setUpMesh = function(){
		var geo = new THREE.SphereGeometry(10, 16, 16);
		var mat = new THREE.MeshBasicMaterial({color:0x0000ff});
		this.mesh = new THREE.Mesh(geo, mat);
		this.mesh.receiveShadow = true;
	};
	
	p.setPosition = function(x, y, z){
		this.mesh.position.x = x;
		this.mesh.position.y = y;
		this.mesh.position.z = z;
	};
	
	p.setScale = function(s){
		this.mesh.scale.set(s, s, s);
	};
	
	p.getMesh = function(){
		return this.mesh;
	};
	
	p.getPosition = function(){
		return this.mesh.position;
	};
	
	p.getName = function(){
		return this.info.name;
	}
	
	p.addToScene = function(scene){
		scene.add(this.mesh);
		scene.add(this.pSystem);
	};
	
	p.removeFromScene = function(scene){
		scene.remove(this.mesh);
		scene.remove(this.pSystem);
	};
	
	p.update = function(){
	};
	
	return Planet;
}());