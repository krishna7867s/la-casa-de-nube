// ==============================================================================
// AGENTE 4: ANALISTA (REPORTES DIARIOS DE RRHH)
// ==============================================================================

import { DailyReportData } from '../../types';
import { db } from '../data-access';
import { EMPLOYEES, INCAPACITIES, LEAVE_REQUESTS, PERSONNEL_MOVEMENTS, TODAY_REPORT } from '../../data/mock-data';

export class AnalystAgent {
  /**
   * Genera o actualiza de forma idempotente el reporte diario oficial para una fecha dada.
   * Ejecutado normalmente a las 7:00 a. m. hora de Costa Rica.
   */
  async generateDailyReport(dateStr?: string): Promise<DailyReportData> {
    const reportDate = dateStr || new Date().toISOString().split('T')[0];

    // 1. Personas ausentes hoy por tipo y departamento
    const absentDetails: Array<{
      employee_name: string;
      department: string;
      reason_type: string;
      until_date: string;
    }> = [];

    const byType: Record<string, number> = { incapacidad: 0, vacaciones: 0, permiso: 0 };
    const byDepartment: Record<string, number> = {};

    // Colaboradores con incapacidad activa
    const activeIncapacities = INCAPACITIES.filter((i) => i.status === 'activa');
    for (const inc of activeIncapacities) {
      byType.incapacidad++;
      const emp = EMPLOYEES.find((e) => e.id === inc.employee_id);
      const dept = emp ? emp.department : 'General';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
      absentDetails.push({
        employee_name: emp ? emp.full_name : 'Colaborador',
        department: dept,
        reason_type: `Incapacidad médica (${inc.type})`,
        until_date: inc.end_date,
      });
    }

    // Colaboradores de vacaciones hoy
    const onVacationEmps = EMPLOYEES.filter((e) => e.status === 'vacaciones');
    for (const emp of onVacationEmps) {
      byType.vacaciones++;
      byDepartment[emp.department] = (byDepartment[emp.department] || 0) + 1;
      absentDetails.push({
        employee_name: emp.full_name,
        department: emp.department,
        reason_type: 'Vacaciones programadas',
        until_date: '2026-11-20',
      });
    }

    // 2. Solicitudes pendientes y cuántas llevan más de 3 días
    const pendingReqs = LEAVE_REQUESTS.filter((r) => r.status === 'pendiente');
    const now = new Date('2026-11-17T09:00:00-06:00').getTime();
    let olderThanThreeDays = 0;

    const pendingItems = pendingReqs.map((r) => {
      const subTime = new Date(r.submitted_at).getTime();
      const diffDays = Math.floor((now - subTime) / (1000 * 60 * 60 * 24));
      if (diffDays >= 3) olderThanThreeDays++;
      return {
        id: r.id,
        employee_name: r.employee_name || 'Colaborador',
        request_type: `${r.request_type} (${r.days_requested} días)`,
        days_requested: r.days_requested,
        submitted_at: r.submitted_at,
        days_pending: Math.max(1, diffDays),
      };
    });

    // 3. Incapacidades activas y días acumulados en el mes
    let accumulatedIncapacityDays = 0;
    for (const inc of INCAPACITIES) {
      accumulatedIncapacityDays += inc.days_count;
    }

    // 4. Ingresos, salidas y tasa de rotación acumulada trimestral
    const newHires = PERSONNEL_MOVEMENTS.filter((m) => m.movement_type === 'ingreso').length;
    const terminations = PERSONNEL_MOVEMENTS.filter((m) => m.movement_type === 'salida').length;
    const averageHeadcount = 60;
    const turnoverRatePct = Number(((terminations / averageHeadcount) * 100).toFixed(2));
    const formulaExplanation = `Tasa de Rotación Trimestral (%) = (Total Salidas [${terminations}] / Dotación Media [${averageHeadcount}]) * 100 = ${turnoverRatePct}%. Representa una retención sobresaliente en el sector creativo y editorial.`;

    // 5. Colaboradores con más de 20 días de vacaciones
    const highVacationEmployees = EMPLOYEES.filter((e) => e.vacation_days_balance > 20).map((e) => ({
      employee_id: e.id,
      employee_name: e.full_name,
      department: e.department,
      vacation_days_balance: e.vacation_days_balance,
    }));

    // 6. Consultas del día anterior
    const chatYesterday = {
      total_queries: 42,
      non_escalated_rate_pct: 95.2,
      average_latency_ms: 1840,
    };

    // 7. Cinco temas más consultados y brechas
    const topTopics = [
      { topic: 'Fecha de pago de aguinaldo y cálculo anticipado', count: 14 },
      { topic: 'Días de vacaciones disponibles para fin de año', count: 11 },
      { topic: 'Estipendio de teletrabajo y comprobantes de luz', count: 8 },
      { topic: 'Procedimiento de incapacidades CCSS y subsidio', count: 5 },
      { topic: 'Descuentos de papelería para bazar navideño', count: 4 },
    ];

    const uncoveredGaps = [
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
    ];

    // 8. Resumen ejecutivo de 3 a 5 frases validado con los números del reporte
    const totalAbsent = absentDetails.length;
    const executiveSummary =
      `La dotación de Nube de Fresa se mantiene en ${averageHeadcount} colaboradores con una rotación acumulada de ${turnoverRatePct}%. ` +
      `Hoy se registran ${totalAbsent} personas ausentes (${byType.incapacidad} por incapacidad médica y ${byType.vacaciones} por vacaciones) con ${accumulatedIncapacityDays} días de incapacidad acumulados en el mes. ` +
      `En el flujo de solicitudes figuran ${pendingReqs.length} casos pendientes, de los cuales ${olderThanThreeDays} superan los 3 días de espera y requieren resolución por parte de las jefaturas. ` +
      `En el portal La Casita de Nube se tramitaron ${chatYesterday.total_queries} consultas ayer con un ${chatYesterday.non_escalated_rate_pct}% de resolución autónoma y ${chatYesterday.average_latency_ms} ms de latencia media, concentrando el interés en aguinaldo y vacaciones.`;

    const report: DailyReportData = {
      report_date: reportDate,
      generated_at: `${reportDate}T07:00:00-06:00`,
      elements: {
        absent_today: {
          total: totalAbsent,
          by_type: byType,
          by_department: byDepartment,
          details: absentDetails,
        },
        pending_requests: {
          total_pending: pendingReqs.length,
          older_than_three_days: olderThanThreeDays,
          items: pendingItems,
        },
        active_incapacities: {
          active_count: activeIncapacities.length,
          accumulated_days_this_month: accumulatedIncapacityDays,
          records: activeIncapacities.map((i) => ({
            employee_name: i.employee_name || 'Colaborador',
            type: i.type,
            start_date: i.start_date,
            days_count: i.days_count,
          })),
        },
        turnover: {
          new_hires_period: newHires,
          terminations_period: terminations,
          average_headcount: averageHeadcount,
          accumulated_turnover_rate_pct: turnoverRatePct,
          formula_explanation: formulaExplanation,
        },
        high_vacation_balances: {
          count: highVacationEmployees.length,
          employees: highVacationEmployees,
        },
        chat_metrics_yesterday: chatYesterday,
        top_topics_and_gaps: {
          top_five_topics: topTopics,
          uncovered_policy_questions: uncoveredGaps,
        },
        executive_summary: executiveSummary,
      },
    };

    // Almacenamiento idempotente
    await db.saveOrUpdateDailyReport(report);
    return report;
  }
}

export const analystAgent = new AnalystAgent();

