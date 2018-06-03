
console.log('=====測試排程=====');
console.log(Date.now());
const { Client } = require('pg');


//////////////////      
//Line主動推播測試
var linebot = require('linebot');
var express = require('express');
var request = require('request');
console.log('宣告Line BOT');
var bot = linebot({
    channelId: '1585073032',
    channelSecret: '0af678b6490a7452cd453250d9bd6998',
    channelAccessToken: 'IOHrMu7KzhjGMinqIDTpoXrxN/NlHFzF3ni7SYAAjN0SShmin7XW/5omFuSGq4tJuTvIdMstBWVpfADfORx7cT0/97Tkx5lmHY2z+77az/1hXYQfRCJGGUbOlSg15drJNNaojTkOSK3bU982zARsZQdB04t89/1O/w1cDnyilFU='
});
//Request IMGUR callback 隨機取圖
var options = {
    url: 'https://api.imgur.com/3/album/BJNxWqK/images',
    headers: { 'Authorization': 'Client-ID d09fd3905abd246' }
};
function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log("\t==>callback取圖OK: (" + info.data.length+")");
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
        
        client.connect();  
        client.query("SELECT * FROM public.user_history_record WHERE get_times>10 and (ten not like 'Yes' or ten is null);", (err, res) => {
            if (err) throw err;
            console.log("(after callback) Push Image For Each User");
            for (let row of res.rows) {
                var ui = row.user_id;
                //console.log(JSON.stringify(row));
                console.log('==>push ui:' + ui);
                var imgLink = info.data[Math.floor(Math.random() * info.data.length)].link;
                bot.push(ui, {
                            "type": "template",
                            "altText": "this is a carousel template",
                            "template": {
                                "type": "carousel",
                                "columns": [
                                {
                                    "thumbnailImageUrl": "https://example.com/bot/images/item1.jpg",
                                    "imageBackgroundColor": "#FFFFFF",
                                    "title": "this is menu",
                                    "text": "description",
                                    "defaultAction": {
                                        "type": "uri",
                                        "label": "View detail",
                                        "uri": "http://example.com/page/123"
                                    },
                                    "actions": [
                               /*     {
                                        "type": "postback",
                                        "label": "Buy",
                                        "data": "action=buy&itemid=111"
                                    },
                                    {
                                        "type": "postback",
                                        "label": "Add to cart",
                                        "data": "action=add&itemid=111"
                                    },*/
                                    {
                                        "type": "uri",
                                        "label": "View detail",
                                        //"uri": "http://line.naver.jp/R/msg/text/?test%20message%0D%0Ahttp%3A%2F%2Fline.me/R/ti/p/%40vqt1073d"
                                        "uri": "https://bit.ly/2srm8Iz"
                                    }
                                ]
                              }/*,
                              {
                                "thumbnailImageUrl": "https://example.com/bot/images/item2.jpg",
                                "imageBackgroundColor": "#000000",
                                "title": "this is menu",
                                "text": "description",
                                "defaultAction": {
                                    "type": "uri",
                                    "label": "View detail",
                                    "uri": "http://example.com/page/222"
                                },
                                "actions": [
                                    {
                                        "type": "postback",
                                        "label": "Buy",
                                        "data": "action=buy&itemid=222"
                                    },
                                    {
                                        "type": "postback",
                                        "label": "Add to cart",
                                        "data": "action=add&itemid=222"
                                    },
                                    {
                                        "type": "uri",
                                        "label": "View detail",
                                        "uri": "http://example.com/page/222"
                                    }
                                ]
                              }*/
                          ],
                          "imageAspectRatio": "rectangle",
                          "imageSize": "cover"
                      }
                });
                                console.log('\t==>push [' + imgLink+'] ok');
            }
            client.end();
        });
        
        const client2 = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
        client2.connect();  
        client2.query("UPDATE public.user_history_record SET ten='Yes' WHERE get_times>10 and (ten not like 'Yes' or ten is null);", (err2, res) => {
            if (err2) throw err2;
            client2.end();
        });
        console.log('\t==>end callback');
    }
}
request(options, callback);

console.log('==================');
