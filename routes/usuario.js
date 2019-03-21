var express = require('express');
var bcryp = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');



//===================================================================================
//Obtiene todos los usurios 
//===================================================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en la carga de Usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });

            });
});


//===================================================================================
//Actualizar usuario 
//===================================================================================

app.put('/:id', [mdAutenticacion.verificacionToken, mdAutenticacion.verificacionRole], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuarios con el id ' + id + ' no existe',
                errors: { message: 'No existe usuario con ese ID' }
            });
        }

        //Actualiza los datos
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            //No muestra la contrasenia encriptada
            usuarioGuardado.password = '';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });
});


//===================================================================================
//Crear un nuevo usuario 
//bcryp.hashSync - encriptacion de contrasenia en una sola via 
//===================================================================================

app.post('/', (req, res) => {

    var body = req.body;

    //Crea nuevos usuarios a la base de datos
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryp.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

//===================================================================================
//Eliminar un usuario por su ID
//===================================================================================

app.delete('/:id', [mdAutenticacion.verificacionToken, mdAutenticacion.verificacionRole], (req, res) => {

    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioEliminado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminar usuario',
                errors: err
            });
        }

        if (!usuarioEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioEliminado
        });

    });

});



module.exports = app;