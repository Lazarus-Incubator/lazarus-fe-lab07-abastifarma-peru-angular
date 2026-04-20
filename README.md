# AbastiFarma Perú

## Propósito del laboratorio

Este proyecto presenta comportamientos inconsistentes en flujos importantes del sistema.

Tu trabajo como estudiante es ingresar como si fueras parte de un equipo frontend que recibe un sistema heredado y necesita:

- entender cómo está organizado
- recorrer la aplicación con criterio
- reproducir problemas reales
- detectar causas probables
- corregir errores funcionales y técnicos
- mejorar la consistencia del frontend
- dejar evidencia clara de lo que encontraste y corregiste

---

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

---

## Instalación

```bash
npm install
```

---

## Ejecución

1. Levantar la fake API con JSON Server:

```bash
npm run api
```

2. En otra terminal, levantar Angular:

```bash
npm start
```

La aplicación quedará disponible en `http://localhost:4200` y la fake API en `http://localhost:3000`.

---

## Credenciales de prueba

Usa más de un rol durante tu validación. No pruebes todo únicamente con `ADMIN`.

- `admin@abastifarma.pe / Admin123*`
- `operaciones@abastifarma.pe / Admin123*`
- `almacen@abastifarma.pe / Admin123*`
- `botica.lima@abastifarma.pe / Admin123*`
- `botica.arequipa@abastifarma.pe / Admin123*`
- `botica.trujillo@abastifarma.pe / Admin123*`

---

## Roles del sistema

- `ADMIN`: consulta todo el sistema y puede registrar solicitudes en cualquier sede activa.
- `OPERACIONES`: revisa solicitudes registradas y puede aprobarlas o rechazarlas.
- `ALMACEN`: revisa solicitudes aprobadas y puede marcarlas como atendidas.
- `BOTICA`: crea solicitudes para su propia sede y solo visualiza solicitudes de esa sede.

---

## Estructura principal

```text
src/app/
  core/
  shared/
  features/
  app.routes.ts
```

---

## Datos de laboratorio

La fake API incluida en `db.json` contiene:

- sedes en Lima, Arequipa, Trujillo y Chiclayo
- usuarios de distintos roles
- productos activos e inactivos
- solicitudes en estados `REGISTRADA`, `APROBADA`, `RECHAZADA` y `ATENDIDA`

---

## Alcance del trabajo

Debes concentrarte principalmente en estos flujos:

- autenticación y navegación inicial
- dashboard
- listado de solicitudes
- filtros y query params
- creación de solicitudes
- detalle de solicitud
- acciones por rol
- cambios de estado
- consistencia visual después de guardar o actualizar
- manejo de loading y error

No se espera que conviertas la app en otro proyecto distinto ni que rehagas toda la arquitectura.

Se espera que:

- entiendas primero
- reproduzcas después
- corrijas con criterio
- refactorices solo cuando aporte valor real

---

## Qué debes hacer

Trabaja con una lógica de diagnóstico profesional:

1. Levanta el proyecto y recorre la aplicación.
2. Inicia sesión con varios roles.
3. Revisa qué pantallas existen y qué acciones aparecen.
4. Contrasta lo que ves con lo que el rol debería poder hacer.
5. Reproduce comportamientos extraños de forma consistente.
6. Busca la causa antes de corregir.
7. Valida después de cada corrección importante.

No corrijas “a ciegas”. Antes de tocar código, intenta responder:

- ¿qué comportamiento es incorrecto?
- ¿cómo se reproduce?
- ¿qué regla del negocio o de la UI parece incumplirse?
- ¿el problema está en la pantalla, en la navegación, en el guard, en el service o en una utilidad compartida?

---

## Reglas funcionales que debes tener presentes

Toma estas reglas como referencia del comportamiento esperado del sistema:

- una solicitud nueva debe iniciar en estado `REGISTRADA`
- solo una solicitud `REGISTRADA` puede pasar a `APROBADA` o `RECHAZADA`
- solo una solicitud `APROBADA` puede pasar a `ATENDIDA`
- una solicitud `RECHAZADA` no debe volver al flujo operativo
- una solicitud `ATENDIDA` no debe volver a estados previos
- una sede inactiva no debería operar como una sede activa
- un usuario `BOTICA` debe operar dentro de su propio alcance
- la visibilidad de acciones debe ser coherente con el rol y con el estado actual del registro
- si la URL cambia o la pantalla se recarga, el comportamiento debe seguir siendo consistente

---

## Pistas de exploración

No son respuestas directas, pero sí puntos razonables desde donde empezar:

- si un problema parece de acceso o navegación, revisa rutas y guards
- si un problema ocurre al refrescar o entrar por URL directa, revisa sesión, restauración de contexto y protección de ruta
- si una acción se ve pero no debería estar visible, revisa tanto template como utilidades de permisos
- si una pantalla queda cargando demasiado, revisa loading, finalize, manejo de errores y flujos RxJS
- si el backend parece guardar pero la vista no cambia, revisa refresco de estado local
- si los filtros se comportan raro, revisa formulario, query params y rehidratación
- si el problema afecta a un rol específico, prueba con otro rol para comparar comportamiento

---

## Recomendación de recorrido

Una secuencia útil para empezar puede ser esta:

1. login con `ADMIN`
2. revisión general del dashboard
3. listado de solicitudes
4. aplicar filtros y refrescar la página
5. abrir detalle desde listado
6. volver al listado
7. probar creación con rol `BOTICA`
8. probar acciones de aprobación con `OPERACIONES`
9. probar atención con `ALMACEN`
10. intentar accesos directos por URL con distintos roles

---

## Qué se espera de tu entrega

Como mínimo, tu trabajo debería dejar evidencia de:

- problemas encontrados
- forma de reproducirlos
- causa o zona probable
- solución aplicada
- validación posterior a la corrección

Archivos sugeridos para acompañar tu solución:

- `HALLAZGOS.md`
- `DECISIONES.md`

---

## Criterio de trabajo esperado

Se evaluará más tu criterio que la cantidad de archivos modificados.

Eso implica:

- leer antes de tocar
- reproducir antes de corregir
- no ocultar el síntoma sin arreglar la causa
- no sobre-refactorizar por gusto
- no asumir que si algo funciona con `ADMIN`, entonces ya está bien
- no confiar solo en la UI; también debes pensar en acceso por ruta, estado y flujo completo

---

## Nota final

Tu meta es dejar el sistema en un estado **más estable, más coherente y mejor explicado** que el que recibiste.
