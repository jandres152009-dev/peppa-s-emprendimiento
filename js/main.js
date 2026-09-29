// 1. DATOS -------------------------------------------------------------
// Número de WhatsApp con código de país y sin "+" ni espacios (Colombia = 57)
const NUMERO_WHATSAPP = "573193133369";

// Precios en pesos. Los bolis tienen precio fijo; el hielo tiene dos tamaños.
const PRECIOS_BOLI = [2500];
const PRECIOS_HIELO = [500, 1000];

const productos = [
  { grupo: "bolis", id: "cola-leche", nombre: "Boli de cola con leche", color: "#5b3a29", precios: PRECIOS_BOLI },
  { grupo: "bolis", id: "galleta",    nombre: "Boli de galleta",        color: "#8a6d3b", precios: PRECIOS_BOLI },
  { grupo: "bolis", id: "coco",       nombre: "Boli de coco",           color: "#64748b", precios: PRECIOS_BOLI },
  { grupo: "bolis", id: "maracuya",   nombre: "Boli de maracuyá",       color: "#b45309", precios: PRECIOS_BOLI },
  { grupo: "bolis", id: "limon",      nombre: "Boli de limón",          color: "#4d7c0f", precios: PRECIOS_BOLI },
  { grupo: "bolis", id: "mora",       nombre: "Boli de mora",           color: "#7a1f5c", precios: PRECIOS_BOLI },
  { grupo: "hielo", id: "hielo",      nombre: "Bolsa de hielo",         color: "#1d8fc4", precios: PRECIOS_HIELO }
];

const cantidades = {}; // ejemplo: { "mora-2500": 2, "hielo-500": 1 }

const formato = (n) =>
  n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

// 2. PINTAR LAS TARJETAS ------------------------------------------------
function pintarProductos() {
  ["bolis", "hielo"].forEach((grupo) => {
    const contenedor = document.getElementById("lista-" + grupo);
    contenedor.innerHTML = productos
      .filter((p) => p.grupo === grupo)
      .map((p) => `
        <article class="tarjeta" style="--color:${p.color}">
          <h3>${p.nombre}</h3>
          ${p.precios.map((precio) => {
            const clave = p.id + "-" + precio;
            return `
            <div class="fila">
              <span class="precio">${formato(precio)}</span>
              <div class="cantidad">
                <button type="button" data-clave="${clave}" data-accion="quitar" aria-label="Quitar ${p.nombre} de ${formato(precio)}">−</button>
                <span id="cant-${clave}">0</span>
                <button type="button" data-clave="${clave}" data-accion="agregar" aria-label="Agregar ${p.nombre} de ${formato(precio)}">+</button>
              </div>
            </div>`;
          }).join("")}
        </article>
      `).join("");
  });
}

// 3. ACTUALIZAR EL PEDIDO -----------------------------------------------
function actualizar() {
  let total = 0;
  const lineas = [];

  productos.forEach((p) => {
    p.precios.forEach((precio) => {
      const clave = p.id + "-" + precio;
      const c = cantidades[clave] || 0;
      document.getElementById("cant-" + clave).textContent = c;
      if (c > 0) {
        total += c * precio;
        lineas.push({ texto: `${c} x ${p.nombre} (${formato(precio)})`, subtotal: c * precio });
      }
    });
  });

  document.getElementById("resumen").innerHTML = lineas.length
    ? lineas.map((l) => `<li><span>${l.texto}</span><span>${formato(l.subtotal)}</span></li>`).join("")
    : "<li>Aún no has agregado nada. Escoge algo arriba.</li>";

  document.getElementById("total").textContent = "Total: " + formato(total);

  const enviar = document.getElementById("enviar");
  if (total > 0) {
    const mensaje =
      "Hola, quiero hacer este pedido:\n" +
      lineas.map((l) => "- " + l.texto).join("\n") +
      "\nTotal: " + formato(total);
    enviar.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    enviar.removeAttribute("aria-disabled");
  } else {
    enviar.href = "#pedido";
    enviar.setAttribute("aria-disabled", "true");
  }
}

// 4. NAVEGACIÓN ENTRE BOLIS Y HIELO -------------------------------------
function mostrarPanel(nombre) {
  document.querySelectorAll(".panel").forEach((p) => {
    p.hidden = p.id !== "panel-" + nombre;
  });
  document.querySelectorAll(".tab").forEach((t) => {
    const activo = t.dataset.ir === nombre;
    t.classList.toggle("activo", activo);
    t.setAttribute("aria-pressed", activo);
  });
}

document.querySelectorAll("[data-ir]").forEach((boton) => {
  boton.addEventListener("click", () => {
    mostrarPanel(boton.dataset.ir);
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("menu").scrollIntoView({ behavior: reducir ? "auto" : "smooth" });
  });
});

// 5. BOTONES + Y − ------------------------------------------------------
document.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-clave]");
  if (!boton) return;

  const { clave, accion } = boton.dataset;
  const actual = cantidades[clave] || 0;
  cantidades[clave] = accion === "agregar" ? actual + 1 : Math.max(0, actual - 1);
  actualizar();
});

pintarProductos();
actualizar();