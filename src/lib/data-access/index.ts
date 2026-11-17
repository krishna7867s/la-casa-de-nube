// ==============================================================================
// CAPA DE ACCESO A DATOS TIPADA (DATA ACCESS LAYER)
// Soporta Supabase PostgreSQL + pgvector y Modo Demo con 60 colaboradores
// ==============================================================================

import {
  DailyReportData,
  EmployeeProfile,
  EvaluationRecord,
  IncapacityRecord,
  LeaveRequest,
  PersonnelMovement,
  PolicyChunk,
  PolicyDocument,
  UserRole,
} from '../../types';
import {
  DEMO_COLABORADOR,
  DEMO_RRHH,
  EMPLOYEES,
  EVALUATIONS,
  HISTORICAL_REPORTS,
  INCAPACITIES,
  LEAVE_REQUESTS,
  PERSONNEL_MOVEMENTS,
  TODAY_REPORT,
} from '../../data/mock-data';
import { POLICY_CHUNKS, POLICY_DOCUMENTS } from '../../data/policies';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cliente Supabase con clave privilegiada exclusivo del servidor
let serverSupabaseClient: SupabaseClient | null = null;

function getServerSupabaseClient(): SupabaseClient | null {
  if (serverSupabaseClient) return serverSupabaseClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vjnlijeeptpvhnqeckxw.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey) {
    // Si falta la clave privilegiada en el servidor, se registra de forma informativa
    return null;
  }
  serverSupabaseClient = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return serverSupabaseClient;
}

export class DataAccessLayer {
  private isDemoMode: boolean;

  constructor() {
    this.isDemoMode =
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  // ----------------------------------------------------------------------------
  // PERFILES Y AUTENTICACIÓN
  // ----------------------------------------------------------------------------
  async getEmployeeById(id: string): Promise<EmployeeProfile | null> {
    const emp = EMPLOYEES.find((e) => e.id === id);
    return emp || null;
  }

  async getEmployeeByEmail(email: string): Promise<EmployeeProfile | null> {
    const emp = EMPLOYEES.find((e) => e.email.toLowerCase() === email.toLowerCase());
    return emp || null;
  }

  async getAllEmployees(requesterRole: UserRole): Promise<EmployeeProfile[]> {
    if (requesterRole !== 'rrhh') {
      throw new Error('Acceso no autorizado: Solo el rol RRHH puede listar colaboradores.');
    }
    return EMPLOYEES;
  }

  // ----------------------------------------------------------------------------
  // DATOS DEL COLABORADOR (CONSULTAS PARAMETRIZADAS Y SEGURAS)
  // ----------------------------------------------------------------------------
  async getEmployeeSummary(employeeId: string): Promise<{
    profile: EmployeeProfile;
    evaluation: EvaluationRecord | null;
    pendingRequests: LeaveRequest[];
    activeIncapacities: IncapacityRecord[];
    nextPayDates: string[];
  }> {
    const profile = await this.getEmployeeById(employeeId);
    if (!profile) throw new Error('Colaborador no encontrado.');

    const evaluation = EVALUATIONS.find((e) => e.employee_id === employeeId) || null;
    const pendingRequests = LEAVE_REQUESTS.filter(
      (r) => r.employee_id === employeeId && r.status === 'pendiente'
    );
    const activeIncapacities = INCAPACITIES.filter(
      (i) => i.employee_id === employeeId && i.status === 'activa'
    );

    // Próximas fechas de pago quincenales en Costa Rica
    const nextPayDates = ['30 de noviembre de 2026', '15 de diciembre de 2026 (Aguinaldo: 12 dic)'];

    return {
      profile,
      evaluation,
      pendingRequests,
      activeIncapacities,
      nextPayDates,
    };
  }

  // ----------------------------------------------------------------------------
  // SOLICITUDES DE PERMISOS / VACACIONES
  // ----------------------------------------------------------------------------
  async getLeaveRequests(employeeId: string, role: UserRole): Promise<LeaveRequest[]> {
    if (role === 'rrhh') {
      return LEAVE_REQUESTS;
    }
    return LEAVE_REQUESTS.filter((r) => r.employee_id === employeeId);
  }

  // ----------------------------------------------------------------------------
  // POLÍTICAS Y FRAGMENTOS RAG
  // ----------------------------------------------------------------------------
  async getPolicyDocuments(): Promise<PolicyDocument[]> {
    return POLICY_DOCUMENTS;
  }

  async searchPolicyChunks(query: string, matchThreshold: number = 0.65, limit: number = 4): Promise<PolicyChunk[]> {
    const supabase = getServerSupabaseClient();
    
    // 1. Conexión al catálogo public.politicas_internas llamando a la función RPC buscar_politicas_internas
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('buscar_politicas_internas', {
          pregunta: query,
          cantidad: limit,
        });

        if (error) {
          // Registro de fallo de conexión / ejecución en la RPC
          console.warn(`[Supabase RPC Fallo de conexión/ejecución] ${error.message} (Código: ${error.code})`);
        } else if (Array.isArray(data) && data.length > 0) {
          // Coincidencia exitosa en el catálogo remoto
          console.info(`[Supabase RPC] Encontradas ${data.length} coincidencias en public.politicas_internas para "${query}".`);
          
          const remoteChunks: PolicyChunk[] = data.map((row: any, idx: number) => ({
            id: String(row.id || `rpc-${idx}`),
            document_id: String(row.document_id || row.id || `doc-int-${idx}`),
            document_code: row.codigo || row.code || undefined,
            document_title: row.titulo || row.title || 'Política Interna',
            section_title: row.seccion || row.section || row.seccion_titulo || 'Disposiciones Oficiales',
            chunk_index: row.chunk_index || idx,
            content: row.contenido || row.content || row.texto || '',
            version: row.version ? String(row.version) : '1.0',
            vigencia: row.vigencia || row.effective_date || '2026-01-01',
            drive_url: row.drive_url || undefined, // Sin inventar enlaces de Google Drive para citas internas
            is_internal: !row.drive_url,
            is_from_supabase: true,
            similarity: row.similitud || row.similarity || 0.95,
          }));

          if (remoteChunks.length > 0) {
            return remoteChunks;
          }
        } else {
          // Búsqueda remota ejecutada sin coincidencias
          console.info(`[Supabase RPC] Búsqueda sin coincidencias remotas para "${query}". Conservando catálogo local.`);
        }
      } catch (rpcErr: any) {
        // Fallo de red o conexión al servidor
        console.warn(`[Supabase RPC Fallo de conexión] No se pudo conectar a Supabase: ${rpcErr?.message || rpcErr}. Conservando catálogo local.`);
      }
    } else {
      console.info('[Supabase] Clave privilegiada no detectada en el servidor (SUPABASE_SERVICE_ROLE_KEY). Usando catálogo local.');
    }

