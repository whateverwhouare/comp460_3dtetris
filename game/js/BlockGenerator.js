
// this part borrowed heavily from https://github.com/fridek/Threejs-Tetris
var BlockGenerator = {};

BlockGenerator.shapes = {
	/* "2D" shapes (involving only 2 axes) */
	"two_blocks": [{x: 1, y: 0, z: 0}],
	"L":
	[
        {x: 1, y: 0, z: 0},
        {x: 1, y: 1, z: 0},
        {x: 1, y: 2, z: 0}
    ],
    "straight3": // one straight line consisting of 3 blocks
    [
        {x: 0, y: 1, z: 0},
        {x: 0, y: 2, z: 0},
    ],
    "square_flat":
    [
        {x: 0, y: 1, z: 0},
        {x: 1, y: 0, z: 0},
        {x: 1, y: 1, z: 0}
    ],
    "short_T": // typical tetris short t 
    [
        {x: 0, y: 1, z: 0},
        {x: 0, y: 2, z: 0},
        {x: 1, y: 1, z: 0}
    ],
    "lightning": // typical tetris lighting-looking z
    [
        {x: 0, y: 1, z: 0},
        {x: 1, y: 1, z: 0},
        {x: 1, y: 2, z: 0}
    ],
    "cross_block":
    [
    	{x: -1, y: 0, z: 0},
    	{x: 1, y: 0, z: 0},
    	{x: 0, y: 0, z: 1},
    	{x: 0, y: 0, z: -1}
    ]
};

BlockGenerator.colors = {
	"yellow": 0xffff00, 
	"blue": 0x0000ff, 
	"orange": 0xff9900, 
	"green": 0x006600,
	"purple": 0x660099,
	"brown": 0x70543b
};

// names of all the blocks in an array
BlockGenerator.allShapes = (function() {
	return Object.getOwnPropertyNames(BlockGenerator.shapes);
})();

BlockGenerator.allColors = (function() {
	return Object.getOwnPropertyNames(BlockGenerator.colors);
})();

BlockGenerator.currentColor = {};
BlockGenerator.generatedTime = 0;	// time at which the last block was generated

BlockGenerator.getRandomBlock = function() {
	return this.generate(getRandomMember(this.allShapes), getRandomMember(this.allColors));
}


BlockGenerator.getCube = function() {
	return new THREE.CubeGeometry(STEP_SIZE, STEP_SIZE, STEP_SIZE);
}


BlockGenerator.generate = function(shapeName, colorName) {
	var i, j;
	var geometry, tmpGeometry, i;
	var shape, block, material;
	var normal, intersects;
	var blockRaycaster = new THREE.Raycaster();
	var toDelete = [];
	
	// copy the shape corresponding to shapeName from internal map into a new shape
	
	var shape = this.cloneVectors(this.shapes[shapeName]);
	var block;
	
	// merge the different cube geometries together
	geometry = this.getCube();
	for (i = 0; i < shape.length; i++) {
		tmpGeometry =  new THREE.Mesh(this.getCube());
		tmpGeometry.position.x = STEP_SIZE * shape[i].x;
		tmpGeometry.position.y = STEP_SIZE * shape[i].y;
		tmpGeometry.position.z = STEP_SIZE * shape[i].z;
		THREE.GeometryUtils.merge(geometry, tmpGeometry);
	}

	// merge them
	geometry.mergeVertices();
	geometry.verticesNeedUpdate = true;

	// material = new THREE.MeshPhongMaterial({ color: 0x0000ff, ambient: 0x050505, opacity: 0.5, transparent: true });
	material = new THREE.MeshLambertMaterial({ color: this.colors[colorName], opacity: 0.5, transparent: true });
	currentColor = material.color;
	block = new THREE.Mesh(geometry, material);

	// raycast itself from the center of each face (negated normal), and whichever face gets intersected
	// is an inner face
	for (i = 0; i < geometry.faces.length; i++) {
		face = geometry.faces[i];
		if (face) {
			normal = face.normal.clone();
			normal.negate();
			blockRaycaster.set(face.centroid, normal);
			intersects = blockRaycaster.intersectObject(block);
			for (j = 0; j < intersects.length; j++) {
				toDelete.push(intersects[j].faceIndex);
			}
		}
	}

	// actually delete them
	for (i = 0; i < toDelete.length; i++) {
		delete geometry.faces[toDelete[i]];
	}
	geometry.faces = geometry.faces.filter( function(v) { return v; });
	geometry.elementsNeedUpdate = true;	// update faces

	/**
	block = THREE.SceneUtils.createMultiMaterialObject(geometry, [
        new THREE.MeshBasicMaterial({color:0x000000, shading:THREE.FlatShading, wireframe:true, transparent:true}),
        new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true })
    ]);
    block.overdraw = true;
	*/

	this.generatedTime = Date.now();

    return block;
}

BlockGenerator.cloneVectors = function (vectors) {
	var i;
	var newVectors = [];
	for (i = 0; i < vectors.length; i++) {
		newVectors[i] = this.cloneVector(vectors[i]);
	}
	return newVectors;
}

BlockGenerator.cloneVector = function (v) {
  return {x: v.x, y: v.y, z: v.z};
};
