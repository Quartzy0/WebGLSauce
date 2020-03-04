class World {
    constructor(handler, width, height, name) {
        this.handler = handler;
        this.gl = handler.gl;
        this.tiles = createArray(height, width);
        this.entities = [];
        this.name = name;

        this.programInfo = handler.programInfo;
        this.camera = handler.camera;

        this.tileSize = 2;
    }

    tick(deltaTime) {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j] != null) {
                    this.tiles[i][j].setPosition(j * this.tileSize, i * this.tileSize, 0.0);
                    this.tiles[i][j].tick(deltaTime);
                }
            }
        }
        this.entities.forEach(entity => {
            if (entity != undefined) {
                entity.tick(deltaTime);
            }
        });
    }

    render() {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j] != null) {
                    this.tiles[i][j].render();
                }
            }
        }
        this.entities.forEach(entity => {
            if (entity != undefined) {
                entity.render();
            }
        });
    }

    getTileById(id) {
        switch (id) {
            case 0:
                return new BrickTile(this.handler);
        }
        return null;
    }

    setTile(x, y, id) {
        this.tiles[y][x] = this.getTileById(id);
    }

    getTile(x, y) {
        return this.tiles[y][x];
    }

    getTiles() {
        return this.tiles;
    }

    getEntities() {
        return this.entities;
    }

    addEntity(x) {
        this.entities.push(x);
    }

    removeEntity(uuid) {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].uuid === uuid) {
                this.entities.splice(i, 1);
                return;
            }
        }
    }
}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }

    return arr;
}