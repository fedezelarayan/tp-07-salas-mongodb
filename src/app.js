const express = require("express");
const ejsLayouts = require("express-ejs-layouts");
const morgan = require("morgan");

function crearApp({
  configuracion,
  middlewareSolicitudes,
  controladorReservas,
  routerReservas,
}) {
  const app = express();

  /* ===== middlewares globales ===== */

  app.use(morgan(configuracion.formatoRegistro));
  app.use(middlewareSolicitudes.identificarSolicitud);
  app.use(middlewareSolicitudes.medirDuracion);

  /* ===== configuración ===== */

  app.set("view engine", "ejs");
  app.set("views", "views");
  app.set("layout", "layouts/main");

  app.use(ejsLayouts);
  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  /* ===== rutas generales ===== */

  app.get("/", (req, res) => {
    res.render("inicio");
  });

  app.get("/estado", controladorReservas.estado);

  /* ===== router de reservas ===== */

  app.use("/reservas", routerReservas);

  /* ===== 404 final ===== */

  app.use((req, res) => {
    res.status(404).render("no-encontrado");
  });

  return app;
}

module.exports = { crearApp };
