class InputManager {
    constructor() {
        this.keyEvents = new Array();
        this.mouseEvents = new Array();
        this.mouseX = 0;
        this.mouseY = 0;
        this.keyStates = { 'KeyA': false };
        window.addEventListener("keydown", event => {
            this.keyStates[event.code] = true;
            this.keyEvents.forEach(handler => {
                if (handler.code === event.code) {
                    handler.handle(event.altKey, event.ctrlKey, event.shiftKey, event.key);
                }
            });
        });
        window.addEventListener("keyup", event => {
            this.keyStates[event.code] = false;
        });
        window.addEventListener("mousedown", event => {
            this.mouseEvents.forEach(handler => {
                if (handler.button === event.button) {
                    handler.handle(event.altKey, event.ctrlKey, event.shiftKey, event.clientX, event.clientY);
                }
            });
        });
        window.addEventListener("mousemove", event => {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });
    }

    addKeyListener(code, handler) {
        this.keyEvents.push({ code: code, handle: handler });
    }

    isKeyDown(code) {
        return this.keyStates[code];
    }

    addMouseListener(button, handler) {
        this.mouseEvents.push({ button: button, handle: handler });
    }

    getMouseX() {
        return this.mouseX;
    }

    getMouseY() {
        return this.mouseY;
    }
}