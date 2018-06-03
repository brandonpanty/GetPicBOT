var linebot = require('linebot');
var express = require('express');

console.log('start index3.js');
console.log('測試PostgreSQL');

var bot = linebot({
    channelId: '1585073032',
    channelSecret: '0af678b6490a7452cd453250d9bd6998',
    channelAccessToken: 'IOHrMu7KzhjGMinqIDTpoXrxN/NlHFzF3ni7SYAAjN0SShmin7XW/5omFuSGq4tJuTvIdMstBWVpfADfORx7cT0/97Tkx5lmHY2z+77az/1hXYQfRCJGGUbOlSg15drJNNaojTkOSK3bU982zARsZQdB04t89/1O/w1cDnyilFU='
});

//測試heroku-postgresql
const { Client } = require('pg');
    console.log('process.env.DATABASE_URL=='+process.env.DATABASE_URL);

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
console.log('log:'+process.env.DATABASE_URL);
var myDate = new Date();
var iMonth=myDate.getMonth(); //获取当前月份(0-11,0代表1月)
var iDay=myDate.getDate(); //获取当前日(1-31)
client.connect();
console.log('連線OK');

//使用者加入機器人好友事件
bot.on('follow', function (event) {
    console.log('==================follow-使用者加入機器人好友事件');
   console.log('query table test1');
   client.query("SELECT count(*) FROM public.user_history_record where user_id='"+event.source.userId+"';", (err, res) => {
   // client.query("SELECT user_id FROM public.user_history_record where user_id='"+event.source.userId+"';", (err, res) => {
      
    if (err) throw err;
       
     for (let row of res.rows) {
         var bExist=row.count;
     //    var bExist=row.user_id;
         console.log("回傳資料:"+bExist);
         console.log(JSON.stringify(row));
         /////////////////
          if(bExist=="0"){
            //問題2:在下一個client會產生Error: Connection terminated by user錯誤訊息
            console.log("新增一筆資料");
              client.query(
                'INSERT into public.user_history_record (user_id, start_date,friend, get_times) VALUES($1, $2, $3,$4) ',
                [event.source.userId,  new Date(), 'Y',1],
                function (err1, result) {
                    if (err1) throw err1;
                });
          }
         /////////////
          if(bExist=="1"){
          console.log("更新一筆資料"); 
              client.query("UPDATE public.user_history_record SET friend='Y' WHERE user_id = '"+event.source.userId+"'", (err2, res) => {
               if (err2) throw err2;
                });
        }
         /////////////////
     }
   //client.end();
});


});

//使用者刪除機器人好友事件
bot.on('unfollow', function (event) {
    console.log('==================unfollow-使用者刪除機器人好友事件');
    //2.於資料庫(假設可以建立表格，表格可以有欄位1表{user_id,user_name,start_time,friend})若已存在資料庫，將"friend"欄位更新為No
    //問題3:加了下列這段，就會crash
     client.query("UPDATE public.user_history_record SET friend='N' WHERE user_id = '"+event.source.userId+"'", (err2, res) => {
        if (err2) throw err2;
        //client.end();
     });
});

//機器人加入群組時的事件
bot.on('join', function (event) { 
    console.log('==================join-機器人加入群組時的事件');
});
//機器人離開群組時的事件
bot.on('leave', function (event) {
    console.log('==================leave-機器人離開群組時的事件');
});;
//使用者透過套版訊息回應時的事件
bot.on('postback', function (event) {
    console.log('==================postback-使用者透過套版訊息回應時的事件');
});

