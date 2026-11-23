# SPEC 02 — Páginas Home y Acerca de

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-11-23
> **Objective:** Implementar la landing page (`/`) y la página About + Contacto (`/acerca`) portando los templates de `references/templates/home-about/`, reubicar la Biblioteca a `/biblioteca` y actualizar el Nav.

---

## Scope

**In:**

- Nueva landing page en `app/page.tsx` — hero, features, games preview, stats, actividad en vivo, pricing, CTA final.
- Mover la Biblioteca de `app/page.tsx` a `app/biblioteca/page.tsx`.
- Nueva página en `app/acerca/page.tsx` — sección About + formulario de Contacto (solo frontend, sin API).
- Actualización de `app/components/Nav.tsx` — añadir enlaces "Inicio" (`/`) y "Acerca de" (`/acerca`); ajustar rutas activas.
- Actualización de cualquier enlace interno que apunte a `/` como Biblioteca (pasan a apuntar a `/biblioteca`).
- CSS del template `references/templates/home-about/styles.css` incorporado a `app/globals.css`.

**Out of scope:**

- Envío real del formulario de contacto (Formspree u otro servicio externo).
- Animaciones adicionales más allá de las del template (`.reveal`, `.fade-in`, `useReveal`).
- Cambios en rutas o lógica de los juegos (`/juego/[id]`, `/salon`, `/auth`).
- Internacionalización.

---

## Data model

No se introducen nuevas estructuras de datos. El Home reutiliza `GAMES` de `app/data/games.ts` para el carrusel de mini-cards (6 primeros juegos).

---

## Implementation plan

1. **CSS base** — Leer `references/templates/home-about/styles.css` y añadir su contenido al final de `app/globals.css`. Verificar: `next dev` arranca sin errores.

2. **Reubicar Biblioteca** — Crear `app/biblioteca/` y mover el contenido actual de `app/page.tsx` a `app/biblioteca/page.tsx` (sin cambios funcionales). Dejar `app/page.tsx` vacío/placeholder temporalmente. Verificar: `/biblioteca` muestra la biblioteca completa.

3. **Actualizar enlaces internos** — Revisar archivos que enlacen a `/` como destino de Biblioteca (`GameCard`, `app/juego/[id]/page.tsx`, `app/salon/page.tsx`) y cambiarlos a `/biblioteca`. Verificar: navegar desde una game card lleva a `/biblioteca` y no rompe ninguna ruta existente.

4. **Componente FloatingSilhouettes y FeatureIcon** — Crear `app/components/FloatingSilhouettes.tsx` y `app/components/FeatureIcon.tsx` como Server Components, portando los SVG pixel del template. Verificar: se renderizan sin errores de tipos.

5. **Componente MiniCard** — Crear `app/components/MiniCard.tsx` como Server Component recibiendo `game: Game` y `href: string`. Verificar: se puede importar desde el Home.

6. **Landing page Home** — Reescribir `app/page.tsx` con todas las secciones del template: hero, `<FloatingSilhouettes/>`, `FeatureIcon`, grid de features, mini-rail con los 6 primeros juegos usando `MiniCard`, stats, actividad en vivo (datos hardcoded del template), pricing + FAQ, CTA final. Usar `useReveal` con `IntersectionObserver` (Client Component o hook en componente client). Verificar: todas las secciones visibles en `localhost:3000/`.

7. **Página About + Contacto** — Crear `app/acerca/page.tsx` (Client Component) con sección hero, divider animado, formulario de contacto. Al enviar formulario válido, mostrar el `terminal-success` del template en lugar del formulario. Validación client-side: campos requeridos; shake animation si faltan campos. Verificar: formulario vacío agita, formulario completo muestra terminal.

8. **Actualizar Nav** — Editar `app/components/Nav.tsx`: añadir enlace "Inicio" apuntando a `/`, enlace "Acerca de" apuntando a `/acerca`; ajustar `isActive` para `/biblioteca` (activo cuando pathname es `/biblioteca` o `/juego/*`). Verificar: en cada ruta el enlace activo es el correcto.

---

## Acceptance criteria

- [ ] `next dev` arranca sin errores de compilación ni de consola.
- [ ] `tsc --noEmit` no produce errores de tipos.
- [ ] `localhost:3000/` muestra la landing page (hero con `FloatingSilhouettes`, 4 feature cards, mini-rail con 6 juegos, stats, actividad en vivo, pricing, CTA final).
- [ ] El botón "EXPLORAR JUEGOS" del hero navega a `/biblioteca`.
- [ ] El botón "CREAR CUENTA" navega a `/auth`.
- [ ] El mini-rail muestra 6 `MiniCard`; hacer click en una navega al detalle del juego correspondiente.
- [ ] Las secciones con clase `.reveal` aparecen con animación al hacer scroll.
- [ ] `localhost:3000/biblioteca` muestra la Biblioteca con las 8 GameCards y filtros funcionales (misma funcionalidad que antes en `/`).
- [ ] `localhost:3000/acerca` muestra la sección About (hero, highlights, divider animado) y el formulario de contacto.
- [ ] Enviar el formulario con campos vacíos aplica la clase `shake` al formulario.
- [ ] Enviar el formulario con todos los campos rellenos muestra la pantalla `terminal-success` con el nombre del usuario en mayúsculas.
- [ ] El botón "ENVIAR OTRO MENSAJE" vuelve al formulario vacío.
- [ ] El Nav muestra 4 enlaces: Inicio, Biblioteca, Salón de la Fama, Acerca de.
- [ ] El enlace "Inicio" aparece activo en `/`.
- [ ] El enlace "Biblioteca" aparece activo en `/biblioteca` y en `/juego/*`.
- [ ] El enlace "Acerca de" aparece activo en `/acerca`.
- [ ] Las rutas `/juego/[id]`, `/salon` y `/auth` siguen funcionando sin regresiones.

---

## Decisions

- **Sí: `/` → Home, `/biblioteca` → Library.** El nav del template usa "Inicio" como raíz; es la jerarquía natural de un sitio con landing page propia.
- **No: `/home` como ruta nueva sin mover la Biblioteca.** No sigue el patrón del template y deja la raíz con una página menos relevante.
- **Sí: `/acerca` para About.** Coherente con las rutas en español del proyecto (`/salon`, `/auth`).
- **No: `/about`.** Mezcla inglés/español en rutas del mismo nivel.
- **Sí: formulario solo frontend con terminal-success.** Coherente con el enfoque "MVP visual" del spec-01; no hay backend.
- **No: integración Formspree/EmailJS.** Dependencia externa fuera del scope visual.
- **Sí: Nav actualizado en este spec.** Las nuevas páginas no son alcanzables desde el nav sin este cambio; es parte inseparable de la feature.
- **Sí: CSS de home-about en `app/globals.css`.** Convención establecida en spec-01 para este proyecto.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| `useReveal` (IntersectionObserver) lanza error en SSR | Encapsular el hook en un Client Component o añadir guard `typeof window !== 'undefined'`. |
| Mover `/` a `/biblioteca` puede romper redirecciones hardcoded en otros componentes | Revisar todos los archivos que usan `href="/"` o `router.push("/")` con intención de ir a la Biblioteca antes del paso 3. |
| Colisión de clases CSS del template home-about con las ya portadas en spec-01 | Revisar nombres de clase al añadir el CSS; prefijos `.home-*`, `.about-*` deberían ser únicos. |

---

## What is **not** in this spec

- Envío real del formulario de contacto.
- Animaciones adicionales no presentes en el template.
- Cambios en `/juego/[id]`, `/salon` o `/auth`.
- Rutas de juego individuales o lógica de juego real.
