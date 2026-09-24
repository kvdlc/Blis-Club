export type IconName =
  | "wifi"
  | "shield"
  | "building"
  | "bus"
  | "graduation"
  | "heartPulse"
  | "briefcase"
  | "mountain"
  | "users"
  | "accessibility"
  | "leaf"
  | "palette"
  | "droplets"
  | "store"
  | "radioTower"
  | "trophy"
  | "scale"
  | "monitor"
  | "check"
  | "sparkles"
  | "target"
  | "trending"
  | "lightbulb"
  | "award"
  | "flag"
  | "handHeart"
  | "megaphone"
  | "mapPin"
  | "clock"
  | "phone"
  | "mail"
  | "quote"
  | "building2"
  | "zap"
  | "calendar"
  | "users2";

export type Tone = "brand" | "accent" | "signal";

export interface Meta {
  label: string;
  value: string;
}

export const candidate = {
  name: "Rodrigo Espín",
  shortName: "Rodrigo",
  nickname: "El Arqui",
  slogan: "El Arqui te acolita",
  sloganLong: "El Arqui te acolita: te acompaña, te escucha y te cumple.",
  position: "Candidato a Alcalde de Latacunga",
  city: "Latacunga",
  province: "Cotopaxi",
  country: "Ecuador",
  movement: "Movimiento Ciudadano El Arqui",
  list: "Lista 21",
  electionDateISO: "2027-02-07T07:00:00-05:00",
  electionLabel: "Elecciones seccionales 2027",
  phone: "+593 99 000 0000",
  whatsapp: "+593 99 000 0000",
  email: "hola@rodrigoespin.ec",
  address: "Casa de campaña · Av. Amazonas y calle Quito, Latacunga",
  hashtag: "#ElArquiTeAcolita",
};

export const navItems: { label: string; href: string }[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Rodrigo", href: "#sobre-rodrigo" },
  { label: "Diagnóstico", href: "#diagnostico" },
  { label: "Propuestas", href: "#propuestas" },
  { label: "Internet Gratis", href: "#internet-gratis" },
  { label: "Ciudad", href: "#latacunga" },
  { label: "Agenda", href: "#agenda" },
  { label: "Súmate", href: "#sumate" },
];

export const heroHighlights: string[] = [
  "Internet gratis en barrios y parroquias",
  "Seguridad con tecnología y barrio",
  "Obra pública que se ve y se siente",
  "Empleo para la gente de Latacunga",
];

export const stats: { value: number; suffix: string; label: string; tone: Tone }[] = [
  { value: 300, suffix: "+", label: "Puntos de WiFi comunitario proyectados", tone: "signal" },
  { value: 12, suffix: "", label: "Parroquias conectadas al plan digital", tone: "brand" },
  { value: 45, suffix: " mil", label: "Metros de espacio público por recuperar", tone: "accent" },
  { value: 100, suffix: "%", label: "Compromiso con la transparencia y la rendición de cuentas", tone: "brand" },
];

export const promesasRapidas: string[] = [
  "Ninguna obra sin consulta al barrio",
  "Presupuesto abierto en línea cada mes",
  "Internet gratis digno, no de vitrina",
  "Más cámaras y más presencia en las calles",
  "Ferias y créditos para emprendedores locales",
  "Un solo Latacunga: urbano y rural",
];

export interface Valor {
  icon: IconName;
  title: string;
  text: string;
}

export const significados: Valor[] = [
  {
    icon: "handHeart",
    title: "Acolitar es acompañar",
    text: "El Arqui no llega a gobernar desde un escritorio. Camina el barrio, se sienta en la tienda de la esquina y trabaja junto a la gente para que las soluciones duren.",
  },
  {
    icon: "lightbulb",
    title: "Acolitar es pensar la ciudad",
    text: "Un arquitecto y emprendedor mira la ciudad como un proyecto: cada vereda, cada parque, cada lote y cada servicio se piensa con planos, presupuesto y fecha.",
  },
  {
    icon: "trending",
    title: "Acolitar es empujar el desarrollo",
    text: "Generar empleo, ordenar el comercio y conectar a Latacunga con el mundo. Ese es el empujón que cambia la vida de una familia.",
  },
  {
    icon: "shield",
    title: "Acolitar es cumplir",
    text: "Propuestas medibles, plazos claros y rendición de cuentas. Lo que se promete en campaña se firma en un plan de trabajo público.",
  },
];

export interface TrayectoriaItem {
  year: string;
  title: string;
  text: string;
}

