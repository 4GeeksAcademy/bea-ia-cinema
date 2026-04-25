type EstadoAsiento = 0 | 1;
type Sala = EstadoAsiento[][];
type PosicionAsiento = {
  fila: number;
  columna: number;
};
type ResultadoParContiguo =
  | { encontrado: true; asientos: [PosicionAsiento, PosicionAsiento] }
  | { encontrado: false; mensaje: string };

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

const sala = inicializarAsientos(FILAS, COLUMNAS);

reservarAsiento(sala, 0, 0);
reservarAsiento(sala, 2, 4);
reservarAsiento(sala, 7, 9);
cancelarReserva(sala, 2, 4);

const conteoAsientos = contarOcupadosYDisponibles(sala);
const parContiguo = encontrarPrimerParContiguoDisponible(sala);
const mensajeParContiguo = parContiguo.encontrado
  ? `Primer par contiguo disponible: Fila ${parContiguo.asientos[0].fila}, Asientos ${parContiguo.asientos[0].columna} y ${parContiguo.asientos[1].columna}`
  : parContiguo.mensaje;

const resultado = [
  "Estado actual de la sala:",
  mostrarSala(sala),
  `Asientos ocupados: ${conteoAsientos.ocupados}`,
  `Asientos disponibles: ${conteoAsientos.disponibles}`,
  mensajeParContiguo,
].join("\n\n");

imprimirEstadoSala(sala);

if (typeof document !== "undefined") {
  import("./style.css").then(() => {
    const app = document.querySelector<HTMLDivElement>("#app");
    if (app) {
      app.innerHTML = `<pre>${resultado}</pre>`;
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
  mostrarSala,
  imprimirEstadoSala,
};
