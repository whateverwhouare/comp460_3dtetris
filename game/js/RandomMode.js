
function RandomMode() {
	Game.call( this );

	this.nextBlockName = getRandomMember(BlockGenerator.allShapes);
	nextPiece_doc.innerHTML = this.nextBlockName;
	this.currentBlock = BlockGenerator.getRandomBlock();
}

RandomMode.prototype = Object.create(Game.prototype);

RandomMode.prototype.getNextBlock = function() {
	var toReturn = BlockGenerator.generate(this.nextBlockName);
	this.currentBlock = toReturn;
	this.nextBlockName = getRandomMember(BlockGenerator.allShapes);
	nextPiece_doc.innerHTML = this.nextBlockName;
	return toReturn;
};

