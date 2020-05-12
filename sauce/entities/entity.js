class Entity {

    constructor(handler, textureUrl, width, height, position, name, id) {
        this.programInfo = handler.shaderInfo;
        this.texture = loadTexture(handler.gl, textureUrl);
        this.gl = handler.gl;

        this.name = name;
        this.modelMatrix = mat4.create();
        this.camera = handler.camera;
        this.width = width;
        this.height = height;
        this.buffers = initBuffers(handler.gl, width, height);
        this.id = id;
        this.health = 50;
        this.uuid = uuidv4();
        this.handler = handler;

        this.position = position;
        this.rotation = 0.0;

        this.velocity = { x: 0, y: 0, z: 0 };
        this.acceleration = { x: 0, y: 0, z: 0 };

        var transform = mat4.create();
        mat4.translate(transform, transform, [this.position.x, this.position.y, this.position.z]);
        mat4.rotate(transform, transform, this.rotation, [0, 0, 1]);
        this.modelMatrix = transform;
    }

    tick(deltaTime) {
        if (this.health <= 0) {
            this.handler.currentWorld.removeEntity(this.uuid);
        }
        let tile = this.handler.currentWorld.getTileFromCoords(this.position.x + this.width / 2.0, this.position.y - 0.1);
        if (tile != null && tile != undefined) {
            if (tile.friction != 0) {
                if (this.acceleration.x > 0) {
                    if (this.acceleration.x - tile.friction < 0) {
                        this.acceleration.x = 0;
                    }
                    this.acceleration.x -= tile.friction;
                } else if (this.acceleration.x < 0) {
                    if (this.acceleration.x + tile.friction > 0) {
                        this.acceleration.x = 0;
                    }
                    this.acceleration.x += tile.friction;
                } else {
                    if (this.velocity.x > 0) {
                        if (this.velocity.x - tile.friction < 0) {
                            this.velocity.x = 0;
                        }
                        this.velocity.x -= tile.friction;
                    } else if (this.velocity.x < 0) {
                        if (this.velocity.x + tile.friction > 0) {
                            this.velocity.x = 0;
                        }
                        this.velocity.x += tile.friction;
                    }
                }
            }
        }

        let newAccelerationX = Math.min(Math.max(this.acceleration.x, -500), 500);
        let newAccelerationY = Math.min(Math.max(this.acceleration.y, -500), 500);
        let newAccelerationZ = Math.min(Math.max(this.acceleration.z, -500), 500);

        let newVelocityX = Math.min(Math.max(-5000, this.velocity.x + newAccelerationX * deltaTime), 5000);
        let newVelocityY = Math.min(Math.max(-5000, this.velocity.y + newAccelerationY * deltaTime), 5000);
        let newVelocityZ = Math.min(Math.max(-5000, this.velocity.z + newAccelerationZ * deltaTime), 5000);

        let newPosX = this.position.x + (newVelocityX * deltaTime);
        let newPosY = this.position.y + (newVelocityY * deltaTime);
        let newPosZ = this.position.z + (newVelocityZ * deltaTime);

        /*if (this.rectColidingWithWorld({ x: newPosX, y: newPosY, width: this.width, height: this.health })) {
            newVelocityX = this.velocity.x;
            newAccelerationX = this.acceleration.x;
            newPosX = this.position.x;

            newVelocityY = this.velocity.y;
            newAccelerationY = this.acceleration.y;
            newPosY = this.position.y;

            newVelocityZ = this.velocity.z;
            newAccelerationZ = this.acceleration.z;
            newPosZ = this.position.z;
        }*/

        this.velocity = { x: newVelocityX, y: newVelocityY, z: newVelocityZ };
        this.acceleration = { x: newAccelerationX, y: newAccelerationY, z: newAccelerationZ };

        this.setPosition(newPosX, newPosY, newPosZ);
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

    //Code from java Rectangle class
    rectColiding(r, r2) {
        var tw = r2.width;
        var th = r2.height;
        var rw = r.width;
        var rh = r.height;
        if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
            return false;
        }
        var tx = r2.x;
        var ty = r2.y;
        var rx = r.x;
        var ry = r.y;
        rw += rx;
        rh += ry;
        tw += tx;
        th += ty;
        //      overflow || intersect
        return ((rw < rx || rw > tx) &&
            (rh < ry || rh > ty) &&
            (tw < tx || tw > rx) &&
            (th < ty || th > ry));
    }

    //Code from java Rectangle class
    isColiding(r) {
        var tw = this.width;
        var th = this.height;
        var rw = r.width;
        var rh = r.height;
        if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
            return false;
        }
        var tx = this.position.x;
        var ty = this.position.y;
        var rx = r.x;
        var ry = r.y;
        rw += rx;
        rh += ry;
        tw += tx;
        th += ty;
        //      overflow || intersect
        return ((rw < rx || rw > tx) &&
            (rh < ry || rh > ty) &&
            (tw < tx || tw > rx) &&
            (th < ty || th > ry));
    }

    rectColidingWithWorld(r) {
        var world = this.handler.currentWorld;
        for (let i = 0; i < world.tiles.length; i++) {
            for (let j = 0; j < world.tiles[i].length; j++) {
                const tile = world.tiles[i][j];
                if (tile == undefined) continue;
                if (!tile.colidable) continue;
                if (this.isColiding({ x: tile.position.x, y: tile.position.y, width: world.tileSize, height: world.tileSize }, r)) {
                    return true;
                }
            }
        }
        return false;
    }

    isColidingWithWorld() {
        var world = this.handler.currentWorld;
        for (let i = 0; i < world.tiles.length; i++) {
            for (let j = 0; j < world.tiles[i].length; j++) {
                const tile = world.tiles[i][j];
                if (tile == undefined) continue;
                if (!tile.colidable) continue;
                if (this.isColiding({ x: tile.position.x, y: tile.position.y, width: world.tileSize, height: world.tileSize })) {
                    return true;
                }
            }
        }
        return false;
    }
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}