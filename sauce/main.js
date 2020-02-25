var world;
var camera;
var inputManager;
var drawable;
var handler;

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

    world = new World(handler, 20, 20, "Boi World");
    world.setTile(0, 0, 0);
    world.setTile(1, 0, 0);
    world.setTile(2, 0, 0);
    world.setTile(3, 0, 0);
    world.setTile(4, 0, 0);
    world.setTile(5, 0, 0);
    world.setTile(6, 0, 0);
    world.setTile(7, 0, 0);
    world.setTile(8, 0, 0);
    world.setTile(9, 0, 0);

    handler.currentWorld = world;

    //drawable = new TestTile(gl, programInfo, camera, inputManager);
    var then = 0;

    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        handler.currentWorld.tick(deltaTime);
        handler.currentWorld.render();

        //drawable.tick(deltaTime);
        //drawable.render();

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function initBuffers(gl, width, height) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [-1.0, 1.0,
        1.0, 1.0, -1.0, -1.0,
        1.0, -1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const texutureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texutureCoordBuffer);

    const textureCoordinates = [
        0.0, 0.0,
        width, 0.0,
        0.0, height,
        width, height
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
    var gl = canvas.getContext("webgl");
    if (gl == null) {
        errorCallback();
        return null;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    inputManager = new InputManager();
    camera = new Camera(gl);
    return gl;
}

window.onload = main;