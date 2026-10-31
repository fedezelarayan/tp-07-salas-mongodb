const mongoose = require("mongoose");

const SALAS = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const TURNOS = ["Mañana", "Tarde", "Noche"];

const reservaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: String,
      required: [true, "El estudiante es obligatorio."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio."],
      trim: true,
      match: [/@/, "El email debe contener @."],
    },
    sala: {
      type: String,
      required: [true, "La sala es obligatoria."],
      enum: {
        values: SALAS,
        message: "La sala seleccionada no es válida.",
      },
    },
    fecha: {
      type: String,
      required: [true, "La fecha es obligatoria."],
      trim: true,
    },
    turno: {
      type: String,
      required: [true, "El turno es obligatorio."],
      enum: {
        values: TURNOS,
        message: "El turno seleccionado no es válido.",
      },
    },
    personas: {
      type: Number,
      required: [true, "La cantidad de personas es obligatoria."],
      min: [1, "Debe haber al menos 1 persona."],
      max: [6, "No pueden ser más de 6 personas."],
      validate: {
        validator: Number.isInteger,
        message: "La cantidad de personas debe ser un número entero.",
      },
    },
  },
  { collection: "reservas" },
);

const Reserva = mongoose.model("Reserva", reservaSchema);

module.exports = Reserva;
