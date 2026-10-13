const botones = document.querySelectorAll("[data-page]");
const pantallaPunto = document.getElementById("pantalla-punto");
const formulario = document.getElementById("form-visita");
const fechaInput = document.getElementById("fecha-visita");
const entradaInput = document.getElementById("entrada");
const salidaInput = document.getElementById("salida");
const totalHoras = document.getElementById("total-horas");
const mensaje = document.getElementById("mensaje-visita");

function mostrarPantalla(pagina) {
  const pantallaInicio = document.getElementById("pantalla-inicio");
  const pantallaPunto = document.getElementById("pantalla-punto");
  const pantallaHistorial = document.getElementById("pantalla-historial");
  const pantallaProductos = document.getElementById("pantalla-productos");
  const pantallaActividades = document.getElementById("pantalla-actividades");
  const encabezado = document.querySelector(".header");

  if (
    !pantallaInicio ||
    !pantallaPunto ||
    !pantallaHistorial ||
    !pantallaProductos ||
    !pantallaActividades ||
    !encabezado
  ) {
    console.error("Falta una pantalla en index.html.");
    return;
  }

  pantallaInicio.hidden = pagina !== "inicio";
  pantallaPunto.hidden = pagina !== "punto";
  pantallaHistorial.hidden = pagina !== "historial";
  pantallaProductos.hidden = pagina !== "productos";
  pantallaActividades.hidden = pagina !== "actividades";
  encabezado.hidden = pagina !== "inicio";

  document.querySelectorAll(".nav-item").forEach((boton) => {
    boton.classList.toggle("active", boton.dataset.page === pagina);
  });

  if (pagina === "punto") {
    fechaInput.value ||= obtenerFechaLocal();
    actualizarHoras();
  }

  if (pagina === "historial") {
    mostrarHistorial();
  }

  if (pagina === "productos") {
    mostrarProductos();
  }

  if (pagina === "actividades") {
    mostrarActividades();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function obtenerFechaLocal() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

botones.forEach((boton) => {
  boton.addEventListener("click", () => {
    const pagina = boton.dataset.page;

    if (["inicio", "punto", "historial", "productos", "actividades"].includes(pagina)) {
      mostrarPantalla(pagina);
    } else {
      alert("Esta pantalla la construiremos en el siguiente paso.");
    }
  });
});

function actualizarHoras() {
  if (!entradaInput.value || !salidaInput.value) {
    totalHoras.textContent = "0 h 0 min";
    return;
  }

  const [horaEntrada, minEntrada] = entradaInput.value.split(":").map(Number);
  const [horaSalida, minSalida] = salidaInput.value.split(":").map(Number);

  let minutos = horaSalida * 60 + minSalida -
                (horaEntrada * 60 + minEntrada);

  // Si la salida es al día siguiente, contempla el cambio de medianoche.
  if (minutos < 0) minutos += 24 * 60;

  const horas = Math.floor(minutos / 60);
  const restantes = minutos % 60;

  totalHoras.textContent = `${horas} h ${restantes} min`;
}

entradaInput.addEventListener("input", actualizarHoras);
salidaInput.addEventListener("input", actualizarHoras);

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const visita = {
    id: Date.now(),
    tienda: document.getElementById("tienda").value.trim(),
    fecha: fechaInput.value,
    entrada: entradaInput.value,
    salida: salidaInput.value,
    horas: totalHoras.textContent,
    observaciones: document.getElementById("nota-visita").value.trim()
  };

  if (salidaInput.value === entradaInput.value) {
    mensaje.textContent = "Revisa las horas: entrada y salida son iguales.";
    return;
  }

  const visitas = JSON.parse(localStorage.getItem("visitas") || "[]");
  visitas.push(visita);
  localStorage.setItem("visitas", JSON.stringify(visitas));

  mensaje.textContent = "¡Visita guardada correctamente!";

  formulario.reset();
  fechaInput.value = obtenerFechaLocal();
  totalHoras.textContent = "0 h 0 min";
});

document.getElementById("fecha").textContent =
  new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

fechaInput.value = obtenerFechaLocal();

