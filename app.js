const PORT = process.env.PORT || 9900;
const app = require('express')();
const http = require('http').createServer(app);
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const javaScriptObfuscator = require('javascript-obfuscator');

const shoudObfercsteCode = false;

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
            let obferscated = javaScriptObfuscator.obfuscate(data, {
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
            });
            res.send(obferscated.getObfuscatedCode());
        } else {
            res.send(data);
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
        var amountDone = 0;
        results.forEach(result => {
            fs.readFile(result, (err, data) => {
                if (err) {
                    done(err);
                }
                finalData += data;
                amountDone++;
                if (amountDone >= results.length) {
                    done(null, finalData);
                }
            });
        });
    });
};