//訊息事件
bot.on('message', function (event) {
    console.log('==================message-訊息事件');
    //1.判斷使用者傳送的訊息是否為"抽"
    //  1.1若不為抽，不處理
    //  1.2若為抽，於表1(假設可以建立表格，表格可以有欄位1表{user_id,user_name,start_time,friend,get_times})將get friends+1
    //  1.3若為抽，於表2(假設可以建立表格，表格可以有欄位2表{user_id,current_time,get_times})判斷該使用者當日抽圖資料是否已存在，若不存在心件資料，
    //     若存在將get times+1
    //把收到訊息的 event 印出來看看
    console.log('解析收到的event:');
    //console.log(event);
    console.log('type==>', event.type);
    console.log('replyToken==>', event.replyToken);
    console.log('userId==>', event.source.userId);
    console.log('==================');
    /*if(event.message.text=='報表'){
            var iSUM=0;
            client.query('SELECT SUM(get_times) FROM public.user_history_record;', (err, res) => {    
                if (err) throw err;
                for (let row of res.rows) {
                    iSUM=row.sum;
                    console.log("抽的總次數:"+iSUM);
                    console.log(JSON.stringify(row));
                    console.log('##');
                }           
            });
            var iCOUNT=0;    
            client.query('SELECT COUNT(*) FROM public.user_history_record where get_times>30;', (err, res) => {    
                if (err) throw err;
                for (let row of res.rows) {
                    iCOUNT=row.count;

                    console.log('##');
                }           
            });
             var iGetUserToday=0; 
                    client.query("SELECT COUNT(*) FROM public.users_daily_record where user_id like '%"+iMonth+"-"+iDay+"%';", (err, res) => {    
                        if (err) throw err;
                        for (let row of res.rows) {
                            iGetUserToday=row.count;
                   
                            console.log('##');
                        }           
                 });
            var iSumToday=0;
            client.query("SELECT SUM(get_times) FROM public.users_daily_record where user_id like '%"+iMonth+"-"+iDay+"%';", (err, res) => {    
                if (err) throw err;
                for (let row of res.rows) {
                    iSumToday=row.sum;
                }           
            });
        
            var iFriend=0;    
            client.query("SELECT COUNT(*) FROM public.user_history_record where friend='Y';", (err, res) => {    
                if (err) throw err;
                for (let row of res.rows) {
                    iFriend=row.count;
                    console.log(JSON.stringify(row));
                    event.reply("          當日活躍人數:"+iGetUserToday+"人"+"\n"+
                                "    當日抽的總次數:"+iSumToday+"次"+"\n"+
                                "超過30次抽的人數:"+iCOUNT+"人"+"\n"+
                                "         抽的總次數:"+iSUM+"次"+"\n"+
                                "      目前訂閱人數:"+iFriend+"人"+"\n"+
                                "   活躍用戶比率為:"+iCOUNT/iFriend*100+"%"
                               ).then(function (data) {
                        console.log('success', data);
                    }).catch(function (error) {
                        console.log('Error', error);
                    });
                    console.log('##');
                }           
            });
  //      client3.end();

    }*/
    /////////////////////////////
    if(event.message.text=='抽'){
    ////////////////////////
        console.log('取得相簿裡的所有照片');
        var request = require('request');
        var options = {
            url: 'https://api.imgur.com/3/album/BJNxWqK/images',
            headers: { 'Authorization': 'Client-ID d09fd3905abd246' }
        };
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                console.log(info.data[Math.floor(Math.random()*info.data.length)].link);
                console.log('傳遞卡片');
                //需要再加入隨機功能
                 event.reply({
                    "type": "image",
                    "originalContentUrl": info.data[Math.floor(Math.random()*info.data.length)].link,
                    "previewImageUrl": info.data[Math.floor(Math.random()*info.data.length)].link
                });
            }
        }
        request(options, callback);
        ////////////////////////      
        client.query("SELECT get_times FROM public.user_history_record where user_id= '"+event.source.userId+"'", (err2, res) => {
            if (err2) throw err2;
                for (let row of res.rows) {
                    var iTimes=row.get_times;
                    if(iTimes=="30"||iTimes=="35"){
                        event.reply({
                            type: 'template',
                            altText: 'this is a confirm template',
                            template: {
                                type: 'confirm',
                                text: 'Are you sure?',
                                actions: [{
                                type: 'message',
                                label: 'Yes',
                                text: 'yes'
                            }, {
                                type: 'message',
                                label: 'No',
                                text: 'no'
                            }]
                        }
                    });
                }
            }
        });
        ////////////////////////      
        client.query("UPDATE public.user_history_record SET get_times=get_times+1 WHERE user_id = '"+event.source.userId+"'", (err2, res) => {
                   if (err2) throw err2;
              });
         // }
        client.query("SELECT count(*) FROM public.users_daily_record where user_id='"+event.source.userId+"-"+iMonth+"-"+iDay+"';", (err, res) => {    
            if (err) throw err;
            for (let row of res.rows) {
                var bExist=row.count;
                console.log("回傳資料:"+event.source.userId+"-"+iMonth+"-"+iDay);
                console.log(JSON.stringify(row));
                if(bExist=="0"){
                    console.log("新增一筆資料");
                    client.query(
                    'INSERT into public.users_daily_record (user_id, get_date, get_times) VALUES($1, $2, $3) ',
                    [event.source.userId+"-"+iMonth+"-"+iDay, new Date(), 1],
                    function (err1, result) {
                        if (err1) throw err1;
                    });
                }
                if(bExist=="1"){
                    console.log("更新一筆資料"); 
                    client.query("UPDATE public.users_daily_record SET get_times=get_times+1 WHERE user_id = '"+event.source.userId+"-"+iMonth+"-"+iDay+"'", (err2, res) => {
                        if (err2) throw err2;
                    });
                }
            }
        });
//////////////////////////////////////////////    
    }
});




//此行抽圖OK但加入後報表不行run
client.end();   





const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