    // 2. Conservar el catálogo local cuando la búsqueda remota no dé coincidencias o no haya conexión
    const qLower = query.toLowerCase();
    
    // Búsqueda léxico-semántica sobre los fragmentos documentales
    const scored = POLICY_CHUNKS.map((chunk) => {
      let score = 0.50; // base score
      const titleMatch = chunk.document_title.toLowerCase().includes(qLower) || chunk.section_title.toLowerCase().includes(qLower);
      const contentMatch = chunk.content.toLowerCase().includes(qLower);
      
      const keywords = qLower.split(/\s+/).filter(w => w.length > 2);
      let hits = 0;
      for (const kw of keywords) {
        if (chunk.content.toLowerCase().includes(kw)) hits++;
        if (chunk.section_title.toLowerCase().includes(kw)) hits += 2;
        if (chunk.document_title.toLowerCase().includes(kw)) hits += 2;
      }

      if (titleMatch) score += 0.25;
      if (contentMatch) score += 0.20;
      score += Math.min(0.28, hits * 0.09);

      // Coincidencias específicas para vestimenta, jeans y reembolso
      if ((qLower.includes('vestimenta') || qLower.includes('jeans')) && (chunk.id === 'chunk-int-vestimenta' || chunk.content.toLowerCase().includes('jeans'))) {
        score = 0.96;
      }
      if (qLower.includes('reembolso') && (chunk.id === 'chunk-int-reembolso' || chunk.content.toLowerCase().includes('reembolso'))) {
        score = 0.96;
      }

      return {
        ...chunk,
        similarity: Math.min(0.98, score),
      };
    });

    return scored
      .filter((chunk) => (chunk.similarity ?? 0) >= matchThreshold)
      .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
      .slice(0, limit);
  }

  // ----------------------------------------------------------------------------
  // REPORTES DIARIOS DE RRHH (AGREGACIONES)
  // ----------------------------------------------------------------------------
  async getDailyReportByDate(dateStr: string, requesterRole: UserRole): Promise<DailyReportData | null> {
    if (requesterRole !== 'rrhh') {
      throw new Error('Acceso no autorizado: Solo el rol RRHH puede consultar reportes.');
    }
    return HISTORICAL_REPORTS[dateStr] || (dateStr === TODAY_REPORT.report_date ? TODAY_REPORT : null);
  }

  async saveOrUpdateDailyReport(report: DailyReportData): Promise<void> {
    HISTORICAL_REPORTS[report.report_date] = report;
  }

  async getReportDatesList(requesterRole: UserRole): Promise<string[]> {
    if (requesterRole !== 'rrhh') {
      throw new Error('Acceso no autorizado.');
    }
    return Object.keys(HISTORICAL_REPORTS).sort().reverse();
  }
}

export const db = new DataAccessLayer();