export const trayectoria: TrayectoriaItem[] = [
  {
    year: "Formación",
    title: "Arquitecto de la Universidad Central del Ecuador",
    text: "Con estudios de especialización en desarrollo urbano, planificación territorial y diseño de espacio público.",
  },
  {
    year: "Emprendedor",
    title: "Fundador de un estudio de diseño y construcción en Cotopaxi",
    text: "Ha liderado proyectos de vivienda social, locales comerciales y adecuaciones barriales, generando empleo para maestros, albañiles y proveedores de la zona.",
  },
  {
    year: "Docencia",
    title: "Docente invitado y capacitador en oficios de la construcción",
    text: "Ha acompañado a jóvenes y artesanos en formación técnica, emprendimiento y economía popular y solidaria.",
  },
  {
    year: "Comunidad",
    title: "Dirigente barrial y gestor de proyectos comunitarios",
    text: "Impulsó mingas, gestión de obras y programas de conectividad y video vigilancia comunitaria en distintos sectores del cantón.",
  },
  {
    year: "Hoy",
    title: "Candidato a Alcalde de Latacunga",
    text: "Encabeza un movimiento ciudadano con vecinos, emprendedores, profesionales y organizaciones rurales que quieren un gobierno que se vea en los barrios.",
  },
];

export const aboutParagraphs: string[] = [
  "Rodrigo Espín es arquitecto de profesión y emprendedor de corazón. Nació, se crió y trabaja en Latacunga. Conoce la ciudad por sus calles, no por los mapas de una oficina: creció entre el mercado, la obra y el barrio, y de ahí viene su manera directa de hablar y de trabajar.",
  "Durante años dirigió su propio estudio de arquitectura y construcción, donde aprendió algo que no enseña ninguna carrera: que una obra se termina cuando hay planos, presupuesto, gente capacitada y sobre todo palabra cumplida. Ese aprendizaje es el que quiere llevar al Municipio.",
  "No llega a la política para aprender a administrar. Llega con un plan: conectar Latacunga con internet gratis y digno, recuperar el espacio público, ordenar el tránsito, activar el comercio y el turismo, y hacer que cada dólar del Municipio rinda y se pueda ver en línea.",
  "Es esposo, padre y vecino. Y como todo latacungueño, sabe que esta ciudad tiene todo para brillar: su gente, su Mama Negra, su Cotopaxi y sus parroquias productivas. Solo le ha faltado un gobierno que empuje de verdad.",
];

export const formacion: string[] = [
  "Arquitecto — Universidad Central del Ecuador",
  "Especialización en planificación urbana y territorial",
  "Programa de liderazgo y gestión pública local",
  "Formación en emprendimiento y economía popular y solidaria",
];

export const banderas: string[] = [
  "Trabajo y palabra cumplida",
  "Cercanía con la gente",
  "Gestión, no discursos",
  "Latacunga primero, siempre",
];

export interface Eje {
  id: string;
  number: string;
  icon: IconName;
  tone: Tone;
  title: string;
  tagline: string;
  description: string;
  compromisos: string[];
  meta: Meta;
}

