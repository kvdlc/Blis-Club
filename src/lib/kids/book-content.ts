// Contenido base para los libros de puzzles (30 páginas por libro).
// Los specs se derivan determinísticamente del número de página.

export interface CrosswordSet { words: { answer: string; clue: string }[] }

export const CRUCIGRAMA_SETS: CrosswordSet[] = [
  { words: [ { answer: "GATO", clue: "Ronronea y caza ratones" }, { answer: "PERRO", clue: "El mejor amigo del hombre" }, { answer: "PATO", clue: "Nada y dice cuac" }, { answer: "RANA", clue: "Salta y dice croac" } ] },
  { words: [ { answer: "SOL", clue: "Brilla de día en el cielo" }, { answer: "LUNA", clue: "Brilla de noche" }, { answer: "NUBE", clue: "Es blanca y lleva lluvia" }, { answer: "MAR", clue: "Es azul y tiene olas" } ] },
  { words: [ { answer: "AUTO", clue: "Tiene cuatro ruedas" }, { answer: "TREN", clue: "Viaja sobre rieles" }, { answer: "AVION", clue: "Vuela por el cielo" }, { answer: "BARCO", clue: "Navega por el mar" } ] },
  { words: [ { answer: "MANGO", clue: "Fruta dulce y anaranjada" }, { answer: "PERA", clue: "Fruta verde con pepitas" }, { answer: "UVA", clue: "Fruta pequeña en racimo" }, { answer: "KIWI", clue: "Fruta verde por dentro" } ] },
  { words: [ { answer: "VACA", clue: "Da leche y dice muuu" }, { answer: "CERDO", clue: "Es rosado y dice oink" }, { answer: "OVEJA", clue: "Su lana es muy suave" }, { answer: "CABRA", clue: "Le gusta saltar en las rocas" } ] },
  { words: [ { answer: "OJO", clue: "Con él ves los colores" }, { answer: "MANO", clue: "Tiene cinco dedos" }, { answer: "PIE", clue: "Con él caminas" }, { answer: "BOCA", clue: "Con ella comes y hablas" } ] },
  { words: [ { answer: "MESA", clue: "Ahí comes y estudias" }, { answer: "SILLA", clue: "Sirve para sentarse" }, { answer: "CAMA", clue: "Sirve para dormir" }, { answer: "PUERTA", clue: "Sirve para entrar y salir" } ] },
  { words: [ { answer: "ROJO", clue: "Color de la manzana" }, { answer: "AZUL", clue: "Color del cielo" }, { answer: "VERDE", clue: "Color del pasto" }, { answer: "ROSA", clue: "Color de las flores bonitas" } ] },
  { words: [ { answer: "PEZ", clue: "Vive en el agua" }, { answer: "PULPO", clue: "Tiene ocho brazos" }, { answer: "OLA", clue: "Se forma en el mar" }, { answer: "CONCHA", clue: "La encuentras en la arena" } ] },
  { words: [ { answer: "LIBRO", clue: "Tiene cuentos e historias" }, { answer: "LAPIZ", clue: "Sirve para escribir y borrar" }, { answer: "REGLA", clue: "Sirve para medir" }, { answer: "GOMA", clue: "Borra lo que escribes" } ] },
];

export const SOPA_SETS: string[][] = [
  ["MANGO", "PERA", "UVA", "KIWI", "MORA", "LIMON"],
  ["GATO", "PERRO", "PATO", "RANA", "LOBO", "OSO"],
  ["ROJO", "AZUL", "VERDE", "ROSA", "GRIS", "NEGRO"],
  ["PEZ", "PULPO", "OLA", "ARENA", "CONCHA", "CANGREJO"],
  ["VACA", "CERDO", "GALLINA", "OVEJA", "CABRA", "CABALLO"],
  ["SOL", "LUNA", "ESTRELLA", "COMETA", "PLANETA", "CIELO"],
  ["MANO", "PIE", "OJO", "BOCA", "NARIZ", "OREJA"],
  ["MESA", "SILLA", "CAMA", "PUERTA", "VENTANA", "COCINA"],
  ["AUTO", "TREN", "BARCO", "AVION", "BICI", "MOTO"],
  ["CAMISA", "PANTALON", "GORRA", "MEDIAS", "ZAPATO", "ABRIGO"],
  ["LIBRO", "LAPIZ", "REGLA", "GOMA", "CUADERNO", "TIJERA"],
  ["PELOTA", "TREN", "GLOBO", "COMETA", "ROBOT", "OSITO"],
];

const DOT_SHAPE_SEQ = ["star", "heart", "fish", "house", "rocket", "flower"];

export function buildPuzzlePageSpec(category: string, index: number): any {
  switch (category) {
    case "sopa_letras": {
      const words = SOPA_SETS[index % SOPA_SETS.length];
      const size = 10 + (index % 4);
      return { words, size, seed: 1000 + index };
    }
    case "crucigrama": {
      const set = CRUCIGRAMA_SETS[index % CRUCIGRAMA_SETS.length];
      return { words: set.words, seed: 2000 + index };
    }
    case "laberinto": {
      const cols = 8 + (index % 8);
      return { cols, rows: cols, seed: 3000 + index };
    }
    case "unir_puntos": {
      const shape = DOT_SHAPE_SEQ[index % DOT_SHAPE_SEQ.length];
      return { shape, count: 8 + (index % 11) };
    }
    default:
      return {};
  }
}

/** Devuelve la lista de 30 specs de página para un libro de puzzles. */
export function buildPuzzleBookPages(category: string, pages = 30) {
  return Array.from({ length: pages }, (_, i) => ({ i }));
}
