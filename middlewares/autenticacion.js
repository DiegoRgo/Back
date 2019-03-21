var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

//===================================================================================
//Verificacion mediante token (MIDDLEWARE)
//===================================================================================

exports.verificacionToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        //la informacion del usuario esta disponible en cualquier peticion
        req.usuario = decoded.usuario;

        //Con este funcion si el token es valido, puede ejecutar las siguietes funciones
        next();

    });
};


//===================================================================================
//Verificacion Admin, o permite actualizar datos mismo usuario  (MIDDLEWARE)
//===================================================================================

exports.verificacionRole = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'Acceso denegado ...! AD' }
        });
    }
};