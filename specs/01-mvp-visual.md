# SPEC 01 — MVP Visual de Arcade Vault

> **Status:** Aprobado
> **Depends on:** —
> **Date:** 2026-11-21
> **Objective:** Portar las 5 pantallas del template HTML a Next.js App Router con TypeScript, solo la parte visual (sin lógica de juego real).

---

## Scope

**In:**

- Pantalla Biblioteca (`/`) — lista de juegos con búsqueda y filtros por categoría.
- Pantalla Detalle (`/juego/[id]`) — ficha de un juego con estadísticas y leaderboard seeded.
- Pantalla Reproductor (`/juego/[id]/jugar`) — placeholder CSS animado (nave, enemigos, grilla neón) con HUD, pausa y modal "Fin de juego".
- Pantalla Auth (`/auth`) — formulario de login/registro con tabs y botón "Jugar como invitado".
- Pantalla Salón de la Fama (`/salon`) — pódium y tabla de scores seeded por juego.
- Nav global con hamburger mobile y estado de usuario (logged/guest).
- Footer global.
- Datos tipados en `app/data/` (GAMES, CATS, seededScores) — mock data que eventualmente vendrá de una base de datos.
- CSS del template portado a `app/globals.css`.
- Estado de usuario fake con localStorage (sin backend).

**Out of scope (para specs futuras):**

- Lógica real de ningún juego.
- Backend / API de autenticación o scores.
- Scores persistidos realmente en servidor.
- Versiones móviles nativas.
- Internacionalización.

---

## Data model

```ts
// app/data/games.ts  — mock data; en el futuro se reemplaza por queries a BD
export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string;        // CSS class, e.g. "cover-bricks"
  color: "cyan" | "magenta" | "green" | "yellow";
  best: number;
  plays: string;
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export const GAMES: Game[] = [ /* 8 juegos del template */ ];
export const CATS: string[] = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];
export function seededScores(seed: number, count?: number): ScoreRow[];
```

```ts
// app/context/UserContext.tsx  (client component)
interface User { name: string; }
interface UserContextValue {
  user: User | null;
  login: (u: User) => void;
  signOut: () => void;
}
// Persiste en localStorage bajo la clave "av_user"
```

No se introducen nuevas estructuras de base de datos ni APIs.

---

## Implementation plan

1. **Datos y CSS base** — Crear `app/data/games.ts` con los 8 juegos, CATS y `seededScores` tipados (mock data, preparada para sustituirse por queries a BD). Portar `references/templates/styles.css` a `app/globals.css` (añadir al final, sin borrar el CSS existente). Verificar: `next dev` arranca sin errores.

2. **UserContext** — Crear `app/context/UserContext.tsx` como Client Component con `UserProvider` y hook `useUser`. El provider lee/escribe `av_user` en localStorage. Envolver `{children}` en `app/layout.tsx` con `<UserProvider>`.

3. **Nav** — Crear `app/components/Nav.tsx` como Client Component. Usa `usePathname` de Next.js para marcar el enlace activo. Incluir hamburger mobile. Montarlo en `app/layout.tsx` antes de `<main>`. Añadir footer en `app/layout.tsx`. Verificar: nav visible en `/`.

4. **Biblioteca** — Reescribir `app/page.tsx` con la pantalla Library: hero, barra de búsqueda, chips de categoría y grid de `GameCard`. Crear `app/components/GameCard.tsx` con el efecto tilt. Los cards navegan a `/juego/[id]`. Verificar: 8 cards visibles, filtros funcionales.

5. **Detalle** — Crear `app/juego/[id]/page.tsx` con la ficha del juego: cover, stats, `seededScores` y botón "Jugar ahora" → `/juego/[id]/jugar`. Verificar: accesible desde cada card.

6. **Reproductor** — Crear `app/juego/[id]/jugar/page.tsx` con HUD (jugador, puntuación, vidas, nivel), pantalla CRT con placeholder animado, overlay de pausa y modal "Fin de juego" con input de nombre y botón guardar (escribe en localStorage `av_scores`). Verificar: pausa/reanudar funciona, modal aparece al pulsar FIN.

7. **Auth** — Crear `app/auth/page.tsx` con tabs "Iniciar Sesión" / "Crear Cuenta", campos de formulario y botón "Jugar como invitado". Al hacer login/submit llama a `useUser().login()` y redirige a `/`. Verificar: tras login el nav muestra el nombre del usuario.

