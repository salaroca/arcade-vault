# SPEC 04 — Integración base de Supabase

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-11-28
> **Objective:** Instalar y configurar el cliente de Supabase en el proyecto Next.js para que futuros specs puedan consumir Auth y DB sin repetir la infraestructura base.

---

## Scope

**In:**

- Obtener las credenciales del proyecto Supabase existente.
- Instalar `@supabase/supabase-js` y `@supabase/ssr`.
- Añadir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` a `.env.local` y a `.env.template`.
- Crear helper de cliente para el **browser**: `lib/supabase/client.ts`.
- Crear helper de cliente para el **servidor** (Server Components / Route Handlers): `lib/supabase/server.ts`.
- Verificar que el cliente se inicializa correctamente arrancando la app.

**Out of scope:**

- Autenticación de usuarios (registro, login, sesión) — spec futuro.
- Creación de tablas o migraciones SQL — spec futuro.
- Row Level Security — spec futuro.
- Supabase Storage — spec futuro.
- Supabase Edge Functions — spec futuro.
- Cambios en ninguna página ni componente existente.

---

## Data model

No se introducen nuevas estructuras de datos en la aplicación. Los helpers devuelven un cliente `SupabaseClient` tipado; los tipos de base de datos se generarán en un spec futuro cuando existan tablas.

---

## Implementation plan

1. **Obtener credenciales** — En el dashboard de Supabase, abrir el proyecto existente y copiar `Project URL` y `anon public key` desde _Settings → API_. Verificar: ambos valores están disponibles.

2. **Instalar paquetes** — Ejecutar `npm install @supabase/supabase-js @supabase/ssr`. Verificar: ambos aparecen en `package.json`.

3. **Configurar variables de entorno** — Añadir a `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<Project URL>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon public key>
   ```

   Añadir las mismas claves (sin valor) a `.env.template`. Verificar: `.env.local` contiene ambas variables con sus valores reales.

4. **Helper de cliente browser** — Crear `lib/supabase/client.ts`:

   ```ts
   import { createBrowserClient } from "@supabase/ssr";

   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
     );
   }
   ```

   Verificar: `tsc --noEmit` no produce errores.

5. **Helper de cliente servidor** — Crear `lib/supabase/server.ts`:

   ```ts
   import { createServerClient } from "@supabase/ssr";
   import { cookies } from "next/headers";

   export async function createClient() {
     const cookieStore = await cookies();
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
       {
         cookies: {
           getAll() {
             return cookieStore.getAll();
           },
           setAll(cookiesToSet) {
             try {
               cookiesToSet.forEach(({ name, value, options }) =>
                 cookieStore.set(name, value, options)
               );
             } catch {}
           },
         },
       }
     );
   }
   ```

   Verificar: `tsc --noEmit` no produce errores.

6. **Smoke test** — Arrancar `next dev` y confirmar que no hay errores de compilación ni de consola relacionados con Supabase. Verificar: `localhost:3000` carga correctamente.

---

## Acceptance criteria

- [ ] `npm install` completa sin errores; `package.json` incluye `@supabase/supabase-js` y `@supabase/ssr`.
- [ ] `.env.local` contiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con valores reales.
- [ ] `.env.template` contiene las mismas claves sin valor.
- [ ] `lib/supabase/client.ts` existe y exporta `createClient()`.
- [ ] `lib/supabase/server.ts` existe y exporta `createClient()`.
- [ ] `tsc --noEmit` no produce errores de tipos.
- [ ] `next dev` arranca sin errores de compilación ni de consola.
- [ ] Ninguna página ni funcionalidad existente presenta regresiones.

---

## Decisions

- **Sí: `@supabase/ssr` en lugar de `@supabase/auth-helpers-nextjs`.** `auth-helpers-nextjs` está deprecado; `@supabase/ssr` es el paquete oficial recomendado para Next.js App Router.
- **No: un único helper universal.** Next.js App Router requiere clientes distintos para browser y servidor por cómo gestiona cookies y el contexto de Request/Response.
- **Sí: `lib/supabase/` como directorio de helpers.** Convención clara; facilita que futuros specs importen desde la misma ruta.
- **No: inicializar el cliente directamente en cada componente.** Los helpers centralizan la configuración y evitan repetición.
- **Sí: proyecto existente reutilizado.** El proyecto ya estaba creado en Supabase; solo se necesitan las credenciales desde _Settings → API_.
- **Sí: definición rápida sin clarificación detallada.** El usuario confirmó explícitamente que el objetivo es solo la infraestructura base para specs futuros.
