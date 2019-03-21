var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs'); //libreria para eliminar o borrar archivo
var app = express();
var Usuario = require('../models/usuario');
app.use(fileUpload()); // default options


app.put('/:tipo/:id', (req, res) => {
    //tipo hace referencia a las posibles tablas existentes de la BD
    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de colecciones/tablas
    var tiposValido = ['usuario'];

    if (tiposValido.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Tipo de coleccion no valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al cargar el archivo',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }
    //nombreCortado = nombreArchivo

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreArchivoI = archivo.name.split('.');
    var extensionArchivo = nombreArchivoI[nombreArchivoI.length - 1];

    //Tipo de extensiones validas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Debe seleccionar una imagen' + extensionesValidas.join(',') }
        });
    }

    //Nombre archivo Actualizado
    //formato: id-#ramdom:fechaCreacion.extension
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    //Mover archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});



function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuario') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }


            var pathViejo = './uploads/usuario/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            })


        });

    }
}


module.exports = app;