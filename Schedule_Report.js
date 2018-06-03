console.log("每日主動推播");
console.log('=====測試排程=====');
console.log(Date.now());
const { Client } = require('pg');
//Line主動推播測試
var linebot = require('linebot');
var express = require('express');
var request = require('request');
var myDate = new Date();
var iMonth=myDate.getMonth(); //?取?前月份(0-11,0代表1月)
var iDay=myDate.getDate(); //?取?前日(1-31)
console.log('宣告Line BOT');
var bot = linebot({
    channelId: '1585073032',
    channelSecret: '0af678b6490a7452cd453250d9bd6998',
    channelAccessToken: 'IOHrMu7KzhjGMinqIDTpoXrxN/NlHFzF3ni7SYAAjN0SShmin7XW/5omFuSGq4tJuTvIdMstBWVpfADfORx7cT0/97Tkx5lmHY2z+77az/1hXYQfRCJGGUbOlSg15drJNNaojTkOSK3bU982zARsZQdB04t89/1O/w1cDnyilFU='
});
var options = {
    url: 'https://api.imgur.com/3/album/BJNxWqK/images',
    headers: { 'Authorization': 'Client-ID d09fd3905abd246' }
};
function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
        client.connect();
  
        var repMessage="";  
        const ME = 'Ubb9f5c58d8fc3755bc871dcda17439f6';
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
                repMessage="          當日活躍人數:"+iGetUserToday+"人"+"\n"+
                                "    當日抽的總次數:"+iSumToday+"次"+"\n"+
                                "超過30次抽的人數:"+iCOUNT+"人"+"\n"+
                                "         抽的總次數:"+iSUM+"次"+"\n"+
                                "      目前訂閱人數:"+iFriend+"人"+"\n"+
                                "   活躍用戶比率為:"+iCOUNT/iFriend*100+"%";
                bot.push(ME, {
                    type: 'text',
                    text: repMessage
                });
                console.log('ok');
            }
            client.end();
        });
    }
}
request(options, callback);
console.log('==================');