export const ejes: Eje[] = [
  {
    id: "internet-gratis",
    number: "01",
    icon: "wifi",
    tone: "signal",
    title: "Internet Gratis y Ciudad Conectada",
    tagline: "Latacunga en línea, sin excusas",
    description:
      "Internet gratis, estable y de verdad en plazas, parques, mercados, unidades educativas, centros de salud y espacios deportivos, tanto en el casco urbano como en las parroquias rurales. Conectividad como servicio social, no como lujo.",
    compromisos: [
      "WiFi libre en plazas, parques y espacios públicos emblemáticos del cantón",
      "Puntos de conexión comunitarios en barrios y parroquias rurales",
      "Fibra óptica municipal para unidades educativas y centros de salud",
      "Alfabetización digital gratuita para adultos mayores y emprendedores",
    ],
    meta: { label: "Meta 2027", value: "300 puntos de WiFi comunitario" },
  },
  {
    id: "seguridad",
    number: "02",
    icon: "shield",
    tone: "brand",
    title: "Seguridad y Convivencia Ciudadana",
    tagline: "Barrio seguro, ciudad tranquila",
    description:
      "Seguridad inteligente: tecnología, iluminación, patrullaje cercano y convivencia. Coordinación directa con la Policía Nacional y las juntas barriales para que la respuesta llegue cuando se necesita.",
    compromisos: [
      "Modernización del centro de videovigilancia municipal",
      "Iluminación LED en calles, parques y pasajes de barrios",
      "Botón de auxilio digital y número único de atención ciudadana",
      "Mesa cantonal de seguridad con juntas barriales y Policía",
    ],
    meta: { label: "Meta 2027", value: "1.500 puntos de luz recuperados" },
  },
  {
    id: "obra-publica",
    number: "03",
    icon: "building",
    tone: "accent",
    title: "Latacunga Que Se Ve Bien",
    tagline: "Obra pública con planos, plazo y gente",
    description:
      "Como arquitecto, Rodrigo piensa cada obra con planificación y diseño. Recuperar parques, plazas, aceras y fachadas del centro histórico, con accesibilidad universal y materiales que duren.",
    compromisos: [
      "Plan de recuperación de parques y plazas por sectores",
      "Aceras y rampas accesibles en rutas priorizadas",
      "Repotenciación del espacio público del centro histórico",
      "Obras contratadas y publicadas en línea con avance semanal",
    ],
    meta: { label: "Meta 2027", value: "45.000 m² de espacio público recuperado" },
  },
  {
    id: "movilidad",
    number: "04",
    icon: "bus",
    tone: "brand",
    title: "Movilidad, Tránsito y Transporte",
    tagline: "Llegar rápido y con dignidad",
    description:
      "Ordenar el tránsito, mejorar la semaforización, crear ciclovías y zonas de parqueo ordenado, y trabajar con el transporte público para un servicio más humano y puntual.",
    compromisos: [
      "Plan integral de tránsito y señalización del cantón",
      "Ciclovías y parqueaderos de bicicletas en puntos clave",
      "Mejora de paradas y unidades de transporte urbano",
      "Peatonalización y ordenamiento del comercio en el centro",
    ],
    meta: { label: "Meta 2027", value: "8 corredores de movilidad ordenados" },
  },
  {
    id: "educacion",
    number: "05",
    icon: "graduation",
    tone: "accent",
    title: "Educación, Primera Infancia y Juventud",
    tagline: "Invertir en el futuro, hoy",
    description:
      "Apoyo real a escuelas y colegios, centros de desarrollo infantil, becas, conectividad y programas de emprendimiento juvenil. La educación es la mejor obra pública que puede construir una ciudad.",
    compromisos: [
      "Centros de Desarrollo Infantil mejorados y cercanos",
      "Becas municipales para estudiantes de parroquias rurales",
      "Laboratorios digitales y conectividad en unidades educativas",
      "Programa de emprendimiento joven y primer empleo",
    ],
    meta: { label: "Meta 2027", value: "1.000 becas y talleres juveniles" },
  },
  {
    id: "salud",
    number: "06",
    icon: "heartPulse",
    tone: "brand",
    title: "Salud y Bienestar",
    tagline: "Cuidar a la gente, en serio",
    description:
      "Fortalecer la atención primaria municipal, las campañas preventivas y el acceso a salud en barrios y parroquias, con brigadas móviles y coordinación con el sistema público.",
    compromisos: [
      "Brigadas médicas móviles en parroquias rurales",
      "Campañas preventivas de salud y nutrición infantil",
      "Apoyo a casas de acogida y salud mental comunitaria",
      "Centros de salud con conectividad y equipamiento básico",
    ],
    meta: { label: "Meta 2027", value: "120 brigadas de salud al año" },
  },
  {
    id: "empleo",
    number: "07",
    icon: "briefcase",
    tone: "accent",
    title: "Empleo y Emprendimiento Local",
    tagline: "Mi barrio produce",
    description:
      "Generar condiciones para que el talento latacungueño se quede. Ferias de emprendedores, líneas de crédito, capacitación y simplificación de trámites para el comercio local.",
    compromisos: [
      "Programa de ferias y mercados de emprendedores",
      "Fondo concursable de créditos para negocios barriales",
      "Capacitación gratuita en oficios y marketing digital",
      "Trámites de patentes en línea y sin vueltas",
    ],
    meta: { label: "Meta 2027", value: "2.000 emprendedores acompañados" },
  },
  {
    id: "turismo",
    number: "08",
    icon: "mountain",
    tone: "signal",
    title: "Turismo Que Genera",
    tagline: "La Mama Negra y el Cotopaxi nos dan para vivir",
    description:
      "Poner a Latacunga en el mapa: rutas turísticas barriales y rurales, señalización, promoción digital, apoyo a guías y artesanos, y una Mama Negra con gestión y seguridad.",
    compromisos: [
      "Rutas turísticas sostenibles con las comunidades",
      "Promoción digital del cantón y su patrimonio",
      "Capacitación y formalización de guías, artesanos y hostales",
      "Plan especial de seguridad y logística para la Mama Negra",
    ],
    meta: { label: "Meta 2027", value: "5 rutas turísticas implementadas" },
  },
  {
    id: "mujer",
    number: "09",
    icon: "users",
    tone: "brand",
    title: "Mujer y Familia",
    tagline: "Más oportunidades, más protección",
    description:
      "Políticas con enfoque de género en el Municipio: emprendimiento femenino, prevención de la violencia, cuidado y corresponsabilidad, con servicios cercanos y confiables.",
    compromisos: [
      "Apoyo al emprendimiento liderado por mujeres",
      "Fortalecimiento de las casas de acogida y protección",
      "Centros de cuidado infantil y apoyo a madres trabajadoras",
      "Programas de prevención de la violencia con instituciones",
    ],
    meta: { label: "Meta 2027", value: "1.500 mujeres capacitadas y con crédito" },
  },
  {
    id: "adultos-mayores",
    number: "10",
    icon: "accessibility",
    tone: "signal",
    title: "Adultos Mayores y Grupos Prioritarios",
    tagline: "Una ciudad para todas las edades",
    description:
      "Atención y respeto para los adultos mayores, personas con discapacidad, niñas y niños. Espacios inclusivos, programas recreativos y accesibilidad real en toda la ciudad.",
    compromisos: [
      "Clubes y programas recreativos para adultos mayores",
      "Ciudad accesible con rampas y señalética táctil",
      "Atención preferencial digital y presencial en el Municipio",
      "Programas de atención a personas con discapacidad",
    ],
    meta: { label: "Meta 2027", value: "100% de oficinas municipales accesibles" },
  },
  {
    id: "ambiente",
    number: "11",
    icon: "leaf",
    tone: "signal",
    title: "Ambiente, Agua y Sostenibilidad",
    tagline: "Latacunga respira",
    description:
      "Gestión de residuos, reciclaje, cuencas hidrográficas, áreas verdes y educación ambiental. Una ciudad limpia es una ciudad que se cuida y que atrae.",
    compromisos: [
      "Plan integral de residuos y reciclaje con recicladores",
      "Reforestación y cuidado de quebradas y áreas verdes",
      "Educación ambiental en escuelas y barrios",
      "Programa de movilidad eléctrica y energía solar municipal",
    ],
    meta: { label: "Meta 2027", value: "30% de residuos reciclados" },
  },
  {
    id: "cultura",
    number: "12",
    icon: "palette",
    tone: "accent",
    title: "Cultura, Patrimonio e Identidad",
    tagline: "Somos Mama Negra, somos Cotopaxi",
    description:
      "Cultura viva: apoyo a artistas, casas patrimoniales recuperadas, festivales, bibliotecas y el centro histórico protegido como el tesoro que es.",
    compromisos: [
      "Plan de recuperación del centro histórico y casas patrimoniales",
      "Fondos para artistas y gestores culturales locales",
      "Agenda cultural permanente en barrios y parroquias",
      "Centro cívico cultural de referencia en Latacunga",
    ],
    meta: { label: "Meta 2027", value: "12 festivales y agendas culturales al año" },
  },
  {
    id: "agua",
    number: "13",
    icon: "droplets",
    tone: "brand",
    title: "Agua Potable y Saneamiento",
    tagline: "El agua es de la gente",
    description:
      "Ampliar y mejorar la cobertura de agua potable y alcantarillado, con mantenimiento permanente y tarifas justas. Obra invisible que salva vidas y dignidad.",
    compromisos: [
      "Plan de ampliación de agua potable en sectores sin cobertura",
      "Mantenimiento y limpieza de redes y alcantarillado",
      "Tratamiento de aguas y protección de fuentes",
      "Ventanilla única de reclamos y medición transparente",
    ],
    meta: { label: "Meta 2027", value: "95% de cobertura de agua en el cantón" },
  },
  {
    id: "mercados",
    number: "14",
    icon: "store",
    tone: "accent",
    title: "Mercados, Comercio y Economía Popular",
    tagline: "Comercio digno para quien madruga",
    description:
      "Mejorar mercados, ordenar el comercio, apoyar a ferias y al pequeño comerciante. Quien vende en Latacunga debe trabajar seguro, limpio y con apoyo.",
    compromisos: [
      "Remodelación y limpieza de mercados municipales",
      "Apoyo a comerciantes autónomos y ferias libres",
      "Capacitación comercial y acceso a digitalización",
      "Ordenamiento del espacio público con consenso",
    ],
    meta: { label: "Meta 2027", value: "3 mercados emblemáticos repotenciados" },
  },
  {
    id: "rural",
    number: "15",
    icon: "radioTower",
    tone: "signal",
    title: "Conectividad y Servicios en las Parroquias",
    tagline: "Un solo Latacunga, urbano y rural",
    description:
      "Las parroquias rurales no son el patio trasero. Internet, vías, riego, servicios y presencia municipal en Aláquez, Mulaló, Pastocalle, Tanicuchí y todos los sectores.",
    compromisos: [
      "Internet rural gratuito en espacios parroquiales",
      "Mantenimiento de vías rurales y caminos productivos",
      "Apoyo al riego y a la producción campesina",
      "Oficinas de atención municipal itinerante",
    ],
    meta: { label: "Meta 2027", value: "100% de parroquias con punto digital" },
  },
  {
    id: "deporte",
    number: "16",
    icon: "trophy",
    tone: "brand",
    title: "Deporte y Vida Saludable",
    tagline: "El deporte aleja los malos caminos",
    description:
      "Canchas, ligas barriales, escuelas de formación y espacio para el deporte como herramienta de prevención y encuentro entre vecinos.",
    compromisos: [
      "Recuperación y iluminación de canchas y espacios deportivos",
      "Apoyo a ligas barriales y parroquiales",
      "Escuelas deportivas gratuitas para niñas, niños y jóvenes",
      "Agenda permanente de campeonatos cantonales",
    ],
    meta: { label: "Meta 2027", value: "40 espacios deportivos recuperados" },
  },
  {
    id: "transparencia",
    number: "17",
    icon: "scale",
    tone: "accent",
    title: "Transparencia y Gobierno Abierto",
    tagline: "Tu plata, tu ciudad, tus cuentas",
    description:
      "Un Municipio abierto: presupuesto en línea, contrataciones públicas, rendición de cuentas y canales directos para que la ciudadanía vigile y participe.",
    compromisos: [
      "Presupuesto y obras publicados en línea, mes a mes",
      "Portal de contrataciones y auditoría ciudadana",
      "Cabildos abiertos y presupuesto participativo",
      "Cero tolerancia a la corrupción y los sobreprecios",
    ],
    meta: { label: "Meta 2027", value: "4 rendiciones de cuentas abiertas por año" },
  },
  {
    id: "innovacion",
    number: "18",
    icon: "monitor",
    tone: "brand",
    title: "Innovación, Trámites Digitales y Buen Uso del Gasto",
    tagline: "Menos filas, más servicios",
    description:
      "Modernizar el Municipio con tecnología y buen uso del dinero: trámites en línea, atención ágil, compras transparentes y una gestión que rinde como una buena empresa.",
    compromisos: [
      "Digitalización de los trámites más solicitados",
      "Ventanilla única y atención por turnos en línea",
      "Optimización del gasto corriente y compras por concurso",
      "Datos abiertos y tablero de gestión municipal",
    ],
    meta: { label: "Meta 2027", value: "60% de trámites digitalizados" },
  },
];

