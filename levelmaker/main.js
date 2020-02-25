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

drawBoard();

var tileGrid = [];
var currentID = 0;
var imgs = [document.getElementById("brick_blue"), document.getElementById("sauce")];

var mouseDown = false;

canvas.addEventListener("mousedown", event => {
    mouseDown = true;
    var x = parseInt(event.clientX / 40, 10);
    var y = parseInt(event.clientY / 40, 10);
    console.log(x + " " + y + " " + ((x + 1) * (y + 1) - 1));
    tileGrid[(x + 1) * (y + 1) - 1] = currentID;
    context.drawImage(imgs[currentID], x * 40, y * 40, 40, 40);
});

canvas.addEventListener("mousemove", event => {
    if (mouseDown) {
        var x = parseInt(event.clientX / 40, 10);
        var y = parseInt(event.clientY / 40, 10);
        if (tileGrid[(x + 1) * (y + 1) - 1] != 0) {
            tileGrid[(x + 1) * (y + 1) - 1] = currentID;
            context.drawImage(imgs[currentID], x * 40, y * 40, 40, 40);
        }
    }
});

canvas.addEventListener("mouseup", event => { mouseDown = false; });

function changeTile(value) {
    currentID = parseInt(value);
}

function exportWorld() {
    var worldObj = { w: (bw / 40) | 0, h: (bh / 40) | 0, name: document.getElementById("name").value, tiles: tileGrid };

    $.ajax({
        type: "POST",
        url: "/saveLevel",
        data: { name: worldObj.name, data: worldObj },
        dataType: "application/json",
        success: function(response) {
            console.log(response);
            if (response === "Success") {
                window.open(window.location.origin + "/getLevel/" + worldObj.name);
            } else {
                document.getElementById("err").innerText = response;
            }
        }
    });
}

document.getElementById("exportWorld").onclick = exportWorld;