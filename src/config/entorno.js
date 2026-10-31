function cargarConfiguracion(env = process.env) {
  const puerto = env.PORT === undefined ? 3000 : Number(env.PORT);

  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error(
      `PORT inválido: "${env.PORT}". Debe ser un entero entre 1 y 65535.`,
    );
  }

  const entorno = env.NODE_ENV || "development";
  const formatoRegistro = entorno === "production" ? "combined" : "dev";

  return { puerto, entorno, formatoRegistro };
}

function leerUriMongo(env = process.env) {
  const uri = (env.MONGODB_URI || "").trim();

  if (!uri) {
    throw new Error(
      "Falta la variable MONGODB_URI. Copiá .env.example a .env y completá los datos.",
    );
  }

  if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://")) {
    throw new Error(
      "MONGODB_URI tiene un prefijo incorrecto. Debe empezar con mongodb+srv:// o mongodb://.",
    );
  }

  return uri;
}

module.exports = { cargarConfiguracion, leerUriMongo };
