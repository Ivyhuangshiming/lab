'use strict'
var can1, can2;
var ctx1, ctx2;

var lastTime;
var deltaTime;

var launchs;
var balls;
var box;
var score;

var begintime;

var mx;

var canvasWidth, canvasHeight;

var bgPic = new Image();
var welcomePic = new Image();

var bestRecord=0;



document.body.onload = game;

function game(){
	init();
	lastTime = Date.now();
	deltaTime =0;

	welcomePic.src = "./src/welcome.png";
	gameloop();

	

}

function init(){
	//获取画布canvas,contex
	can1 = document.getElementById("canvas1"); //cat,score,life
	ctx1 = can1.getContext('2d');

	can2 = document.getElementById("canvas2"); //bg,ball
	ctx2 = can2.getContext('2d');

	can1.onmousemove= getMousePos;

	can1.addEventListener('click',function(){
		console.log("retry");
		score.ballNum =0;
		score.life = 3;
		score.gameOver = false;
	}, false);


	bgPic.src = "./src/b1.jpg";

	canvasWidth =can1.width;
	canvasHeight = can1.height;


	launchs = new launchObj();
	launchs.init();

	balls = new ballObj();
	balls.init();

	box = new boxObj ();
	box.init();

	score = new dataObj();
	score.init();

	mx = canvasWidth*0.5;
	begintime =Date.now();

}

function gameloop(){
	requestAnimFrame(gameloop); //setInterval, setTimeout, frame per second;

	var now = Date.now();
		deltaTime = now - lastTime;
		lastTime = now;

	if(now-begintime<4000){
		ctx2.drawImage(welcomePic, 0, 0, canvasWidth, canvasHeight);
		console.log(333);

	}else{
		
		drawBackground();

		launchs.draw();

		ctx1.clearRect(0,0,canvasWidth,canvasHeight);
		box.draw();

		ballMonitor();
		balls.draw();

		ballBoxCollision();

		score.draw();
	}

	
}

function getMousePos(e){
    //if (data.gameOver) return;
    
    if(e.offsetX || e.layerX){
        mx = e.offsetX || e.layerX;
        //my = e.offsetY || e.layerY;
     
    }
}