export interface WifiZona {
  nombre: string;
  tipo: "Urbana" | "Rural";
  puntos: string[];
}

export const internetGratis = {
  intro: [
    "Hoy en Latacunga hay internet en unas cuadras y en otras no. Eso no puede depender de la suerte del barrio donde naciste. Rodrigo Espín propone una red municipal de WiFi gratuito, estable y con soporte real, para que estudiar, trabajar y hacer trámites deje de ser un privilegio.",
    "El plan no es solo colgar antenas: es tender fibra óptica por donde no llega, firmar convenios con la academia y la empresa privada, y poner puestos de conexión comunitaria con mesas, carga y acompañamiento para quienes no saben usar la tecnología.",
    "Internet en la plaza para el estudiante, en el mercado para la comerciante, en el centro de salud para el médico y en la parroquia para el agricultor que quiere vender su producto. Esa es la ciudad conectada que vamos a construir.",
  ],
  features: [
    {
      icon: "zap" as IconName,
      title: "Gratis y sin trucos",
      text: "Acceso libre y sin costo en los espacios públicos, sin publicidad invasiva ni límites arbitrarios.",
    },
    {
      icon: "shield" as IconName,
      title: "Seguro y confiable",
      text: "Red filtrada y protegida, con acompañamiento y educación sobre el uso responsable de internet.",
    },
    {
      icon: "radioTower" as IconName,
      title: "Urbano y rural",
      text: "Mismo compromiso en el centro de Latacunga que en cada parroquia del cantón.",
    },
    {
      icon: "users2" as IconName,
      title: "Con soporte cercano",
      text: "Talleres de alfabetización digital y puntos de ayuda para adultos mayores y emprendedores.",
    },
  ],
  zonas: [
    {
      nombre: "Parque Vicente León y centro histórico",
      tipo: "Urbana",
      puntos: ["Plaza principal", "Parque Vicente León", "Atrio de la Catedral", "Mercado Central"],
    },
    {
      nombre: "Barrios del norte",
      tipo: "Urbana",
      puntos: ["Eloy Alfaro", "San Felipe", "La Estación", "20 de Noviembre"],
    },
    {
      nombre: "Barrios del sur",
      tipo: "Urbana",
      puntos: ["San Buenaventura", "El Calvario", "Ignacio Flores", "San José"],
    },
    {
      nombre: "Parroquias rurales I",
      tipo: "Rural",
      puntos: ["Aláquez", "Guaytacama", "Tanicuchí", "Toacaso"],
    },
    {
      nombre: "Parroquias rurales II",
      tipo: "Rural",
      puntos: ["Mulaló", "Pastocalle", "Poaló", "Belisario Quevedo"],
    },
  ] as WifiZona[],
  fases: [
    { fase: "Fase 1", detalle: "Plazas, parques y espacios emblemáticos del casco urbano." },
    { fase: "Fase 2", detalle: "Mercados, unidades educativas, centros de salud y espacios deportivos." },
    { fase: "Fase 3", detalle: "Barrios priorizados y puntos digitales comunitarios." },
    { fase: "Fase 4", detalle: "Parroquias rurales y conectividad para la producción campesina." },
  ],
};

