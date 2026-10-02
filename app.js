const titular = "Unai Pescador";
let saldoInicial = 85.5;
const simboloMoneda = "€";

const movimientos = [
  {
    id: 1,
    concepto: "Nómina",
    importe: 1500,
    categoria: "Ingreso",
    fecha: "2026-09-01"
  },
  {
    id: 2,
    concepto: "Supermercado",
    importe: -240.75,
    categoria: "Gasto",
    fecha: "2026-09-03"
  },
  {
    id: 3,
    concepto: "Freelance",
    importe: 350,
    categoria: "Ingreso",
    fecha: "2026-09-05"
  },
  {
    id: 4,
    concepto: "Gasolina",
    importe: -85.2,
    categoria: "Gasto",
    fecha: "2026-09-07"
  },
  {
    id: 5,
    concepto: "Streaming",
    importe: -14.99,
    categoria: "Gasto",
    fecha: "2026-09-10"
  },
  {
    id: 6,
    concepto: "Regalo",
    importe: -50,
    categoria: "Gasto",
    fecha: "2026-09-12"
  }
];

function formatearDinero(cantidad) {
  return `${cantidad.toFixed(2).replace(".", ",")} ${simboloMoneda}`;
}

function totalIngresos() {
  let total = 0;

  for (const movimiento of movimientos) {
    if (movimiento.importe > 0) {
      total += movimiento.importe;
    }
  }

  return total;
}

function totalGastos() {
  let total = 0;

  for (const movimiento of movimientos) {
    if (movimiento.importe < 0) {
      total += movimiento.importe;
    }
  }

  return total;
}

function saldoActual() {
  return saldoInicial + totalIngresos() + totalGastos();
}

function totalGastadoReduce() {
  return movimientos.reduce((total, movimiento) => {
    if (movimiento.importe < 0) {
      return total + Math.abs(movimiento.importe);
    }
    return total;
  }, 0);
}

function gastosPorCategoria() {
  return movimientos.reduce((acumulador, movimiento) => {
    if (movimiento.importe < 0) {
      const categoria = movimiento.categoria;
      acumulador[categoria] = (acumulador[categoria] || 0) + Math.abs(movimiento.importe);
    }
    return acumulador;
  }, {});
}

function categoriaMasGastada() {
  const gastos = gastosPorCategoria();

  return Object.entries(gastos).reduce(
    (maximo, [categoria, total]) => {
      if (total > maximo.total) {
        return { categoria, total };
      }
      return maximo;
    },
    { categoria: "Ninguna", total: 0 }
  );
}

function pintarEstadisticas() {
  const totalGastadoElemento = document.getElementById("total-gastado");
  const categoriaMasGastadaElemento = document.getElementById("categoria-mas-gastada");
  const listaGastosCategoria = document.getElementById("lista-gastos-categoria");

  if (!totalGastadoElemento || !categoriaMasGastadaElemento || !listaGastosCategoria) return;

  const totalGastado = totalGastadoReduce();
  const categoriaTop = categoriaMasGastada();
  const gastos = gastosPorCategoria();

  totalGastadoElemento.textContent = formatearDinero(totalGastado);
  categoriaMasGastadaElemento.textContent = `${categoriaTop.categoria} (${formatearDinero(categoriaTop.total)})`;

  listaGastosCategoria.innerHTML = "";

  Object.entries(gastos).forEach(([categoria, total]) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${categoria}</span><strong>${formatearDinero(total)}</strong>`;
    listaGastosCategoria.appendChild(item);
  });
}

function pintarMovimientos() {
  const cuerpoTabla = document.getElementById("tabla-movimientos-body");
  const filtro = document.getElementById("filtro-categoria");

  if (!cuerpoTabla || !filtro) return;

  const categoriaSeleccionada = filtro.value;

  const movimientosFiltrados = movimientos.filter((movimiento) => {
    return categoriaSeleccionada === "Todos" || movimiento.categoria === categoriaSeleccionada;
  });

  cuerpoTabla.innerHTML = "";

  movimientosFiltrados.forEach((movimiento) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${movimiento.concepto}</td>
      <td>${movimiento.categoria}</td>
      <td>${movimiento.fecha}</td>
      <td class="${movimiento.importe >= 0 ? "positivo" : "negativo"}">${formatearDinero(movimiento.importe)}</td>
      <td><button type="button" class="btn-borrar" data-id="${movimiento.id}">Borrar</button></td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

function refrescar() {
  pintarMovimientos();
  pintarEstadisticas();

  const saldoElemento = document.getElementById("saldo");
  if (saldoElemento) {
    saldoElemento.textContent = formatearDinero(saldoActual());
  }
}

if (typeof document !== "undefined") {
  document.getElementById("titular").textContent = titular;
  document.getElementById("moneda").textContent = simboloMoneda;

  const filtro = document.getElementById("filtro-categoria");
  const formulario = document.getElementById("form-movimiento");
  const cuerpoTabla = document.getElementById("tabla-movimientos-body");

  filtro.addEventListener("change", pintarMovimientos);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const concepto = document.getElementById("concepto").value.trim();
    const importeValor = Number(document.getElementById("importe").value);
    const categoria = document.getElementById("categoria-nueva").value;

    if (!concepto || Number.isNaN(importeValor)) {
      alert("Debes introducir un concepto y un importe válido.");
      return;
    }

    const importe = categoria === "Gasto" ? -Math.abs(importeValor) : Math.abs(importeValor);

    movimientos.push({
      id: Date.now(),
      concepto,
      importe,
      categoria,
      fecha: new Date().toISOString().slice(0, 10)
    });

    formulario.reset();
    refrescar();
  });

  cuerpoTabla.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".btn-borrar");

    if (!boton) return;

    const idMovimiento = Number(boton.dataset.id);
    const indice = movimientos.findIndex((movimiento) => movimiento.id === idMovimiento);

    if (indice !== -1) {
      movimientos.splice(indice, 1);
      refrescar();
    }
  });

  refrescar();
}

console.log("Ingresos:", formatearDinero(totalIngresos()));
console.log("Gastos:", formatearDinero(totalGastos()));
console.log("Total gastado con reduce:", formatearDinero(totalGastadoReduce()));
console.log("Gastos por categoría:", gastosPorCategoria());
console.log("Categoría con más gasto:", categoriaMasGastada());
console.log("Saldo actual:", formatearDinero(saldoActual()));
console.log(movimientos);
