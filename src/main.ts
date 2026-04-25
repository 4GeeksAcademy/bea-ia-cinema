type EstadoAsiento = 0 | 1;
type Sala = EstadoAsiento[][];
type PosicionAsiento = [number, number];
type TipoMensaje = "info" | "error" | "success";
type ParContiguo = [PosicionAsiento, PosicionAsiento];

const FILAS = 8;
const COLUMNAS = 10;
const LIBRE: EstadoAsiento = 0;
const OCUPADO: EstadoAsiento = 1;

function inicializarAsientos(filas: number, columnas: number): Sala {
  const sala: Sala = [];

  for (let i = 0; i < filas; i++) {
    const fila: EstadoAsiento[] = [];
    for (let j = 0; j < columnas; j++) {
      fila.push(LIBRE);
    }
    sala.push(fila);
  }

  return sala;
}

function posicionValida(
  sala: Sala,
  fila: number,
  columna: number
): boolean {
  return (
    fila >= 0 && fila < sala.length && columna >= 0 && columna < sala[0].length
  );
}

function reservarAsiento(sala: Sala, fila: number, columna: number): boolean {
  if (!posicionValida(sala, fila, columna)) {
    return false;
  }

  if (sala[fila][columna] === OCUPADO) {
    return false;
  }

  sala[fila][columna] = OCUPADO;
  return true;
}

function cancelarReserva(sala: Sala, fila: number, columna: number): boolean {
  if (!posicionValida(sala, fila, columna)) {
    return false;
  }

  if (sala[fila][columna] === LIBRE) {
    return false;
  }

  sala[fila][columna] = LIBRE;
  return true;
}

function contarDisponibles(sala: Sala): number {
  return sala.flat().filter((asiento) => asiento === LIBRE).length;
}

function contarOcupadosYDisponibles(
  sala: Sala
): [number, number] {
  const disponibles = contarDisponibles(sala);
  const totalAsientos = sala.length * sala[0].length;
  const ocupados = totalAsientos - disponibles;

  return [ocupados, disponibles];
}

function encontrarPrimerParContiguoDisponible(
  sala: Sala
): ParContiguo | null {
  for (let fila = 0; fila < sala.length; fila++) {
    for (let columna = 0; columna < sala[fila].length - 1; columna++) {
      if (sala[fila][columna] === LIBRE && sala[fila][columna + 1] === LIBRE) {
        return [
          [fila, columna],
          [fila, columna + 1],
        ];
      }
    }
  }

  return null;
}

function encontrarPrimerosDosParesContiguosDisponibles(sala: Sala): ParContiguo[] {
  const pares: ParContiguo[] = [];

  for (let fila = 0; fila < sala.length; fila++) {
    for (let columna = 0; columna < sala[fila].length - 1; columna++) {
      if (sala[fila][columna] === LIBRE && sala[fila][columna + 1] === LIBRE) {
        pares.push([
          [fila, columna],
          [fila, columna + 1],
        ]);

        if (pares.length === 2) {
          return pares;
        }
      }
    }
  }

  return pares;
}

function mostrarSala(sala: Sala): string {
  const columnas: string[] = [];
  for (let i = 0; i < sala[0].length; i++) {
    columnas.push(String(i + 1).padStart(2, "0"));
  }
  const encabezado = "     " + columnas.join(" ");

  const filas = sala
    .map((fila, i) => {
      const asientosVisibles = fila
        .map((asiento) => (asiento === OCUPADO ? "X" : "L"))
        .join("  ");
      return `${String(i + 1).padStart(2, "0")} | ${asientosVisibles}`;
    })
    .join("\n");

  return `${encabezado}\n${filas}`;
}

function imprimirEstadoSala(sala: Sala): void {
  console.log("Estado actual de la sala:");
  console.log(mostrarSala(sala));
}

function claveAsiento(fila: number, columna: number): string {
  return `${fila}-${columna}`;
}

function parsearClaveAsiento(clave: string): [number, number] {
  const [filaStr, columnaStr] = clave.split("-");
  return [Number(filaStr), Number(columnaStr)];
}

function formatearPosicion(fila: number, columna: number): string {
  return `Fila ${fila + 1}, Asiento ${columna + 1}`;
}