export interface AgendaItem {
  day: string;
  month: string;
  title: string;
  place: string;
  time: string;
  tag: string;
}

export const agenda: AgendaItem[] = [
  {
    day: "05",
    month: "OCT",
    title: "Casa abierta: hablemos de internet gratis",
    place: "Parque Vicente León, Latacunga",
    time: "16:00",
    tag: "Comunidad",
  },
  {
    day: "12",
    month: "OCT",
    title: "Recorrido y asamblea barrial",
    place: "Barrio San Buenaventura",
    time: "18:30",
    tag: "Barrio",
  },
  {
    day: "19",
    month: "OCT",
    title: "Minga de espacio público",
    place: "Barrio Eloy Alfaro",
    time: "08:00",
    tag: "Obra",
  },
  {
    day: "26",
    month: "OCT",
    title: "Encuentro de emprendedores latacungueños",
    place: "Mercado Central",
    time: "10:00",
    tag: "Empleo",
  },
  {
    day: "02",
    month: "NOV",
    title: "Visita y reunión en parroquias rurales",
    place: "Tanicuchí y Toacaso",
    time: "09:00",
    tag: "Rural",
  },
  {
    day: "09",
    month: "NOV",
    title: "Foro: seguridad y convivencia ciudadana",
    place: "Salón municipal, Latacunga",
    time: "17:00",
    tag: "Seguridad",
  },
];

