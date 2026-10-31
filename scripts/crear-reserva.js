const { conectar, desconectar } = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

const reservaEjemplo = {
  estudiante: "Ana Ficticia",
  email: "ana.ficticia@example.com",
  sala: "Sala Norte",
  fecha: "2026-11-10",
  turno: "Tarde",
  personas: 3,
};

async function main() {
  try {
    await conectar();

    const reserva = new Reserva(reservaEjemplo);
    const guardada = await reserva.save();

    console.log("Reserva guardada correctamente.");
    console.log(`  _id: ${guardada._id.toString()}`);
    console.log(
      `  ${guardada.estudiante} - ${guardada.sala} - ${guardada.fecha} - ${guardada.turno} - ${guardada.personas} personas`,
    );
  } catch (error) {
    process.exitCode = 1;

    if (error.name === "ValidationError") {
      console.error("Reserva rechazada: no cumple las reglas del modelo.");
      console.error(
        `  Campos a revisar: ${Object.keys(error.errors).join(", ")}`,
      );

      for (const campo of Object.values(error.errors)) {
        console.error(`  - ${campo.path}: ${campo.message}`);
      }
    } else if (error.name === "CastError") {
      console.error(
        "Reserva rechazada: un valor no se pudo convertir al tipo del campo.",
      );
      console.error(`  Campo a revisar: ${error.path}`);
    } else {
      console.error(`No se pudo guardar la reserva (${error.name}).`);
    }
  } finally {
    await desconectar();
  }
}

main();
