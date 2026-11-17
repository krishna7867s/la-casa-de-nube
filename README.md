# La Casita de Nube · Portal de Políticas de RRHH con RAG Multiagente
## Mini Proyecto #2: Nube de Fresa S.A. (Costa Rica)

Portal interno inteligente para **Nube de Fresa**, estudio de papelería e ilustración digital de 60 colaboradores en San José, Costa Rica. Diseñado con una estética artesanal de **agenda japonesa de los 2000s**, combina un sistema RAG multiagente para consulta de políticas oficiales con la gestión privada de datos de personal y un dashboard exclusivo para Recursos Humanos.

---

## 🌟 Características Principales

- **Arquitectura de 5 Agentes Especialistas:**
  1. **Orquestador:** Clasificación de intención, soporte de consultas mixtas y filtro de privacidad.
  2. **Políticas (RAG):** Búsqueda semántica con citas clicables a documentos en Google Drive.
  3. **Datos del Colaborador:** Consultas parametrizadas de solo lectura para vacaciones, trámites y fechas de pago.
  4. **Analista:** Cálculo automático del reporte diario oficial con los 8 elementos requeridos y resumen ejecutivo de 3 a 5 frases.
  5. **Ingesta:** Sincronización continua con Google Drive API (`changes.list`) y cursor `startPageToken`.
- **Privacidad y Aislamiento Estricto:**
  - Verificación de sesión en el servidor (`Server-Side Auth`).
  - Detección y bloqueo total de intentos de consulta de datos de terceros (**Preguntas 21 y 22** con 0% de fuga).
  - Row Level Security (RLS) en Supabase para aislar registros de colaboradores y reportes de RRHH.
- **Diseño Estilo Agenda Japonesa 2000s:**
  - Paleta pastel: Crema (`#FFF8EF`), Rosa suave (`#F7D8DF`), Salvia (`#DCE8D3`), Ciruela (`#633248`) y texto café oscuro (`#382C35`).
  - Pestañas de libreta, microilustraciones SVG de fresas, nubes y sellos de carta.
- **Dashboard Privado de RRHH:**
  - 4 Indicadores clave (KPIs).
  - 2 Gráficos (Tendencia de 30 días y distribución por departamentos).
  - Tabla de solicitudes pendientes con alertas para las que superan 3 días de espera.
  - Historial de reportes accesible por fecha y ejecutor en vivo del banco de evaluación.

---

## 🚀 Puesta en Marcha Rápida

### 1. Requisitos Previos
- Node.js v18+ o v20+
- npm o pnpm

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Copia el archivo de ejemplo:
```bash
cp .env.example .env.local
```

Configura tus credenciales en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://vjnlijeeptpvhnqeckxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
NEXT_PUBLIC_DEMO_MODE=true
APP_TIMEZONE=America/Costa_Rica
```

> **Nota:** Con `NEXT_PUBLIC_DEMO_MODE=true`, la aplicación funciona al 100% de manera interactiva con los 60 colaboradores simulados, movimientos de 3 meses, 10 políticas indexadas y reportes diarios. Al ingresar la `ANON_KEY`, se conecta de inmediato a tu proyecto Supabase.

### 4. Ejecución del Servidor de Desarrollo
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

### 5. Ejecución del Banco de Evaluación (45 Preguntas)
```bash
npm run test:eval
```
O visita la pestaña **Dashboard Privado RRHH** en la aplicación web y presiona **«Evaluar 45 Preguntas»** para ver la matriz interactiva en tiempo real.

---

## 🗄️ Esquema de Base de Datos (Supabase)

El script SQL completo para inicializar el proyecto remoto se encuentra en:
👉 [`supabase_schema.sql`](./supabase_schema.sql)

Incluye:
- Extensión `pgvector`
- Tablas `profiles`, `leave_requests`, `incapacities`, `evaluations`, `personnel_movements`
- Tablas RAG: `policy_documents`, `policy_chunks` y función RPC `match_policy_chunks`
- Tabla `daily_reports` con los 8 elementos del JSON
- Políticas `RLS` estrictas por rol

---

## 📚 Documentación de Entrega

1. **[INFORME_TECNICO.md](./INFORME_TECNICO.md):** Arquitectura completa, justificación del stack, prompts de los 5 agentes y resultados de evaluación.
2. **[INVESTIGACION_COSTA_RICA.md](./INVESTIGACION_COSTA_RICA.md):** Estudio legal de 8 páginas sobre el Código de Trabajo, MTSS, CCSS, teletrabajo y aguinaldo en Costa Rica.
3. **[GUION_DEMO.md](./GUION_DEMO.md):** Guion paso a paso para la demostración en vivo de 15 minutos.
4. **[GUION_VIDEO_5MIN.md](./GUION_VIDEO_5MIN.md):** Guion y desglose para el video de respaldo de 5 minutos.

