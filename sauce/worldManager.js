class World {
    constructor(handler, width, height, name, spawnpoint) {
        if (typeof(width) === 'number') {
            this.handler = handler;
            this.gl = handler.gl;
            this.tiles = createArray(height, width);
            this.entities = [];
            this.name = name;
            this.gravity = 1;

            this.programInfo = handler.programInfo;
            this.camera = handler.camera;
            this.spawnpoint = spawnpoint;

            this.tileSize = 2;
        } else if (typeof(width) === 'object') {
            this.tileSize = 2;
            this.handler = handler;
            this.gl = handler.gl;
            this.tiles = toTilesArr(width.tiles);
            this.entities = [];
            this.name = width.name;
            this.gravity = 1;
            this.spawnpoint = { x: 15, y: 15 };

            this.programInfo = handler.programInfo;
            this.camera = handler.camera;
        }
        this.prevEntities = [];
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
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity != undefined) {
                if (!this.prevEntities.includes(entity) && entity instanceof Player) {
                    entity.setPosition(this.spawnpoint.x, this.spawnpoint.y, 0.0);
                    console.log("Added player on position" + JSON.stringify(entity.position));
                }
                let tile = this.handler.currentWorld.getTileFromCoords(entity.position.x + entity.width / 2.0, entity.position.y - 0.1);
                if (tile == null && tile == undefined) {
                    entity.acceleration.y -= this.gravity;
                } else {
                    entity.acceleration.y = Math.max(0, entity.acceleration.y);
                    entity.velocity.y = Math.max(0, entity.velocity.y);
                    entity.position.y = tile.position.y + this.tileSize;
                }
                entity.tick(deltaTime);
            }
        }
        this.prevEntities = this.entities;
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

    setTile(x, y, id) {
        this.tiles[y][x] = getTileById(id);
    }

    getTile(x, y) {
        return this.tiles[y][x];
    }

    //Code from java Rectangle class
    isColiding(r, r2) {
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

    getTileFromCoords(x, y) {
        var world = this.handler.currentWorld;
        for (let i = 0; i < world.tiles.length; i++) {
            for (let j = 0; j < world.tiles[i].length; j++) {
                const tile = world.tiles[i][j];
                if (tile == undefined) continue;
                if (!tile.colidable) continue;
                if (this.isColiding({ x: tile.position.x, y: tile.position.y, width: world.tileSize, height: world.tileSize }, { x: x, y: y, width: 0.1, height: 0.1 })) {
                    return tile;
                }
            }
        }
        return null;
    }

    getTiles() {
        return this.tiles;
    }

    getEntities() {
        return this.entities;
    }

    addEntity(x) {
        if (x instanceof Player) {
            x.position.x = this.spawnpoint.x;
            x.position.y = this.spawnpoint.y;
        }
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

function getTileById(id) {
    switch (id) {
        case 0:
            return new BlueBrickTile(this.handler);
        case 2:
            return new GrayBrickTile(this.handler);
    }
    return null;
}

function toTilesArr(arr) {
    var arr1 = createArray(arr.length, arr[0].length);
    for (let i = arr.length - 1; i >= 0; i--) {
        for (let j = 0; j < arr[i].length; j++) {
            var tile = getTileById(arr[i][j]);
            if (tile != null) {
                tile.setPosition(j * this.tileSize, i * this.tileSize);
            }
            arr1[(arr.length - 1) - i][j] = tile;
        }
    }
    return arr1;
}

function getResource(url, cb) {
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            cb(this.responseText);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}