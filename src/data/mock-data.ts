import {
  DailyReportData,
  EmployeeProfile,
  EvaluationRecord,
  IncapacityRecord,
  LeaveRequest,
  PersonnelMovement,
} from '../types';

// ==============================================================================
// 60 COLABORADORES SIMULADOS - NUBE DE FRESA
// ==============================================================================

const FIRST_NAMES = [
  'Mariana', 'Carlos', 'Sofía', 'Esteban', 'Jimena', 'Alejandro', 'Valeria', 'Daniel',
  'Camila', 'Felipe', 'Lucía', 'Sebastián', 'Daniela', 'Mateo', 'Fiorella', 'Gabriel',
  'Elena', 'Andrés', 'Monserrat', 'Diego', 'Paula', 'Ignacio', 'Natalia', 'Javier',
  'Andrea', 'Rodrigo', 'Beatriz', 'Mauricio', 'Adriana', 'Fabián', 'Catalina', 'Oscar',
  'Carolina', 'Manuel', 'Isabella', 'Alonso', 'Pamela', 'Alvaro', 'Gabriela', 'Arturo',
  'Victoria', 'Bernardo', 'Monica', 'Emilio', 'Raquel', 'Jorge', 'Lorena', 'Eduardo',
  'Patricia', 'Claudio', 'Silvia', 'Federico', 'Melissa', 'Roberto', 'Tatiana', 'Pablo',
  'Laura', 'Marco', 'Karla', 'David'
];

const LAST_NAMES = [
  'Castro Solís', 'Vargas Mora', 'Mora Valverde', 'Rojas Alvarado', 'Navarro Quesada',
  'Chaves Morales', 'Jiménez Fonseca', 'Gómez Umaña', 'Araya Monge', 'Campos Blanco',
  'Fernández Vega', 'Quesada Rojas', 'Bolaños Soto', 'Cordero Brenes', 'Solano Solano',
  'Méndez Salazar', 'Barboza Arias', 'Villalobos Murillo', 'Herrera Calvo', 'Guzmán Alfaro'
];

const DEPARTMENTS = [
  { name: 'Ilustración y Arte Digital', count: 18, baseRole: 'Ilustrador/a' },
  { name: 'Papelería y Producción', count: 14, baseRole: 'Especialista en Producción' },
  { name: 'Diseño y Experiencia Digital', count: 12, baseRole: 'Diseñador/a UI/UX' },
  { name: 'Mercadeo y Redes', count: 7, baseRole: 'Especialista en Contenido' },
  { name: 'Finanzas y Administración', count: 5, baseRole: 'Analista Contable' },
  { name: 'Recursos Humanos y Cultura', count: 4, baseRole: 'Generalista de RRHH' },
];

export const EMPLOYEES: EmployeeProfile[] = [];

