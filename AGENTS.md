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

### Otro proyecto (NO tocar desde este repo)
- **Project ref**: `srjhrhiesienkofisvnv`
- **Nombre**: `Blis Project` / otro
- **Contenido**: trading, whatsapp, comunidad, email, etc.
- ⚠️ La config MCP GLOBAL apunta a este proyecto. NO ejecutar migraciones de Blis Club ahí.

## Conexiones MCP / Tokens (IMPORTANTE)

Hay **dos conexiones MCP** con tokens DISTINTOS, cada uno restringido a un proyecto. No mezclarlos.

| Conexión | Archivo | Proyecto al que apunta | Token (últimos 6) | Uso |
|----------|---------|------------------------|-------------------|-----|
| **MCP local (este repo)** | `opencode.json` en la raíz | `yauoswqvuwruufozwduu` (blis-club) | `...aed22f2` | Migraciones Spartan/Guau/Auto |
| **MCP global** | `~/.config/opencode/opencode.jsonc` | `srjhrhiesienkofisvnv` (Blis Project) | `...1ff70a` | OTRO proyecto (no usar aquí) |

**Reglas:**
- Cuando ejecutes migraciones SQL o consultes tablas para este repo, SIEMPRE usa el MCP local (`opencode.json`), que apunta a `yauoswqvuwruufozwduu`. Si las tablas `spartan_*` no aparecen al listar, estás usando la conexión equivocada.
- Si ves tablas como `trading_history`, `whatsapp_messages`, `comunidad_*` o `email_*`, estás en el proyecto EQUIVOCADO (`srjhrhiesienkofisvnv`) — detente.
- El token del MCP global (`sbp_fceb...1ff70a`) NO tiene acceso a blis-club, y viceversa. Están aislados a propósito.
- Si las herramientas de Supabase devuelven `403 Forbidden` o `You do not have permission`, es que el token no cubre ese proyecto — cambia a la conexión correcta.

**Verificación rápida:** ejecutar `list_tables` en schema `public`. Si ves `spartan_*` → conexión correcta. Si ves `trading_*`/`whatsapp_*` → conexión equivocada.

