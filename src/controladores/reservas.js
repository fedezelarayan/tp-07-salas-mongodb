function crearControladorReservas(servicio) {
  function estado(req, res) {
    res.json({
      servicio: "activo",
      reservas: servicio.contar(),
      solicitudId: res.locals.solicitudId,
    });
  }

  function listar(req, res) {
    res.render("reservas/lista", {
      reservas: servicio.listar(),
    });
  }

  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      errores: [],
      datos: {},
    });
  }

  function detalle(req, res) {
    const id = Number(req.params.id);

    const reserva = servicio.buscarPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado");
    }

    res.render("reservas/detalle", {
      reserva,
    });
  }

  function crear(req, res) {
    servicio.crear(req.reservaValidada);

    res.redirect("/reservas");
  }

  return { estado, listar, mostrarFormulario, detalle, crear };
}

module.exports = { crearControladorReservas };