8. **Salón de la Fama** — Crear `app/salon/page.tsx` con pódium (oro/plata/bronce), tabs por juego y tabla con `seededScores`. Si hay usuario, mostrar su fila destacada en amarillo. Verificar: cambiar tab actualiza scores.

---

## Acceptance criteria

- [ ] `next dev` arranca sin errores de compilación ni de consola.
- [ ] `tsc --noEmit` no produce errores de tipos.
- [ ] La Biblioteca muestra las 8 GameCards.
- [ ] El filtro de categoría oculta correctamente los juegos que no pertenecen a ella.
- [ ] La búsqueda por nombre filtra en tiempo real.
- [ ] El efecto tilt 3D de GameCard se activa al mover el ratón sobre la card.
- [ ] El Nav marca como activo el enlace de la ruta actual.
- [ ] El hamburger mobile abre y cierra el panel lateral.
- [ ] La pantalla Detalle muestra el título, descripción larga, estadísticas y 10 filas de leaderboard seeded.
- [ ] El botón "Jugar ahora" en Detalle navega al Reproductor.
- [ ] El Reproductor muestra el placeholder CSS animado (nave, enemigos, grilla).
- [ ] El botón Pausa muestra el overlay "EN PAUSA"; Reanudar lo oculta.
- [ ] El botón FIN abre el modal "Fin de juego" con la puntuación final.
- [ ] El botón "Guardar puntuación" escribe en `localStorage["av_scores"]`.
- [ ] La pantalla Auth muestra los dos tabs; el campo email solo aparece en "Crear Cuenta".
- [ ] "Jugar como invitado" actualiza el nav (sin nombre de usuario) y redirige a `/`.
- [ ] Hacer login muestra el nombre del usuario en el Nav.
- [ ] El Salón de la Fama muestra pódium y tabla de 12 filas para cada juego.
- [ ] Si hay usuario logueado, su fila aparece en amarillo al pie de la tabla.

---

## Decisions

- **Sí: Next.js App Router file-based routing.** Más idiomático para el stack declarado en CLAUDE.md. El hash-routing del template era una solución SPA sin framework.
- **No: Hash-routing SPA.** Descartado por no aprovechar Next.js y dificultar SSR futuro.
- **Sí: `app/components/` para componentes.** Proyecto de una sola app; no hay razón para sacarlos a la raíz.
- **No: `components/` en raíz.** Overhead sin beneficio en este contexto.
- **Sí: `app/data/games.ts` para datos.** La carpeta `app/data/` agrupa toda la capa de datos mock; facilita la migración futura a queries reales de BD sin tocar los componentes.
- **No: `lib/data.ts`.** Válido técnicamente, pero `app/data/` comunica mejor la intención de que esos datos serán reemplazados por una fuente real dentro del mismo proyecto Next.js.
- **Sí: Volcar `styles.css` en `app/globals.css`.** Porto directo sin renombrar clases; Tailwind v4 y el CSS del template usan espacios de nombres distintos (`av-*`, `cover-*`).
- **No: CSS Modules.** Implicaría renombrar todas las clases del template; coste alto sin ganancia clara en el MVP.
- **Sí: Placeholder animado en Reproductor.** Mantiene el impacto visual del template; es parte del "MVP visual".
- **No: Pantalla "Próximamente".** Pierde el valor visual que justifica el MVP.
- **Sí: UserContext con localStorage.** Gestión de sesión fake sin backend; suficiente para el MVP visual.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Conflicto de variables CSS entre Tailwind v4 `@theme` y los tokens `--cyan`, `--magenta` del template | Revisar colisiones tras el paso 1; renombrar los tokens del template si es necesario (ej. `--av-cyan`). |
| Componentes del template que usan `window`/`localStorage` directamente lanzan error en SSR | Marcar esos componentes con `'use client'`; usar `typeof window !== 'undefined'` donde sea necesario. |

---

## What is **not** in this spec

- Lógica real de ningún juego.
- Backend de autenticación o scores.
- Persistencia de scores en servidor.
- Integración con Google / GitHub (los botones aparecen pero no hacen nada).

Cada uno de esos puntos, si llega, va en su propio spec.
