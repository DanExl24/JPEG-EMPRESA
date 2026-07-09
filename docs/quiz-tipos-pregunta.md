# Quiz: tipos de pregunta (V/F, Selección Múltiple, Abierta)

## Qué cambió

- **Quiz** (`template: 'quiz'`) ahora permite mezclar tipos de pregunta dentro del mismo quiz:
  - **Selección Múltiple**: igual que antes, varias opciones, 1 correcta.
  - **Verdadero/Falso**: 2 opciones fijas, se marca cuál es la correcta.
  - **Pregunta Abierta**: el aprendiz escribe texto libre. No se autocalifica — queda pendiente hasta que el instructor la revise.
- **Opción Múltiple** (`template: 'preguntas'`) se deja intacto: solo Selección Múltiple, sin selector de tipo.
- Cada actividad sigue siendo 1 sola fila en la tabla `activities` (Postgres/Neon). Las preguntas se guardan como JSON dentro de la columna `quiz_question` (mismo patrón que ya usa Crucigrama en `crossword1_clue`).

## Formato JSON de `quiz_question`

```json
{
  "questions": [
    { "type": "multiple", "question": "...", "options": [{ "text": "...", "correct": true }, { "text": "...", "correct": false }] },
    { "type": "truefalse", "question": "...", "correct": true },
    { "type": "open", "question": "..." }
  ]
}
```

Compatibilidad: si una pregunta no trae `type`, se asume `'multiple'` (quizzes creados antes de este cambio siguen funcionando).

## Backend (autorizado a tocar para este feature)

- `backend/prisma/schema.prisma` — `ActivitySubmission` ahora tiene:
  - `answers String? @default("[]")` — JSON con la respuesta de cada pregunta y si fue correcta.
  - `reviewStatus String @default("graded")` — `'graded'` (todo autocalificado), `'pending'` (tiene preguntas abiertas sin revisar), `'reviewed'` (instructor ya revisó).
  - Aplicado a Neon vía `npx prisma db push` (sin migración nueva, columnas con default, no destructivo).
- `backend/src/controllers/activity.controller.js`:
  - `submitActivity` ahora acepta `answers` en el body. Si hay alguna pregunta `type: 'open'`, la entrega queda `reviewStatus: 'pending'` y `passed: false` hasta revisión.
  - Nuevo `getActivitySubmissions` — `GET /api/activities/:id/submissions`, devuelve entregas de una actividad con datos del aprendiz (nombre/apellido) y `answers` ya parseado.
  - Nuevo `reviewSubmission` — `PATCH /api/activities/:id/submissions/:apprenticeId/review`, el instructor manda `{ answers, approved }`, marca `reviewStatus: 'reviewed'` y `passed` según `approved`.
- `backend/src/routes/activity.routes.js` — rutas registradas para los 2 endpoints nuevos.

## Frontend

- `src/views/actividades/ActividadesView.vue`:
  - Bloque de creación de Quiz separado del de Opción Múltiple (antes compartían el mismo bloque).
  - Selector de tipo por pregunta (3 botones) solo en Quiz.
  - `saveActivity` valida cada pregunta según su tipo antes de serializar a JSON.
  - Demo dentro del modal soporta los 3 tipos (V/F con 2 botones, Abierta con textarea sin autocalificación).
  - Botón nuevo **"Revisar Entregas"** (solo visible en actividades `quiz`/`preguntas`) abre modal: lista entregas, muestra texto de cada pregunta abierta + respuesta del aprendiz, instructor marca Correcta/Incorrecta por pregunta y Aprueba/Desaprueba la entrega completa.
- `src/views/actividades/ActividadDetalleView.vue`:
  - Render por tipo de pregunta (V/F con 2 botones, Abierta con `textarea`, Selección Múltiple igual que antes).
  - Al entregar, si hay alguna pregunta abierta: banner ámbar "pendiente de revisión", `passed=false` provisional, botón "Reiniciar" deshabilitado (no se puede reintentar mientras el instructor tiene la entrega).
  - Al cargar una entrega ya revisada, se recupera el desglose pregunta-por-pregunta (`reviewedAnswers`) con ícono verde/rojo/reloj según corresponda.

## Pendiente / no incluido en este cambio

- No hay notificación push al instructor cuando llega una entrega pendiente — debe entrar manualmente a "Revisar Entregas".
- El botón "Revisar Entregas" se muestra siempre en actividades quiz/preguntas, no solo cuando hay pendientes reales (no se trajo el conteo antes de abrir el modal).