function mostrarHistorial() {
  const lista = document.getElementById("lista-historial");
  const visitas = JSON.parse(localStorage.getItem("visitas") || "[]");

  if (visitas.length === 0) {
    lista.innerHTML = `
      <div class="tip-card">
        <div>
          <strong>Aún no tienes visitas</strong>
          <p>Cuando guardes una visita, aparecerá aquí.</p>
        </div>
      </div>
    `;
    return;
  }

  const totalMinutos = visitas.reduce((total, visita) => {
    const [horas, minutos] = visita.horas
      .replace(" h ", ":")
      .replace(" min", "")
      .split(":")
      .map(Number);

    return total + horas * 60 + minutos;
  }, 0);

  const horasTotales = Math.floor(totalMinutos / 60);
  const minutosRestantes = totalMinutos % 60;

  lista.innerHTML = `
    <div class="hours-card">
      <span>Total de tiempo registrado</span>
      <strong>${horasTotales} h ${minutosRestantes} min</strong>
    </div>

    ${[...visitas].reverse().map(visita => `
      <article class="tip-card">
        <div>
          <strong>${escaparHTML(visita.tienda)}</strong>
          <p>Fecha: ${escaparHTML(visita.fecha)}</p>
          <p>Entrada: ${escaparHTML(visita.entrada)} · Salida: ${escaparHTML(visita.salida)}</p>
          <p>Tiempo trabajado: ${escaparHTML(visita.horas)}</p>
          ${visita.observaciones
            ? `<p>Observaciones: ${escaparHTML(visita.observaciones)}</p>`
            : ""}
        </div>
      </article>
    `).join("")}
  `;
}

function escaparHTML(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caracter]);
}

const formularioProducto = document.getElementById("form-producto");
const buscarProducto = document.getElementById("buscar-producto");
const listaProductos = document.getElementById("lista-productos");
const mensajeProducto = document.getElementById("mensaje-producto");

function obtenerProductos() {
  return JSON.parse(localStorage.getItem("productos") || "[]");
}

function mostrarProductos() {
  const buscar = document.getElementById("buscar-producto");
  const filtro = document.getElementById("filtro-categoria");
  const lista = document.getElementById("lista-productos");

  if (!buscar || !filtro || !lista) return;

  const busqueda = buscar.value.trim().toLowerCase();
  const categoriaSeleccionada = filtro.value;

  const productos = obtenerProductos().filter((producto) => {
    const coincideCategoria =
      !categoriaSeleccionada ||
      producto.categoria === categoriaSeleccionada;

    const coincideBusqueda = [
      producto.nombre,
      producto.marca,
      producto.presentacion,
      producto.codigo
    ].some((dato) =>
      String(dato || "").toLowerCase().includes(busqueda)
    );

    return coincideCategoria && coincideBusqueda &&
      producto.activo !== false;
  });

  if (productos.length === 0) {
    lista.innerHTML = `
      <div class="tip-card">
        <div>
          <strong>No hay productos en esta categoría</strong>
          <p>Prueba otra categoría o cambia la búsqueda.</p>
        </div>
      </div>
    `;
    return;
  }

  lista.innerHTML = productos.map((producto) => `
    <article class="tip-card">
      <div>
        <strong>${escaparHTML(producto.nombre)}</strong>
        <p>Categoría: ${escaparHTML(producto.categoria || "Sin categoría")}</p>
        <p>Marca: ${escaparHTML(producto.marca || "Sin marca")}</p>
        <p>Presentación: ${escaparHTML(producto.presentacion || "No especificada")}</p>
        ${producto.codigo
          ? `<p>Código: ${escaparHTML(producto.codigo)}</p>`
          : ""}
        <button
          type="button"
          class="back-button"
          data-eliminar-producto="${escaparHTML(producto.id)}"
        >
          Eliminar producto
        </button>
      </div>
    </article>
  `).join("");
}

formularioProducto.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const producto = {
    id: Date.now().toString(),
    nombre: document.getElementById("nombre-producto").value.trim(),
    marca: document.getElementById("marca-producto").value.trim(),
    presentacion: document.getElementById("presentacion-producto").value.trim(),
    codigo: document.getElementById("codigo-producto").value.trim()
  };

  if (!producto.nombre || !producto.marca) {
    mensajeProducto.textContent = "Escribe el nombre y la marca.";
    return;
  }

  const productos = obtenerProductos();
  productos.push(producto);
  localStorage.setItem("productos", JSON.stringify(productos));

  formularioProducto.reset();
  mensajeProducto.textContent = "¡Producto guardado correctamente!";
  mostrarProductos();
});

