var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');

//===================================================================================
//Renueva el token 
//===================================================================================


app.get('/renuevaToken', mdAutenticacion.verificacionToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 });

    res.status(200).json({
        ok: true,
        token: token
    });
});

//===================================================================================
//Verificacion e Ingreso(login)
//===================================================================================


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        //Verifica si existe el email ingresado
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        //Verifica Contrasenia
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: err
            });
        }


        //Crear token de confiramcion
        usuarioBD.password = '';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 14400 = 4 horas


        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id,
            menu: obtenerMenu(usuarioBD.role)

        });
    });
});

//===================================================================================
//Obtiene el menu dependiendo del role del usuario
//===================================================================================

function obtenerMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                //{ titulo: 'ProgressBar', url: '/progress' },
                //{ titulo: 'Grafica', url: '/grafica1' }
            ]
        },
        {
            titulo: 'Mantenimineto',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' }
                //{ titulo: 'Prueba ', url: '/otro' }
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[0].submenu.unshift({ titulo: 'Agregar Aplicacion', url: '/aplicacion/:id' });
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
        menu[1].submenu.unshift({ titulo: 'Aplicaciones', url: '/aplicaciones' });

    }

    return menu;
}

module.exports = app;