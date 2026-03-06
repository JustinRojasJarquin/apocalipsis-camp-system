import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
app.get("/ejemplo", (req, res) => {
=======
app.get("/api", (req, res) => {
>>>>>>> fbbd93d4b2958c39283f26cff89207744966139c
  res.json({
    status: "Correcto",
    message: "Ejecutando en TypeScript",
  });
});


export default app;
