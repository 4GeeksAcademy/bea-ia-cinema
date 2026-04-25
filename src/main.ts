type EstadoAsiento = 0 | 1;
type Sala = EstadoAsiento[][];
type PosicionAsiento = {
  fila: number;
  columna: number;
};
type TipoMensaje = "info" | "error" | "success";
type ResultadoParContiguo =
  | { encontrado: true; asientos: [PosicionAsiento, PosicionAsiento] }
  | { encontrado: false; mensaje: string };
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
): { ocupados: number; disponibles: number } {
  const disponibles = contarDisponibles(sala);
  const totalAsientos = sala.length * sala[0].length;
  const ocupados = totalAsientos - disponibles;

  return { ocupados, disponibles };
}

function encontrarPrimerParContiguoDisponible(
  sala: Sala
): ResultadoParContiguo {
  for (let fila = 0; fila < sala.length; fila++) {
    for (let columna = 0; columna < sala[fila].length - 1; columna++) {
      if (sala[fila][columna] === LIBRE && sala[fila][columna + 1] === LIBRE) {
        return {
          encontrado: true,
          asientos: [
            { fila: fila + 1, columna: columna + 1 },
            { fila: fila + 1, columna: columna + 2 },
          ],
        };
      }
    }
  }

  return {
    encontrado: false,
    mensaje:
      "No hay dos asientos contiguos disponibles en la misma fila.",
  };
}

function encontrarPrimerosDosParesContiguosDisponibles(sala: Sala): ParContiguo[] {
  const pares: ParContiguo[] = [];

  for (let fila = 0; fila < sala.length; fila++) {
    for (let columna = 0; columna < sala[fila].length - 1; columna++) {
      if (sala[fila][columna] === LIBRE && sala[fila][columna + 1] === LIBRE) {
        pares.push([
          { fila, columna },
          { fila, columna: columna + 1 },
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

function parsearClaveAsiento(clave: string): { fila: number; columna: number } {
  const [filaStr, columnaStr] = clave.split("-");
  return {
    fila: Number(filaStr),
    columna: Number(columnaStr),
  };
}

function formatearPosicion(fila: number, columna: number): string {
  return `Fila ${fila + 1}, Asiento ${columna + 1}`;
}

function construirResumenTexto(sala: Sala): string {
  const conteoAsientos = contarOcupadosYDisponibles(sala);
  const parContiguo = encontrarPrimerParContiguoDisponible(sala);
  const mensajeParContiguo = parContiguo.encontrado
    ? `Primer par contiguo disponible: Fila ${parContiguo.asientos[0].fila}, Asientos ${parContiguo.asientos[0].columna} y ${parContiguo.asientos[1].columna}`
    : parContiguo.mensaje;

  return [
    "Estado actual de la sala:",
    mostrarSala(sala),
    `Asientos ocupados: ${conteoAsientos.ocupados}`,
    `Asientos disponibles: ${conteoAsientos.disponibles}`,
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
          <p class="cinema-subtitle">Haz clic en asientos libres para seleccionarlos. Luego pulsa en "Reservar seleccionados".</p>

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

      if (
        !mapaSala ||
        !btnReservar ||
        !selectorContiguos ||
        !btnReservarContiguos ||
        !mensajeReserva ||
        !resumenSala
      ) {
        return;
      }

      const seleccionados = new Set<string>();

      const mostrarMensaje = (texto: string, tipo: TipoMensaje = "info"): void => {
        mensajeReserva.textContent = texto;
        mensajeReserva.className = `mensaje mensaje--${tipo}`;
      };

      const actualizarResumen = (): void => {
        const conteo = contarOcupadosYDisponibles(sala);
        resumenSala.textContent = `Ocupados: ${conteo.ocupados} | Disponibles: ${conteo.disponibles} | Seleccionados: ${seleccionados.size}`;
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
          opcion.value = `${a.fila}-${a.columna}|${b.fila}-${b.columna}`;
          opcion.textContent = `Opción ${index + 1}: Fila ${a.fila + 1}, Asientos ${a.columna + 1} y ${b.columna + 1}`;
          selectorContiguos.appendChild(opcion);
        });

        selectorContiguos.disabled = false;
        btnReservarContiguos.disabled = false;
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
        if (seleccionados.size === 0) {
          mostrarMensaje("No has seleccionado asientos para reservar.", "error");
          return;
        }

        const reservadosAhora: string[] = [];
        const noDisponibles: string[] = [];

        for (const clave of seleccionados) {
          const { fila, columna } = parsearClaveAsiento(clave);
          if (reservarAsiento(sala, fila, columna)) {
            reservadosAhora.push(formatearPosicion(fila, columna));
          } else {
            noDisponibles.push(formatearPosicion(fila, columna));
          }
        }

        seleccionados.clear();

        if (reservadosAhora.length > 0) {
          let mensaje = `Asientos reservados correctamente: ${reservadosAhora.join(", ")}.`;
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
        if (selectorContiguos.disabled || !selectorContiguos.value) {
          mostrarMensaje(
            "No hay asientos contiguos disponibles en este momento.",
            "error"
          );
          return;
        }

        const [asientoA, asientoB] = selectorContiguos.value.split("|");
        const { fila: filaA, columna: columnaA } = parsearClaveAsiento(asientoA);
        const { fila: filaB, columna: columnaB } = parsearClaveAsiento(asientoB);

        const reservaA = reservarAsiento(sala, filaA, columnaA);
        const reservaB = reservarAsiento(sala, filaB, columnaB);

        seleccionados.delete(claveAsiento(filaA, columnaA));
        seleccionados.delete(claveAsiento(filaB, columnaB));

        if (reservaA && reservaB) {
          mostrarMensaje(
            `Asientos contiguos reservados correctamente: ${formatearPosicion(filaA, columnaA)} y ${formatearPosicion(filaB, columnaB)}.`,
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

      pintarMapa();
      actualizarResumen();
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
