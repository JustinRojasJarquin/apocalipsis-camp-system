const bcrypt = require("bcrypt");

async function generar() {
  const hash = await bcrypt.hash("UNA2026", 10);
  console.log(hash);
}

generar();
//Ya no se necesita este archivo, se utilizo como prueba para crear e hash de una contraseña