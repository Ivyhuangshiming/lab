
$(function () {
    var gender = null;
    var age = 0;
    var errorCount = 0;
    var ground =0;
    var celing = 0;
    var interalCtrl;

    video = document.getElementById('video'),
            canvas = document.getElementById('canvas'),
            snap = document.getElementById('tack'),
            img = document.getElementById('testImg'),
            vendorUrl = window.URL || window.webkitURL;

    //选择性别和年龄
   $(".gender img").click(function(){
        $(".gender").children("img"). css({"opacity":"0.5","filter":"alpha(opacity=50)","-ms-filter": "alpha( opacity=50 )","-moz-opacity":"0.5"});
        $(this).css({"opacity":"1","filter":"alpha(opacity=100)","-ms-filter": "alpha( opacity=100 )","-moz-opacity":"1"});
        gender = $(this).attr("class");
        
    });


   //进入准备页面并打开摄像机
   $("button[name = 'PerComBtn']").click(function(){
      if(gender!=null && $("input[name = 'month']").val().trim()!="" && $("input[name = 'years']").val().trim()!=""){
         age =parseInt( $("input[name = 'years']").val()*12)+parseInt($("input[name = 'month']").val());
         console.log("age:"+age+","+"gender:"+gender);
         ground = age;
         if(age>=50){
            alert("The test does ot fit for you baby age!");
            $("input").val("");
            location.reload();
         }else{
            //显示准备页
            $(".wapper").css("display","none");
            $(".wapper:eq(1)").css("display","block");

            //打开摄像头
            //媒体对象
            navigator.getMedia = navigator.getUserMedia ||
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia ||
                                 navigator.msGetUserMedia;
            navigator.getMedia({
                video: true, //使用摄像头对象
                audio: false  //不适用音频
            }, function(strem){
                console.log(strem);
                video.src = vendorUrl.createObjectURL(strem);
                video.play();
            }, function(error) {
                //error.code
                console.log(error);
            });

         }       

      }else{
        alert("The gender, years and month should not be null!")
      }
   });

    $("button[name = 'testComBtn']").click(function(){
        //判断摄像机是否打开（略）
        //进入问答界面
        if(age<=50){
            $(".wapper").css("display","none");
            $(".wapper:eq(2)").css("display","block");    
            $(".wapper:eq(2)").html(dataJson[age-1][1]);
        }
        
    });

    //读完题目
    $(".wapper:eq(2)").click(function(){
                
            $(".wapper").css("display","none");
            //输入答案
            $("#Choice1 img").attr("src","./images/data/"+dataJson[age-1][3]+".jpg");
            $("#Choice2 img").attr("src","./images/data/"+dataJson[age-1][4]+".jpg");
            $("#Choice3 img").attr("src","./images/data/"+dataJson[age-1][5]+".jpg");
            $("#Choice4 img").attr("src","./images/data/"+dataJson[age-1][6]+".jpg");
            $(".wapper:eq(3)").css("display","block"); 
            $("#Answer .eye").css("display","none");
            //开始检测  
            beginInternal();    
     });     

    //答完题目
    $(".wapper:eq(3) div").click(function(){ 
        //判断对错
        var choice = $(this).find("img").eq(0).attr("src").split("/")[3].split(".")[0];
        var answer = dataJson[age-1][2];
        if(choice!=answer){
            errorCount++;
        }

        //判断是否继续
        if(age<50 && errorCount<6){     
            age++;
            $(".wapper").css("display","none");
            $(".wapper").css("display","none");
            $(".wapper:eq(2)").css("display","block");
            $(".wapper:eq(2)").html(dataJson[age-1][1]);
        }
        else{
            celing = age;
            var score = parseInt(100/(50-ground) * (celing-ground));
             $(".wapper").css("display","none");
             $(".wapper:eq(4) .bigInfo").html(score);
             $(".wapper:eq(4)").css("display","block");
        }
        //停止检测
        stopInternal();
    });

    function beginInternal(){
        interalCtrl = setInterval(function(){
                    //绘制canvas图形
                    canvas.getContext("2d").drawImage(video, 0, 0, 100, 80);
                    
                    //把canvas图像转为img图片
                     img.src = canvas.toDataURL("image/png");},2000);
    }

    function stopInternal(){

        window.clearInterval(interalCtrl);
    }

      

    img.addEventListener('load', function() {
      detectImg();
    });

});


