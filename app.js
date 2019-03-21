//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Inicializar variables
var app = express();

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); //Desde cualquier lugar se va a poder realizar peticiones
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

//Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imgRoutes = require('./routes/img');
var aplicacionRoutes = require('./routes/aplicacion');


//Conexion a la BDD
mongoose.connection.openUri('mongodb://localhost:27017/usersDB', (err, res) => {

    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', ' online!');
});

//Server index config
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads'));

//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imgRoutes);
app.use('/aplicacion', aplicacionRoutes);
app.use('/', appRoutes);


//Eschucar peticiones
app.listen(3000, () => {
    console.log('Express server ejecutandose puerto 3000: \x1b[32m%s\x1b[0m', ' online!');
});