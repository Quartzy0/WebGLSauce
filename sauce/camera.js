class Camera {
    constructor(gl) {
        const FOV = 45 * Math.PI / 100;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        this.projectionMatrix = mat4.create();

        mat4.perspective(this.projectionMatrix, FOV, aspect, zNear, zFar);

        this.viewMatrix = mat4.create();
        this.projViewMatrix = mat4.create();

        this.position = { x: 0.0, y: 0, z: -50.0 };
        this.rotation = 0.0;

        var transform = mat4.create();
        mat4.translate(transform, transform, [this.position.x, this.position.y, this.position.z]);
        mat4.rotate(transform, transform, this.rotation, [0, 0, 1]);
        this.viewMatrix = transform;
        mat4.multiply(this.projViewMatrix, this.projectionMatrix, this.viewMatrix);
    }

    setPosition(x, y, z) {
        this.position = { x: x, y: y, z: z };
        var transform = mat4.create();
        mat4.translate(transform, transform, [this.position.x, this.position.y, this.position.z]);
        mat4.rotate(transform, transform, this.rotation, [0, 0, 1]);
        this.viewMatrix = transform;
        mat4.multiply(this.projViewMatrix, this.projectionMatrix, this.viewMatrix);
    }

    setRotation(r) {
        this.rotation = r;
        var transform = mat4.create();
        mat4.translate(transform, transform, [this.position.x, this.position.y, this.position.z]);
        mat4.rotate(transform, transform, this.rotation, [0, 0, 1]);
        this.viewMatrix = transform;
        mat4.multiply(this.projViewMatrix, this.projectionMatrix, this.viewMatrix);
    }

    getPosition() {
        return this.position;
    }

    getRotation() {
        return this.rotation;
    }

    getProjectionViewMat() {
        return this.projViewMatrix;
    }
}