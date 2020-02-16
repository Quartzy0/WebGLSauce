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
        this.translate(-0.0, 0.0, -6.0);
        mat4.multiply(this.projViewMatrix, this.projectionMatrix, this.viewMatrix);
    }

    translate(x, y, z) {
        mat4.translate(this.viewMatrix, this.viewMatrix, [x, y, z]);
        mat4.multiply(this.projViewMatrix, this.projectionMatrix, this.viewMatrix);
    }

    rotate(x, y, z) {
        mat4.rotate(this.viewMatrix, this.viewMatrix, [x, y, z]);
        mat4.multiply(this.projViewMatrix, this.projectionMatrix, this.viewMatrix);
    }

    getProjectionViewMat() {
        return this.projViewMatrix;
    }
}