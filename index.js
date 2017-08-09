let express = require('express');
let bodyParser = require("body-parser");
let rount = require("./app");
let app = express();
app.use(bodyParser.json());
rount(app)
let server = app.listen(8081, function() {
    let host = server.address().address
    let port = server.address().port
    console.log("http://%s:%s", host, port)
})