buscarProducto.addEventListener("input", mostrarProductos);

listaProductos.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-eliminar-producto]");
  if (!boton) return;

  const productos = obtenerProductos().filter(
    (producto) => producto.id !== boton.dataset.eliminarProducto
  );

  localStorage.setItem("productos", JSON.stringify(productos));
  mostrarProductos();
});

const archivoCatalogo = document.getElementById("archivo-catalogo");
const mensajeImportacion = document.getElementById("mensaje-importacion");
const filtroCategoria = document.getElementById("filtro-categoria");

if (archivoCatalogo) {
  archivoCatalogo.addEventListener("change", async () => {
    const archivo = archivoCatalogo.files[0];

    if (!archivo) return;

    if (typeof XLSX === "undefined") {
      mensajeImportacion.textContent =
        "No se pudo cargar la biblioteca de Excel. Revisa tu conexión a internet.";
      return;
    }

    try {
      const datos = await archivo.arrayBuffer();
      const libro = XLSX.read(datos, { type: "array" });

      const hojaProductos = libro.Sheets["Productos"];
      const hojaReglas = libro.Sheets["Reglas de exhibición"];
      const hojaCategorias = libro.Sheets["Categorías"];

      if (!hojaProductos || !hojaReglas || !hojaCategorias) {
        throw new Error(
          "El Excel debe contener las hojas Productos, Reglas de exhibición y Categorías."
        );
      }

      const productosExcel = XLSX.utils.sheet_to_json(hojaProductos, {
        defval: ""
      });

      const reglasExcel = XLSX.utils.sheet_to_json(hojaReglas, {
        defval: ""
      });

      const categoriasExcel = XLSX.utils.sheet_to_json(hojaCategorias, {
        defval: ""
      });

      const normalizar = (valor) =>
        String(valor ?? "").trim().toLowerCase();

      const productos = productosExcel
        .filter((fila) => fila.id && fila.nombre)
        .map((fila) => ({
          id: String(fila.id).trim(),
          categoria: String(fila.categoria ?? "").trim(),
          marca: String(fila.marca ?? "").trim(),
          nombre: String(fila.nombre).trim(),
          presentacion: String(fila.presentacion ?? "").trim(),
          codigo: String(fila.codigo_barras ?? "").trim(),
          imagen: String(fila.imagen ?? "").trim(),
          activo: normalizar(fila.activo) !== "no"
        }));

      if (productos.length === 0) {
        throw new Error(
          "No se encontraron productos. Revisa los encabezados de la hoja Productos."
        );
      }

      const reglas = reglasExcel.map((fila) => ({
        ...fila
      }));

      const categorias = categoriasExcel
        .map((fila) => ({
          id: String(fila.id_categoria ?? "").trim(),
          nombre: String(fila.nombre_categoria ?? "").trim(),
          orden: Number(fila.orden) || 999,
          descripcion: String(fila.descripcion ?? "").trim()
        }))
        .filter((categoria) => categoria.nombre);

      localStorage.setItem("productos", JSON.stringify(productos));
      localStorage.setItem("reglasExhibicion", JSON.stringify(reglas));
      localStorage.setItem("categorias", JSON.stringify(categorias));

      actualizarFiltroCategorias();
      mostrarProductos();

      mensajeImportacion.textContent =
        `Importación correcta: ${productos.length} productos, ` +
        `${reglas.length} reglas y ${categorias.length} categorías.`;
    } catch (error) {
      console.error("Error al importar el catálogo:", error);
      mensajeImportacion.textContent =
        "No se pudo importar el archivo: " + error.message;
    } finally {
      archivoCatalogo.value = "";
    }
  });
}

function actualizarFiltroCategorias() {
  if (!filtroCategoria) return;

  const categoriaActual = filtroCategoria.value;
  const categorias = JSON.parse(
    localStorage.getItem("categorias") || "[]"
  );

  filtroCategoria.innerHTML =
    '<option value="">Todas las categorías</option>';

  categorias
    .sort((a, b) => a.orden - b.orden)
    .forEach((categoria) => {
      const opcion = document.createElement("option");
      opcion.value = categoria.nombre;
      opcion.textContent = categoria.nombre;
      filtroCategoria.appendChild(opcion);
    });

  if (categorias.some((categoria) => categoria.nombre === categoriaActual)) {
    filtroCategoria.value = categoriaActual;
  }
}

