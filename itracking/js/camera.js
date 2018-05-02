

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
    console.log(data);
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success(data) {
            faceConfig.face_token = data.faces[0].face_token;
            analyzeImg(); //调用分析图片的函数
        },
        error(XMLHttpRequest, textStatus, errorThrown){

            console.log(errorThrown);
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
                age : attributes.age.value,
                gender: attributes.gender.value,
                ethnicity: attributes.ethnicity.value,
                glass: attributes.glass.value,
                eyegaze: attributes.eyegaze
            }
            console.log(faceAttributes);
            //用jQuery获取模板
            var tpl   =  $("#tpl").html();
            //预编译模板
            var template = Handlebars.compile(tpl);
            //匹配json内容
            var html = template(faceAttributes);
            //输入模板
            $('#result').html(html);
        }
    })
}
