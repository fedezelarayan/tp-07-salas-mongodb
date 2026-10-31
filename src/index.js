const { cargarConfiguracion } = require("./config/entorno");
const { crearServicioReservas } = require("./servicios/reservas");
const { crearControladorReservas } = require("./controladores/reservas");
const { crearRouterReservas } = require("./rutas/reservas");
const { crearMiddlewareSolicitudes } = require("./middleware/solicitudes");
const { crearApp } = require("./app");

const datosIniciales = [
  {
    id: 1,
    estudiante: "Federico Zelarayan",
    email: "federico@gmail.com",
    sala: "Sala Norte",
    fecha: "2026-09-24",
    turno: "Mañana",
    personas: 2,
  },
  {
    id: 2,
    estudiante: "Juan Pérez",
    email: "juan@gmail.com",
    sala: "Sala Sur",
    fecha: "2026-09-24",
    turno: "Tarde",
    personas: 4,
  },
  {
    id: 3,
    estudiante: "María González",
    email: "maria@gmail.com",
    sala: "Sala Multimedia",
    fecha: "2026-09-25",
    turno: "Noche",
    personas: 3,
  },
  {
    id: 4,
    estudiante: "Lucía Fernández",
    email: "lucia@gmail.com",
    sala: "Sala Norte",
    fecha: "2026-09-26",
    turno: "Tarde",
    personas: 5,
  },
];

const configuracion = cargarConfiguracion();

const servicioReservas = crearServicioReservas(datosIniciales);
const controladorReservas = crearControladorReservas(servicioReservas);
const routerReservas = crearRouterReservas(controladorReservas);
const middlewareSolicitudes = crearMiddlewareSolicitudes();

const app = crearApp({
  configuracion,
  middlewareSolicitudes,
  controladorReservas,
  routerReservas,
});

app.listen(configuracion.puerto, () => {
  console.log(
    `Servidor ejecutándose en http://localhost:${configuracion.puerto}`,
  );
});