let empIndex = 0;
for (const dept of DEPARTMENTS) {
  for (let i = 0; i < dept.count; i++) {
    const firstName = FIRST_NAMES[empIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(empIndex * 3 + i) % LAST_NAMES.length];
    const email = `${firstName.toLowerCase()}.${lastName.split(' ')[0].toLowerCase()}@nubedefresa.cr`;
    
    // Asignar rol RRHH a los de departamento RRHH
    const isRRHH = dept.name === 'Recursos Humanos y Cultura' && (i === 0 || i === 1);
    
    // Algunos colaboradores con más de 20 días para el reporte
    let vacationDays = 12 + ((empIndex * 4) % 10);
    if (empIndex === 3 || empIndex === 14 || empIndex === 28 || empIndex === 45) {
      vacationDays = 22 + (empIndex % 6); // Más de 20 días acumulados
    }

    const hireYear = 2022 + (empIndex % 4);
    const hireMonth = String(1 + (empIndex % 12)).padStart(2, '0');
    const hireDay = String(1 + (empIndex % 28)).padStart(2, '0');

    EMPLOYEES.push({
      id: `emp-${String(empIndex + 1).padStart(3, '0')}`,
      full_name: `${firstName} ${lastName}`,
      email,
      role: isRRHH ? 'rrhh' : 'colaborador',
      department: dept.name,
      position: i === 0 ? `Líder de ${dept.name}` : dept.baseRole,
      hire_date: `${hireYear}-${hireMonth}-${hireDay}`,
      salary_colones: 650000 + (empIndex * 22000),
      vacation_days_balance: vacationDays,
      status: empIndex === 2 ? 'incapacitado' : empIndex === 8 ? 'vacaciones' : 'activo',
      phone: `+506 8${String(1000000 + empIndex * 7777).slice(0, 7)}`,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${firstName}`,
    });
    empIndex++;
  }
}

// Empleado demo colaborador destacado
export const DEMO_COLABORADOR = EMPLOYEES[0]; // Mariana Castro Solís
// Empleado demo RRHH destacado
export const DEMO_RRHH = EMPLOYEES.find(e => e.role === 'rrhh') || EMPLOYEES[56]; // Sofía Mora

// ==============================================================================
// SOLICITUDES DE PERMISOS Y VACACIONES
// ==============================================================================
export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'req-101',
    employee_id: EMPLOYEES[0].id,
    employee_name: EMPLOYEES[0].full_name,
    request_type: 'vacaciones',
    start_date: '2026-12-01',
    end_date: '2026-12-05',
    days_requested: 5,
    reason: 'Vacaciones de descanso post-lanzamiento agenda 2027',
    status: 'pendiente',
    submitted_at: '2026-11-12T10:15:00-06:00', // Más de 3 días pendiente
  },
  {
    id: 'req-105',
    employee_id: EMPLOYEES[0].id,
    employee_name: EMPLOYEES[0].full_name,
    request_type: 'permiso',
    start_date: '2026-11-20',
    end_date: '2026-11-20',
    days_requested: 1,
    reason: 'Solicitud de permiso personal del viernes para trámite bancario',
    status: 'pendiente',
    submitted_at: '2026-11-16T09:00:00-06:00', // Permiso del viernes de Mariana
  },
  {
    id: 'req-102',
    employee_id: EMPLOYEES[1].id,
    employee_name: EMPLOYEES[1].full_name,
    request_type: 'estudio',
    start_date: '2026-11-20',
    end_date: '2026-11-20',
    days_requested: 0.5,
    reason: 'Presentación de examen de Maestría en Diseño Gráfico UCR',
    status: 'pendiente',
    submitted_at: '2026-11-11T14:30:00-06:00', // Más de 3 días pendiente
  },
  {
    id: 'req-103',
    employee_id: EMPLOYEES[4].id,
    employee_name: EMPLOYEES[4].full_name,
    request_type: 'vacaciones',
    start_date: '2026-11-25',
    end_date: '2026-11-28',
    days_requested: 4,
    reason: 'Trámite personal y descanso familiar',
    status: 'pendiente',
    submitted_at: '2026-11-16T08:45:00-06:00', // Menos de 3 días
  },
  {
    id: 'req-104',
    employee_id: EMPLOYEES[6].id,
    employee_name: EMPLOYEES[6].full_name,
    request_type: 'duelo',
    start_date: '2026-11-03',
    end_date: '2026-11-07',
    days_requested: 5,
    reason: 'Duelo por familiar primer grado',
    status: 'aprobada',
    submitted_at: '2026-11-02T16:00:00-06:00',
    reviewed_at: '2026-11-03T08:00:00-06:00',
    reviewer_comments: 'Aprobado con acompañamiento de bienestar.',
  },
  {
    id: 'req-105',
    employee_id: EMPLOYEES[10].id,
    employee_name: EMPLOYEES[10].full_name,
    request_type: 'vacaciones',
    start_date: '2026-10-15',
    end_date: '2026-10-22',
    days_requested: 6,
    reason: 'Vacaciones anuales periodo 2025',
    status: 'aprobada',
    submitted_at: '2026-10-01T09:00:00-06:00',
  },
  {
    id: 'req-106',
    employee_id: EMPLOYEES[15].id,
    employee_name: EMPLOYEES[15].full_name,
    request_type: 'personal',
    start_date: '2026-11-22',
    end_date: '2026-11-22',
    days_requested: 1,
    reason: 'Renovación de cédula y pasaporte',
    status: 'pendiente',
    submitted_at: '2026-11-13T11:20:00-06:00', // > 3 días
  }
];

// ==============================================================================
// INCAPACIDADES ACTIVAS Y DEL MES
// ==============================================================================
export const INCAPACITIES: IncapacityRecord[] = [
  {
    id: 'inc-01',
    employee_id: EMPLOYEES[2].id, // Sofía Mora
    employee_name: EMPLOYEES[2].full_name,
    type: 'enfermedad_comun',
    ccss_boleta_number: 'CCSS-SJ-2026-88192',
    start_date: '2026-11-14',
    end_date: '2026-11-18',
    days_count: 5,
    status: 'activa',
    department: EMPLOYEES[2].department,
  },
  {
    id: 'inc-02',
    employee_id: EMPLOYEES[19].id,
    employee_name: EMPLOYEES[19].full_name,
    type: 'enfermedad_comun',
    ccss_boleta_number: 'CCSS-SJ-2026-74910',
    start_date: '2026-11-02',
    end_date: '2026-11-06',
    days_count: 5,
    status: 'finalizada',
    department: EMPLOYEES[19].department,
  },
];

// ==============================================================================
// EVALUACIONES DE DESEMPEÑO
// ==============================================================================
export const EVALUATIONS: EvaluationRecord[] = EMPLOYEES.map((emp, idx) => ({
  id: `eval-${idx + 1}`,
  employee_id: emp.id,
  last_evaluation_date: '2026-06-20',
  next_evaluation_date: '2026-12-15',
  last_score: 4.2 + ((idx * 3) % 8) / 10,
  evaluator_name: 'Comité de Dirección Creativa y RRHH',
  notes: 'Excelente aporte creativo, compromiso con entregas y buen clima en equipo.',
}));

// ==============================================================================
// MOVIMIENTOS DE PERSONAL (ÚLTIMOS 3 A 4 MESES)
// ==============================================================================
export const PERSONNEL_MOVEMENTS: PersonnelMovement[] = [
  {
    id: 'mov-01',
    employee_id: EMPLOYEES[58].id,
    employee_name: EMPLOYEES[58].full_name,
    movement_type: 'ingreso',
    movement_date: '2026-08-16',
    department: 'Mercadeo y Redes',
    details: 'Contratación de Especialista en Creación de Contenido Digital',
  },
  {
    id: 'mov-02',
    employee_id: EMPLOYEES[59].id,
    employee_name: EMPLOYEES[59].full_name,
    movement_type: 'ingreso',
    movement_date: '2026-09-01',
    department: 'Papelería y Producción',
    details: 'Ingreso para fortalecimiento del taller de encuadernación artesanal',
  },
  {
    id: 'mov-03',
    employee_id: EMPLOYEES[7].id,
    employee_name: EMPLOYEES[7].full_name,
    movement_type: 'promocion',
    movement_date: '2026-09-15',
    department: 'Ilustración y Arte Digital',
    details: 'Ascenso a Ilustrador Senior y Mentor del semillero de talentos',
  },
  {
    id: 'mov-04',
    employee_id: 'emp-salida-01',
    employee_name: 'Gabriel Zúñiga Montero',
    movement_type: 'salida',
    movement_date: '2026-10-15',
    department: 'Diseño y Experiencia Digital',
    details: 'Renuncia voluntaria por oportunidad en el exterior; preaviso cumplido cabalmente',
  },
  {
    id: 'mov-05',
    employee_id: EMPLOYEES[0].id,
    employee_name: EMPLOYEES[0].full_name,
    movement_type: 'ajuste_salarial',
    movement_date: '2026-10-01',
    department: 'Ilustración y Arte Digital',
    details: 'Ajuste salarial por mérito y liderazgo en la colección Kawaii Botánica',
  },
];

// ==============================================================================
// REPORTE DIARIO DE RRHH (8 ELEMENTOS OBLIGATORIOS)
// ==============================================================================
export const TODAY_REPORT: DailyReportData = {
  report_date: '2026-11-17',
  generated_at: '2026-11-17T07:00:00-06:00',
  elements: {
    // 1. Personas ausentes hoy por tipo y departamento
    absent_today: {
      total: 2,
      by_type: {
        incapacidad: 1,
        vacaciones: 1,
      },
      by_department: {
        'Recursos Humanos y Cultura': 1,
        'Ilustración y Arte Digital': 1,
      },
      details: [
        {
          employee_name: EMPLOYEES[2].full_name,
          department: EMPLOYEES[2].department,
          reason_type: 'Incapacidad médica (CCSS)',
          until_date: '2026-11-18',
        },
        {
          employee_name: EMPLOYEES[8].full_name,
          department: EMPLOYEES[8].department,
          reason_type: 'Vacaciones programadas',
          until_date: '2026-11-20',
        },
      ],
    },
    // 2. Solicitudes pendientes y cuántas llevan más de tres días
    pending_requests: {
      total_pending: 4,
      older_than_three_days: 3,
      items: [
        {
          id: 'req-101',
          employee_name: EMPLOYEES[0].full_name,
          request_type: 'Vacaciones (5 días)',
          days_requested: 5,
          submitted_at: '2026-11-12T10:15:00-06:00',
          days_pending: 5,
        },
        {
          id: 'req-102',
          employee_name: EMPLOYEES[1].full_name,
          request_type: 'Permiso de estudio (0.5 días)',
          days_requested: 0.5,
          submitted_at: '2026-11-11T14:30:00-06:00',
          days_pending: 6,
        },
        {
          id: 'req-106',
          employee_name: EMPLOYEES[15].full_name,
          request_type: 'Trámite personal (1 día)',
          days_requested: 1,
          submitted_at: '2026-11-13T11:20:00-06:00',
          days_pending: 4,
        },
        {
          id: 'req-103',
          employee_name: EMPLOYEES[4].full_name,
          request_type: 'Vacaciones (4 días)',
          days_requested: 4,
          submitted_at: '2026-11-16T08:45:00-06:00',
          days_pending: 1,
        },
      ],
    },
    // 3. Incapacidades activas y días acumulados durante el mes
    active_incapacities: {
      active_count: 1,
      accumulated_days_this_month: 10, // 5 días de inc-01 + 5 días finalizados de inc-02
      records: [
        {
          employee_name: EMPLOYEES[2].full_name,
          type: 'Enfermedad común (CCSS)',
          start_date: '2026-11-14',
          days_count: 5,
        },
      ],
    },
    // 4. Ingresos, salidas y tasa de rotación acumulada con fórmula documentada
    turnover: {
      new_hires_period: 2,
      terminations_period: 1,
      average_headcount: 60,
      accumulated_turnover_rate_pct: 1.67, // (1 salida / 60 colaboradores promedio) * 100 = 1.67% trimestral
      formula_explanation: 'Tasa de Rotación (%) = (Total Salidas del Trimestre / Dotación Media del Personal) * 100. Con 1 salida sobre dotación media de 60 colaboradores en el trimestre agosto-noviembre 2026, la rotación acumulada es de 1.67%, situándose en un rango saludable de retención para el sector creativo.',
    },
    // 5. Colaboradores con más de 20 días de vacaciones acumulados
    high_vacation_balances: {
      count: 4,
      employees: [
        {
          employee_id: EMPLOYEES[3].id,
          employee_name: EMPLOYEES[3].full_name,
          department: EMPLOYEES[3].department,
          vacation_days_balance: 23,
        },
        {
          employee_id: EMPLOYEES[14].id,
          employee_name: EMPLOYEES[14].full_name,
          department: EMPLOYEES[14].department,
          vacation_days_balance: 24.5,
        },
        {
          employee_id: EMPLOYEES[28].id,
          employee_name: EMPLOYEES[28].full_name,
          department: EMPLOYEES[28].department,
          vacation_days_balance: 22,
        },
        {
          employee_id: EMPLOYEES[45].id,
          employee_name: EMPLOYEES[45].full_name,
          department: EMPLOYEES[45].department,
          vacation_days_balance: 25,
        },
      ],
    },
    // 6. Consultas del día anterior, porcentaje sin escalamiento y latencia media
    chat_metrics_yesterday: {
      total_queries: 42,
      non_escalated_rate_pct: 95.2, // 40 resueltas directamente por la IA sin escalar a RRHH humano
      average_latency_ms: 1840, // 1.84 segundos
    },
    // 7. Cinco temas más consultados y preguntas de política sin cobertura
    top_topics_and_gaps: {
      top_five_topics: [
        { topic: 'Fecha de pago de aguinaldo y cálculo anticipado', count: 14 },
        { topic: 'Días de vacaciones disponibles para fin de año', count: 11 },
        { topic: 'Estipendio de teletrabajo y comprobantes de luz', count: 8 },
        { topic: 'Procedimiento de incapacidades CCSS y subsidio', count: 5 },
        { topic: 'Descuentos de papelería para bazar navideño', count: 4 },
      ],
      uncovered_policy_questions: [
        {
          question_redacted: '¿La empresa ofrece subsidio especial para compra de iPad con lápiz para colaboradores en periodo de prueba?',
          date: '2026-11-16',
          missing_aspect: 'Equipamiento de hardware gráfico para personal nuevo antes de cumplir los 3 meses.',
        },
        {
          question_redacted: '¿Es posible solicitar permiso sin goce de salario para una pasantía internacional de 3 meses?',
          date: '2026-11-15',
          missing_aspect: 'Reglamentación de licencias no remuneradas prolongadas para perfeccionamiento artístico.',
        },
      ],
    },
    // 8. Resumen ejecutivo de 3 a 5 frases basado en las cifras del reporte
    executive_summary: 'La dotación se mantiene estable con 60 colaboradores y una rotación acumulada baja del 1.67%. Hoy se reportan 2 ausencias justificadas (1 por incapacidad médica y 1 por vacaciones programadas) y 10 días acumulados de incapacidad en el mes. Existen 4 solicitudes pendientes, de las cuales 3 superan los 3 días de espera y requieren revisión prioritaria de las jefaturas. El portal registró 42 consultas con un 95.2% de resolución autónoma y 1.84 s de latencia media, concentrando el interés en aguinaldo y vacaciones.',
  },
};

// Histórico de reportes de días anteriores para el selector de fechas del dashboard
export const HISTORICAL_REPORTS: Record<string, DailyReportData> = {
  '2026-11-17': TODAY_REPORT,
  '2026-11-16': {
    ...TODAY_REPORT,
    report_date: '2026-11-16',
    generated_at: '2026-11-16T07:00:00-06:00',
    elements: {
      ...TODAY_REPORT.elements,
      chat_metrics_yesterday: {
        total_queries: 38,
        non_escalated_rate_pct: 94.7,
        average_latency_ms: 1910,
      },
      executive_summary: 'Jornada previa con operación normal y 38 consultas tramitadas en La Casita de Nube con un 94.7% de resolución directa. Se mantuvo estable la dotación de 60 colaboradores con 2 ausencias y 3 solicitudes en espera de aprobación.',
    },
  },
  '2026-11-15': {
    ...TODAY_REPORT,
    report_date: '2026-11-15',
    generated_at: '2026-11-15T07:00:00-06:00',
    elements: {
      ...TODAY_REPORT.elements,
      chat_metrics_yesterday: {
        total_queries: 29,
        non_escalated_rate_pct: 96.5,
        average_latency_ms: 1750,
      },
      executive_summary: 'Reporte de fin de semana con bajo volumen de consultas (29 transacciones) y latencia óptima de 1.75 s. No se registraron nuevos ingresos ni salidas, y se procesó el cierre semanal de asistencia con 1 ausencia médica.',
    },
  },
};

