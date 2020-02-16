class Drawable {
    constructor(gl, textureUrl, programInfo, camera, inputManager) {
        this.programInfo = programInfo;
        this.texture = loadTexture(gl, textureUrl);
        this.gl = gl;

        this.modelMatrix = mat4.create();
        this.camera = camera;
        this.buffers = initBuffers(gl);
        this.inputManager = inputManager;
        this.speed = 5;
    }

    tick(deltaTime) {
        if (this.inputManager.isKeyDown('KeyD')) {
            this.translate(this.speed * deltaTime, 0, 0);
        }
        if (this.inputManager.isKeyDown('KeyW')) {
            this.translate(0, this.speed * deltaTime, 0);
        }
        if (this.inputManager.isKeyDown('KeyA')) {
            this.translate(-this.speed * deltaTime, 0, 0);
        }
        if (this.inputManager.isKeyDown('KeyS')) {
            this.translate(0, -this.speed * deltaTime, 0);
        }
    }

    draw() {
        {
            const numComponents = 2;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
            this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
        }

        {
            const numComponents = 2;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.textureCoord);
            this.gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, numComponents, type, normalize, stride, offset);
            this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
        }

        this.gl.useProgram(this.programInfo.program);

        var mvp = mat4.create();
        mat4.multiply(mvp, this.modelMatrix, this.camera.getProjectionViewMat());
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.uMVP, false, mvp);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);

        {
            const offset = 0;
            const vertexCount = 4;
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }

    translate(x, y, z) {
        mat4.translate(this.modelMatrix, this.modelMatrix, [x, y, z]);
    }
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const boreder = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, boreder, srcFormat, srcType, pixel);
    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        console.log(image.width + " " + image.height + " " + (isPowerOf2(image.width) && isPowerOf2(image.height)));
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_2, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };

    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}