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
    console.log("Yay");

    copyToClipboard(JSON.stringify(worldObj));
}

function copyToClipboard(data) {
    // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    // must use a temporary form element for the selection and copy
    target = document.getElementById(targetId);
    if (!target) {
        var target = document.createElement("textarea");
        target.style.position = "absolute";
        target.style.left = "-9999px";
        target.style.top = "0";
        target.id = targetId;
        document.body.appendChild(target);
    }
    target.textContent = data;
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
        succeed = document.execCommand("copy");
    } catch (e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }
    // clear temporary content
    target.textContent = "";
    return succeed;
}

document.getElementById("exportWorld").onclick = exportWorld;