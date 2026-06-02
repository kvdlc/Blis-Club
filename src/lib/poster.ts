export const POSTER_FIELDS = {
  poster_title: { max: 40, default: "PERRO PERDIDO", label: "Título" },
  nombre: { max: 25, label: "Nombre" },
  raza: { max: 30, label: "Raza" },
  peso: { max: 10, label: "Peso" },
  lost_location: { max: 80, label: "Última vez visto", placeholder: "Ej: Parque Centenario, CABA" },
  lost_notes: { max: 140, label: "Notas / Señas particulares", placeholder: "Ej: Lleva collar azul, es amigable pero asustadizo" },
  poster_contact: { max: 60, label: "Contacto", placeholder: "Ej: +54 11 1234-5678" },
  poster_reward_amount: { max: 20, label: "Recompensa", placeholder: "Ej: $5,000" },
} as const;

export type PosterFieldKey = keyof typeof POSTER_FIELDS;