if (filtroCategoria) {
  filtroCategoria.addEventListener("change", mostrarProductos);
}

const formularioActividad = document.getElementById("form-actividad");
const listaActividades = document.getElementById("lista-actividades");
const mensajeActividad = document.getElementById("mensaje-actividad");
const fechaActividad = document.getElementById("fecha-actividad");

if (fechaActividad) {
  fechaActividad.value = obtenerFechaLocal();
}

function obtenerActividades() {
  return JSON.parse(localStorage.getItem("actividades") || "[]");
}

function mostrarActividades() {
  if (!listaActividades) return;

  const actividades = obtenerActividades();

  if (actividades.length === 0) {
    listaActividades.innerHTML = `
      <div class="tip-card">
        <div>
          <strong>Aún no tienes actividades</strong>
          <p>Las actividades que guardes aparecerán aquí.</p>
        </div>
      </div>
    `;
    return;
  }

  listaActividades.innerHTML = [...actividades].reverse().map((actividad) => `
    <article class="tip-card">
      <div>
        <strong>${escaparHTML(
          Array.isArray(actividad.tipos)
            ? actividad.tipos.join(", ")
            : actividad.tipo || "Actividad"
        )}</strong>
        <p>Tienda: ${escaparHTML(actividad.tienda)}</p>
        <p>Fecha: ${escaparHTML(actividad.fecha)}</p>
        ${actividad.observaciones
          ? `<p>Observaciones: ${escaparHTML(actividad.observaciones)}</p>`
          : ""}
        <button
          type="button"
          class="back-button"
          data-eliminar-actividad="${actividad.id}"
        >
          Eliminar actividad
        </button>
      </div>
    </article>
  `).join("");
}

if (formularioActividad) {
  formularioActividad.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const tiposSeleccionados = [
      ...document.querySelectorAll('input[name="tipo-actividad"]:checked')
    ].map((casilla) => casilla.value);

    if (tiposSeleccionados.length === 0) {
      mensajeActividad.textContent = "Selecciona al menos una actividad.";
      return;
    }

    const actividad = {
      id: Date.now().toString(),
      tienda: document.getElementById("tienda-actividad").value.trim(),
      fecha: fechaActividad.value,
      tipos: tiposSeleccionados,
      observaciones: document.getElementById("nota-actividad").value.trim()
    };

    const actividades = obtenerActividades();
    actividades.push(actividad);

    localStorage.setItem("actividades", JSON.stringify(actividades));

    formularioActividad.reset();
    fechaActividad.value = obtenerFechaLocal();

    mensajeActividad.textContent = "¡Actividad guardada correctamente!";
    mostrarActividades();
  });
}

if (listaActividades) {
  listaActividades.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-eliminar-actividad]");
    if (!boton) return;

    const actividades = obtenerActividades().filter(
      (actividad) => actividad.id !== boton.dataset.eliminarActividad
    );

    localStorage.setItem("actividades", JSON.stringify(actividades));
    mostrarActividades();
  });
}

const nuevaActividadInput = document.getElementById("nueva-actividad");
const agregarActividadBtn = document.getElementById("agregar-actividad");
const actividadesPersonalizadas = document.getElementById("actividades-personalizadas");

if (agregarActividadBtn) {
  agregarActividadBtn.addEventListener("click", () => {
    const nombre = nuevaActividadInput.value.trim();

    if (!nombre) {
      nuevaActividadInput.focus();
      return;
    }

    const duplicada = [
      ...document.querySelectorAll('input[name="tipo-actividad"]')
    ].some((casilla) => casilla.value.toLowerCase() === nombre.toLowerCase());

    if (duplicada) {
      alert("Esa actividad ya existe en la lista.");
      return;
    }

    const etiqueta = document.createElement("label");
    etiqueta.className = "actividad-opcion-personalizada";

    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.name = "tipo-actividad";
    casilla.value = nombre;
    casilla.checked = true;

    etiqueta.append(casilla, document.createTextNode(" " + nombre));
    actividadesPersonalizadas.appendChild(etiqueta);

    nuevaActividadInput.value = "";
    nuevaActividadInput.focus();
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {
        console.log("Mi Jornada está preparada para funcionar sin conexión.");
      })
      .catch((error) => {
        console.error("Error al activar el funcionamiento sin conexión:", error);
      });
  });
}