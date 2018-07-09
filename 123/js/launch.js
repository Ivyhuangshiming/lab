var launchObj = function (){
	this.x = [];
}

launchObj.prototype.num = 5;

launchObj.prototype.init = function(){
	this.x = [60,204,348,492,634];

	console.log("a");
}

launchObj.prototype.draw = function(){
	for(var i =0; i<this.num;i++){
		//beginPath, moveTo, lineTo, strokeStyle, lineWidth, lineCap, global
		ctx2.beginPath();
		ctx2.moveTo(this.x[i], 0);
		ctx2.lineTo(this.x[i], 10);
		ctx2.lineWidth=80;
		ctx2.lineCap="round";
		ctx2.strokeStyle="Transparent";
		ctx2.stroke();
	}
}
