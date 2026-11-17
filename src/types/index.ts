// ==============================================================================
// TIPOS Y CONTRATOS DE DATOS - LA CASITA DE NUBE
// ==============================================================================

export type UserRole = 'colaborador' | 'rrhh';

export type EmployeeStatus = 'activo' | 'inactivo' | 'incapacitado' | 'vacaciones';

export interface EmployeeProfile {
  id: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  hire_date: string; // YYYY-MM-DD
  salary_colones: number;
  vacation_days_balance: number;
  status: EmployeeStatus;
  phone?: string;
  avatar_url?: string;
}

export interface EvaluationRecord {
  id: string;
  employee_id: string;
  last_evaluation_date?: string;
  next_evaluation_date: string;
  last_score?: number;
  evaluator_name?: string;
  notes?: string;
}

export type LeaveRequestType = 'vacaciones' | 'estudio' | 'maternidad_paternidad' | 'duelo' | 'personal';
export type LeaveRequestStatus = 'pendiente' | 'aprobada' | 'rechazada';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  request_type: LeaveRequestType;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: LeaveRequestStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  reviewer_comments?: string;
}

export interface IncapacityRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  type: 'enfermedad_comun' | 'accidente_trabajo' | 'maternidad';
  ccss_boleta_number?: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: 'activa' | 'finalizada';
  department?: string;
}

export interface PersonnelMovement {
  id: string;
  employee_id: string;
  employee_name?: string;
  movement_type: 'ingreso' | 'salida' | 'promocion' | 'cambio_departamento' | 'ajuste_salarial';
  movement_date: string;
  department: string;
  details: string;
}

export interface PolicyDocument {
  id: string;
  code: string; // POL-01 ... POL-10
  title: string;
  doc_type: 'pdf' | 'gdoc' | 'gsheet';
  version: string;
  effective_date: string;
  responsible_role: string;
  drive_url: string;
  sections_count: number;
}

export interface PolicyChunk {
  id: string;
  document_id: string;
  document_code?: string;
  document_title: string;
  section_title: string;
  chunk_index: number;
  content: string;
  drive_url?: string;
  version?: string;
  vigencia?: string;
  token_count?: number;
  embedding?: number[];
  similarity?: number;
  is_internal?: boolean;
  is_from_supabase?: boolean;
}

// Estructura oficial del JSON de reporte diario (8 elementos obligatorios)
export interface DailyReportData {
  report_date: string; // YYYY-MM-DD
  generated_at: string; // ISO
  elements: {
    // 1. Personas ausentes hoy por tipo y departamento
    absent_today: {
      total: number;
      by_type: Record<string, number>; // e.g. { "vacaciones": 2, "incapacidad": 1, "permiso": 0 }
      by_department: Record<string, number>; // e.g. { "Ilustración": 1, "Papelería": 2 }
      details: Array<{
        employee_name: string;
        department: string;
        reason_type: string;
        until_date: string;
      }>;
    };
    // 2. Solicitudes pendientes y cuántas llevan más de tres días
    pending_requests: {
      total_pending: number;
      older_than_three_days: number;
      items: Array<{
        id: string;
        employee_name: string;
        request_type: string;
        days_requested: number;
        submitted_at: string;
        days_pending: number;
      }>;
    };
    // 3. Incapacidades activas y días acumulados durante el mes
    active_incapacities: {
      active_count: number;
      accumulated_days_this_month: number;
      records: Array<{
        employee_name: string;
        type: string;
        start_date: string;
        days_count: number;
      }>;
    };
    // 4. Ingresos, salidas y tasa de rotación acumulada con fórmula documentada
    turnover: {
      new_hires_period: number;
      terminations_period: number;
      average_headcount: number;
      accumulated_turnover_rate_pct: number;
      formula_explanation: string;
    };
    // 5. Colaboradores con más de 20 días de vacaciones acumulados
    high_vacation_balances: {
      count: number;
      employees: Array<{
        employee_id: string;
        employee_name: string;
        department: string;
        vacation_days_balance: number;
      }>;
    };
    // 6. Consultas del día anterior, porcentaje sin escalamiento y latencia media
    chat_metrics_yesterday: {
      total_queries: number;
      non_escalated_rate_pct: number;
      average_latency_ms: number;
    };
    // 7. Cinco temas más consultados y preguntas de política sin cobertura
    top_topics_and_gaps: {
      top_five_topics: Array<{ topic: string; count: number }>;
      uncovered_policy_questions: Array<{
        question_redacted: string;
        date: string;
        missing_aspect: string;
      }>;
    };
    // 8. Resumen ejecutivo de 3 a 5 frases basado en las cifras del reporte
    executive_summary: string;
  };
}

export type QueryIntent =
  | 'policy'
  | 'personal_data'
  | 'mixed'
  | 'report'
  | 'restricted'
  | 'out_of_scope';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: QueryIntent;
  agent?: string;
  citations?: Array<{
    document_code?: string;
    document_title: string;
    section_title?: string;
    version?: string;
    vigencia?: string;
    drive_url?: string;
    snippet: string;
    is_internal?: boolean;
  }>;
  latency_ms?: number;
  escalated?: boolean;
}

