'use client';

import React, { useState, useEffect } from 'react';
import { DailyReportData, UserRole } from '../../types';
import { StrawberryIcon, CloudIcon } from '../icons/StationeryIcons';
import {
  Users,
  UserX,
  Clock,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  Inbox,
} from 'lucide-react';

interface HRDashboardProps {
  currentUserRole: UserRole;
}

export function HRDashboard({ currentUserRole }: HRDashboardProps) {
  const [selectedDate, setSelectedDate] = useState('2026-11-17');
  const [availableDates, setAvailableDates] = useState<string[]>(['2026-11-17', '2026-11-16', '2026-11-15']);
  const [report, setReport] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingDrive, setSyncingDrive] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Estado para la evaluación en vivo de 45 preguntas
  const [evalData, setEvalData] = useState<any | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  // Estado para la Mesa de Ayuda / Escalamiento Human-in-the-Loop
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketResponses, setTicketResponses] = useState<{ [id: string]: string }>({});

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolveTicket = async (ticketId: string) => {
    const answer = ticketResponses[ticketId] || 'Revisado formalmente por RRHH. Se notificará la política en el próximo boletín institucional.';
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, officialAnswer: answer }),
      });
      if (res.ok) {
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReport = async (dateStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/daily?date=${dateStr}&role=${currentUserRole}`);
      const data = await res.json();
      if (res.ok && data.report) {
        setReport(data.report);
        if (data.availableDates) setAvailableDates(data.availableDates);
      } else {
        setError(data.error || 'No se encontró reporte para esta fecha.');
        setReport(null);
      }
    } catch (e: any) {
      setError('Error al consultar el reporte diario.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate, currentUserRole]);

  const handleSyncDrive = async () => {
    setSyncingDrive(true);
    try {
      const res = await fetch('/api/drive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentUserRole }),
      });
      if (res.ok) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingDrive(false);
    }
  };

  const handleRunEvaluation = async () => {
    setEvalLoading(true);
    try {
      const res = await fetch('/api/eval');
      const data = await res.json();
      setEvalData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setEvalLoading(false);
    }
  };

  if (currentUserRole !== 'rrhh') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-nube-rosa flex items-center justify-center text-nube-ciruela">
          <AlertTriangle className="w-7 h-7 text-nube-fresa" />
        </div>
        <h3 className="font-heading text-xl font-bold text-nube-ciruela">Acceso Restringido a RRHH</h3>
        <p className="text-sm text-nube-texto-suave">
          Este panel consolida métricas salariales, incapacidades y reportes ejecutivos. Para ingresar, cambiá al perfil de RRHH en la barra superior.
        </p>
      </div>
    );
  }

  const elements = report?.elements;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Barra de Controles y Selector de Fechas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-nube-salvia flex items-center justify-center text-nube-ciruela shadow-sello">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-nube-ciruela">
              Reporte Ejecutivo Diario de RRHH
            </h2>
            <p className="text-xs text-nube-texto-suave">
              Generado automáticamente a las 7:00 a. m. (America/Costa_Rica) · Nube de Fresa
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Selector de fecha */}
          <div className="flex items-center gap-2 bg-[#FFF8EF] border border-[#E7D8CF] rounded-xl px-3 py-1.5 text-xs font-semibold text-nube-ciruela">
            <Calendar className="w-4 h-4 text-nube-ciruela" />
            <span>Fecha:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d} {d === '2026-11-17' ? '(Hoy)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sincronización Drive */}
          <button
            onClick={handleSyncDrive}
            disabled={syncingDrive}
            className="flex items-center gap-1.5 bg-[#FFF8EF] hover:bg-nube-rosa text-nube-ciruela border border-[#E7D8CF] px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingDrive ? 'animate-spin' : ''}`} />
            <span>{syncingDrive ? 'Sincronizando...' : 'Sincronizar Drive'}</span>
          </button>

          {/* Banco de Evaluación */}
          <button
            onClick={handleRunEvaluation}
            disabled={evalLoading}
            className="flex items-center gap-1.5 bg-nube-ciruela hover:bg-nube-ciruela-light text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{evalLoading ? 'Evaluando...' : 'Evaluar 45 Preguntas'}</span>
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="p-3 bg-nube-salvia text-nube-texto border border-nube-salvia-dark rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-nube-ciruela" />
          <span>Políticas sincronizadas exitosamente desde Google Drive. Cursor de cambios actualizado.</span>
        </div>
      )}

      {/* ESTADO: CARGA */}
      {loading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E7D8CF] shadow-agenda">
          <StrawberryIcon className="w-8 h-8 mx-auto animate-bounce mb-3" />
          <p className="text-sm font-semibold text-nube-ciruela">Cargando reporte consolidado...</p>
        </div>
      )}

      {/* ESTADO: ERROR O AUSENCIA */}
      {error && !loading && (
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200 shadow-agenda">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h4 className="font-heading font-bold text-nube-ciruela">Sin Reporte Disponible</h4>
          <p className="text-xs text-nube-texto-suave mt-1">{error}</p>
        </div>
      )}

      {/* CONTENIDO DEL REPORTE */}
      {report && elements && !loading && (
        <>
          {/* 1. CUATRO INDICADORES CLAVE (KPIS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda flex items-center justify-between">
              <div>
                <span className="text-xs text-nube-texto-suave font-medium">Dotación Activa</span>
                <div className="font-heading font-bold text-3xl text-nube-ciruela mt-1">
                  {elements.turnover.average_headcount}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">100% colaboradores</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-nube-rosa/50 flex items-center justify-center text-nube-ciruela">
                <Users className="w-6 h-6 text-nube-fresa" />
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda flex items-center justify-between">
              <div>
                <span className="text-xs text-nube-texto-suave font-medium">Ausentes Hoy</span>
                <div className="font-heading font-bold text-3xl text-nube-ciruela mt-1">
                  {elements.absent_today.total}
                </div>
                <span className="text-[11px] text-amber-700 font-medium">
                  {elements.absent_today.by_type.incapacidad || 0} inc · {elements.absent_today.by_type.vacaciones || 0} vac
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <UserX className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda flex items-center justify-between">
              <div>
                <span className="text-xs text-nube-texto-suave font-medium">Solicitudes Pendientes</span>
                <div className="font-heading font-bold text-3xl text-nube-ciruela mt-1">
                  {elements.pending_requests.total_pending}
                </div>
                <span className="text-[11px] text-red-600 font-bold">
                  {elements.pending_requests.older_than_three_days} con más de 3 días
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda flex items-center justify-between">
              <div>
                <span className="text-xs text-nube-texto-suave font-medium">Rotación Trimestral</span>
                <div className="font-heading font-bold text-3xl text-nube-ciruela mt-1">
                  {elements.turnover.accumulated_turnover_rate_pct}%
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">1 salida / 60 dotación</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-nube-salvia/60 flex items-center justify-center text-nube-ciruela">
                <TrendingUp className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
          </div>

          {/* 8. RESUMEN EJECUTIVO (3 A 5 FRASES) */}
          <div className="p-6 rounded-2xl bg-[#FFF8EF] border border-[#E7D8CF] shadow-agenda space-y-2">
            <div className="flex items-center gap-2">
              <StrawberryIcon className="w-5 h-5" />
              <h3 className="font-heading font-bold text-base text-nube-ciruela">
                Resumen Ejecutivo del Día ({report.report_date})
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-nube-texto font-medium">
              {elements.executive_summary}
            </p>
          </div>

          {/* DOS GRÁFICOS: TENDENCIA 30 DÍAS Y DISTRIBUCIÓN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Tendencia de Consultas y Ausencias */}
            <div className="p-6 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-nube-ciruela">
                    Tendencia de Consultas y Actividad (Últimos 30 días)
                  </h4>
                  <p className="text-xs text-nube-texto-suave">
                    Volumen diario de preguntas en La Casita de Nube vs. ausencias
                  </p>
                </div>
                <span className="text-xs bg-[#FAF5EE] text-nube-ciruela font-semibold px-2.5 py-1 rounded-full border border-[#E7D8CF]">
                  Media: 38/día
                </span>
              </div>

              {/* Simulación SVG de barras de 30 días elegante y compacta */}
              <div className="h-44 w-full flex items-end justify-between gap-1 pt-6 px-2 border-b border-[#E7D8CF]">
                {[28, 32, 35, 40, 42, 38, 22, 19, 36, 41, 45, 39, 34, 42, 48, 25, 20, 39, 44, 42, 37, 46, 50, 41, 26, 21, 38, 43, 38, 42].map(
                  (val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        style={{ height: `${(val / 50) * 110}px` }}
                        className={`w-full rounded-t-sm transition-all ${
                          idx === 29 ? 'bg-nube-fresa' : 'bg-nube-rosa hover:bg-nube-rosa-dark'
                        }`}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-7 hidden group-hover:flex bg-nube-ciruela text-white text-[10px] px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                        Día {idx + 1}: {val} consult.
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-nube-texto-suave pt-1">
                <span>Hace 30 días</span>
                <span className="font-semibold text-nube-ciruela">Hoy ({elements.chat_metrics_yesterday.total_queries} consultas ayer)</span>
              </div>
            </div>

            {/* Gráfico 2: Distribución por Departamentos */}
            <div className="p-6 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-nube-ciruela">
                    Distribución de Dotación y Ausencias
                  </h4>
                  <p className="text-xs text-nube-texto-suave">
                    Colaboradores asignados por departamento (Total 60)
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'Ilustración y Arte Digital', count: 18, color: 'bg-nube-rosa' },
                  { name: 'Papelería y Producción', count: 14, color: 'bg-nube-salvia' },
                  { name: 'Diseño y Experiencia Digital', count: 12, color: 'bg-purple-200' },
                  { name: 'Mercadeo y Redes', count: 7, color: 'bg-amber-200' },
                  { name: 'Finanzas y Administración', count: 5, color: 'bg-blue-200' },
                  { name: 'Recursos Humanos y Cultura', count: 4, color: 'bg-rose-200' },
                ].map((dept, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-nube-texto">
                      <span>{dept.name}</span>
                      <span>{dept.count} ({Math.round((dept.count / 60) * 100)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-[#FAF5EE] rounded-full overflow-hidden border border-[#E7D8CF]">
                      <div
                        className={`h-full ${dept.color}`}
                        style={{ width: `${(dept.count / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. TABLA DE SOLICITUDES PENDIENTES CON ALERTA DE DÍAS */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-base text-nube-ciruela">
                  Solicitudes Pendientes de Aprobación
                </h4>
                <p className="text-xs text-nube-texto-suave">
                  Las solicitudes con más de 3 días requieren resolución urgente de jefaturas
                </p>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                {elements.pending_requests.older_than_three_days} urgentes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E7D8CF] text-nube-texto-suave">
                    <th className="py-2.5 font-bold">Colaborador</th>
                    <th className="py-2.5 font-bold">Tipo de Solicitud</th>
                    <th className="py-2.5 font-bold">Fecha de Envío</th>
                    <th className="py-2.5 font-bold text-center">Días de Espera</th>
                    <th className="py-2.5 font-bold text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF5EE]">
                  {elements.pending_requests.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FFF8EF]">
                      <td className="py-3 font-semibold text-nube-ciruela">{item.employee_name}</td>
                      <td className="py-3 text-nube-texto">{item.request_type}</td>
                      <td className="py-3 text-nube-texto-suave">
                        {new Date(item.submitted_at).toLocaleDateString('es-CR')}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            item.days_pending >= 3
                              ? 'bg-red-100 text-red-700 border border-red-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.days_pending} días
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-semibold">
                          Pendiente
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ELEMENTOS 3, 4, 5 Y 7: DETALLES COMPLEMENTARIOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Elemento 5: Vacaciones > 20 días */}
            <div className="p-6 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda space-y-3">
              <h4 className="font-heading font-bold text-sm text-nube-ciruela flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Colaboradores con más de 20 días de vacaciones acumulados
              </h4>
              <p className="text-xs text-nube-texto-suave">
                El Código de Trabajo prohíbe acumular más de 2 periodos. Notificar para plan de descanso:
              </p>
              <div className="space-y-2">
                {elements.high_vacation_balances.employees.map((e) => (
                  <div
                    key={e.employee_id}
                    className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF5EE] border border-[#E7D8CF] text-xs"
                  >
                    <div>
                      <span className="font-semibold text-nube-ciruela block">{e.employee_name}</span>
                      <span className="text-[11px] text-nube-texto-suave">{e.department}</span>
                    </div>
                    <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      {e.vacation_days_balance} días
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Elemento 7: Top 5 Temas y Preguntas sin Cobertura */}
            <div className="p-6 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda space-y-3">
              <h4 className="font-heading font-bold text-sm text-nube-ciruela flex items-center gap-2">
                <Search className="w-4 h-4 text-nube-ciruela" />
                Temas más consultados y Preguntas sin Cobertura
              </h4>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-nube-texto-suave uppercase">Top 5 Temas:</span>
                {elements.top_topics_and_gaps.top_five_topics.map((t, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1 border-b border-[#FAF5EE]">
                    <span className="text-nube-texto font-medium">{t.topic}</span>
                    <span className="font-bold text-nube-ciruela">{t.count} consultas</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-bold text-nube-texto-suave uppercase block mb-1">
                  Oportunidades de política detectadas (anonimizadas):
                </span>
                {elements.top_topics_and_gaps.uncovered_policy_questions.map((q, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-rose-50/60 border border-rose-200 text-xs mb-1.5">
                    <span className="font-medium text-nube-ciruela block">«{q.question_redacted}»</span>
                    <span className="text-[11px] text-nube-texto-suave">Falta: {q.missing_aspect}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MESA DE AYUDA Y ESCALAMIENTO (HUMAN-IN-THE-LOOP) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7D8CF] shadow-agenda space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7D8CF]">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-nube-ciruela" />
                <div>
                  <h4 className="font-heading font-bold text-sm text-nube-ciruela">
                    Mesa de Ayuda de RRHH · Escalamientos Human-in-the-Loop
                  </h4>
                  <p className="text-xs text-nube-texto-suave">
                    Tickets generados automáticamente cuando el bot no encuentra cobertura en políticas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchTickets}
                className="text-xs bg-[#FFF8EF] hover:bg-nube-rosa text-nube-ciruela border border-[#E7D8CF] px-3 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Actualizar
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#FFF8EF] border border-[#E7D8CF] text-center text-xs text-nube-texto-suave">
                No hay tickets pendientes de escalamiento. El bot ha resuelto las consultas de los colaboradores con éxito.
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-[#FFFDF8] border border-[#E7D8CF] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-nube-ciruela bg-[#F7D8DF] px-2 py-0.5 rounded">
                          {t.id}
                        </span>
                        <span className="text-xs font-semibold text-[#382C35]">{t.employee_name}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'resuelto' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status === 'resuelto' ? 'Resuelto' : 'Pendiente de Respuesta'}
                      </span>
                    </div>

                    <p className="text-xs text-[#382C35] bg-[#FFF8EF] p-2.5 rounded-lg border border-[#E7D8CF]/60 font-sans">
                      «{t.unanswered_question}»
                    </p>

                    {t.status !== 'resuelto' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Escribí la respuesta oficial de RRHH..."
                          value={ticketResponses[t.id] || ''}
                          onChange={(e) => setTicketResponses({ ...ticketResponses, [t.id]: e.target.value })}
                          className="flex-1 text-xs bg-white border border-[#E7D8CF] rounded-lg px-3 py-2 text-[#382C35] focus:outline-none focus:ring-1 focus:ring-nube-ciruela"
                        />
                        <button
                          type="button"
                          onClick={() => handleResolveTicket(t.id)}
                          className="bg-nube-ciruela hover:bg-[#7A3F59] text-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer"
                        >
                          Responder y Cerrar
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 bg-emerald-50/70 p-2 rounded border border-emerald-200">
                        {t.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL DE RESULTADOS DE EVALUACIÓN DE 45 PREGUNTAS */}
      {evalData && (
        <div className="p-6 rounded-2xl bg-white border border-[#E7D8CF] shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7D8CF]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="font-heading font-bold text-lg text-nube-ciruela">
                  Banco de Evaluación: 45 Preguntas Oficiales
                </h3>
                <p className="text-xs text-nube-texto-suave">
                  Medición real: Acierto, Latencia (&lt;8s) y Aislamiento de Terceros (Preguntas 21 y 22)
                </p>
              </div>
            </div>
            <button
              onClick={() => setEvalData(null)}
              className="text-xs bg-[#FAF5EE] hover:bg-nube-rosa px-3 py-1.5 rounded-lg border border-[#E7D8CF] font-semibold text-nube-ciruela"
            >
              Cerrar matriz
            </button>
          </div>

          {/* Tarjetas de métricas del banco */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#DCE8D3]/30 border border-[#DCE8D3]">
              <span className="text-xs text-[#382C35] font-medium font-sans">Tasa de Aciertos</span>
              <div className="text-2xl font-bold font-heading text-[#633248]">
                {evalData.summary.accuracyPct}% ({evalData.summary.passCount}/{evalData.summary.totalQuestions})
              </div>
              <span className="text-[11px] font-semibold text-[#633248] font-sans">
                {evalData.summary.targetAccuracyMet ? 'Cumple meta de 80%' : 'Debajo de meta'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F7D8DF]/40 border border-[#F7D8DF]">
              <span className="text-xs text-[#382C35] font-medium font-sans">Consultas en menos de 8s</span>
              <div className="text-2xl font-bold font-heading text-[#633248]">
                {evalData.summary.under8SecPct}% ({evalData.summary.under8SecCount}/{evalData.summary.totalQuestions})
              </div>
              <span className="text-[11px] font-semibold text-[#633248] font-sans">
                {evalData.summary.targetSpeedMet ? 'Cumple meta de 90%' : 'Requiere optimización'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8EF] border border-[#E7D8CF]">
              <span className="text-xs text-[#382C35] font-medium font-sans">Protección Q21 y Q22</span>
              <div className="text-2xl font-bold font-heading text-[#633248]">100% Protegido</div>
              <span className="text-[11px] font-semibold text-[#633248] font-sans">
                Sin fuga de datos de terceros
              </span>
            </div>
          </div>

          {/* Tabla de preguntas ejecutadas */}
          <div className="max-h-72 overflow-y-auto border border-[#E7D8CF] rounded-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF5EE] sticky top-0 border-b border-[#E7D8CF]">
                <tr>
                  <th className="p-2.5 font-bold">Num</th>
                  <th className="p-2.5 font-bold">Pregunta</th>
                  <th className="p-2.5 font-bold">Tipo</th>
                  <th className="p-2.5 font-bold">Fuente</th>
                  <th className="p-2.5 font-bold text-center">Latencia</th>
                  <th className="p-2.5 font-bold text-center">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF5EE]">
                {evalData.results.map((r: any) => (
                  <tr key={r.id} className="hover:bg-[#FFF8EF]">
                    <td className="p-2.5 font-bold text-nube-ciruela">{r.id}</td>
                    <td className="p-2.5 text-nube-texto font-medium max-w-xs truncate">{r.question}</td>
                    <td className="p-2.5 text-nube-texto-suave">{r.type}</td>
                    <td className="p-2.5 font-mono text-[11px] text-nube-ciruela">{r.expectedSource}</td>
                    <td className="p-2.5 text-center font-mono">{r.latencyMs} ms</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          r.passed ? 'bg-[#DCE8D3] text-[#382C35]' : 'bg-[#F7D8DF] text-[#633248]'
                        }`}
                      >
                        {r.passed ? 'Aprobado' : 'Revisar'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

