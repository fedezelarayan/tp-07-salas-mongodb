function crearMiddlewareSolicitudes() {
  let solicitudId = 0;

  function identificarSolicitud(req, res, next) {
    solicitudId++;

    const idFormateado = `BIB-${String(solicitudId).padStart(4, "0")}`;

    res.locals.solicitudId = idFormateado;

    next();
  }

  function medirDuracion(req, res, next) {
    const inicio = Date.now();

    res.on("finish", () => {
      const duracion = Date.now() - inicio;

      console.log(
        `[${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duracion}ms`,
      );
    });

    next();
  }

  return { identificarSolicitud, medirDuracion };
}

module.exports = { crearMiddlewareSolicitudes };
