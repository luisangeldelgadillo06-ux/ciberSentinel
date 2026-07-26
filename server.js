// =============================================
// CYBERSENTINEL — Servidor Backend
// =============================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

app.get("/",(req , res) => {
    res.json({ mensaje: "CyberSentinel API funcionando ✅"});

});

// ── RUTA 1: Guardar un ataque nuevo (POST) ──
app.post("/ataques", async (req, res) => {
    const { tipo, mensaje, ip, pais } = req.body;

    try {
        const resultado = await pool.query(
            "INSERT INTO ataques (tipo, mensaje, ip, pais) VALUES ($1, $2, $3, $4) RETURNING *",
            [tipo, mensaje, ip, pais]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al guardar el ataque" });
    }
});

// ── RUTA 2: Leer todos los ataques (GET) ──
app.get("/ataques", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM ataques ORDER BY fecha DESC LIMIT 50"
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener ataques" });
    }
});

// ── RUTA 3: Guardar una IP bloqueada (POST) ──
app.post("/ips-bloqueadas", async (req, res) => {
    const { ip, pais } = req.body;

    try {
        const resultado = await pool.query(
            "INSERT INTO ips_bloqueadas (ip, pais) VALUES ($1, $2) RETURNING *",
            [ip, pais]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al bloquear IP" });
    }
});

// ── RUTA 4: Leer todas las IPs bloqueadas (GET) ──
app.get("/ips-bloqueadas", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM ips_bloqueadas ORDER BY fecha_bloqueo DESC"
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener IPs bloqueadas" });
    }
});
const PUERTO = 3000;
app.listen(PUERTO, () => {
        console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});