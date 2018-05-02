

let faceConfig = {
    face_token : '',
}
let faceAttributes = {};


function getBlobBydataURI(dataURI) {  
            var binary = atob(dataURI.split(',')[1]);  
            var array = [];  
            for(var i = 0; i < binary.length; i++) {  
                array.push(binary.charCodeAt(i));  
            }  
            return new Blob([new Uint8Array(array)], {type : 'image/png'});  
        }  
  
function detectImg() {

    let url = 'https://api-cn.faceplusplus.com/facepp/v3/detect';

    let dataURL = canvas.toDataURL("image/png");
 
    let imgBase64Data = getBlobBydataURI(dataURL);
    let data = new FormData();
    data.append('api_key', "ri01AlUOp4DUzMzMYCjERVeRw88hlvCa");
    data.append('api_secret', "pF3JOAxBENEYXV-Q96A3s-CkyWqBg49u");
    data.append('image_file', imgBase64Data);
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success(data) {
            if(data.faces.length>0){
                faceConfig.face_token = data.faces[0].face_token;
                analyzeImg(); //调用分析图片的函数
            }
            
        },
        error(XMLHttpRequest, textStatus, errorThrown){

            //console.log(errorThrown);
        }
    })
}

function analyzeImg() {
    let url = 'https://api-cn.faceplusplus.com/facepp/v3/face/analyze';
    $.ajax({
        url: url,
        type: 'POST',
        data: {
            api_key: "ri01AlUOp4DUzMzMYCjERVeRw88hlvCa",
            api_secret: "pF3JOAxBENEYXV-Q96A3s-CkyWqBg49u",
            face_tokens: faceConfig.face_token,
            return_attributes: "gender,age,smiling,ethnicity,eyegaze,eyestatus"
        },
        success(data) {
            // console.log(data);
            let attributes = data.faces[0].attributes;
            faceAttributes = {
                width:data.faces[0].face_rectangle.width,
                height:data.faces[0].face_rectangle.height,
                age : attributes.age.value,
                gender: attributes.gender.value,
                ethnicity: attributes.ethnicity.value,
                glass: attributes.glass.value,
                eyegaze: attributes.eyegaze
            }
            console.log(faceAttributes);

            //计算出汇聚点
            //右眼中心坐标
            var C1 = new vector2d(faceAttributes.eyegaze.left_eye_gaze.position_x_coordinate, faceAttributes.eyegaze.left_eye_gaze.position_y_coordinate);
            //左眼中心坐标
            var C2 = new vector2d(faceAttributes.eyegaze.right_eye_gaze.position_x_coordinate, faceAttributes.eyegaze.right_eye_gaze.position_y_coordinate);
            //右眼视线
            var D1 = new vector2d(faceAttributes.eyegaze.left_eye_gaze.vector_x_component,faceAttributes.eyegaze.left_eye_gaze.vector_y_component);
            //左眼视线
            var D2 = new vector2d(faceAttributes.eyegaze.right_eye_gaze.vector_x_component,faceAttributes.eyegaze.right_eye_gaze.vector_y_component);

            //确定圆心
            var O = C1.add(C2).scale(0.5);
            var R = Math.max(faceAttributes.width,faceAttributes.height);
            var D = D1.add(D2).scale(0.5);
            var P =O.add(D);

            //判断视线落在哪个格子上
            var columnNo;
            if (P.vx<0.5 && P.vy>0.5){
                columnNo =0;
            } else if(P.vx>0.5 && P.vy>0.5){
                columnNo =1;
            } else if(P.vx<0.5 && P.vy<0.5){
                columnNo = 2;
            }else{
                columnNo = 3;
            }

            $("#Answer .eye").css("display","none");
            $("#Answer .eye").eq(columnNo).css("display","block");

        }
    })
}


var vector2d = function (x,y){
    var vec = {
        vx: x,
        vy: y,

        //加另一个向量
        add: function (vec2){
            vec.vx+=vec2.vx;
            vec.vy+=vec2.vy;
            return vec;
        },

        //缩放
        scale: function (scale){
            vec.vx*=scale;
            vec.vy*=scale;
            return vec;
        }

    };

    return vec;
};