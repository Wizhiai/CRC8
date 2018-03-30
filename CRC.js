// // var fs = require('fs')
// //     , http = require('http')
// //     , socketio = require('socket.io');
// //
// // var server = http.createServer(function(req, res) {
// //     res.writeHead(200, { 'Content-type': 'text/html'});
// //     res.end(fs.readFileSync(__dirname + '/index.html'));
// // }).listen(8080, function() {
// //     console.log('Listening at: http://localhost:8080');
// // });
// //
// // socketio.listen(server).on('connection', function (socket) {
// //     socket.on('message', function (msg) {
// //         console.log('Message Received: ', msg);
// //         socket.broadcast.emit('message',"SaaS");
// //     });
// // });

var cardNumber= "";
var cardVer= "";
var net = require("net")
const AccessControlCommand = require("./AccessControlCommand");
const mysql = require("./mysql");//debug用
Buffer.prototype.toByteArray = function () {
    return Array.prototype.slice.call(this, 0)
}
let list  = [];
function hexToStringWide(h) {
    var a = [];
    var i = 0;
    if (h.length % 4) {
        a.push(String.fromCharCode(parseInt(h.substring(0, 4), 16)));
        i = 4;
    }
    for (; i < h.length; i += 4) {
        a.push(String.fromCharCode(parseInt(h.substring(i, i + 4), 16)));
    }
    return a.join('');
};

function stringToHex(str) {
    var val = "";
    for (var i = 0; i < str.length; i++) {
        if (val == "")
            val = str.charCodeAt(i).toString(16);
        else
            val += "," + str.charCodeAt(i).toString(16);
    }
    return val;
}

function stringToHexWide(s) {
    var result = '';
    for (var i = 0; i < s.length; i++) {
        var b = s.charCodeAt(i);
        if (0 <= b && b < 16) {
            result += '000' + b.toString(16);
        }
        if (16 <= b && b < 255) {
            result += '00' + b.toString(16);
        }
        if (255 <= b && b < 4095) {
            result += '0' + b.toString(16);
        }
        if (4095 <= b && b < 65535) {
            result += b.toString(16);
        }
    }
    return result;
};
//数字转成16进制
function toHex(num){//将一个数字转化成16进制字符串形式
    return num<16?"0x0"+num.toString(16).toUpperCase():"0x"+num.toString(16).toUpperCase();
}
function BtoString(bufString) {
    let bufGetString ="";
    for (var i = 0; i < bufString.length; i++) {
        // console.log(String.fromCharCode(bufString[i]));
        bufGetString = bufGetString+(String.fromCharCode(bufString[i]));

    }
    return bufGetString;
}
function Stringto(bufString) {
    let TByte ="";
    for (var i = 0; i < bufString.length; i++) {
        //     console.log(String.fromCharCode(bufString[i]));
        TByte = TByte+(String.fromCharCode(bufString[i]));

    }
    return TByte;
}
//通信数据格式：地址+数据长度+功能（主命令）+功能（子命令）+数据+CRC
//              1      1    1           1            n    1      byte
console.log("tcpserver start");

let list2=require('./initList').list;

for(let i=0;i<10;i++){
    list2.push({key:i});
}
console.log(list2);
var server = net.createServer();
// serverFactory.server=server;
server.on('connection',function (socket) {
    console.log("new connecter");
    //
    console.log(PCPost(0x00));
    // socket.write(PCPost(0x00));

    list.push(socket);
    socket.on("data",(data)=>{
        console.log("get new message");
    console.log(new Date());

        socket.write(CRCB(Buffer.from(data)));


});
    socket.on('error',function (e) {
        console.log("出错");
        console.log(e.toString());
    });
    // 为这个socket实例添加一个"close"事件处理函数
    socket.on('close', function(data) {
        // console.log('CLOSED: ' +
        //     server.remoteAddress + ' ' + server.remotePort);
    });

})


server.listen(8432,'0.0.0.0',function(){
    console.log('server start listen')

})

// server.listen(8848);
function CRCB(data,length) {


    let i,j;


    let crc = 0xFF;
    for( i = 0; i <length; i++){

        crc^= data[i];



        for(j=0;j<8;j++) {
            if(crc & 0x01) {

                crc = (crc>>1) ^ 0x84;

            }
            else {
                crc=crc>>1;

            }
        }

    }

    return crc;
}

