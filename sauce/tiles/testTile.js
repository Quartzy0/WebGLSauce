class TestTile extends Tile {
    constructor(gl, programInfo, camera, inputManager) {
        super(gl, "brick_blue.png", programInfo, camera, 1);
        this.inputManager = inputManager;

        this.speed = 1;
    }

    tick(deltaTime) {
        let moveAmount = this.speed * deltaTime;
        console.log(this.getPosition());
        if (this.inputManager.isKeyDown("KeyA")) {
            this.setPosition(this.getPosition().x - moveAmount, this.getPosition().y, this.getPosition().z);
        }
        if (this.inputManager.isKeyDown("KeyD")) {
            this.setPosition(this.getPosition().x + moveAmount, this.getPosition().y, this.getPosition().z);
        }
        if (this.inputManager.isKeyDown("KeyW")) {
            this.setPosition(this.getPosition().x, this.getPosition().y - moveAmount, this.getPosition().z);
        }
        if (this.inputManager.isKeyDown("KeyS")) {
            this.setPosition(this.getPosition().x, this.getPosition().y + moveAmount, this.getPosition().z);
        }
    }

    setSpeed(speed) {
        this.speed = speed;
    }
}