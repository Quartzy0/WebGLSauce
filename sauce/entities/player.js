class Player extends Entity {
    constructor(handler, position) {
        super(handler, 'player.png', 2.0, 4.0, position, "Player", 0);
        this.walkSpeed = 100;
    }

    tick(deltaTime) {
        if (this.handler.inputManager.isKeyDown("KeyA")) {
            this.acceleration.x = this.acceleration.x <= -this.walkSpeed ? this.acceleration.x : this.acceleration.x - this.walkSpeed;
        }
        if (this.handler.inputManager.isKeyDown("KeyD")) {
            this.acceleration.x = this.acceleration.x >= this.walkSpeed ? this.acceleration.x : this.acceleration.x + this.walkSpeed;
        }
        if (this.handler.inputManager.isKeyDown("KeyW")) {
            this.velocity.y = 7.5;
        }
        super.tick(deltaTime);
    }
}