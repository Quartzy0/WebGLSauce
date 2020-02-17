class World {
    constructor(gl, programInfo, camera, width, height, name) {
        this.gl = gl;
        this.tiles = createArray(height, width);
        this.name = name;

        this.programInfo = programInfo;
        this.camera = camera;

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
    }

    render() {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j] != null) {
                    this.tiles[i][j].render();
                }
            }
        }
    }

    getTileById(id) {
        switch (id) {
            case 0:
                return new BrickTile(this.gl, this.programInfo, this.camera);
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