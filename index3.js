var linebot = require('linebot');
var express = require('express');

console.log('start index3.js 2');
console.log('測試PostgreSQL');

var bot = linebot({
    channelId: '1585073032',
    channelSecret: '0280477c35c67b960eb6121ca5ea787f',
    channelAccessToken: 'x1Vd/lDAxnEJaEh34am/zfVEjcFXTx1nX2ixBGwMd1TR5Li3jSpHUDDU8iH4npyvuTvIdMstBWVpfADfORx7cT0/97Tkx5lmHY2z+77az/1drtJ242U2GOj++hgT0CND2pdBXEUK3mdOw9RmdnCM0QdB04t89/1O/w1cDnyilFU='
});


//測試heroku-postgresql
const { Client } = require('pg');

//const client = new Client({
//    connectionString: process.env.DATABASE_URL,
//    ssl: true,
//});
//client.connect();

var myDate = new Date();
console.log('new Date():'+new Date());
var iMonth = myDate.getMonth(); //?取?前月份(0-11,0代表1月)
var iDay = myDate.getDate(); //?取?前日(1-31)
console.log('連線OK');

//使用者加入機器人好友事件
bot.on('follow', function (event) {
    console.log('==================follow-使用者加入機器人好友事件');
    console.log('query table user_history_record');
    
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: true, });
    client.connect();
    client.query("SELECT count(*) FROM public.user_history_record where user_id='" + event.source.userId + "';", (err, res) => {
        // client.query("SELECT user_id FROM public.user_history_record where user_id='"+event.source.userId+"';", (err, res) => {

        if (err) throw err;

        for (let row of res.rows) {
            var bExist = row.count;
            //var bExist=row.user_id;
            console.log("回傳資料:" + row.user_id);
            console.log(JSON.stringify(row));
            /////////////////
            if (bExist == "0") {
                //問題2:在下一個client會產生Error: Connection terminated by user錯誤訊息
                console.log("新增一筆資料");

                const client1 = new Client({ connectionString: process.env.DATABASE_URL, ssl: true, });
                client1.connect();
                client1.query(
                    'INSERT into public.user_history_record (user_id, start_date,friend, get_times) VALUES($1, $2, $3,$4) ',
                    [event.source.userId, new Date(), 'Y', 1],
                    function (err1, result) {
                        if (err1) throw err1;
                        client1.end();
                    });
                console.log("新增一筆資料OK");
            }
            /////////////
            if (bExist == "1") {
                console.log("更新一筆資料");

                const client2 = new Client({ connectionString: process.env.DATABASE_URL, ssl: true, });
                client2.connect();
                client2.query("UPDATE public.user_history_record SET friend='Y' WHERE user_id = '" + event.source.userId + "'", (err2, res) => {
                    if (err2) throw err2;
                    client2.end();
                });
                console.log("更新一筆資料OK");
            }
            /////////////////
        }
        client.end();
    });


});

