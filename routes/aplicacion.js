var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Aplicacion = require('../models/aplicacion');



//===================================================================================
//Obtiene todas las aplicaciones 
//===================================================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Aplicacion.find({})
        .populate('aplicacion', 'nombre url img')
        .skip(desde)
        .limit(5)
        .exec(
            (err, aplicaciones) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en la carga de Aplicaciones',
                        errors: err
                    });
                }

                Aplicacion.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        aplicaciones: aplicaciones,
                        total: conteo
                    });
                });

            });
});


//===================================================================================
//Obtener aplicacion por ID
//===================================================================================

app.get('/:id', (req, res) => {
    var id = req.params.id;
    Aplicacion.findById(id)
        .populate('usuario', 'nombre')
        .exec((err, aplicacion) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en la carga de Aplicaciones',
                    errors: err
                });
            }

            if (!aplicacion) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La aplicacion con el id' + id + 'no existe',
                    errors: { message: 'No existe una aplicacion con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                aplicacion: aplicacion
            });
        });
});


//===================================================================================
//Actualizar aplicacion 
//===================================================================================

app.put('/:id', [mdAutenticacion.verificacionToken, mdAutenticacion.verificacionRole], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Aplicacion.findById(id, (err, aplicacion) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar aplicacion',
                errors: err
            });
        }

        if (!aplicacion) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La aplicacion con el id ' + id + ' no existe',
                errors: { message: 'No existe aplicacion con ese ID' }
            });
        }

        //Actualiza los datos
        aplicacion.nombre = body.nombre;
        aplicacion.url = body.url;
        aplicacion.img = body.img
        aplicacion.usuario = req.usuario._id;

        aplicacion.save((err, aplicacionGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar aplicacion',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                aplicacion: aplicacionGuardado
            });

        });
    });
});


//===================================================================================
//Crear un nuevo aplicacion 
//===================================================================================

app.post('/', (req, res) => {

    var body = req.body;

    //Crea nueva aplicacion a la base de datos
    var aplicacion = new Aplicacion({
        nombre: body.nombre,
        url: body.url,
        img: body.img,
        //usuario: req.usuario._id
    });

    aplicacion.save((err, aplicacionGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear aplicación',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            aplicacion: aplicacionGuardado,
        });
    });
});

//===================================================================================
//Eliminar un aplicacion por su ID
//===================================================================================

app.delete('/:id', [mdAutenticacion.verificacionToken, mdAutenticacion.verificacionRole], (req, res) => {

    var id = req.params.id;
    Aplicacion.findByIdAndRemove(id, (err, aplicacionEliminado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminar aplicacion',
                errors: err
            });
        }

        if (!aplicacionEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe aplicacion con ese ID',
                errors: { message: 'No existe una aplicacion con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            aplicacion: aplicacionEliminado
        });

    });

});



module.exports = app;