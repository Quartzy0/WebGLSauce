class Player extends Entity {
    constructor(handler, position) {
        super(handler, 'player.png', 1, 2, position, "Player", 0);
    }

    tick(deltaTime) {
        var moveAmount = 20 * deltaTime;
        if (this.handler.inputManager.isKeyDown("KeyA")) {
            this.setPosition(this.getPosition().x - moveAmount, this.getPosition().y, this.getPosition().z);
        }
        if (this.handler.inputManager.isKeyDown("KeyD")) {
            this.setPosition(this.getPosition().x + moveAmount, this.getPosition().y, this.getPosition().z);
        }
        if (this.handler.inputManager.isKeyDown("KeyW")) {
            this.setPosition(this.getPosition().x, this.getPosition().y + moveAmount, this.getPosition().z);
        }
        if (this.handler.inputManager.isKeyDown("KeyS")) {
            this.setPosition(this.getPosition().x, this.getPosition().y - moveAmount, this.getPosition().z);
        }
    }
}