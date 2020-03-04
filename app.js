const PORT = process.env.PORT || 9900;
const app = require('express')();
const http = require('http').createServer(app);
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const javaScriptObfuscator = require('javascript-obfuscator');

const obferscationConfig = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: false,
    disableConsoleOutput: true,
    log: false,
    mangle: false,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: true,
    stringArray: true,
    stringArrayEncoding: 'base64',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
};

const shoudObfercsteCode = true;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

http.listen(PORT, function() {
    console.log('Listening on *:' + PORT);
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/getLevel/*', function(req, res) {
    let name = req.url.replace("/getLevel/", "");
    fs.access(__dirname + "/tmp/levels/" + name + ".json", error => {
        if (!error) {
            var filePath = path.join(__dirname, "/tmp/levels/" + name + ".json");
            var stat = fs.statSync(filePath);

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Content-Length': stat.size,
                'Content-Disposition': 'attachment; filename=' + name + ".json"
            });

            var readStream = fs.createReadStream(filePath);
            readStream.pipe(response);
        } else {
            res.status(404).send("Level not found");
        }
    });
});

app.get('/levelmaker', function(req, res) {
    res.sendFile(__dirname + "/levelmaker/index.html");
});

app.post('/saveLevel', function(req, res) {
    let name = req.body.name;
    let data = req.body.data;
    fs.access(__dirname + "/tmp/levels/" + name + ".json", error => {
        if (error) {
            fs.writeFile(__dirname + "/tmp/levels/" + name + ".json", data, function(err) {
                if (err) {
                    res.send("Un unknown error occured");
                    throw err;
                }
                res.status(200).send("Success");
            });
        } else {
            res.send("That level already exists");
        }
    });
});

app.get('/assets/*/*', function(req, res) {
    const name = req.url.replace("/assets/", "");
    fs.access(__dirname + "/res/" + name, error => {
        if (!error) {
            res.sendFile(__dirname + "/res/" + name);
        } else {
            res.status(404).send("Asset does not exist!");
        }
    });
});

app.get('/scripts/sauce', function(req, res) {
    combineFiles(__dirname + "/sauce/", function(err, data) {
        if (err) throw err;
        res.set('Content-Type', 'text/javascript');
        if (shoudObfercsteCode) {
            let obferscated = javaScriptObfuscator.obfuscate(data, obferscationConfig);
            res.status(200).send(obferscated.getObfuscatedCode());
        } else {
            res.status(200).send(data);
        }
    });
});

app.get('/scripts/levelmaker', function(req, res) {
    fs.readFile(path.join(__dirname, "/levelmaker/main.js"), function(err, data) {
        if (err) {
            res.send("An unexpected error occured");
            console.log(err);
        }
        res.set('Content-Type', 'text/javascript');
        if (shoudObfercsteCode) {
            let obferscated = javaScriptObfuscator.obfuscate(data, obferscationConfig);
            res.send(obferscated.getObfuscatedCode());
        } else {
            res.status(200).send(data);
        }
    });
});

function filewalker(dir, done) {
    let results = [];

    fs.readdir(dir, function(err, list) {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, results);

        list.forEach(function(file) {
            file = path.resolve(dir, file);

            fs.stat(file, function(err, stat) {
                // If directory, execute a recursive call
                if (stat && stat.isDirectory()) {
                    // Add directory to array [comment if you need to remove the directories from the array]
                    //results.push(file);

                    filewalker(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);

                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

function combineFiles(dir, done) {
    filewalker(dir, (err, results) => {
        if (err) {
            throw err;
        }

        var finalData = "";
        var indexOfMain = 0;

        var priorityThings = {};

        var done1 = 0;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.endsWith("main.js")) {
                indexOfMain = i;
                continue;
            }
            fs.readFile(result, (err, data) => {
                if (err) {
                    done(err);
                }
                done1++;
                const split = (data + "").split("\n")[0].split(" ");
                if (split.includes("extends")) {
                    if (!priorityThings[split[3].toUpperCase()]) {
                        priorityThings[split[3].toUpperCase()] = { done: false, filesToDo: [data] };
                        return;
                    }
                    if (!priorityThings[split[3].toUpperCase()].done) {
                        priorityThings[split[3].toUpperCase()].filesToDo.push(data);
                        return;
                    }
                }
                let a = result.split(path.sep);
                let a1 = a[a.length - 1].toUpperCase();
                if (!priorityThings[a1.substr(0, a1.lastIndexOf("."))]) {
                    priorityThings[a1.substr(0, a1.lastIndexOf("."))] = { done: true, filesToDo: [] };
                } else {
                    priorityThings[a1.substr(0, a1.lastIndexOf("."))].done = true;
                }
                finalData += data;
                priorityThings[a1.substr(0, a1.lastIndexOf("."))].filesToDo.forEach(element => {
                    finalData += element;
                });
                if (done1 === results.length - 1) {
                    fs.readFile(results[indexOfMain], function(err, data) {
                        if (err) {
                            done(err);
                            return;
                        }
                        finalData += data;
                        done(null, finalData);
                    });
                }
            });
        }
    });
};