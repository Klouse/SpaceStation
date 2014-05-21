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
		this.cameraPoint = new THREE.Vector3(this.getPosition().x, this.getPosition().y, this.getPosition().z + 50 * scaledDiam / 2);
	};
	
	var p = Planet.prototype;
	
	p.setUpMesh = function(){
		//Textures taken from:
		//Mercury: http://astrogeology.usgs.gov
		//Venus: http://astrogeology.usgs.gov
		//Earth: http://astrogeology.usgs.gov
		//Mars: http://astrogeology.usgs.gov
		//Jupiter: http://www.mapsharing.org/MS-maps/map-pages-planets-map/images-planets-map/8-planet-jupiter-map.jpg
		//Saturn: http://astrogeology.usgs.gov
		//Uranus: http://img-new.cgtrader.com/items/23540/large_uranus_3d_model_blend_e0c39188-f855-4dce-a82e-f4222623e483.jpg
		//Neptune: http://www.planetaryvisions.com/images_new/37.jpg
		//Pluto:
		var t_url = 'textures/' + this.info.name + '_uv.jpg'
		var texture = THREE.ImageUtils.loadTexture(t_url);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.anistropy = 16;
		var geo = new THREE.SphereGeometry(10, 16, 16);
		var mat = new THREE.MeshPhongMaterial({map: texture, color:0xffffff, shininess: 10});
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
		this.mesh.rotation.y += .005;
	};
	
	return Planet;
}());