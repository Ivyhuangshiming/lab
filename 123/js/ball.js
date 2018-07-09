var ballObj = function(){
	this.alive = []; //bool
	this.x =[];
	this.y =[];
	this.l =[];
	this.spd =[];
	this.ballType = [];
	this.blue = new Image();
	this.red = new Image();
	this.yellow = new Image();
}

ballObj.prototype.num =30;

ballObj.prototype.init = function (){

	for (var i =0; i< this.num; i++){
		this.alive[i] =false;
		this.x[i] =0;
		this.y[i] =30;
		this.l[i]=0;
		this.spd[i] = Math.random() * 0.05 +0.008 ; (0.008,0.58);
		this.ballType[i] = "";
	}

		this.blue.src = './src/1_ball.png';
		this.red.src = './src/2_ball.png';
		this.yellow.src = './src/3_ball.png';

}

ballObj.prototype.draw = function(){
	for(var i=0; i<this.num; i++){
		//draw
		//find, fly up
		if(this.alive[i]){
			var pic;
			if(this.ballType[i] =="blue"){
				pic = this.blue;
			}else if(this.ballType[i] == "red"){
				pic = this.red;
			}else{
				pic = this.yellow;
			}

			if(this.l[i] <= 100){
				this.l[i] += this.spd[i] * deltaTime;
			}else{
				this.y[i] += this.spd[i]*8*deltaTime;
			}

			ctx2.drawImage(pic,this.x[i]-this.l[i]*0.5,this.y[i]-this.l[i]*0.5,this.l[i],this.l[i]);

			if(this.y[i] > 1300){
				this.alive[i] = false;
			}
		}		
			
	}
}

ballObj.prototype.born = function(i){
	var launchID = parseInt(5*Math.random());
	this.x[i] = launchs.x[launchID];
	this.y[i] =30;
	this.l[i]=0;
	this.alive[i] =true;
	var ran = Math.random();
	if(ran<0.3){
		this.ballType[i] = 'blue';
	}else if(ran>=0.3 && ran <0.6){
		this.ballType[i] = 'red';
	}else{
		this.ballType [i]= 'yellow';
	}
	
}

ballObj.prototype.dead = function(i){
	this.alive[i] =false;
}

function ballMonitor(){
	var num =0;
	for(var i=0 ; i< balls.num; i++){
		if(balls.alive[i]) num++;
	}

	if(num < 14){
		sendBall();
		return;
	}
}

function sendBall(){

	for(var i=0; i < balls.num; i++){
		if(!balls.alive[i] && score.gameOver == false){
			balls.born(i);
			return;
		}
	}
}