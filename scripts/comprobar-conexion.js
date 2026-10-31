const { conectar, desconectar } = require("../src/config/base-datos");
const { leerUriMongo } = require("../src/config/entorno");

const CODIGOS_DNS = [
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEOUT",
  "ESERVFAIL",
  "EAI_AGAIN",
];

function ocultarUri(texto) {
  return String(texto).replace(/mongodb(\+srv)?:\/\/\S+/g, "[URI oculta]");
}

function buscarCausas(error) {
  const causas = [];
  let actual = error;

  while (actual && causas.length < 5) {
    causas.push(actual);
    actual = actual.cause;
  }

  return causas;
}

function diagnosticar(error) {
  const causas = buscarCausas(error);

  const dns = causas.find((causa) => CODIGOS_DNS.includes(causa.code));

  if (dns) {
    return {
      tipo: "DNS",
      nombre: dns.name,
      codigo: dns.code,
      operacion: dns.syscall || "desconocida",
    };
  }

  const autenticacion = causas.find(
    (causa) =>
      causa.codeName === "AuthenticationFailed" ||
      causa.code === 18 ||
      /bad auth|authentication failed/i.test(causa.message || ""),
  );

  if (autenticacion) {
    return {
      tipo: "autenticación",
      nombre: autenticacion.name,
      codigo: autenticacion.code ?? "sin código",
      operacion: "login",
    };
  }

  return {
    tipo: "servidor o red",
    nombre: error.name,
    codigo: error.code ?? "sin código",
    operacion: "selección de servidor",
  };
}

async function main() {
  let etapa = "configuración";

  try {
    const uri = leerUriMongo();

    etapa = "conexión";
    const conexion = await conectar(uri);

    console.log(`Conexión exitosa a la base "${conexion.name}".`);
  } catch (error) {
    process.exitCode = 1;

    if (etapa === "configuración") {
      console.error(`Fallo de configuración: ${ocultarUri(error.message)}`);
    } else {
      const d = diagnosticar(error);

      console.error(`Fallo de ${d.tipo}.`);
      console.error(`  Error: ${d.nombre}`);
      console.error(`  Código: ${d.codigo}`);
      console.error(`  Operación: ${d.operacion}`);
    }
  } finally {
    await desconectar();
  }
}

main();
