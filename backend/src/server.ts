import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(` Escuchando en el puerto http://localhost:${PORT}`);
});