class Entity {
    constructor(handler, textureUrl, width, height, position, name, id) {
        this.programInfo = programInfo;
        this.texture = loadTexture(gl, textureUrl);
        this.gl = gl;

        this.modelMatrix = mat4.create();
        this.camera = camera;
        this.buffers = initBuffers(gl);
        this.id = id;
        this.health = 0;
        this.uuid = uuidv4();
        this.handler = handler;

        this.position = position;
        this.rotation = 0.0;
    }

    tick(deltaTime) {
        if (this.health <= 0) {
            this.handler.currentWorld.removeEntity(this.uuid);
        }
    }

    render() {
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
        mat4.multiply(mvp, this.camera.getProjectionViewMat(), this.modelMatrix);
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

    setPosition(x, y, z) {
        this.position = { x: x, y: y, z: z };
        var transform = mat4.create();
        mat4.translate(transform, transform, [this.position.x, this.position.y, this.position.z]);
        mat4.rotate(transform, transform, this.rotation, [0, 0, 1]);
        this.modelMatrix = transform;
    }

    setRotation(r) {
        this.rotation = r;
        var transform = mat4.create();
        mat4.translate(transform, transform, [this.position.x, this.position.y, this.position.z]);
        mat4.rotate(transform, transform, this.rotation, [0, 0, 1]);
        this.modelMatrix = transform;
    }

    getPosition() {
        return this.position;
    }

    getRotation() {
        return this.rotation;
    }
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}