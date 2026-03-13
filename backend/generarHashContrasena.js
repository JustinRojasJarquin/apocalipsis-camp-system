const bcrypt = require("bcrypt");

async function generar() {
  const hash = await bcrypt.hash("UNA2026", 10);
  console.log(hash);
}

generar();