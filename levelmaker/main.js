var canvas = document.getElementById("gridCanvas");
var context = canvas.getContext("2d");

canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

//grid width and height
var bw = canvas.width - 1;
var bh = canvas.height - 1;

function drawBoard() {
    for (var x = 0; x <= bw; x += 40) {
        context.moveTo(0.5 + x, 0);
        context.lineTo(0.5 + x, bh);
    }


    for (var x = 0; x <= bh; x += 40) {
        context.moveTo(0, 0.5 + x);
        context.lineTo(bw, 0.5 + x);
    }

    context.strokeStyle = "black";
    context.stroke();
}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }

    return arr;
}

drawBoard();

var tileGrid = createArray(Math.floor(bh / 40), Math.floor(bw / 40));
var currentID = 0;
var spawnpoint = { x: 0, y: 0 };
var imgs = [document.getElementById("brick_blue"), document.getElementById("sauce"), document.getElementById("brick_gray")];

var mouseDown = false;
var spawnpointImg = document.getElementById("spawnpoint");

canvas.addEventListener("mousedown", event => {
    mouseDown = true;
    var x = (event.clientX / 40) | 0;
    var y = (event.clientY / 40) | 0;

    if (currentID == 0) {
        context.clearRect(spawnpoint.x * 40 + 1, spawnpoint.y * 40 + 1, 39, 39);
        spawnpoint = { x: x, y: y };
        context.drawImage(spawnpointImg, x * 40 + 1, y * 40 + 1, 39, 39);
    } else if (!(x === spawnpoint.x && y === spawnpoint.y)) {
        console.log(x + " " + y + " " + ((x + 1) * (y + 1) - 1));
        tileGrid[y][x] = (currentID - 1);
        context.drawImage(imgs[currentID - 1], x * 40 + 1, y * 40 + 1, 39, 39);
    }
});

canvas.addEventListener("mousemove", event => {
    if (mouseDown && currentID != 0) {
        var x = (event.clientX / 40) | 0;
        var y = (event.clientY / 40) | 0;
        if (tileGrid[y][x] != currentID - 1 && !(x === spawnpoint.x && y === spawnpoint.y)) {
            tileGrid[y][x] = currentID - 1;
            context.drawImage(imgs[currentID - 1], x * 40 + 1, y * 40 + 1, 39, 39);
        }
    }
});

canvas.addEventListener("mouseup", event => { mouseDown = false; });

function changeTile(value) {
    currentID = parseInt(value);
}

function exportWorld() {
    var worldObj = { w: (bw / 40) | 0, h: (bh / 40) | 0, name: document.getElementById("name").value, tiles: tileGrid, spawnX: spawnpoint.x, spawnY: spawnpoint.y };

    navigator.clipboard.writeText(JSON.stringify(worldObj)).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

document.getElementById("exportWorld").onclick = exportWorld;