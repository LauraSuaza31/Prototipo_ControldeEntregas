import express, {Application} from "express";
import indexRouter from "./routes/index";
import areasRouter from "./routes/areas";
import cargosRouter from "./routes/cargos";
import tiposUsuariosRouter from "./routes/tiposUsuarios";
import equiposRouter from "./routes/equipos";
import empleadosRouter from "./routes/empleados";
import asignacionEquiposRouter from "./routes/asignacionEquipos";
import menusRouter from "./routes/menus";
import usuariosRouter from "./routes/usuarios";

const app: Application = express();

/// Habilitación cors
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE");
    next();
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Routes
app.use(indexRouter);
app.use(areasRouter);
app.use(cargosRouter);
app.use(tiposUsuariosRouter);
app.use(equiposRouter);
app.use(empleadosRouter);
app.use(asignacionEquiposRouter);
app.use(empleadosRouter);
app.use(menusRouter);
app.use(usuariosRouter);

const port = 3000;

app.listen(port);
console.log('Server on port', port);