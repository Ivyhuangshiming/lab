var dataObj = function (){
	this.ballNum =0;
	this.life = 3;
	this.gameOver = false;

	this.zero = new Image ();
	this.one= new Image();
	this.two = new Image();
	this.three = new Image();
	this.four = new Image();
	this.five = new Image();
	this.six = new Image();
	this.seven = new Image();
	this.eight = new Image();
	this.night = new Image();

	this.alive = new Image();
	this.dead = new Image();

	this.gameOverImg = new Image();
	this.congratuationImg = new Image();
	this.retryImg = new Image();
	this.bestRecord;

	this.nums;

}

dataObj.prototype.init = function(){
	this.zero.src = './src/n0.png';
	this.one.src= './src/n1.png';
	this.two.src = './src/n2.png';
	this.three.src = './src/n3.png';
	this.four.src = './src/n4.png';
	this.five.src = './src/n5.png';
	this.six.src = './src/n6.png';
	this.seven.src = './src/n7.png';
	this.eight.src = './src/n8.png';
	this.night.src = './src/n9.png';

	this.alive.src = './src/1_l.png';
	this.dead.src = './src/2_l.png';
	this.gameOverImg.src = './src/gameOver.png';
	this.congratuationImg.src = './src/congratuation.png';
	this.retryImg.src = './src/retry-01.png';
	this.bestRecord =0;

	this.nums = [this.zero,this.one,this.two,this.three,this.four,this.five,this.six,this.seven,this.eight,this.night];
}

dataObj.prototype.reset = function(){
	this.ballNum = 0;
}

dataObj.prototype.draw = function(){
	var a =this.ballNum - parseInt(this.ballNum/10)*10;
	var b = (this.ballNum-a)/10-parseInt(this.ballNum/100)*10;
	var c = parseInt((this.ballNum-a-b*10)/100);

	ctx1.drawImage(this.nums[c],0,0,60,60);
	ctx1.drawImage(this.nums[b],40,0,60,60);
	ctx1.drawImage(this.nums[a],80,0,60,60);

	if(this.life==3){	
		ctx1.drawImage(this.alive,canvasWidth-80,0,60,60);
		ctx1.drawImage(this.alive,canvasWidth-130,0,60,60);
		ctx1.drawImage(this.alive,canvasWidth-180,0,60,60);
	}else if(this.life==2){	
		ctx1.drawImage(this.alive,canvasWidth-80,0,60,60);
		ctx1.drawImage(this.alive,canvasWidth-130,0,60,60);
		ctx1.drawImage(this.dead,canvasWidth-180,0,60,60);
	}else if(this.life==1){	
		ctx1.drawImage(this.alive,canvasWidth-80,0,60,60);
		ctx1.drawImage(this.dead,canvasWidth-130,0,60,60);
		ctx1.drawImage(this.dead,canvasWidth-180,0,60,60);
	}else{	
		ctx1.drawImage(this.dead,canvasWidth-80,0,60,60);
		ctx1.drawImage(this.dead,canvasWidth-130,0,60,60);
		ctx1.drawImage(this.dead,canvasWidth-180,0,60,60);

		//游戏结束
		this.gameOver = true;
	}

	if(this.gameOver == true){

			if(this.ballNum > bestRecord){
				bestRecord = this.ballNum; 
				ctx1.drawImage(this.congratuationImg,canvasWidth*0.3,canvasHeight*0.5,300,200);
			}else{
				ctx1.drawImage(this.gameOverImg,canvasWidth*0.3,canvasHeight*0.5,300,200);
			}

			ctx1.save();//保存画布的当前状态
		    ctx1.shadowColor='#FFF';
		    ctx1.shadowBlur=10;
		    ctx1.font='36px Verdana';
		    ctx1.textAlign='center';
		    ctx1.fillStyle='#FFF';
		    ctx1.textBaseline='bottom';//设置文字的对齐方式
		    ctx1.fillText(this.ballNum,canvasWidth*0.3+140,canvasHeight*0.5+110);//在canvas上写字
		    ctx1.fillText(bestRecord,canvasWidth*0.3+140,canvasHeight*0.5+160);//在canvas上写字
		    ctx1.restore();//恢复画布的状态到最近一次save()的状态

			

			//重新开始键
			ctx1.drawImage(this.retryImg,canvasWidth*0.3+120,canvasHeight*0.5+180,60,60);
		}
	
} 
