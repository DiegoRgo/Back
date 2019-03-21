var express = require('express');
var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImg = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    }

    if (tipo === 'usuarios') {
        var pathNoImg = path.resolve(__dirname, '../assets/noUser-img.jpg');
        res.sendFile(pathNoImg);
    } else {
        var pathNoImg = path.resolve(__dirname, '../assets/noFolder-img.jpg');
        res.sendFile(pathNoImg);
    }

});

module.exports = app;