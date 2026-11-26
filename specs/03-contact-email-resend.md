# SPEC 03 — Envío de correo desde formulario de contacto (Resend)

> **Status:** Aprobado
> **Depends on:** SPEC 02
> **Date:** 2026-11-25
> **Objective:** Conectar el formulario de contacto de `/acerca` a Resend vía una API route de Next.js para enviar emails reales al administrador.

---

## Scope

**In:**

- Nueva API route `app/api/contact/route.ts` — POST handler que recibe `{ name, email, msg }` y llama a Resend.
- Modificar `app/acerca/page.tsx` — `onSubmit` llama a `/api/contact`; muestra `terminal-success` en éxito y `terminal-error` en fallo.
- Añadir variable `RESEND_API_KEY` a `.env.local` (placeholder; el usuario proveerá el valor real).
- Instalar el paquete `resend`.

**Out of scope:**

- Verificación de dominio propio en Resend.
- Confirmación de recepción por email al usuario que envía el formulario.
- Rate limiting o protección anti-spam.
- Cambios en cualquier otra página o componente.

---

## Data model

No se introducen nuevas estructuras persistentes. El body del POST es:

```ts
{ name: string; email: string; msg: string }
```

La API devuelve `{ ok: true }` en éxito o `{ ok: false, error: string }` en fallo.

---

## Implementation plan

1. **Instalar Resend** — `npm install resend`. Verificar: `package.json` contiene `"resend"`.

2. **Configurar `.env.local`** — Añadir `RESEND_API_KEY=REEMPLAZAR_CON_TU_KEY`. Verificar: el archivo existe y contiene la variable.

3. **API route** — Crear `app/api/contact/route.ts` con un handler `POST` que:
   - Lee `name`, `email`, `msg` del body JSON.
   - Valida que los tres campos estén presentes; devuelve 400 si falta alguno.
   - Instancia `new Resend(process.env.RESEND_API_KEY)` y llama a `resend.emails.send(...)` con:
     - `from`: `"Arcade Vault <onboarding@resend.dev>"`
     - `to`: `["sergi.sala10@gmail.com"]`
     - `subject`: `"[Arcade Vault] Nuevo mensaje de contacto"`
     - `html`: bloque con nombre, email y mensaje del usuario.
   - Devuelve `{ ok: true }` (200) o `{ ok: false, error: mensaje }` (500).
   - Verificar: `curl -X POST localhost:3000/api/contact -H "Content-Type: application/json" -d '{"name":"Test","email":"a@b.com","msg":"hola"}'` devuelve `{"ok":true}`.

4. **Cablear el formulario** — Modificar `onSubmit` en `app/acerca/page.tsx`:
   - Añadir estado `error: string | null` (inicialmente `null`).
   - En lugar de `setSent(form.name.trim())` directamente, hacer `fetch("/api/contact", ...)` con los datos del formulario.
   - En éxito (`ok: true`) → `setSent(form.name.trim())`.
   - En fallo (`ok: false` o excepción de red) → `setError(mensaje)`.
   - Mientras espera respuesta, deshabilitar el botón de envío (estado `loading: boolean`).
   - Verificar: formulario completo muestra terminal-success; API devolviendo error muestra terminal-error.

5. **Pantalla terminal-error** — Añadir rama en el JSX del formulario: cuando `error !== null`, mostrar un bloque `.terminal-success` (reutiliza los estilos) con:
   - Barra de título igual (`VAULT-OS // TERMINAL`).
   - Líneas de terminal con `[ERR]` en rojo/magenta y el texto de error.
   - Botón "REINTENTAR" que limpia `error` y vuelve al formulario (sin borrar los campos).
   - Verificar: estado de error visible con los estilos correctos.

---

## Acceptance criteria

- [ ] `npm install resend` completa sin errores; `package.json` incluye `"resend"`.
- [ ] `.env.local` contiene `RESEND_API_KEY`.
- [ ] `POST /api/contact` con body válido devuelve `{"ok":true}` (200).
- [ ] `POST /api/contact` con campos faltantes devuelve 400.
- [ ] Enviar el formulario completo en `/acerca` llama a `/api/contact` y muestra `terminal-success` al recibir `ok: true`.
- [ ] Si la API devuelve error, el formulario muestra la pantalla `terminal-error` con botón "REINTENTAR".
- [ ] "REINTENTAR" vuelve al formulario con los campos preservados (no se borran).
- [ ] El botón "▶ ENVIAR MENSAJE" queda deshabilitado mientras la petición está en vuelo.
- [ ] El email llega a `sergi.sala10@gmail.com` con asunto `[Arcade Vault] Nuevo mensaje de contacto`.
- [ ] `tsc --noEmit` no produce errores de tipos.
- [ ] `next dev` arranca sin errores de compilación.

---

## Decisions

- **Sí: API route en `/api/contact`.** La API key de Resend nunca debe exponerse al cliente; el handler server-side es el único lugar seguro.
- **No: llamar a Resend directamente desde el cliente.** Expondría `RESEND_API_KEY` en el bundle de browser.
- **Sí: `onboarding@resend.dev` como from.** No requiere verificar dominio propio; adecuado para esta fase.
- **No: dominio propio verificado.** Fuera de scope; se puede migrar más adelante sin cambiar la lógica.
- **Sí: terminal-error muestra los campos preservados al reintentar.** Mejor UX; el usuario no pierde el texto que escribió.
- **No: limpiar el formulario al reintentar.** Sería frustrante si el error es transitorio.
- **Sí: estado `loading` deshabilitando el botón.** Previene envíos dobles.
- **No: confirmación de email al remitente.** Fuera de scope por ahora.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| `RESEND_API_KEY` no configurada en producción | Documentar en `.env.local` con comentario; la API devuelve 500 con mensaje claro. |
| Resend rechaza `onboarding@resend.dev` en producción | Migrar a dominio verificado (spec futuro); no afecta el flujo actual. |
| `fetch` en `onSubmit` lanza excepción de red | Capturar en `catch` y llamar `setError(...)`. |
