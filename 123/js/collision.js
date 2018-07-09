//判断距离
function ballBoxCollision(){
	if(score.gameOver == false)	{
		for(var i = 0; i<balls.num;i++){
			if(balls.alive[i]){
				
				var l =calLength2(balls.x[i],balls.y[i],box.x+110,box.y+100);				

				if(l<1200){	
						//获取球的颜色
						var ballColor = balls.ballType[i] 
						//获取小猫的数字
						//var num = parseInt(box.changePool[box.curBox].src.replace(/[^0-9]+/g, ''));
						var num = parseInt(box.changePool[box.curBox].src.split("/")[7].split("_")[0]);

						//判断是否匹配
						if((ballColor =="blue"&&num==1)||(ballColor =="red"&&num==2)||(ballColor =="yellow"&&num==3)){
							score.ballNum+=1;
						}else{
							score.life-=1;
						}			
						
			
						balls.dead(i);
					
				}
			}
		}
	}
}