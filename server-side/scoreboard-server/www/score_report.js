console.log("PhatBoi was here");
var parentDiv;
var cFrame;
var canvas;
var widthOffset;
var heightOffset;
var canvasWidth;
var canvasHeight;

var graphX;
var graphY;


window.addEventListener('load', (event) => {
    parentDiv = document.getElementById("score_graph");
    cFrame = document.createElement('canvas');
    cFrame.setAttribute("id", "scoreboard");
    cFrame.setAttribute("width", parentDiv.clientWidth);
    cFrame.setAttribute("height", parentDiv.clientHeight);
    cFrame.style.border = "none";
    parentDiv.appendChild(cFrame);
    
    canvas = cFrame.getContext("2d");
    widthOffset = 35.0;
    heightOffset = 20.0 + 80 ;
    canvasWidth = cFrame.width;
    canvasHeight = cFrame.height;
    graphX = 35.0;
    graphY = 20.0;
    
    window.setInterval(update, 10 * 1000);
    update();
});


function update(){

    var xmlhttp = new XMLHttpRequest();
    var url = "/info/"+window.location.pathname.split('/')[2];
    var entry;
    xmlhttp.onload = function() {
        if (this.status == 200) {
            var width = canvasWidth - widthOffset;
            var height = canvasHeight - heightOffset;
            entry = JSON.parse(this.responseText);
            
            //Title
            document.title = "Team " + entry.num + " Scoring Report";
            
            //Team Info Summary
            var tbody = document.getElementById("teamInfoSummary");
            tbody.innerHTML = "";
            var tableRow = document.createElement("tr");
            var _id = document.createElement("td");
            var _div = document.createElement("td");
            var _im_no = document.createElement("td");
            var _play_time = document.createElement("td");
            var _total_score = document.createElement("td");
            var _warnings = document.createElement("td");
            _id.innerHTML = entry.num;
            _div.innerHTML = entry.division;
            _im_no.innerHTML = "" + entry.images.length;
            var passedTime;
            if(entry.hasOwnProperty("endTime")){
                passedTime = new Date(entry.endTime) - new Date(entry.startTime);
            }else{
                passedTime = new Date() - new Date(entry.startTime);
            }
            passedTime /= 1000.0;
            var minute = Math.floor((passedTime % 3600) / 60);
            if(minute < 10){
                minute = "0" + minute;
            }
            _play_time.innerHTML = Math.floor(passedTime / 3600) + ":" + minute;
            _total_score.innerHTML = "" + entry.score;
            var warnMsg = "";
            if(entry.warn.multipleInstance){
                warnMsg += "M";
            }
            if(entry.warn.timeExceeded){
                warnMsg += "T";
            }
            _warnings.innerHTML = warnMsg;
            tableRow.appendChild(_id);
            tableRow.appendChild(_div);
            tableRow.appendChild(_im_no);
            tableRow.appendChild(_play_time);
            tableRow.appendChild(_total_score);
            tableRow.appendChild(_warnings);
            tbody.appendChild(tableRow);
            
            //Image List
            var iList = document.getElementById("imageList");
            iList.innerHTML = "";
            for(var i = 0; i < entry.images.length; i++){
                var curr_img = entry.images[i];
                var _tr = document.createElement("tr");
                var _img_name = document.createElement("td");
                var _img_time = document.createElement("td");
                var _img_found = document.createElement("td");
                var _img_remaining = document.createElement("td");
                var _img_penalties = document.createElement("td");
                var _img_score = document.createElement("td");
                var _img_warn = document.createElement("td");
                _img_name.innerHTML = curr_img.name;
                if(curr_img.hasOwnProperty("endTime")){
                    passedTime = new Date(curr_img.endTime) - new Date(curr_img.startTime);
                }else{
                    passedTime = new Date() - new Date(curr_img.startTime);
                }
                passedTime /= 1000.0;
                minute = Math.floor((passedTime % 3600) / 60);
                if(minute < 10){
                    minute = "0" + minute;
                }
                _img_time.innerHTML = Math.floor(passedTime / 3600) + ":" + minute;
                _img_found.innerHTML = curr_img.vulns;
                _img_remaining.innerHTML = curr_img.maxVulns - curr_img.vulns;
                _img_penalties.innerHTML = curr_img.pens;
                _img_score.innerHTML = "" + curr_img.score;
                warnMsg = "";
                if(curr_img.warn.multipleInstance){
                    warnMsg += "M";
                }
                if(curr_img.warn.timeExceeded){
                    warnMsg += "T";
                }
                _img_warn.innerHTML = warnMsg;
                _tr.appendChild(_img_name);
                _tr.appendChild(_img_time);
                _tr.appendChild(_img_found);
                _tr.appendChild(_img_remaining);
                _tr.appendChild(_img_penalties);
                _tr.appendChild(_img_score);
                _tr.appendChild(_img_warn);
                iList.appendChild(_tr);
            }
            
            //Setup
            
            var images = entry.images;
            canvas.clearRect(0, 0, canvasWidth, canvasHeight);
            
            var startTime = new Date(entry.startTime).getTime();
            var endTime = new Date(entry.endTime).getTime();
            
            var lineColors = ["#FF0000", "#E6E600", "#0000FF", "#00FF00", "#FF9900", "#FF00FF"];
            
            //Legend
            var legendLength = 0;
            for(var i = 0; i < images.length; i++){
                var name = images[i].name;
                canvas.fillStyle = lineColors[i % lineColors.length];
                canvas.fillRect(canvasWidth - 20, 20 * i + canvasHeight / 4, 10, 10);
                canvas.font = "15px Arial";
                canvas.textAlign = 'right';
                var cms = canvas.measureText(name).width;
                if(cms > legendLength)
                    legendLength = cms;
                canvas.fillText(name, canvasWidth - 30, 10 + 20 * i + canvasHeight / 4);
            }
            legendLength += 35;
            width -= legendLength;
            canvas.lineWidth = 1;
            
            //Graph Section
            
            var maxScore = 0;
            for(var i = 0; i < images.length; i++){
                for(var j = 0; j < images[i].scores.length; j++){
                    if (images[i].scores[j].score > maxScore){
                        maxScore = images[i].scores[j].score;
                    }
                }
            }
            maxScore = Math.max(40, Math.ceil(maxScore / 10) * 10);
            var scoreScale = 10;
            while(maxScore / scoreScale >= 50){
                scoreScale *= 10;
            }
            canvas.strokeStyle = "#b5b5b5";
            for(var i = 0; i <= maxScore / scoreScale; i++){
                canvas.beginPath();
                var drawHeight = height - (scoreScale * height / maxScore) * i;
                canvas.moveTo(0 + graphX, drawHeight + graphY);
                canvas.lineTo(width + graphX, drawHeight + graphY);
                canvas.stroke();
            }
            canvas.lineWidth = 3;
            for(var i = 0; i < images.length; i++){
                canvas.strokeStyle = lineColors[i % lineColors.length];
                canvas.beginPath();
                canvas.moveTo(0 + graphX, height + graphY);
                for(var j = 0; j < images[i].scores.length; j++){
                    var mapHeight = map(images[i].scores[j].score, 0, maxScore, 0, height);
                    mapHeight = height - mapHeight;
                    var scoreTime = new Date(entry.images[i].scores[j].time).getTime();
                    var mapWidth = map(scoreTime, startTime, endTime, 0, width);
                    canvas.lineTo(mapWidth + graphX, mapHeight + graphY);
                }
                canvas.stroke();
            }
            
            //Labeling Section
            canvas.font = "14px Arial";
            canvas.textAlign = 'right';
            canvas.fillStyle = "#000000";
            for(var i = 0; i <= maxScore / scoreScale; i++){
                canvas.fillText("" + i * scoreScale, graphX - 5,  height - (scoreScale * height / maxScore) * i + graphY - 3);
            }
            var labelAmount = 10;
            for(var i = 1; i <= labelAmount; i++){
                canvas.save();
                var dateTime = new Date(map(i, 0, labelAmount, startTime, endTime));
                var timeString = dateTime.toLocaleTimeString();
                canvas.translate(width * i / labelAmount + graphX, height + graphY);
                var tickLength = 5;
                canvas.beginPath();
                canvas.strokeStyle = "#b5b5b5"
                canvas.moveTo(0, tickLength / 2);
                canvas.lineTo(0, -tickLength / 2);
                canvas.stroke();
                canvas.textAlign = 'right';
                canvas.rotate(-Math.PI/4);
                canvas.fillText(timeString, -15, 15);
                canvas.restore();
            }
            //Update
            var timeUpdate = document.getElementById("gentime");
            timeUpdate.innerHTML = "" + new Date().toUTCString();
        }
    };
    xmlhttp.open("GET", url);
    xmlhttp.send();
    
}

function map(v, a, b, c, d){
    return c + (v - a) * (d - c) / (b - a);
}