function construirResumenTexto(sala: Sala): string {
  const [ocupados, disponibles] = contarOcupadosYDisponibles(sala);
  const parContiguo = encontrarPrimerParContiguoDisponible(sala);
  const mensajeParContiguo = parContiguo
    ? `Primer par contiguo disponible: Fila ${parContiguo[0][0] + 1}, Asientos ${parContiguo[0][1] + 1} y ${parContiguo[1][1] + 1}`
    : "No hay dos asientos contiguos disponibles en la misma fila.";

  return [
    "Estado actual de la sala:",
    mostrarSala(sala),
    `Asientos ocupados: ${ocupados}`,
    `Asientos disponibles: ${disponibles}`,
    mensajeParContiguo,
  ].join("\n\n");
}

const sala = inicializarAsientos(FILAS, COLUMNAS);

reservarAsiento(sala, 0, 0);
reservarAsiento(sala, 2, 4);
reservarAsiento(sala, 7, 9);
cancelarReserva(sala, 2, 4);

const resultado = construirResumenTexto(sala);

imprimirEstadoSala(sala);

if (typeof document !== "undefined") {
  import("./style.css").then(() => {
    const app = document.querySelector<HTMLElement>("#app");
    if (app) {
      app.innerHTML = `
        <section class="cinema-ui">
          <h2 class="cinema-title">Mapa de la sala</h2>
          <p class="cinema-subtitle">Primero completa tu nombre. Luego selecciona asientos y confirma la reserva.</p>

          <section class="formulario-reserva" aria-label="Formulario de nombre para reservar">
            <label for="input-nombre" class="label-nombre">Nombre de la persona que reserva</label>
            <div class="fila-formulario-reserva">
              <input id="input-nombre" type="text" class="input-nombre" placeholder="Ejemplo: Ana Perez" autocomplete="name" />
              <button id="btn-guardar-nombre" type="button" class="btn-reservar btn-reservar--secundario">Continuar</button>
            </div>
            <p id="estado-nombre" class="estado-nombre estado-nombre--pendiente">Antes de reservar, completa tu nombre.</p>
          </section>

          <div class="leyenda">
            <span class="leyenda-item"><span class="punto punto--libre"></span> L libre (reservable)</span>
            <span class="leyenda-item"><span class="punto punto--ocupado"></span> X ocupado por otra persona</span>
            <span class="leyenda-item"><span class="punto punto--seleccionado"></span> Seleccionado por ti</span>
          </div>

          <div id="mapa-sala" class="mapa-sala"></div>

          <div class="acciones">
            <button id="btn-reservar" type="button" class="btn-reservar">Reservar seleccionados</button>
          </div>

          <div class="acciones-contiguos">
            <label for="selector-contiguos" class="label-contiguos">Reservar asientos contiguos (misma fila):</label>
            <select id="selector-contiguos" class="selector-contiguos"></select>
            <button id="btn-reservar-contiguos" type="button" class="btn-reservar btn-reservar--secundario">Reservar par contiguo</button>
          </div>

          <p id="mensaje-reserva" class="mensaje mensaje--info">Selecciona uno o más asientos para reservar.</p>
          <p id="resumen-sala" class="resumen"></p>
        </section>
      `;

      const mapaSala = document.querySelector<HTMLDivElement>("#mapa-sala");
      const btnReservar = document.querySelector<HTMLButtonElement>("#btn-reservar");
      const selectorContiguos = document.querySelector<HTMLSelectElement>("#selector-contiguos");
      const btnReservarContiguos = document.querySelector<HTMLButtonElement>("#btn-reservar-contiguos");
      const mensajeReserva = document.querySelector<HTMLParagraphElement>("#mensaje-reserva");
      const resumenSala = document.querySelector<HTMLParagraphElement>("#resumen-sala");
      const inputNombre = document.querySelector<HTMLInputElement>("#input-nombre");
      const btnGuardarNombre = document.querySelector<HTMLButtonElement>("#btn-guardar-nombre");
      const estadoNombre = document.querySelector<HTMLParagraphElement>("#estado-nombre");

      if (
        !mapaSala ||
        !btnReservar ||
        !selectorContiguos ||
        !btnReservarContiguos ||
        !mensajeReserva ||
        !resumenSala ||
        !inputNombre ||
        !btnGuardarNombre ||
        !estadoNombre
      ) {
        return;
      }

      const seleccionados = new Set<string>();
      const historialReservasJSON: string[] = [];
      let nombreReserva = "";

      const mostrarMensaje = (texto: string, tipo: TipoMensaje = "info"): void => {
        mensajeReserva.textContent = texto;
        mensajeReserva.className = `mensaje mensaje--${tipo}`;
      };

      const tieneNombreReserva = (): boolean => nombreReserva.trim().length > 0;

      const actualizarEstadoNombre = (): void => {
        if (tieneNombreReserva()) {
          estadoNombre.textContent = `Reservando a nombre de ${nombreReserva}.`;
          estadoNombre.className = "estado-nombre estado-nombre--ok";
        } else {
          estadoNombre.textContent = "Antes de reservar, completa tu nombre.";
          estadoNombre.className = "estado-nombre estado-nombre--pendiente";
        }

        btnReservar.disabled = !tieneNombreReserva();
      };

      const solicitarNombreSiFalta = (): boolean => {
        if (tieneNombreReserva()) {
          return true;
        }

        mostrarMensaje(
          "Para reservar asientos primero debes completar el formulario con tu nombre.",
          "error"
        );
        inputNombre.focus();
        return false;
      };

      const actualizarResumen = (): void => {
        const [ocupados, disponibles] = contarOcupadosYDisponibles(sala);
        resumenSala.textContent = `Ocupados: ${ocupados} | Disponibles: ${disponibles} | Seleccionados: ${seleccionados.size}`;
      };

      const crearMetadataReservaJSON = (
        nombre: string,
        asientos: string[]
      ): string => {
        return JSON.stringify([
          ["nombre", nombre],
          ["asientos", asientos],
          ["marcaTiempo", new Date().toISOString()],
        ]);
      };

      const actualizarOpcionesContiguas = (): void => {
        const pares = encontrarPrimerosDosParesContiguosDisponibles(sala);
        selectorContiguos.innerHTML = "";

        if (pares.length === 0) {
          const opcion = document.createElement("option");
          opcion.value = "";
          opcion.textContent = "No hay asientos contiguos disponibles";
          selectorContiguos.appendChild(opcion);
          selectorContiguos.disabled = true;
          btnReservarContiguos.disabled = true;
          return;
        }

        pares.forEach((par, index) => {
          const opcion = document.createElement("option");
          const a = par[0];
          const b = par[1];
          opcion.value = `${a[0]}-${a[1]}|${b[0]}-${b[1]}`;
          opcion.textContent = `Opción ${index + 1}: Fila ${a[0] + 1}, Asientos ${a[1] + 1} y ${b[1] + 1}`;
          selectorContiguos.appendChild(opcion);
        });

        selectorContiguos.disabled = false;
        btnReservarContiguos.disabled = !tieneNombreReserva();
      };

      const pintarMapa = (): void => {
        mapaSala.innerHTML = "";

        for (let fila = 0; fila < sala.length; fila++) {
          const filaEl = document.createElement("div");
          filaEl.className = "fila";

          const etiquetaFila = document.createElement("span");
          etiquetaFila.className = "etiqueta-fila";
          etiquetaFila.textContent = `F${String(fila + 1).padStart(2, "0")}`;
          filaEl.appendChild(etiquetaFila);

          for (let columna = 0; columna < sala[fila].length; columna++) {
            const estado = sala[fila][columna];
            const clave = claveAsiento(fila, columna);
            const estaSeleccionado = seleccionados.has(clave);
            const asientoEl = document.createElement("button");

            asientoEl.type = "button";
            asientoEl.className = "asiento";
            asientoEl.dataset.fila = String(fila);
            asientoEl.dataset.columna = String(columna);
            asientoEl.textContent = estado === OCUPADO ? "X" : "L";

            if (estado === OCUPADO) {
              asientoEl.classList.add("asiento--ocupado");
            } else if (estaSeleccionado) {
              asientoEl.classList.add("asiento--seleccionado");
            } else {
              asientoEl.classList.add("asiento--libre");
            }

            asientoEl.title = formatearPosicion(fila, columna);

            asientoEl.addEventListener("click", () => {
              if (sala[fila][columna] === OCUPADO) {
                mostrarMensaje(
                  `${formatearPosicion(fila, columna)} no se puede reservar porque ya está ocupado.`,
                  "error"
                );
                return;
              }

              if (seleccionados.has(clave)) {
                seleccionados.delete(clave);
                mostrarMensaje(
                  `${formatearPosicion(fila, columna)} fue quitado de tu selección.`,
                  "info"
                );
              } else {
                seleccionados.add(clave);
                mostrarMensaje(
                  `${formatearPosicion(fila, columna)} seleccionado para reservar.`,
                  "info"
                );
              }

              pintarMapa();
              actualizarResumen();
            });

            filaEl.appendChild(asientoEl);
          }

          mapaSala.appendChild(filaEl);
        }
      };

      btnReservar.addEventListener("click", () => {
        if (!solicitarNombreSiFalta()) {
          return;
        }

        if (seleccionados.size === 0) {
          mostrarMensaje("No has seleccionado asientos para reservar.", "error");
          return;
        }

        const reservadosAhora: string[] = [];
        const noDisponibles: string[] = [];

        for (const clave of seleccionados) {
          const [fila, columna] = parsearClaveAsiento(clave);
          if (reservarAsiento(sala, fila, columna)) {
            reservadosAhora.push(formatearPosicion(fila, columna));
          } else {
            noDisponibles.push(formatearPosicion(fila, columna));
          }
        }

        seleccionados.clear();

        if (reservadosAhora.length > 0) {
          historialReservasJSON.push(
            crearMetadataReservaJSON(nombreReserva, reservadosAhora)
          );
          let mensaje = `Asientos reservados correctamente a nombre de ${nombreReserva}: ${reservadosAhora.join(", ")}.`;
          if (noDisponibles.length > 0) {
            mensaje += ` No se pudieron reservar: ${noDisponibles.join(", ")} (ya ocupados).`;
          }
          mostrarMensaje(mensaje, "success");
        } else {
          mostrarMensaje(
            `No se pudo completar la reserva. Los asientos seleccionados ya están ocupados: ${noDisponibles.join(", ")}.`,
            "error"
          );
        }

        pintarMapa();
        actualizarResumen();
        actualizarOpcionesContiguas();
      });

      btnReservarContiguos.addEventListener("click", () => {
        if (!solicitarNombreSiFalta()) {
          return;
        }

        if (selectorContiguos.disabled || !selectorContiguos.value) {
          mostrarMensaje(
            "No hay asientos contiguos disponibles en este momento.",
            "error"
          );
          return;
        }

          const [asientoA, asientoB] = selectorContiguos.value.split("|");
          const [filaA, columnaA] = parsearClaveAsiento(asientoA);
          const [filaB, columnaB] = parsearClaveAsiento(asientoB);

        const reservaA = reservarAsiento(sala, filaA, columnaA);
        const reservaB = reservarAsiento(sala, filaB, columnaB);

        seleccionados.delete(claveAsiento(filaA, columnaA));
        seleccionados.delete(claveAsiento(filaB, columnaB));

        if (reservaA && reservaB) {
          historialReservasJSON.push(
            crearMetadataReservaJSON(nombreReserva, [
              formatearPosicion(filaA, columnaA),
              formatearPosicion(filaB, columnaB),
            ])
          );
          mostrarMensaje(
            `Asientos contiguos reservados correctamente a nombre de ${nombreReserva}: ${formatearPosicion(filaA, columnaA)} y ${formatearPosicion(filaB, columnaB)}.`,
            "success"
          );
        } else {
          mostrarMensaje(
            "No se pudo reservar el par contiguo porque uno o ambos asientos ya están ocupados.",
            "error"
          );
        }

        pintarMapa();
        actualizarResumen();
        actualizarOpcionesContiguas();
      });

      btnGuardarNombre.addEventListener("click", () => {
        const nombreIngresado = inputNombre.value.trim().replace(/\s+/g, " ");

        if (!nombreIngresado) {
          nombreReserva = "";
          actualizarEstadoNombre();
          mostrarMensaje("Debes escribir un nombre para poder reservar asientos.", "error");
          inputNombre.focus();
          return;
        }

        nombreReserva = nombreIngresado;
        inputNombre.value = nombreReserva;
        actualizarEstadoNombre();
        actualizarOpcionesContiguas();
        mostrarMensaje(`Perfecto, la reserva se hara a nombre de ${nombreReserva}.`, "success");
      });

      inputNombre.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          btnGuardarNombre.click();
        }
      });

      pintarMapa();
      actualizarResumen();
      actualizarEstadoNombre();
      actualizarOpcionesContiguas();
    }
  });
}

console.log(resultado);

export {
  FILAS,
  COLUMNAS,
  inicializarAsientos,
  reservarAsiento,
  cancelarReserva,
  contarDisponibles,
  contarOcupadosYDisponibles,
  encontrarPrimerParContiguoDisponible,
  encontrarPrimerosDosParesContiguosDisponibles,
  mostrarSala,
  imprimirEstadoSala,
};
