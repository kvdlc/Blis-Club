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

### Fotos e imágenes (REGLAS OBLIGATORIAS)
- **NUNCA** pedir una URL/link para cargar una imagen o foto. Siempre se sube por **archivo** desde el dispositivo.
- Usar las funciones de subida existentes en `src/lib/storage.ts` (ej. `uploadDogPhoto`, `uploadAutoPhoto`, `uploadDocumentPhoto`, etc.) que reciben un `File` y hacen `supabase.storage.from(...).upload(...)`, o crear una análoga si se necesita un bucket/ruta distinta.
- En los formularios usar `<input type="file" accept="image/*" />` (oculto dentro de un label) y mostrar la miniatura con `<img src={url} />` una vez subida.
- No usar campos de texto para pegar URLs de imágenes.

## Supabase Projects

Este repo (Blis Club) tiene **varios proyectos** en la misma cuenta de Supabase. El MCP local (`opencode.json`, NO commiteado) apunta al proyecto correcto de este repo. La config global (`~/.config/opencode/opencode.jsonc`) apunta a OTRO proyecto — no usarla aquí.

### Proyecto de Blis Club (este repo)
- **Project ref**: `yauoswqvuwruufozwduu`
- **Nombre**: `blis-club`
- **URL**: `https://yauoswqvuwruufozwduu.supabase.co`
- **Contenido**: Aplicaciones Spartan, Guau (perros), Auto (vehículos)
- **Migraciones**: `supabase/migrations/00001` a `00077+`
- **Tablas Spartan**: `spartan_*`, `applications`, `user_apps`, `profiles`, etc.
- Uso de DB: `src/lib/supabase/server.ts` (client), `client.ts` (browser), `service.ts` (service_role)
- Para DDL/migraciones usar el MCP conectado a `yauoswqvuwruufozwduu`

### Otros proyectos (NO tocar desde este repo)
- La config MCP **global** puede apuntar a OTROS proyectos (p. ej. `kqjlckaavrwtxnroacrk`).
- ⚠️ NO ejecutar migraciones de Blis Club en esas conexiones. Este repo aísla su DB con
  `opencode.json`, que sobreescribe la global.

## Conexiones MCP / Tokens (IMPORTANTE)

Cada repo define su propia conexión MCP en `opencode.json` en la raíz (está en `.gitignore`, no se commitea).
La config **global** (`~/.config/opencode/opencode.jsonc`) NO se usa para proyectos: solo contiene MCPs
de cuenta (playwright, firecrawl, tavily, vercel) y un Supabase por defecto que este repo SOBREESCRIBE.

### Este repo (Blis Club)
- `opencode.json` (raíz) define `mcp.supabase` con `project_ref=yauoswqvuwruufozwduu`.
- El token se lee con `{file:~/.secrets/supabase-blis-club.pat}` (nunca vive en el repo).
- La config de proyecto sobreescribe la global: en este proyecto solo se ve blis-club.
- `github` también se define aquí leyendo `{file:~/.secrets/github.pat}`.

### Secretos (fuera del repo, en `~/.secrets/`)
- `supabase-blis-club.pat` → PAT (`sbp_...`) con acceso a `yauoswqvuwruufozwduu`.
- `github.pat` → PAT de GitHub.
- `firecrawl.key`, `tavily.key` → claves de esos MCP.

### Reglas
- Para este repo SIEMPRE usa el MCP `supabase` del proyecto (apunta a blis-club). Si ves `trading_*`,
  `whatsapp_*`, `clientes`, `proyectos`, `lotes`… estás en el proyecto EQUIVOCADO — detente.
- Si Supabase devuelve `403 Forbidden` / `You do not have permission`, el token no cubre el proyecto:
  revisa `~/.secrets/supabase-blis-club.pat`.
- Los cambios de config NO se recargan en caliente: hay que **reiniciar opencode**.

### Agregar otro proyecto (patrón)
1. Crear `opencode.json` en la raíz de ese repo con su propio `mcp.supabase` (`project_ref` distinto).
2. Poner su token en `~/.secrets/<algo>.pat` y referenciarlo con `{file:...}`.
3. Verificar con `opencode debug config` (debe aparecer solo su `project_ref`).
4. Reiniciar opencode.

**Verificación rápida:** `list_tables` en schema `public`. Si ves `spartan_*` → blis-club (correcto).
Si ves `trading_*`/`whatsapp_*`/`clientes` → conexión equivocada.

