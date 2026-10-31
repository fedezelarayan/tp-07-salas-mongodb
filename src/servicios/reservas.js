function crearServicioReservas() {
  const reservas = [
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

  function listar() {
    return reservas;
  }

  function contar() {
    return reservas.length;
  }

  function buscarPorId(id) {
    return reservas.find((reserva) => reserva.id === id);
  }

  function crear(datos) {
    const nuevoId =
      reservas.length > 0
        ? Math.max(...reservas.map((reserva) => reserva.id)) + 1
        : 1;

    const nuevaReserva = { id: nuevoId, ...datos };

    reservas.push(nuevaReserva);

    return nuevaReserva;
  }

  return { listar, contar, buscarPorId, crear };
}

module.exports = { crearServicioReservas };
