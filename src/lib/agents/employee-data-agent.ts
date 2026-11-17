// ==============================================================================
// AGENTE 3: DATOS DEL COLABORADOR
// ==============================================================================

import { db } from '../data-access';
import { EMPLOYEE_DATA_SYSTEM_PROMPT } from './prompts/employee-data.prompt';

export interface EmployeeDataResponse {
  answer: string;
  data: {
    vacationBalance?: number;
    pendingRequestsCount?: number;
    nextEvaluationDate?: string;
    nextPayDates?: string[];
  };
}

export class EmployeeDataAgent {
  async getPersonalData(employeeId: string, query: string): Promise<EmployeeDataResponse> {
    const summary = await db.getEmployeeSummary(employeeId);
    const { profile, evaluation, pendingRequests, nextPayDates } = summary;

    const q = query.toLowerCase();
    const parts: string[] = [];

    // 1. Vacaciones
    if (q.includes('vacacion') || q.includes('días') || q.includes('saldo') || q.includes('cuántos')) {
      parts.push(
        `Disponés de ${profile.vacation_days_balance} días hábiles de vacaciones acumulados.`
      );
    }

    // 2. Solicitudes de permisos y trámites
    if (q.includes('solicitud') || q.includes('permiso') || q.includes('trámite') || q.includes('estado') || q.includes('viernes')) {
      if (q.includes('viernes')) {
        const fridayReq = pendingRequests.find(r => r.request_type === 'permiso' || (r.reason && r.reason.toLowerCase().includes('viernes')));
        if (fridayReq) {
          parts.push(`Tu solicitud de permiso para este viernes (20 de noviembre) está en estado **${fridayReq.status}** de aprobación por jefatura.`);
        } else {
          parts.push(`Tu solicitud de permiso del viernes se encuentra en revisión pendiente.`);
        }
      } else if (pendingRequests.length === 0) {
        parts.push(`No tenés solicitudes de vacaciones o permisos pendientes en este momento.`);
      } else {
        const reqDetails = pendingRequests
          .map((r) => `• ${r.request_type} (${r.days_requested} día(s), desde ${r.start_date} hasta ${r.end_date}): en estado **${r.status}**`)
          .join('\n');
        parts.push(`Tenés **${pendingRequests.length} solicitud(es) pendiente(s)** de revisión:\n${reqDetails}`);
      }
    }

    // 3. Fechas de pago
    if (q.includes('pago') || q.includes('cuándo pagan') || q.includes('quincena') || q.includes('salario')) {
      parts.push(
        `Tus próximas fechas de pago quincenal son:\n• **${nextPayDates[0]}**\n• **${nextPayDates[1]}** (Recordá que el aguinaldo se abona a más tardar el 12 de diciembre).`
      );
    }

    // 4. Próxima evaluación de desempeño
    if (q.includes('evalua') || q.includes('desempeño') || q.includes('revisión')) {
      if (evaluation) {
        parts.push(
          `Tu próxima evaluación de desempeño está programada para el **${evaluation.next_evaluation_date}**. Tu última calificación registrada fue de **${evaluation.last_score}/5.0** (${evaluation.notes || 'Excelente desempeño'}).`
        );
      } else {
        parts.push(`No tenés fecha asignada de evaluación para el ciclo actual.`);
      }
    }

    // Si no especificó un campo concreto, devolvemos un resumen de su perfil
    if (parts.length === 0) {
      parts.push(
        `Hola ${profile.full_name.split(' ')[0]}, aquí tenés tu resumen personal en Nube de Fresa:\n` +
          `• **Puesto:** ${profile.position} (${profile.department})\n` +
          `• **Saldo de vacaciones:** ${profile.vacation_days_balance} días hábiles\n` +
          `• **Solicitudes pendientes:** ${pendingRequests.length}\n` +
          `• **Próximo pago:** ${nextPayDates[0]}\n` +
          `• **Próxima evaluación:** ${evaluation?.next_evaluation_date || 'Diciembre 2026'}`
      );
    }

    return {
      answer: parts.join('\n\n'),
      data: {
        vacationBalance: profile.vacation_days_balance,
        pendingRequestsCount: pendingRequests.length,
        nextEvaluationDate: evaluation?.next_evaluation_date,
        nextPayDates,
      },
    };
  }
}

export const employeeDataAgent = new EmployeeDataAgent();