export interface Testimonio {
  name: string;
  role: string;
  text: string;
  initials: string;
  tone: Tone;
}

export const testimonios: Testimonio[] = [
  {
    name: "María Cabrera",
    role: "Comerciante, Mercado Central",
    text: "El Arqui llegó, se sentó en mi puesto y escuchó. No vino a pedir el voto y desaparecer. Queremos que el mercado tenga internet y esté limpio.",
    initials: "MC",
    tone: "accent",
  },
  {
    name: "Luis Toapanta",
    role: "Dirigente barrial, San Buenaventura",
    text: "Nos ayudó con los planos y la gestión para recuperar el parque. Es un hombre de obra y de palabra. Eso es lo que necesita Latacunga.",
    initials: "LT",
    tone: "brand",
  },
  {
    name: "Ana Chicaiza",
    role: "Estudiante universitaria",
    text: "Con internet en las plazas podría estudiar sin gastar datos. Además quiere becas para quienes venimos de las parroquias.",
    initials: "AC",
    tone: "signal",
  },
  {
    name: "Segundo Vaca",
    role: "Productor, Tanicuchí",
    text: "Queremos conectividad y vías buenas para vender lo que sembramos. Rodrigo entiende al campo porque ha trabajado con nosotros.",
    initials: "SV",
    tone: "brand",
  },
  {
    name: "Patricia Hidalgo",
    role: "Emprendedora, Latacunga",
    text: "Pide créditos y capacitación para negocios de barrio. Yo vendo artesanías y necesito ese empujón para crecer.",
    initials: "PH",
    tone: "accent",
  },
  {
    name: "Jorge Guamangate",
    role: "Docente",
    text: "Hablar de conectividad en colegios y laboratorios digitales no es discurso, es educación. Los profesores lo apoyamos.",
    initials: "JG",
    tone: "signal",
  },
];

export interface Noticia {
  category: string;
  date: string;
  title: string;
  excerpt: string;
  tone: Tone;
}

