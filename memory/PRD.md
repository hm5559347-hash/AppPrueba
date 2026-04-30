# Maison Estética — Sistema Interno de Gestión

## Original Problem Statement
Aplicación de gestión interna para clínica de estética enfocada en administración de citas y control de personal.

**Estructura de Datos:**
- Especialistas: Nombre, especialidad, horario entrada/salida
- Servicios: Nombre, duración, costo
- Citas: Especialista, Servicio, cliente, fecha, hora inicio, estado

**Reglas de negocio:**
- Impedir solapamiento de citas para el mismo especialista
- UI limpia y profesional para tablet/móvil

## User Choices
- Auth: PIN (1234)
- Paleta: blanco/negro/grises (HARD CONSTRAINT)
- Funciones extra: gestión de Especialistas + vista semanal
- Datos de ejemplo precargados

## Architecture
- **Backend**: FastAPI + Motor (MongoDB async). Endpoints `/api/auth/verify-pin`, `/api/specialists` CRUD, `/api/services` CRUD, `/api/appointments` CRUD + filters (date, week_start). Conflict prevention en `create_appointment` con overlap check.
- **Frontend**: React 19 + React Router. Páginas: PinLock, DailyAgenda, WeeklyAgenda, NewAppointment, Catalog. AuthContext con sessionStorage (lazy init).
- **Diseño**: Editorial B&W. Cormorant Garamond (display) + Manrope (UI). Bordes 1px negros, esquinas rectas (rounded-none).

## Implemented (Feb 2026)
- PIN Lock screen (1234) con keypad y dots editorial
- Sidebar nav + topbar mobile
- Daily Agenda con timeline por hora, contadores, cambio de estado (Confirmada → En curso → Finalizada), eliminar
- Weekly Agenda: grid 7 días × 13 horas, navegación prev/next/today
- New Appointment: selector 3-pasos (especialista → servicio → cliente/fecha/hora), slots auto-generados respetando horario y conflictos
- Catalog: tabs Servicios + Especialistas con CRUD modal
- Datos de muestra: 4 especialistas, 6 servicios, 5 citas hoy
- 7/7 tests backend + 100% frontend E2E

## Backlog (P1)
- Filtro por especialista en Daily Agenda
- Búsqueda de citas por cliente
- Exportación CSV/PDF de reportes diarios

## Backlog (P2)
- Recordatorios SMS/WhatsApp al cliente
- Métricas mensuales (ingresos por servicio/especialista)
- Multi-PIN por usuario
- Bloqueo de horarios (vacaciones, ausencias)
