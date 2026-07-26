// =============================================
// CYBERSENTINEL — Lógica de simulación
// =============================================

// 1. Estado global del sistema

let contadorAtaques   = 0;
let contadorIPs       = 0;
let contadorIntrusos  = 0;
let hayAtaqueCritico  = false;


// 2. Base de datos de ataques simulados
const ATAQUES = [
    { tipo:"CRÍTICO", msg:"Inyección SQL detectada",        ip:"185.23.4.1",    pais:"Rusia",          clase:"log-critico" },
    { tipo:"CRÍTICO", msg:"Ataque DDoS en curso",           ip:"91.108.4.15",   pais:"Ucrania",        clase:"log-critico" },
    { tipo:"CRÍTICO", msg:"Escalada de privilegios",        ip:"103.21.244.0",  pais:"China",          clase:"log-critico" },
    { tipo:"ALERTA",  msg:"Fuerza bruta SSH detectada",     ip:"122.11.23.45",  pais:"China",          clase:"log-alerta"  },
    { tipo:"ALERTA",  msg:"Escaneo de puertos detectado",   ip:"45.33.32.156",  pais:"EEUU",           clase:"log-alerta"  },
    { tipo:"ALERTA",  msg:"Intento de acceso no autorizado",ip:"77.88.55.66",   pais:"Alemania",       clase:"log-alerta"  },
    { tipo:"INFO",    msg:"Tráfico sospechoso analizado",   ip:"198.41.0.4",    pais:"Países Bajos",   clase:"log-info"    },
    { tipo:"INFO",    msg:"Firma de malware detectada",     ip:"8.8.8.8",       pais:"EEUU",           clase:"log-info"    },
];

// 3. Función para obtener la hora actual
function obtenerHora() {
    const ahora = new Date();
    const h = String(ahora.getHours()).padStart(2, "0");
    const m = String(ahora.getMinutes()).padStart(2, "0");
    const s = String(ahora.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

// 4. Función para agregar una línea a la consola
function agregarLog(ataque) {
    const consola = document.getElementById("consola-logs");

    // Crear la línea de log
    const linea = document.createElement("div");
    linea.className = `log-linea ${ataque.clase}`;
    linea.textContent = `[${obtenerHora()}] [${ataque.tipo}] ${ataque.msg} desde ${ataque.ip} [${ataque.pais}]`;

    // Agregar al inicio de la consola
    consola.prepend(linea);
}

// 5. Función para actualizar los contadores
function actualizarContadores(ataque) {
    contadorAtaques++;
    document.getElementById("contador-ataques").textContent = contadorAtaques;

    if (ataque.tipo === "CRÍTICO") {
        contadorIntrusos++;
        document.getElementById("contador-intrusos").textContent = contadorIntrusos;
    }
}

// 6. Función para actualizar el estado del sistema
function actualizarEstado(ataque) {
    const estado = document.getElementById("estado-sistema");

    if (ataque.tipo === "CRÍTICO") {
        hayAtaqueCritico = true;
        estado.textContent = "⚠ BAJO ATAQUE";
        estado.className = "estado ataque";
    }
}

// 7. Función para agregar IP al panel lateral
function agregarIP(ataque) {
    const lista = document.getElementById("lista-ips");

    // Verificar que la IP no esté ya en la lista
    const yaExiste = document.getElementById(`ip-${ataque.ip.replace(/\./g, "-")}`);
    if (yaExiste) return;

    const item = document.createElement("div");
    item.className = "ip-item";
    item.id = `ip-${ataque.ip.replace(/\./g, "-")}`;

    item.innerHTML = `
        <div>
            <div class="ip-direccion">${ataque.ip}</div>
            <div class="ip-detalle">${ataque.pais} · ${ataque.msg}</div>
        </div>
        <button class="btn-bloquear" onclick="bloquearIP(this, '${ataque.ip}')">
            Bloquear
        </button>
    `;

    lista.prepend(item);
}

// 8. Función para bloquear una IP
function bloquearIP(boton, ip) {
    const item = boton.parentElement;
    item.classList.add("ip-bloqueada");
    boton.textContent = "Bloqueada";
    boton.disabled = true;

    // Sumar al contador de IPs baneadas
    contadorIPs++;
    document.getElementById("contador-ips").textContent = contadorIPs;

    // Agregar log de confirmación
    const logFalso = {
        tipo: "INFO",
        msg: `IP ${ip} bloqueada exitosamente`,
        ip: ip,
        pais: "—",
        clase: "log-info"
    };
    agregarLog(logFalso);

    // Revisar si quedan ataques críticos activos
    const criticos = document.querySelectorAll(".ip-item:not(.ip-bloqueada)");
    if (criticos.length === 0) {
        hayAtaqueCritico = false;
        const estado = document.getElementById("estado-sistema");
        estado.textContent = "SISTEMA SEGURO";
        estado.className = "estado seguro";
    }
}

// 9. Función para limpiar la consola
function limpiarConsola() {
    document.getElementById("consola-logs").innerHTML = "";
}

// 10. Motor principal — genera un ataque aleatorio
function generarAtaque() {
    const indice = Math.floor(Math.random() * ATAQUES.length);
    const ataque = ATAQUES[indice];

    if (ataque.tipo === "CRÍTICO") {
        reproducirAlerta();
    }
    
    agregarLog(ataque);
    actualizarContadores(ataque);
    actualizarEstado(ataque);
    agregarIP(ataque);
    actualizarGrafico(ataque);
   
    fetch("http://localhost:3000/ataques", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        tipo:    ataque.tipo,
        mensaje: ataque.msg,
        ip:      ataque.ip,
        pais:    ataque.pais
    })
});
}



