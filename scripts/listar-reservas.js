const { conectar, desconectar } = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

async function main() {
  try {
    await conectar();

    const reservas = await Reserva.find();

    console.log(`Reservas recuperadas: ${reservas.length}`);

    for (const reserva of reservas) {
      console.log(
        `  ${reserva._id.toString()} | ${reserva.estudiante} | ${reserva.sala} | ${reserva.fecha} | ${reserva.turno} | ${reserva.personas} personas`,
      );
    }
  } catch (error) {
    process.exitCode = 1;
    console.error(`No se pudo consultar las reservas (${error.name}).`);
  } finally {
    await desconectar();
  }
}

main();