//使用者刪除機器人好友事件
bot.on('unfollow', function (event) {
    console.log('==================unfollow-使用者刪除機器人好友事件');
    //2.於資料庫(假設可以建立表格，表格可以有欄位1表{user_id,user_name,start_time,friend})若已存在資料庫，將"friend"欄位更新為No
    //問題3:加了下列這段，就會crash

    const client3 = new Client({ connectionString: process.env.DATABASE_URL, ssl: true, });
    client3.connect();
    client3.query("UPDATE public.user_history_record SET friend='N' WHERE user_id = '" + event.source.userId + "'", (err2, res) => {
        if (err2) throw err2;
        client3.end();
    });
    console.log('update OK');
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
    if (event.message.text == '抽') {
        ////////////////////////
        console.log('new Date():'+new Date());
        console.log('取得相簿裡的所有照片');
        var request = require('request');
        var options = {
            //url: 'https://api.imgur.com/3/album/BJNxWqK/images',
            url: 'https://imgur-apiv3.p.mashape.com/3/image/',
           // url:'https://imgur-apiv3.p.mashape.com/3/account/brandonpantw/images/ids'',
            headers: { 
            'X-Mashape-Key': '8Wp006g50fmsh6PtDtiuQiO5nOIIp1o4P4kjsnuYq45yJzVNIw',
            'Authorization': 'Client-ID fae107e7473c25f'
        }
        };
               // function callback(error, response, body) {
       //     if (!error && response.statusCode == 200) {
       //         var info = JSON.parse(body);
       //         console.log(info.data[Math.floor(Math.random() * info.data.length)].link);
                console.log('傳遞卡片');
                //需要再加入隨機功能
                event.reply({
                    "type": "image",
//                   https://imgur.com/1i2DQft
                  //    "originalContentUrl": info.data[Math.floor(Math.random() * info.data.length)].link,
                    //"originalContentUrl": 'https://imgur.com/1i2DQft',
                    "originalContentUrl": 'https://i.imgur.com/Mki9oX3.jpg',
                   //   "previewImageUrl": info.data[Math.floor(Math.random() * info.data.length)].link
                    //"previewImageUrl": 'https://i.imgur.com/Mki9oX3.jpg'
                    "previewImageUrl": 'https://imgur.com/1i2DQft'
                });
       //     }
       // }
       // request(options, callback);
        ////////////////////////  

        const client4 = new Client({ connectionString: process.env.DATABASE_URL, ssl: true, });
        client4.connect();
        client4.query("SELECT get_times FROM public.user_history_record where user_id= '" + event.source.userId + "'", (err2, res) => {
            if (err2) throw err2;
            for (let row of res.rows) {
                
                console.log('row',row);
                var iTimes = row.get_times;
                if (iTimes == "30" || iTimes == "35") {
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
                        }//End of template
                    });//End of event.reply
                }//End of if
            }//End of for
            client4.end();
        });
        ////////////////////////    


        const client5 = new Client({ connectionString: process.env.DATABASE_URL, ssl: true, });
        client5.connect();
        client5.query("UPDATE public.user_history_record SET get_times=get_times+1 WHERE user_id = '" + event.source.userId + "'", (err2, res) => {
            if (err2) throw err2;
            client5.end();
        });
        // }

        const client6 = new Client({ connectionString: process.env.DATABASE_URL, ssl: true, });
        client6.connect();
        client6.query("SELECT count(*) FROM public.users_daily_record where user_id='" + event.source.userId + "-" + iMonth + "-" + iDay + "';", (err, res) => {
            if (err) throw err;
            for (let row of res.rows) {
                var bExist = row.count;
                console.log("回傳資料:" + event.source.userId + "-" + iMonth + "-" + iDay);
                console.log(JSON.stringify(row));
                if (bExist == "0") {
                    console.log("新增一筆資料");
                    const client7 = new Client({ connectionString: process.env.DATABASE_URL, ssl: true, });
                    client7.connect();
                    client7.query(
                        'INSERT into public.users_daily_record (user_id, get_date, get_times) VALUES($1, $2, $3) ',
                        [event.source.userId + "-" + iMonth + "-" + iDay, new Date(), 1],
                        function (err1, result) {
                            if (err1) throw err1;
                            client7.end();
                        });
                }
                if (bExist == "1") {
                    console.log("更新一筆資料");
                    const client8 = new Client({ connectionString: process.env.DATABASE_URL, ssl: true, });
                    client8.connect();
                    client8.query("UPDATE public.users_daily_record SET get_times=get_times+1 WHERE user_id = '" + event.source.userId + "-" + iMonth + "-" + iDay + "'", (err2, res) => {
                        if (err2) throw err2;
                        client8.end();
                    });
                }
            }//End of for
            client6.end();
        });
        //////////////////////////////////////////////    
    }
});


//此行抽圖OK但加入後報表不行run
//client.end();   
const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});