function reproducirAlerta() {
    const contexto = new AudioContext();
    const oscilador = contexto.createOscillator();
    const volumen = contexto.createGain();

    oscilador.connect(volumen);
    volumen.connect(contexto.destination);

    oscilador.frequency.value = 880;
    oscilador.type = "square";

    volumen.gain.setValueAtTime(0.3, contexto.currentTime);
    volumen.gain.exponentialRampToValueAtTime(0.001, contexto.currentTime + 0.5);

    oscilador.start(contexto.currentTime);
    oscilador.stop(contexto.currentTime + 0.5);
}
function pausarReanudar() {
    const btn = document.getElementById("btn-pausa");

    if (intervalo) {
        // Está corriendo → pausar
        clearInterval(intervalo);
        intervalo = null;
        btn.textContent = "▶ Reanudar";
    } else {
        // Está pausado → reanudar
        intervalo = setInterval(generarAtaque, 4000);
        btn.textContent = "⏸ Pausar";
    }
}

const datosGrafico = {
    criticos: 0,
    alertas: 0,
    info: 0
};
const ctx = document.getElementById("grafico-ataques").getContext("2d");
const grafico = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["CRÍTICO", "ALERTA", "INFO"],
        datasets: [{
            label: "Eventos detectados",
            data: [0, 0, 0],
            backgroundColor: [
                "rgba(255, 51, 51, 0.7)",
                "rgba(255, 214, 0, 0.7)",
                "rgba(0, 255, 136, 0.7)"
            ],
            borderColor: [
                "#ff3333",
                "#ffd600",
                "#00ff88"
            ],
            borderWidth: 1,
            borderRadius: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: { color: "#c8c8c8", font: { family: "Courier New" } },
                grid:  { color: "#2a2a2a" }
            },
            y: {
                ticks: { color: "#c8c8c8", font: { family: "Courier New" } },
                grid:  { color: "#2a2a2a" },
                beginAtZero: true
            }
        }
    }
});


function actualizarGrafico(ataque) {
    if (ataque.tipo === "CRÍTICO") datosGrafico.criticos++;
    if (ataque.tipo === "ALERTA")  datosGrafico.alertas++;
    if (ataque.tipo === "INFO")    datosGrafico.info++;

    grafico.data.datasets[0].data = [
        datosGrafico.criticos,
        datosGrafico.alertas,
        datosGrafico.info
    ];
    grafico.update();
}
// 11. Arrancar la simulación
// Genera un ataque inmediatamente al cargar

generarAtaque();

let intervalo = setInterval(generarAtaque, 4000);


    



