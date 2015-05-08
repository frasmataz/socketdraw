var socket = io.connect();
var trails = new Array();
var paint;
var colour;

$(window).on('beforeunload', function(){
    socket.close();
});

socket.on('addclick', function(data){
    trails = data;
    redraw();
});

socket.on('start', function(data){
    trails = data.trails;
    colour = data.colour;
    $("#colourtext").css('color', colour);
    redraw();
});

socket.on('clear', function(){
    trails = [];
    redraw();
});

var context = document.getElementById('canvas').getContext("2d");

function clearcanvas() {
    socket.emit('clear');
}

function trail(x,y,colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
}

function addClick(x, y) {
    var send = {
        'x': x,
        'y': y
    };

    socket.emit('addclick', send);
}

function startPath() {
    paint = true;
    socket.emit('startPath');
}

function endPath() {
    paint = false;
    socket.emit('endPath');
}

function redraw() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

    context.lineJoin = "round";
    context.lineWidth = 5;

    for (var j = 0; j < trails.length; j++) {
        for (var i = 0; i < trails[j].x.length; i++) {
            context.beginPath();
            if (i) {
                context.moveTo(trails[j].x[i - 1], trails[j].y[i - 1]);
            } else {
                context.moveTo(trails[j].x[i] - 1, trails[j].y[i]);
            }
            context.lineTo(trails[j].x[i], trails[j].y[i]);
            context.closePath();
            context.strokeStyle = trails[j].c;
            context.stroke();
        }
    }
}

$('#canvas').mousedown(function(e){
    var mouseX = e.pageX - this.offsetLeft;
    var mousey = e.pageY - this.offsetTop;

    startPath();
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    redraw();
});


var lastSend = new Date().getTime();

$('#canvas').mousemove(function(e){
    if((new Date().getTime() - lastSend > 20) && paint){
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        redraw();
        lastSend = new Date().getTime();
    }
});

$('#canvas').mouseup(function(e){
    endPath();
});