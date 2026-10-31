const dns = require("node:dns");
const mongoose = require("mongoose");

const { leerUriMongo } = require("./entorno");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function conectar(uri = leerUriMongo()) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  return mongoose.connection;
}

async function desconectar() {
  await mongoose.disconnect();
}

module.exports = { conectar, desconectar };
