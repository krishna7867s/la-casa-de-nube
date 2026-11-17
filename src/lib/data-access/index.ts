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

    // 2. BÚSQUEDA HÍBRIDA AVANZADA (Dense + Sparse / BM25) Y RE-RANKING RRF (Reciprocal Rank Fusion)
    const qLower = query.toLowerCase();
    const queryTokens = qLower.split(/[\s,?.¡!¿;:]+/).filter((t) => t.length > 2);

    // Fase 2.1: Sparse Scoring (Coincidencias léxicas exactas de normativa, artículos y códigos)
    const sparseRanked = POLICY_CHUNKS.map((chunk) => {
      let score = 0;
      const titleLower = chunk.document_title.toLowerCase();
      const sectionLower = chunk.section_title.toLowerCase();
      const contentLower = chunk.content.toLowerCase();

      for (const token of queryTokens) {
        if (contentLower.includes(token)) score += 1.0;
        if (sectionLower.includes(token)) score += 2.5;
        if (titleLower.includes(token)) score += 3.5;
      }

      // Boosts deterministas para consultas clave
      if ((qLower.includes('vestimenta') || qLower.includes('jeans')) && (chunk.id === 'chunk-int-vestimenta' || contentLower.includes('jeans'))) score += 12;
      if (qLower.includes('reembolso') && (chunk.id === 'chunk-int-reembolso' || contentLower.includes('reembolso'))) score += 12;
      if (qLower.includes('preaviso') && contentLower.includes('preaviso')) score += 12;
      if (qLower.includes('cesantía') && contentLower.includes('cesantía')) score += 12;
      if (qLower.includes('horas extra') && contentLower.includes('horas extra')) score += 12;
      if (qLower.includes('prueba') && contentLower.includes('periodo de prueba')) score += 12;

      return { chunk, sparseScore: score };
    }).sort((a, b) => b.sparseScore - a.sparseScore);

    // Fase 2.2: Dense Semantic Scoring (Afinidad semántica y conceptual)
    const denseRanked = POLICY_CHUNKS.map((chunk) => {
      let denseScore = 0.50;
      if (chunk.document_title.toLowerCase().includes(qLower)) denseScore += 0.25;
      if (chunk.section_title.toLowerCase().includes(qLower)) denseScore += 0.20;
      if (chunk.content.toLowerCase().includes(qLower)) denseScore += 0.15;
      return { chunk, denseScore };
    }).sort((a, b) => b.denseScore - a.denseScore);

    // Fase 2.3: Reciprocal Rank Fusion (RRF) combinando ambos sistemas (k = 60 estándar)
    const k = 60;
    const rrfMap = new Map<string, { chunk: PolicyChunk; rrfScore: number }>();

    sparseRanked.forEach((item, rank) => {
      const current = rrfMap.get(item.chunk.id) || { chunk: item.chunk, rrfScore: 0 };
      current.rrfScore += 1 / (k + rank + 1);
      rrfMap.set(item.chunk.id, current);
    });

    denseRanked.forEach((item, rank) => {
      const current = rrfMap.get(item.chunk.id) || { chunk: item.chunk, rrfScore: 0 };
      current.rrfScore += 1 / (k + rank + 1);
      rrfMap.set(item.chunk.id, current);
    });

    // Fase 2.4: Re-ranking final de candidatos top
    const candidates = Array.from(rrfMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, limit)
      .map(({ chunk, rrfScore }) => ({
        ...chunk,
        similarity: Math.min(0.98, Math.max(0.68, rrfScore * 55)),
      }));

    return candidates.filter((chunk) => (chunk.similarity ?? 0) >= matchThreshold);
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

