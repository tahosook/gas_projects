// 昨日を取得
function getYesterday() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    var date = Utilities.formatDate(yesterday, 'Asia/Tokyo', 'yyyy-MM-dd');
    Logger.log(date);
    
    return date;
}

// メイン関数
function main(){
    
}