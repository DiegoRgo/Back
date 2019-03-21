var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');
var app = express();

app.use(fileupload());

var Usuario = require('../models/usuario');
var Aplicacion = require('../models/aplicacion');

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de coleccion
    var tiposValidos = ['usuarios', 'aplicaciones'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de coleccion no valida',
            errors: { message: 'Tipo de coleccion no valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono ninguna imagen ',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.img;
    var nombreCortado = archivo.name.split('.');
    var extencionArchivo = nombreCortado[nombreCortado.length - 1];

    //Extensiones validas
    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extencionesValidas.indexOf(extencionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extencion no valida',
            errors: { message: 'Laas extenciones validas son: ' + extencionesValidas.join(', ') }
        });
    }

    //Nombre img personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extencionArchivo }`;



    //mover Archivo
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: true,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res)
    });
});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Sobre escribe si existe la imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'aplicaciones') {
        Aplicacion.findById(id, (err, aplicacion) => {

            if (!aplicacion) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Aplicación no existe',
                    errors: { message: 'Aplicación no existe' }
                });
            }

            var pathViejo = './uploads/aplicaciones/' + aplicacion.img;

            //Sobre escribe si existe la imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            aplicacion.img = nombreArchivo;
            aplicacion.save((err, aplicacionActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de aplicación actualizada',
                    aplicacion: aplicacionActualizado
                });
            });

        });

    }



}

module.exports = app;