export const noticias: Noticia[] = [
  {
    category: "Propuesta",
    date: "18 sep 2026",
    title: "Rodrigo Espín presenta el plan de Internet Gratis para Latacunga",
    excerpt:
      "El candidato detalló las cuatro fases para llevar WiFi libre y fibra óptica a barrios, mercados, unidades educativas y parroquias rurales del cantón.",
    tone: "signal",
  },
  {
    category: "Recorrido",
    date: "11 sep 2026",
    title: "El Arqui te acolita llegó al barrio Eloy Alfaro",
    excerpt:
      "Vecinos y dirigentes expusieron la necesidad de iluminación, seguridad y recuperación del parque barrial durante una asamblea abierta.",
    tone: "brand",
  },
  {
    category: "Empleo",
    date: "04 sep 2026",
    title: "Encuentro de emprendedores: créditos y ferias para el comercio local",
    excerpt:
      "Rodrigo Espín se reunió con emprendedores y artesanos para construir una agenda de apoyo a la economía popular y solidaria.",
    tone: "accent",
  },
  {
    category: "Rural",
    date: "28 ago 2026",
    title: "Un solo Latacunga: gira por las parroquias rurales del cantón",
    excerpt:
      "Conectividad, vías y riego fueron los temas centrales del recorrido por Mulaló, Pastocalle y Tanicuchí.",
    tone: "brand",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "¿Quién es Rodrigo Espín?",
    a: "Rodrigo Espín es arquitecto, emprendedor y vecino de Latacunga. Dirige un estudio de diseño y construcción, ha trabajado con comunidades de todo el cantón y hoy es candidato a Alcalde encabezando el Movimiento Ciudadano El Arqui.",
  },
  {
    q: "¿Qué significa “El Arqui te acolita”?",
    a: "Es un compromiso en tres palabras: te acompaña, te escucha y te cumple. “Acolitar” es estar al lado de la gente, empujar y no dejar sola a la comunidad. El Arqui no gobierna desde un escritorio, gobierna caminando el barrio.",
  },
  {
    q: "¿El internet gratis va a llegar a las parroquias rurales?",
    a: "Sí. El plan tiene cuatro fases y la ruralidad es parte central. Toda parroquia tendrá al menos un punto digital comunitario, y se tenderá conectividad para unidades educativas, centros de salud y zonas productivas.",
  },
  {
    q: "¿De dónde saldrá el dinero para tantas propuestas?",
    a: "De tres fuentes: mejor uso del presupuesto municipal (compras transparentes y menos gasto corriente), convenios con empresa privada y academia, y cooperación internacional. Además, cada peso se publicará en línea para que la ciudadanía lo vigile.",
  },
  {
    q: "¿Cómo va a mejorar la seguridad?",
    a: "Con videovigilancia modernizada, más y mejores luminarias, botón de auxilio digital, patrullaje cercano coordinado con la Policía y mesas de seguridad barriales que funcionen de verdad.",
  },
  {
    q: "¿Cómo puede participar un vecino en la campaña?",
    a: "Sumándose como voluntario, organizando una casa abierta en su barrio, compartiendo las propuestas en redes o apoyando con una donación. Toda ayuda cuenta y se maneja con transparencia.",
  },
  {
    q: "¿Qué pasa si no gana?",
    a: "El plan de trabajo es público y quedará como agenda ciudadana. Rodrigo seguirá trabajando por Latacunga desde su profesión y desde las organizaciones barriales, empujando las propuestas con la comunidad.",
  },
  {
    q: "¿Cómo se rendirá cuentas del dinero de la campaña?",
    a: "Con cuentas claras: el movimiento presentará sus ingresos y gastos ante el organismo electoral y además los publicará de forma abierta para que cualquier vecino pueda revisarlos.",
  },
];

export interface VolunteerRole {
  icon: IconName;
  title: string;
  text: string;
}

export const volunteerRoles: VolunteerRole[] = [
  { icon: "megaphone", title: "Vocero de barrio", text: "Comparte las propuestas en tu junta barrial y organiza casas abiertas." },
  { icon: "handHeart", title: "Voluntario en recorridos", text: "Acompaña las visitas territoriales y ayuda a levantar necesidades del sector." },
  { icon: "monitor", title: "Equipo digital", text: "Ayuda a crear contenido, difundir en redes y manejar datos de la campaña." },
  { icon: "calendar", title: "Logística y eventos", text: "Apoya en mingas, asambleas, ferias y actividades comunitarias." },
];

export interface DonationTier {
  amount: string;
  title: string;
  text: string;
  tone: Tone;
}

export const donationTiers: DonationTier[] = [
  {
    amount: "$10",
    title: "Aporte vecino",
    text: "Financia material informativo para las casas abiertas en los barrios.",
    tone: "brand",
  },
  {
    amount: "$50",
    title: "Impulso de barrio",
    text: "Ayuda a movilizar una jornada de recorrido y asamblea territorial.",
    tone: "accent",
  },
  {
    amount: "$100",
    title: "Construye ciudad",
    text: "Sostiene una minga de recuperación de espacio público con la comunidad.",
    tone: "signal",
  },
];

export const transparencia: string[] = [
  "Cuentas de campaña publicadas de forma abierta",
  "Aportes registrados y auditados ante el organismo electoral",
  "Cero uso de recursos públicos en la campaña",
  "Plan de trabajo firmado y disponible para la ciudadanía",
];

