# AGENTS.md

## Language Rules

### Spanish
- **ALWAYS use Latin American Spanish (español neutro)**, never Argentine Spanish (voseo).
- Use "tú" conjugation, NOT "vos": "tú tienes" not "vos tenés", "tú puedes" not "vos podés".
- Imperative: "registra", "elige", "escribe", "prueba", "combina", "entra", "guarda", "busca", "cambia" (never "registrá", "elegí", "escribí", "probá", "combiná", "entrá", "guardá", "buscá", "cambiá").
- Present tense: "tú sirves" not "vos servís", "tú tienes" not "vos tenés".
- Attached pronouns with accent: "bájalo" "súbelo" (not unaccented "bajalo" "subilo").
- Examples of BAD (Argentine): "Registrá tu perro", "Probá con otra palabra", "Ideal si tenés poco tiempo", "Elegí según tu estilo"
- Examples of GOOD (Latin American): "Registra tu perro", "Prueba con otra palabra", "Ideal si tienes poco tiempo", "Elige según tu estilo"

### Technical Rules
- Never use `void` prefix for async calls that should be awaited or error-checked
- Always use `service_role` client for admin operations and webhooks
- Use `{ scroll: false }` with `router.replace` for tab navigation
- Read from `useSearchParams` directly instead of relying on `initialTab` prop for tab state
