var world;
var camera;
var inputManager;
var drawable;
var handler;
var player;
var enemy;

var paused = false;

Array.prototype.reshape = function(rows, cols) {
    var copy = this.slice(0); // Copy all elements.
    this.length = 0; // Clear out existing array.

    for (var r = 0; r < rows; r++) {
        var row = [];
        for (var c = 0; c < cols; c++) {
            var i = r * cols + c;
            if (i < copy.length) {
                row.push(copy[i]);
            }
        }
        this.push(row);
    }
};

function main() {
    const gl = initGL("webGLCanvas", function() {
        alert("WebGL not supported!");
    });

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVP;

        varying lowp vec2 vTextureCord;

        void main() {
            gl_Position = uMVP * aVertexPosition;
            vTextureCord = aTextureCoord;
        }
    `;
    const fsSource = `
        varying lowp vec2 vTextureCord;

        uniform sampler2D uSampler;

        void main() {
            gl_FragColor = texture2D(uSampler, vTextureCord);
        }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord")
        },
        uniformLocations: {
            uMVP: gl.getUniformLocation(shaderProgram, "uMVP"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler")
        }
    };

    handler = {
        camera: camera,
        shaderInfo: programInfo,
        inputManager: inputManager,
        gl: gl
    };

    player = new Player(handler, { x: 0, y: 10, z: 0 });
    enemy = new DemoEnemy(handler, { x: 0, y: 10, z: 0 });
    getResource("/assets/levels/demoLevel.json", function(res) {
        world = new World(handler, JSON.parse(res));
        //world = new World(handler, 47, 23, "Demo Level", { x: 16, y: 16 });

        world.entities.push(player);
        world.entities.push(enemy);

        handler.currentWorld = world;

        //drawable = new TestTile(gl, programInfo, camera, inputManager);
        var then = 0;

        var frameStart = 0;
        var frames = 0;

        function render(now) {
            now *= 0.001;
            if (now - frameStart >= 1.0) {
                console.log("FPS: " + frames);
                frames = 0;
                frameStart = now;
            }
            frames++;
            const deltaTime = now - then;
            then = now;

            if (!paused) {
                gl.clearColor(0.5, 0.5, 0.5, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                handler.currentWorld.tick(deltaTime);
                handler.currentWorld.render();
            }

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    });
}

function initBuffers(gl, width, height) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [0, height,
        width, height, 0, 0,
        width, 0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const texutureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texutureCoordBuffer);

    const textureCoordinates = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
        gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        textureCoord: texutureCoordBuffer
    };
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize shader program: " + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling shader: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initGL(canvasID, errorCallback) {
    const canvas = document.getElementById(canvasID);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var gl = canvas.getContext("webgl");
    if (gl == null) {
        errorCallback();
        return null;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    inputManager = new InputManager();
    camera = new Camera(gl);
    return gl;
}

window.onload = main;