export const socials: { name: string; href: string; icon: "facebook" | "instagram" | "twitter" | "youtube" | "tiktok" }[] = [
  { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { name: "TikTok", href: "https://tiktok.com", icon: "tiktok" },
  { name: "X", href: "https://x.com", icon: "twitter" },
  { name: "YouTube", href: "https://youtube.com", icon: "youtube" },
];

export const marqueeItems: string[] = [
  "El Arqui te acolita",
  "Internet gratis para Latacunga",
  "Barrio seguro, ciudad tranquila",
  "Obra pública que se ve",
  "Empleo para nuestra gente",
  "Un solo Latacunga",
  "Mama Negra, orgullo nuestro",
];

export const imagenes = {
  hero: "/img/hero-latacunga.webp",
  retrato: "/img/retrato-arqui.webp",
  planos: "/img/arquitecto-planos.webp",
  wifi: "/img/comunidad-wifi.webp",
  obra: "/img/obra-espacio-publico.webp",
  mamaNegra: "/img/mama-negra.webp",
  mercado: "/img/mercado.webp",
  parroquia: "/img/parroquia-rural.webp",
};

export interface DonutData {
  value: number;
  label: string;
  sublabel: string;
  color: string;
}

export const diagnostico = {
  intro: [
    "Antes de proponer, hay que medir. El equipo de Rodrigo Espín recorrió barrios y parroquias, levantó datos y escuchó a la gente para entender dónde duele Latacunga y por dónde hay que empezar.",
    "Estos números no son para asustar: son la radiografía que sostiene cada propuesta del plan. Donde hay una brecha, hay un eje de trabajo con meta y presupuesto.",
  ],
  disclaimer:
    "Cifras de diagnóstico elaboradas por el equipo de campaña con recorridos territoriales y fuentes locales. Son referenciales y se actualizarán con un observatorio ciudadano abierto.",
  donuts: [
    {
      value: 58,
      label: "de los hogares no tienen internet fijo en casa",
      sublabel: "La brecha digital golpea más a las parroquias rurales.",
      color: "#0fb5a3",
    },
    {
      value: 92,
      label: "de los barrios no tienen WiFi público municipal",
      sublabel: "Solo unas pocas cuadras céntricas cuentan con conexión libre.",
      color: "#1552d4",
    },
    {
      value: 67,
      label: "de los vecinos percibe inseguridad en su sector",
      sublabel: "Falta iluminación, cámaras y presencia en las calles.",
      color: "#ff8a1e",
    },
  ] as DonutData[],
  trend: {
    title: "Hogares de Latacunga con acceso a internet (2019–2026)",
    caption:
      "El acceso crece, pero todavía 6 de cada 10 hogares quedan fuera. La meta del plan es cerrar esa brecha con red municipal y alfabetización digital.",
    points: [
      { label: "2019", value: 30 },
      { label: "2020", value: 36 },
      { label: "2021", value: 43 },
      { label: "2022", value: 48 },
      { label: "2023", value: 55 },
      { label: "2024", value: 61 },
      { label: "2025", value: 66 },
      { label: "2026", value: 71 },
    ],
  },
  bars: {
    title: "Cobertura de servicios en las parroquias rurales",
    items: [
      { label: "Alumbrado público", value: 82, color: "#1552d4" },
      { label: "Agua potable", value: 74, color: "#0fb5a3" },
      { label: "Alcantarillado", value: 61, color: "#0fb5a3" },
      { label: "Vialidad en buen estado", value: 57, color: "#ff8a1e" },
      { label: "Acceso a internet", value: 38, color: "#e2720a", note: "La brecha más grande y la más urgente." },
    ],
  },
  kpis: [
    { icon: "target" as IconName, value: 18, suffix: "", label: "ejes con meta y responsable", tone: "brand" as Tone },
    { icon: "clock" as IconName, value: 100, suffix: " días", label: "para las primeras obras priorizadas", tone: "accent" as Tone },
    { icon: "shield" as IconName, value: 4, suffix: "", label: "rendiciones de cuentas al año", tone: "signal" as Tone },
  ],
};

export interface GaleriaItem {
  src: string;
  title: string;
  text: string;
  tag: string;
  tone: Tone;
  wide?: boolean;
}

export const galeria: GaleriaItem[] = [
  {
    src: imagenes.mamaNegra,
    title: "La Mama Negra, nuestra identidad",
    text: "Patrimonio vivo que genera turismo, empleo y orgullo. Merece gestión, seguridad y promoción de verdad.",
    tag: "Cultura",
    tone: "accent",
    wide: true,
  },
  {
    src: imagenes.mercado,
    title: "Mercados y comercio",
    text: "Quien madruga a vender merece un mercado limpio, seguro y digitalizado.",
    tag: "Empleo",
    tone: "brand",
  },
  {
    src: imagenes.parroquia,
    title: "El campo también es Latacunga",
    text: "Vías, riego y conectividad para que la producción campesina crezca.",
    tag: "Rural",
    tone: "signal",
  },
  {
    src: imagenes.obra,
    title: "Espacio público para la gente",
    text: "Parques, aceras y plazas recuperadas con accesibilidad y diseño.",
    tag: "Obra",
    tone: "brand",
  },
];