function PCPost(status){    //PC端主动发送请求开水停水
    cardVer = [0x02];

    // cardNumber = dataB.slice(1,5);

    // let status = dataB.slice(5,6);
    //  返回数据YY:Ver 版本号(0x02)+ErrMes (1byte)(见附录 1) + 物理卡号 (4byte) +2byte (可用时间单位秒)+Statu(s 请求信息)(1byte
    let time = [0x00,0x78];
    // let ErrMes =[0x00];
    let sendData =[];


    sendData =  sendData.concat(cardVer);
    // sendData = sendData.concat(ErrMes);
    // sendData = sendData.concat(cardNumber);
    // sendData =  sendData.concat(time);
    sendData =    sendData.concat(status);//长度为9
    let sendBuffData =[0x01];//拿到地址需要在首部加上地址
    let dataLength = [0x06];
    let orders = [0x04,0x1A,0x03];

    sendBuffData= sendBuffData.concat(dataLength);
    sendBuffData=           sendBuffData.concat(orders);
    sendBuffData=  sendBuffData.concat(sendData);

    let crc = CRCB(sendBuffData,sendBuffData.length);
    console.log(crc);
    sendBuffData=   sendBuffData.concat(crc);

    // socket.write(Buffer.from(sendBuffData));
    console.log(Buffer.from(sendBuffData));

    return Buffer.from(sendBuffData);
}

function  getMachineVer() {
    // cardVer = [0x02];

    // cardNumber = dataB.slice(1,5);

    // let status = dataB.slice(5,6);
    //  返回数据YY:Ver 版本号(0x02)+ErrMes (1byte)(见附录 1) + 物理卡号 (4byte) +2byte (可用时间单位秒)+Statu(s 请求信息)(1byte
    // let time = [0x00,0x78];
    // let ErrMes =[0x00];
    let sendData =[];


    sendData =  sendData.concat(cardVer);
    // sendData = sendData.concat(ErrMes);
    // sendData = sendData.concat(cardNumber);
    // sendData =  sendData.concat(time);
    // sendData =    sendData.concat(status);//长度为9
    let sendBuffData =[0x01];//拿到地址需要在首部加上地址
    let dataLength = [0x03];
    let orders = [0x03,0x03];

    sendBuffData= sendBuffData.concat(dataLength);
    sendBuffData=           sendBuffData.concat(orders);
    // sendBuffData=  sendBuffData.concat(sendData);

    let crc = CRCB(sendBuffData,sendBuffData.length);
    sendBuffData=   sendBuffData.concat(crc);

    // socket.write(Buffer.from(sendBuffData));
    console.log(Buffer.from(sendBuffData));
    return Buffer.from(sendBuffData);
}
function  getMachineMAC() {
    // cardVer = [0x02];

    // cardNumber = dataB.slice(1,5);

    // let status = dataB.slice(5,6);
    //  返回数据YY:Ver 版本号(0x02)+ErrMes (1byte)(见附录 1) + 物理卡号 (4byte) +2byte (可用时间单位秒)+Statu(s 请求信息)(1byte
    // let time = [0x00,0x78];
    // let ErrMes =[0x00];
    let sendData =[];


    sendData =  sendData.concat(cardVer);
    // sendData = sendData.concat(ErrMes);
    // sendData = sendData.concat(cardNumber);
    // sendData =  sendData.concat(time);
    // sendData =    sendData.concat(status);//长度为9
    let senffData =[0x01];//拿到地址需要在首部加上地址
    let dataLength = [0x04];
    let orders = [0x03,0x10,0x01];

    sendBuffData= sendBuffData.concat(dataLength);
    sendBuffData=           sendBuffData.concat(orders);
    // sendBuffData=  sendBuffData.concat(sendData);

    let crc = CRCB(sendBuffData,sendBuffData.length);
    sendBuffData=   sendBuffData.concat(crc);

    // socket.write(Buffer.from(sendBuffData));
    console.log(Buffer.from(sendBuffData));
    return Buffer.from(sendBuffData);
}
// function PCtoMachineheartbeat(machineMac,machineStatus) {
//     // cardVer = [0x02];
//
//     // cardNumber = dataB.slice(1,5);
//
//     // let status = dataB.slice(5,6);
//     //  返回数据YY:Ver 版本号(0x02)+ErrMes (1byte)(见附录 1) + 物理卡号 (4byte) +2byte (可用时间单位秒)+Statu(s 请求信息)(1byte
//     // let time = [0x00,0x78];
//     // let ErrMes =[0x00];
//     let sendData =machineMac;
//
//
//     sendData =  sendData.concat(machineStatus);
//     // sendData = sendData.concat(ErrMes);
//     // sendData = sendData.concat(cardNumber);
//     // sendData =  sendData.concat(time);
//     // sendData =    sendData.concat(status);//长度为9
//     let sendBuffData =[];//拿到地址需要在首部加上地址
//     let dataLength = [0x0D];
//     let orders = [0x99,0x99];
//
//     sendBuffData= sendBuffData.concat(dataLength);
//     sendBuffData=           sendBuffData.concat(orders);
//     sendBuffData=  sendBuffData.concat(sendData);
//
//     let crc = CRCB(sendBuffData,sendBuffData.length);
//     sendBuffData=   sendBuffData.concat(crc);
//
//     // socket.write(Buffer.from(sendBuffData));
//     console.log(Buffer.from(sendBuffData));
//     return Buffer.from(sendBuffData);
// }
exports.list = list;
// exports.Pcpost = PCPost(status);