var express = require('express');
var app = express();

var Usuario = require('../models/usuario');
var Aplicacion = require('../models/aplicacion');

//=================================================
//Busqueda especifica/coleccion 
//=================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'aplicaciones':
            promesa = buscarAplicaciones(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo pueden ser: Usuarios y Aplicaciones',
                error: { message: 'El tipo de colecion no es valida' }

            });

    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});


//=================================================
//Busqueda general 
//=================================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarUsuarios(busqueda, regex),
            buscarAplicaciones(busqueda, regex)
        ])
        .then(respuestaBusqueda => {

            res.status(200).json({
                ok: true,
                usuario: respuestaBusqueda[0],
                aplicaciones: respuestaBusqueda[1]
            });
        });

    // buscarUsuarios(busqueda, regex).then(usuario => {
    //     res.status(200).json({
    //         ok: true,
    //         usuario: usuario
    //     });
    // });

});

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuario) => {

                if (err) {
                    reject('Error al cargar Usuarios', err);
                } else {
                    resolve(usuario);
                }
            });
    });


}

function buscarAplicaciones(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Aplicacion.find({}, 'nombre url')
            .or([{ 'nombre': regex }, { 'url': regex }])
            .populate('usuario', 'nombre role')
            .exec((err, aplicaciones) => {

                if (err) {
                    reject('Error al cargar Aplicacion', err);
                } else {
                    resolve(aplicaciones);
                }
            });
    });


}

module.exports = app;