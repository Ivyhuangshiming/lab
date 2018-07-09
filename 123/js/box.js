var boxObj = function(){
	this.x=0;
	this.y=0;
	this.red_1_bad = new Image();
	this.red_1_good = new Image();
	this.yellow_1_bad = new Image();
	this.yellow_1_good = new Image();

	this.blue_2_bad = new Image();
	this.blue_2_good = new Image();
	this.yellow_2_bad = new Image();
	this.yellow_2_good = new Image();

	this.blue_3_bad = new Image();
	this.blue_3_good = new Image();
	this.red_3_bad = new Image();
	this.red_3_good = new Image();

	this.curBox =0;
	this.changePool =[];
	this.wrongPool =[];

	this.l;
}

boxObj.prototype.init = function(){
	this.x =canvasWidth * 0.5;
	this.y =canvasHeight -195;

	this.l = 0;

	this.red_1_bad.src = './src/1_red_bad.png';
	this.red_1_good.src = './src/1_red_good.png';
	this.yellow_1_bad.src = './src/1_yellow_bad.png';
	this.yellow_1_good.src = './src/1_yellow_good.png';

	this.blue_2_bad.src = './src/2_blue_bad.png';
	this.blue_2_good.src = './src/2_blue_good.png';
	this.yellow_2_bad.src = './src/2_yellow_bad.png';
	this.yellow_2_good.src = './src/2_yellow_good.png';

	this.blue_3_bad.src = './src/3_blue_bad.png';
	this.blue_3_good.src = './src/3_blue_good.png';
	this.red_3_bad.src = './src/3_red_bad.png';
	this.red_3_good.src = './src/3_red_good.png';

	this.changePool = [this.red_1_good,this.yellow_1_good,this.blue_2_good,this.yellow_2_good,this.blue_3_good,this.red_3_good];
	this.wrongPool = [this.red_1_bad,this.yellow_1_bad,this.blue_2_bad,this.yellow_2_bad,this.blue_3_bad,this.red_3_bad];
	
}

boxObj.prototype.draw = function(){

	if(score.gameOver == false){
		if(this.l<5000){
			this.l+= deltaTime;
		}else{
			this.l=0;
			this.curBox = parseInt(6*Math.random());
		}
		}

		this.x = lerpDistance(mx, this.x-110, 0.4);
		ctx1.save();
		ctx1.drawImage(this.changePool[this.curBox],this.x, this.y,220,180);
		ctx1.restore();

}