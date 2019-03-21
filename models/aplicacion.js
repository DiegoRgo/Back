var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var aplicacionSchema = new Schema({

    nombre: { type: String, unique: true, required: [true, 'El nombre de la aplicación es necesaria'] },
    url: { type: String, unique: true, required: [true, 'La Url de la aplicación es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }

}, { collection: 'aplicaciones' });

aplicacionSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Aplicacion', aplicacionSchema);