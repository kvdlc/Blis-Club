export interface VaccineDose {
  dose_number: number;
  age_weeks: number;
  label: string;
}

export interface VaccineWiki {
  id: string;
  name: string;
  emoji: string;
  group: "core" | "optional";
  severity: string;
  severityEmoji: string;
  contagion: string;
  whatItDoes: string;
  afterVaccine: { canBathe: string; canGoOut: string; canExercise: string };
  sideEffects: string;
  schedule: { doses: VaccineDose[]; boosterIntervalMonths: number };
  brands: string[];
  costUsdMin: number;
  costUsdMax: number;
}

export const VACCINES: VaccineWiki[] = [
  {
    id: "hepatitis",
    name: "Hepatitis Infecciosa",
    emoji: "🫀",
    group: "core",
    severity: "⚠️ GRAVE. El adenovirus canino tipo 1 ataca el hígado, riñones y ojos. Puede causar hepatitis fulminante, falla renal y ceguera. La mortalidad es del 30% en casos severos. El 'ojo azul' es una secuela típica.",
    severityEmoji: "⚠️",
    contagion: "💧 Por orina, heces o saliva de perros infectados. El virus es muy resistente y sobrevive semanas en el ambiente. Un charco de orina en la calle puede ser fuente de contagio por meses.",
    whatItDoes: "💉 La vacuna protege el hígado y riñones de tu perro contra este virus. Viene combinada con la del moquillo y parvovirus en la mayoría de vacunas (DHP o DHPP).",
    afterVaccine: {
      canBathe: "🛁 Espera 2-3 días",
      canGoOut: "🚶 Sí, precaución con zonas muy sucias",
      canExercise: "🏃 Normal desde el día siguiente",
    },
    sideEffects: "Hinchazón leve en el sitio de inyección. Letargo por 24 horas. Muy raro: reacción alérgica (edema facial).",
    schedule: {
      doses: [
        { dose_number: 1, age_weeks: 8, label: "Primera dosis (2 meses)" },
        { dose_number: 2, age_weeks: 12, label: "Segunda dosis (+4 semanas)" },
        { dose_number: 3, age_weeks: 16, label: "Tercera dosis (+4 semanas)" },
      ],
      boosterIntervalMonths: 12,
    },
    brands: ["Vanguard Plus (Zoetis)", "Nobivac DHPPi (MSD)", "Canigen (Virbac)", "Galaxy (Merck)"],
    costUsdMin: 12,
    costUsdMax: 25,
  },
  {
    id: "moquillo",
    name: "Moquillo (Distemper)",
    emoji: "🫁",
    group: "core",
    severity: "⚠️ MUY GRAVE. El virus del moquillo ataca el sistema respiratorio, digestivo y nervioso. Causa neumonía, convulsiones y daño cerebral permanente. La mortalidad es del 50-80%. Los sobrevivientes suelen quedar con secuelas neurológicas de por vida.",
    severityEmoji: "⚠️",
    contagion: "🤧 Por el aire, al estornudar o toser un perro infectado. También por compartir platos de agua o comida. El virus entra por la nariz y boca. Es como un resfrío pero 100 veces más peligroso.",
    whatItDoes: "💉 Esta vacuna protege contra el virus del distemper canino, primo del sarampión humano. Previene que el virus cruce al cerebro, donde causa el daño más grave e irreversible.",
    afterVaccine: {
      canBathe: "🛁 Espera 3 días",
      canGoOut: "🚶 Sí, pero evita contacto con perros desconocidos por 5-7 días",
      canExercise: "🏃 Ejercicio moderado por 3 días, luego normal",
    },
    sideEffects: "Fiebre leve (1-2 días). Letargo. Inflamación en la zona del pinchazo. Muy raro: síntomas respiratorios leves temporales.",
    schedule: {
      doses: [
        { dose_number: 1, age_weeks: 8, label: "Primera dosis (2 meses)" },
        { dose_number: 2, age_weeks: 12, label: "Segunda dosis (+4 semanas)" },
        { dose_number: 3, age_weeks: 16, label: "Tercera dosis (+4 semanas)" },
      ],
      boosterIntervalMonths: 12,
    },
    brands: ["Vanguard Plus (Zoetis)", "Nobivac DHPPi (MSD)", "Galaxy (Merck)", "Canigen (Virbac)"],
    costUsdMin: 12,
    costUsdMax: 25,
  },
  {
    id: "parvovirus",
    name: "Parvovirus",
    emoji: "🩸",
    group: "core",
    severity: "⚠️ MUY GRAVE. El parvovirus causa diarrea con sangre, vómitos severos y deshidratación extrema. Sin tratamiento intensivo, la mortalidad en cachorros puede superar el 90%. Es ALTAMENTE contagioso entre perros.",
    severityEmoji: "⚠️",
    contagion: "💩 Por contacto con heces infectadas, tierra contaminada, o superficies donde estuvo un perro enfermo. El virus sobrevive MESES en el ambiente. Tu perro puede contagiarse oliendo el pasto del parque donde pasó un perro infectado hace semanas.",
    whatItDoes: "💉 La vacuna entrena las defensas de tu perro para atacar el virus antes de que destruya las células del intestino. Es la vacuna que más vidas salva en cachorros.",
    afterVaccine: {
      canBathe: "🛁 Espera 3 días después del pinchazo",
      canGoOut: "🚶 Sí, pero evita parques con muchos perros por 1 semana",
      canExercise: "🏃 Ejercicio suave los primeros 2 días, luego normal",
    },
    sideEffects: "Ligera molestia en la zona del pinchazo. Algunos perros pueden estar más dormilones por 24 horas. Muy rara vez, vómito leve.",
    schedule: {
      doses: [
        { dose_number: 1, age_weeks: 8, label: "Primera dosis (2 meses)" },
        { dose_number: 2, age_weeks: 12, label: "Segunda dosis (+4 semanas)" },
        { dose_number: 3, age_weeks: 16, label: "Tercera dosis (+4 semanas)" },
      ],
      boosterIntervalMonths: 12,
    },
    brands: ["Vanguard Plus (Zoetis)", "Nobivac Parvo-C (MSD)", "Canigen (Virbac)", "Duramune (Elanco)"],
    costUsdMin: 12,
    costUsdMax: 25,
  },
  {
    id: "coronavirus",
    name: "Coronavirus Canino",
    emoji: "🦠",
    group: "optional",
    severity: "📋 MODERADA. Diferente al COVID-19 humano. Causa gastroenteritis con diarrea líquida, vómitos y deshidratación. Especialmente peligroso en cachorros menores de 3 meses donde puede ser mortal.",
    severityEmoji: "📋",
    contagion: "💩 Por contacto con heces de perros infectados, superficies contaminadas o agua sucia. Muy común en criaderos, refugios y zonas con alta densidad de perros. Se contagia rápidamente entre camadas.",
    whatItDoes: "💉 Protege el tracto intestinal contra el coronavirus canino. Reduce la severidad de los síntomas gastrointestinales. Se recomienda especialmente si tu perro convive con muchos otros perros.",
    afterVaccine: {
      canBathe: "🛁 Espera 48 horas",
      canGoOut: "🚶 Sí, sin restricciones especiales",
      canExercise: "🏃 Normal",
    },
    sideEffects: "Mínimos. Ligero dolor en zona de inyección. Algunos perros pueden estar más tranquilos por 24 horas.",
    schedule: {
      doses: [
        { dose_number: 1, age_weeks: 8, label: "Primera dosis (2 meses)" },
        { dose_number: 2, age_weeks: 12, label: "Segunda dosis (+4 semanas)" },
      ],
      boosterIntervalMonths: 12,
    },
    brands: ["Duramune (Elanco)", "Galaxy (Merck)", "Canigen (Virbac)"],
    costUsdMin: 8,
    costUsdMax: 18,
  },
  {
    id: "leptospirosis",
    name: "Leptospirosis",
    emoji: "💧",
    group: "core",
    severity: "⚠️ GRAVE. Bacteria que ataca riñones e hígado. Causa fiebre alta, vómitos, diarrea, ictericia (ponerse amarillo) y falla renal aguda. ES ZOONÓTICA: te la puede contagiar a ti. Lavarse las manos después de tocar orina es clave.",
    severityEmoji: "⚠️",
    contagion: "💧 Por agua o suelo contaminado con orina de ratas, animales salvajes u otros perros infectados. Si tu perro toma agua de charcos, nada en ríos o lagos, o camina por zonas húmedas, el riesgo es alto.",
    whatItDoes: "💉 Protege contra las cepas más comunes de leptospira. Reduce la posibilidad de que tu perro se enferme gravemente y de que te contagie a ti o tu familia.",
    afterVaccine: {
      canBathe: "🛁 Espera 48 horas",
      canGoOut: "🚶 Evita charcos y agua estancada por 1 semana",
      canExercise: "🏃 Normal",
    },
    sideEffects: "Dolor e inflamación en la zona del pinchazo (más notorio que otras vacunas). Letargo por 24-48h. Algunos perros pueden tener fiebre leve. Razas pequeñas son más propensas a reacciones.",
    schedule: {
      doses: [
        { dose_number: 1, age_weeks: 12, label: "Primera dosis (3 meses)" },
        { dose_number: 2, age_weeks: 16, label: "Segunda dosis (+4 semanas)" },
      ],
      boosterIntervalMonths: 12,
    },
    brands: ["Vanguard L4 (Zoetis)", "Nobivac Lepto (MSD)", "Lepto Shield (Elanco)", "Canigen L (Virbac)"],
    costUsdMin: 10,
    costUsdMax: 22,
  },
  {
    id: "giardia",
    name: "Giardia",
    emoji: "🪱",
    group: "optional",
    severity: "📋 MODERADA. Parásito intestinal microscópico. Causa diarrea crónica intermitente, heces blandas con moco, pérdida de peso y pelaje opaco. Es muy común y difícil de eliminar del ambiente. ZOONÓTICA: puede contagiarte.",
    severityEmoji: "📋",
    contagion: "💧 Por beber agua contaminada con quistes del parásito (charcos, ríos, lagos). También por lamer superficies o pelo contaminado con heces. Los quistes sobreviven meses en ambientes húmedos. Común en guarderías y parques caninos.",
    whatItDoes: "💉 La vacuna reduce la excreción de quistes (huevecillos) del parásito en las heces de tu perro, disminuyendo la contaminación ambiental y la posibilidad de reinfección. NO elimina una infección existente; necesitas desparasitar primero.",
    afterVaccine: {
      canBathe: "🛁 Sí, después de 24 horas",
      canGoOut: "🚶 Evita que beba agua de charcos o ríos",
      canExercise: "🏃 Normal",
    },
    sideEffects: "Mínimos. Ligera molestia en el sitio de inyección. Muy raro: vómito o diarrea leve temporal.",
    schedule: {
      doses: [
        { dose_number: 1, age_weeks: 12, label: "Primera dosis (3 meses)" },
        { dose_number: 2, age_weeks: 15, label: "Segunda dosis (+3 semanas)" },
      ],
      boosterIntervalMonths: 12,
    },
    brands: ["GiardiaVax (Zoetis)"],
    costUsdMin: 15,
    costUsdMax: 28,
  },
  {
    id: "lyme",
    name: "Enfermedad de Lyme",
    emoji: "🕷️",
    group: "optional",
    severity: "📋 MODERADA. Transmitida por garrapatas. Causa fiebre, cojera intermitente (que cambia de pata), inflamación articular y letargo. Si no se trata, puede causar daño renal crónico y problemas cardíacos.",
    severityEmoji: "📋",
    contagion: "🕷️ Por la mordedura de una garrapata infectada (no se contagia de perro a perro). La garrapata debe estar adherida al menos 24-48 horas para transmitir la bacteria. Más común en zonas boscosas, pastizales altos y climas húmedos.",
    whatItDoes: "💉 Entrena al sistema inmune para atacar la bacteria Borrelia burgdorferi antes de que cause artritis y daño renal. Ideal si vives en zona rural, tu perro sale al campo o hay muchas garrapatas en tu región.",
    afterVaccine: {
      canBathe: "🛁 Sí, después de 24 horas",
      canGoOut: "🚶 Sí, pero mantén protección antiparasitaria",
      canExercise: "🏃 Normal",
    },
    sideEffects: "Inflamación en zona de inyección. Letargo 24-48h. Algunos perros pueden tener fiebre leve. Reacciones alérgicas son raras pero posibles.",
    schedule: {
      doses: [
        { dose_number: 1, age_weeks: 12, label: "Primera dosis (3 meses)" },
        { dose_number: 2, age_weeks: 15, label: "Segunda dosis (+3 semanas)" },
      ],
      boosterIntervalMonths: 12,
    },
    brands: ["LymeVax (Zoetis)", "Nobivac Lyme (MSD)", "Duramune Lyme (Elanco)"],
    costUsdMin: 15,
    costUsdMax: 30,
  },
  {
    id: "tos-perrera",
    name: "Tos de Perrera (Bordetella)",
    emoji: "🗣️",
    group: "optional",
    severity: "📋 MODERADA. Infección respiratoria muy contagiosa. Causa tos seca persistente (como si tuviera algo atorado), secreción nasal y fiebre leve. Rara vez es mortal, pero es muy molesta y puede durar semanas.",
    severityEmoji: "📋",
    contagion: "🏠 Por el aire en lugares con muchos perros: guarderías, parques, pensiones, exposiciones, entrenamientos grupales. Se transmite como la gripe entre humanos. Tu perro puede contagiarse simplemente jugando con otro perro en el parque.",
    whatItDoes: "💉 Reduce la severidad de la tos de perrera. No evita el contagio al 100%, pero hace que los síntomas sean mucho más leves y duren menos. Es como la vacuna de la gripe en humanos.",
    afterVaccine: {
      canBathe: "🛁 Espera 48 horas",
      canGoOut: "🚶 Evita guarderías y parques caninos por 5 días",
      canExercise: "🏃 Suave por 3 días, luego normal",
    },
    sideEffects: "Estornudos leves por 1-2 días (especialmente si es la versión intranasal). Ligero letargo. Muy raro: tos leve temporal.",
    schedule: {
      doses: [{ dose_number: 1, age_weeks: 12, label: "Primera dosis (3 meses)" }],
      boosterIntervalMonths: 6,
    },
    brands: ["Nobivac KC (MSD)", "Bronchicine (Zoetis)", "Pneumodog (Merial)"],
    costUsdMin: 10,
    costUsdMax: 20,
  },
  {
    id: "rabia",
    name: "Rabia",
    emoji: "🦠",
    group: "core",
    severity: "☠️ MORTAL. La rabia no tiene cura una vez que aparecen los síntomas. Es la enfermedad más peligrosa porque se transmite a humanos.",
    severityEmoji: "☠️",
    contagion: "🦊 Por mordedura de un animal infectado: murciélagos, zorros, perros callejeros. El virus viaja por la saliva y ataca el sistema nervioso. Tu perro puede contagiarse incluso en el jardín si entra un murciélago enfermo.",
    whatItDoes: "💉 Esta vacuna le enseña al sistema inmune de tu perro a reconocer y destruir el virus de la rabia antes de que llegue al cerebro. Es la vacuna más importante y es OBLIGATORIA por ley en casi todos los países.",
    afterVaccine: {
      canBathe: "🛁 Sí, después de 48 horas del pinchazo",
      canGoOut: "🚶 Sí, sin ningún problema",
      canExercise: "🏃 Normal, sin restricciones",
    },
    sideEffects: "Inflamación leve en la zona del pinchazo por 1-2 días. Cansancio ligero. En casos muy raros (1 en 10,000), reacción alérgica que requiere atención veterinaria inmediata.",
    schedule: {
      doses: [{ dose_number: 1, age_weeks: 16, label: "Primera dosis (4 meses)" }],
      boosterIntervalMonths: 12,
    },
    brands: ["Rabisin (Merial)", "Defensor (Zoetis)", "Imrab (Merial)", "Nobivac Rabia (MSD)"],
    costUsdMin: 8,
    costUsdMax: 20,
  },
];
