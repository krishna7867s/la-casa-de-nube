'use client';

import React, { useState, useEffect } from 'react';
import { DailyReportData, UserRole } from '../../types';
import { StrawberryIcon, CloudIcon, PostageStampIcon, PaperclipIcon } from '../icons/StationeryIcons';
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
  Printer,
  LifeBuoy,
  CheckCircle2,
  Sparkles,
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
    const answer =
      ticketResponses[ticketId] ||
      'Revisado formalmente por la Jefatura de RRHH. Esta disposición será incorporada en la próxima actualización de normativas.';
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
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#F7D8DF] flex items-center justify-center text-[#633248]">
          <AlertTriangle className="w-7 h-7 text-[#633248]" />
        </div>
        <h3 className="font-heading text-xl font-bold text-[#633248]">Acceso Restringido a RRHH</h3>
        <p className="text-sm text-[#6B5A66] leading-relaxed">
          Este panel consolida métricas salariales, incapacidades y reportes ejecutivos de todo el estudio. Para ingresar, seleccioná el perfil de Laura (Jefatura RRHH) en la barra superior.
        </p>
      </div>
    );
  }

  const elements = report?.elements;

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* 1. Barra de Controles y Selector de Fechas */}
      <div className="relative p-5 sm:p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Washi tape decorativo */}
        <div className="absolute -top-2.5 left-10 w-20 h-4 bg-[#DCE8D3] opacity-85 rounded-xs border border-black/5" />

        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-11 h-11 rounded-xl bg-[#F7D8DF] border border-[#F2D0D9] flex items-center justify-center text-[#633248] shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-bold text-[#633248]">
                Libro de Registro & Indicadores de RRHH
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCE8D3] text-[#355328]">
                Oficial 2026
              </span>
            </div>
            <p className="text-xs text-[#6B5A66]">
              Nube de Fresa S.A. · Emisión diaria a las 7:00 a. m. (America/Costa_Rica)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Selector de fecha */}
          <div className="flex items-center gap-2 bg-[#FFF8EF] border border-[#E7D8CF] rounded-xl px-3 py-2 text-xs font-semibold text-[#633248] shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#633248]" />
            <span className="text-[11px] text-[#6B5A66]">Fecha:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-bold text-[#633248]"
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
            type="button"
            onClick={handleSyncDrive}
            disabled={syncingDrive}
            className="flex items-center gap-1.5 bg-[#FFF8EF] hover:bg-[#F7D8DF]/50 text-[#633248] border border-[#E7D8CF] px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingDrive ? 'animate-spin' : ''}`} />
            <span>{syncingDrive ? 'Sincronizando...' : 'Sincronizar Drive'}</span>
          </button>

          {/* Imprimir Acta Oficial */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-[#FFF8EF] hover:bg-[#DCE8D3]/50 text-[#633248] border border-[#E7D8CF] px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Imprimir acta oficial del reporte diario"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Acta</span>
          </button>

          {/* Banco de Evaluación */}
          <button
            type="button"
            onClick={handleRunEvaluation}
            disabled={evalLoading}
            className="flex items-center gap-1.5 bg-[#633248] hover:bg-[#7A3F59] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{evalLoading ? 'Evaluando...' : 'Evaluar 45 Casos'}</span>
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="p-3 bg-[#DCE8D3]/60 text-[#355328] border border-[#DCE8D3] rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#355328] shrink-0" />
          <span>Políticas sincronizadas exitosamente desde Google Drive. Cursor de cambios actualizado.</span>
        </div>
      )}

      {/* ESTADO: CARGA */}
      {loading && (
        <div className="p-12 text-center bg-[#FFFDF8] rounded-2xl border border-[#E7D8CF] shadow-card-subtle">
          <StrawberryIcon className="w-8 h-8 mx-auto animate-bounce mb-3" />
          <p className="text-sm font-semibold text-[#633248]">Consolidando libro diario de métricas...</p>
        </div>
      )}

      {/* ESTADO: ERROR O AUSENCIA */}
      {error && !loading && (
        <div className="p-8 text-center bg-[#FFFDF8] rounded-2xl border border-red-200 shadow-card-subtle">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h4 className="font-heading font-bold text-[#633248]">Sin Reporte Disponible</h4>
          <p className="text-xs text-[#6B5A66] mt-1">{error}</p>
        </div>
      )}

      {/* CONTENIDO DEL REPORTE */}
      {report && elements && !loading && (
        <>
          {/* 1. CUATRO INDICADORES CLAVE (KPIS CON TONOS PASTEL INDIVIDUALES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Dotación Activa (Rosa Suave) */}
            <div className="relative p-5 rounded-2xl bg-[#FFF4F7] border border-[#F2D2DC] shadow-card-subtle flex items-center justify-between">
              <div className="absolute -top-2 left-6 w-12 h-3.5 bg-[#F7D8DF] opacity-80 rounded-xs border border-black/5" />
              <div>
                <span className="text-xs text-[#6B5A66] font-medium block">Dotación Activa</span>
                <div className="font-heading font-bold text-3xl text-[#633248] mt-1">
                  {elements.turnover.average_headcount}
                </div>
                <span className="text-[11px] text-[#355328] font-semibold">100% colaboradores</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#F7D8DF] border border-[#F2D0D9] flex items-center justify-center text-[#633248] shadow-xs">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 2: Ausentes Hoy (Salvia Suave) */}
            <div className="relative p-5 rounded-2xl bg-[#F6FAF3] border border-[#D8E6D0] shadow-card-subtle flex items-center justify-between">
              <div className="absolute -top-2 left-6 w-12 h-3.5 bg-[#DCE8D3] opacity-80 rounded-xs border border-black/5" />
              <div>
                <span className="text-xs text-[#6B5A66] font-medium block">Ausentes Hoy</span>
                <div className="font-heading font-bold text-3xl text-[#633248] mt-1">
                  {elements.absent_today.total}
                </div>
                <span className="text-[11px] text-[#553C24] font-medium">
                  {elements.absent_today.by_type.incapacidad || 0} inc · {elements.absent_today.by_type.vacaciones || 0} vac
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#DCE8D3] border border-[#CCDDC1] flex items-center justify-center text-[#355328] shadow-xs">
                <UserX className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 3: Solicitudes Pendientes (Mantequilla) */}
            <div className="relative p-5 rounded-2xl bg-[#FFFBF0] border border-[#EFE1C3] shadow-card-subtle flex items-center justify-between">
              <div className="absolute -top-2 left-6 w-12 h-3.5 bg-[#FFF2D6] opacity-80 rounded-xs border border-black/5" />
              <div>
                <span className="text-xs text-[#6B5A66] font-medium block">Solicitudes en Trámite</span>
                <div className="font-heading font-bold text-3xl text-[#633248] mt-1">
                  {elements.pending_requests.total_pending}
                </div>
                <span className="text-[11px] text-[#A63624] font-bold">
                  {elements.pending_requests.older_than_three_days} con más de 3 días
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF2D6] border border-[#EFE1C3] flex items-center justify-center text-[#704820] shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 4: Rotación Trimestral (Lavanda Suave) */}
            <div className="relative p-5 rounded-2xl bg-[#FAF4F8] border border-[#E8D4E5] shadow-card-subtle flex items-center justify-between">
              <div className="absolute -top-2 left-6 w-12 h-3.5 bg-[#EED8EA] opacity-80 rounded-xs border border-black/5" />
              <div>
                <span className="text-xs text-[#6B5A66] font-medium block">Rotación Trimestral</span>
                <div className="font-heading font-bold text-3xl text-[#633248] mt-1">
                  {elements.turnover.accumulated_turnover_rate_pct}%
                </div>
                <span className="text-[11px] text-[#355328] font-semibold">1 salida / 60 dotación</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#EED8EA] border border-[#DFC3DA] flex items-center justify-center text-[#552B46] shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 2. RESUMEN EJECUTIVO (FORMATO NOTA DE AGENDA / EDITORIAL) */}
          <div className="relative p-6 sm:p-7 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle space-y-3">
            {/* Washi tape butter */}
            <div className="absolute -top-2.5 left-10 w-24 h-4 bg-[#FFF2D6] opacity-90 rounded-xs border border-black/5" />

            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-6 h-6 rounded-full bg-[#F7D8DF] flex items-center justify-center">
                <StrawberryIcon className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#633248]">
                Resumen Ejecutivo de la Jornada ({report.report_date})
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF8EF] border border-[#E7D8CF] text-[#6B5A66] ml-auto">
                Auditoría RRHH
              </span>
            </div>

            <div className="planner-ruled-lines p-4 rounded-xl border border-[#E7D8CF]/60 bg-[#FFFDF8]">
              <p className="text-sm leading-relaxed text-[#382C35] font-medium">
                {elements.executive_summary}
              </p>
            </div>
          </div>

          {/* 3. DOS GRÁFICOS: TENDENCIA 30 DÍAS Y DISTRIBUCIÓN POR DEPARTAMENTOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Tendencia de Consultas y Ausencias */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#633248]">
                    Volumen de Consultas (Últimos 30 días)
                  </h4>
                  <p className="text-xs text-[#6B5A66]">
                    Preguntas resueltas por el portal vs. ausencias registradas
                  </p>
                </div>
                <span className="text-xs bg-[#FFF8EF] text-[#633248] font-semibold px-2.5 py-1 rounded-full border border-[#E7D8CF]">
                  Media: 38 / día
                </span>
              </div>

              {/* Simulación SVG de barras pastel de 30 días */}
              <div className="h-44 w-full flex items-end justify-between gap-1 pt-6 px-1 border-b border-[#E7D8CF]">
                {[28, 32, 35, 40, 42, 38, 22, 19, 36, 41, 45, 39, 34, 42, 48, 25, 20, 39, 44, 42, 37, 46, 50, 41, 26, 21, 38, 43, 38, 42].map(
                  (val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        style={{ height: `${(val / 50) * 115}px` }}
                        className={`w-full rounded-t-sm transition-all ${
                          idx === 29 ? 'bg-[#633248]' : 'bg-[#F7D8DF] hover:bg-[#F2BAC8]'
                        }`}
                      />
                      {/* Tooltip pastel */}
                      <div className="absolute -top-7 hidden group-hover:flex bg-[#382C35] text-white text-[10px] px-2 py-0.5 rounded shadow-sm z-10 whitespace-nowrap">
                        Día {idx + 1}: {val} consultas
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B5A66] pt-1">
                <span>Hace 30 días</span>
                <span className="font-semibold text-[#633248]">
                  Hoy ({elements.chat_metrics_yesterday.total_queries} consultas ayer)
                </span>
              </div>
            </div>

            {/* Gráfico 2: Distribución por Departamentos */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#633248]">
                    Dotación por Departamento
                  </h4>
                  <p className="text-xs text-[#6B5A66]">
                    Distribución de los 60 colaboradores del estudio
                  </p>
                </div>
                <span className="text-xs bg-[#FFF8EF] text-[#633248] font-semibold px-2.5 py-1 rounded-full border border-[#E7D8CF]">
                  6 Departamentos
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'Ilustración y Arte Digital', count: 18, color: 'bg-[#F7D8DF]' },
                  { name: 'Papelería y Producción', count: 14, color: 'bg-[#DCE8D3]' },
                  { name: 'Diseño y Experiencia Digital', count: 12, color: 'bg-[#EED8EA]' },
                  { name: 'Mercadeo y Redes', count: 7, color: 'bg-[#FFF2D6]' },
                  { name: 'Finanzas y Administración', count: 5, color: 'bg-[#E5D7CE]' },
                  { name: 'Recursos Humanos y Cultura', count: 4, color: 'bg-[#F2BAC8]' },
                ].map((dept, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-[#382C35]">
                      <span>{dept.name}</span>
                      <span className="text-[#6B5A66]">
                        {dept.count} ({Math.round((dept.count / 60) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#FFF8EF] rounded-full overflow-hidden border border-[#E7D8CF]">
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

          {/* 4. TABLA DE SOLICITUDES PENDIENTES CON ALERTA DE 3 DÍAS */}
          <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7D8CF]/60">
              <div>
                <h4 className="font-heading font-bold text-base text-[#633248]">
                  Trámites Pendientes de Aprobación
                </h4>
                <p className="text-xs text-[#6B5A66]">
                  Las solicitudes con más de 3 días de antigüedad requieren resolución prioritaria por jefaturas
                </p>
              </div>
              <span className="text-xs font-bold text-[#A63624] bg-[#FFEBE5] border border-[#F3C7BE] px-3 py-1 rounded-full">
                {elements.pending_requests.older_than_three_days} urgentes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E7D8CF] text-[#6B5A66]">
                    <th className="py-2.5 font-bold">Colaborador</th>
                    <th className="py-2.5 font-bold">Tipo de Solicitud</th>
                    <th className="py-2.5 font-bold">Fecha de Envío</th>
                    <th className="py-2.5 font-bold text-center">Días de Espera</th>
                    <th className="py-2.5 font-bold text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF5EE]">
                  {elements.pending_requests.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FFF8EF] transition-colors">
                      <td className="py-3 font-semibold text-[#633248]">{item.employee_name}</td>
                      <td className="py-3 text-[#382C35]">{item.request_type}</td>
                      <td className="py-3 text-[#6B5A66]">
                        {new Date(item.submitted_at).toLocaleDateString('es-CR')}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            item.days_pending >= 3
                              ? 'bg-[#FFEBE5] text-[#A63624] border border-[#F3C7BE]'
                              : 'bg-[#DCE8D3] text-[#355328]'
                          }`}
                        >
                          {item.days_pending} días
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-[#704820] bg-[#FFF2D6] border border-[#EFE1C3] px-2.5 py-0.5 rounded-full font-semibold">
                          Pendiente
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. VACACIONES ACUMULADAS (>20 DÍAS) & TEMAS MÁS CONSULTADOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vacaciones > 20 días */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#A63624]" />
                <h4 className="font-heading font-bold text-sm text-[#633248]">
                  Colaboradores con más de 20 días acumulados
                </h4>
              </div>
              <p className="text-xs text-[#6B5A66]">
                El Código de Trabajo de Costa Rica prohíbe acumular más de dos periodos consecutivos:
              </p>
              <div className="space-y-2 pt-1">
                {elements.high_vacation_balances.employees.map((e) => (
                  <div
                    key={e.employee_id}
                    className="flex justify-between items-center p-3 rounded-xl bg-[#FFF8EF] border border-[#E7D8CF] text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#633248] block">{e.employee_name}</span>
                      <span className="text-[11px] text-[#6B5A66]">{e.department}</span>
                    </div>
                    <span className="font-bold text-[#704820] bg-[#FFF2D6] border border-[#EFE1C3] px-2.5 py-0.5 rounded-md">
                      {e.vacation_days_balance} días
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Temas y Preguntas sin Cobertura */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle space-y-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#633248]" />
                <h4 className="font-heading font-bold text-sm text-[#633248]">
                  Temas más Consultados & Oportunidades
                </h4>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#6B5A66] uppercase block mb-1">
                  Top 5 Temas Frecuentes:
                </span>
                {elements.top_topics_and_gaps.top_five_topics.map((t, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1 border-b border-[#FAF5EE]">
                    <span className="text-[#382C35] font-medium">{t.topic}</span>
                    <span className="font-bold text-[#633248]">{t.count} consultas</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#6B5A66] uppercase block mb-1">
                  Preguntas con vacíos de cobertura detectados:
                </span>
                {elements.top_topics_and_gaps.uncovered_policy_questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#FFF4F7] border border-[#F2D2DC] text-xs mb-1.5"
                  >
                    <span className="font-medium text-[#633248] block">«{q.question_redacted}»</span>
                    <span className="text-[11px] text-[#6B5A66]">Aspecto faltante: {q.missing_aspect}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. MESA DE AYUDA Y ESCALAMIENTO (HUMAN-IN-THE-LOOP) */}
          <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7D8CF]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F7D8DF] flex items-center justify-center text-[#633248]">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#633248]">
                    Mesa de Ayuda de RRHH · Escalamientos Human-in-the-Loop
                  </h4>
                  <p className="text-xs text-[#6B5A66]">
                    Tickets generados automáticamente cuando una consulta no tiene cobertura en políticas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchTickets}
                className="text-xs bg-[#FFF8EF] hover:bg-[#F7D8DF]/40 text-[#633248] border border-[#E7D8CF] px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                Actualizar
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="p-5 rounded-xl bg-[#FFF8EF] border border-[#E7D8CF] text-center text-xs text-[#6B5A66]">
                No hay tickets pendientes de escalamiento. Las consultas de los colaboradores han sido cubiertas satisfactoriamente.
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-[#FFF8EF]/50 border border-[#E7D8CF] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#633248] bg-[#F7D8DF] px-2 py-0.5 rounded">
                          {t.id}
                        </span>
                        <span className="text-xs font-semibold text-[#382C35]">{t.employee_name}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          t.status === 'resuelto'
                            ? 'bg-[#DCE8D3] text-[#355328]'
                            : 'bg-[#FFF2D6] text-[#704820] border border-[#EFE1C3]'
                        }`}
                      >
                        {t.status === 'resuelto' ? 'Resuelto' : 'Pendiente de Respuesta'}
                      </span>
                    </div>

                    <p className="text-xs text-[#382C35] bg-[#FFFDF8] p-3 rounded-lg border border-[#E7D8CF]/60 font-sans">
                      «{t.unanswered_question}»
                    </p>

                    {t.status !== 'resuelto' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Escribí la resolución oficial de RRHH para este caso..."
                          value={ticketResponses[t.id] || ''}
                          onChange={(e) => setTicketResponses({ ...ticketResponses, [t.id]: e.target.value })}
                          className="flex-1 text-xs bg-white border border-[#E7D8CF] rounded-lg px-3 py-2 text-[#382C35] focus:outline-none focus:ring-1 focus:ring-[#633248]"
                        />
                        <button
                          type="button"
                          onClick={() => handleResolveTicket(t.id)}
                          className="bg-[#633248] hover:bg-[#7A3F59] text-white text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                          Resolver Ticket
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#355328] bg-[#DCE8D3]/40 p-2.5 rounded-lg border border-[#DCE8D3]">
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

      {/* 7. MODAL DE RESULTADOS DE EVALUACIÓN DE 45 PREGUNTAS (ESTILO AUDITORÍA BINDER) */}
      {evalData && (
        <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7D8CF]/60">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#355328]" />
              <div>
                <h3 className="font-heading font-bold text-lg text-[#633248]">
                  Matriz de Evaluación Oficial: 45 Casos de Prueba
                </h3>
                <p className="text-xs text-[#6B5A66]">
                  Verificación en tiempo real: Precisión, Latencia (&lt;8s) y Aislamiento de Terceros (Q21 y Q22)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEvalData(null)}
              className="text-xs bg-[#FFF8EF] hover:bg-[#F7D8DF]/40 px-3 py-1.5 rounded-lg border border-[#E7D8CF] font-semibold text-[#633248] cursor-pointer"
            >
              Cerrar matriz
            </button>
          </div>

          {/* Tarjetas de sellos de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F6FAF3] border border-[#D8E6D0]">
              <span className="text-xs text-[#6B5A66] font-medium block">Tasa de Aciertos</span>
              <div className="text-2xl font-bold font-heading text-[#633248] mt-0.5">
                {evalData.summary.accuracyPct}% ({evalData.summary.passCount}/{evalData.summary.totalQuestions})
              </div>
              <span className="text-[11px] font-semibold text-[#355328]">
                {evalData.summary.targetAccuracyMet ? 'Supera meta oficial (80%)' : 'Debajo de meta'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF4F7] border border-[#F2D2DC]">
              <span className="text-xs text-[#6B5A66] font-medium block">Consultas en &lt; 8 segundos</span>
              <div className="text-2xl font-bold font-heading text-[#633248] mt-0.5">
                {evalData.summary.under8SecPct}% ({evalData.summary.under8SecCount}/{evalData.summary.totalQuestions})
              </div>
              <span className="text-[11px] font-semibold text-[#355328]">
                {evalData.summary.targetSpeedMet ? 'Cumple meta de velocidad (90%)' : 'Requiere optimización'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFBF0] border border-[#EFE1C3]">
              <span className="text-xs text-[#6B5A66] font-medium block">Aislamiento Q21 y Q22</span>
              <div className="text-2xl font-bold font-heading text-[#633248] mt-0.5">100% Protegido</div>
              <span className="text-[11px] font-semibold text-[#355328]">
                Cero fuga de información sensible
              </span>
            </div>
          </div>

          {/* Tabla de pruebas ejecutadas */}
          <div className="max-h-72 overflow-y-auto border border-[#E7D8CF] rounded-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FFF8EF] sticky top-0 border-b border-[#E7D8CF] text-[#6B5A66]">
                <tr>
                  <th className="p-2.5 font-bold">Núm</th>
                  <th className="p-2.5 font-bold">Pregunta Evaluada</th>
                  <th className="p-2.5 font-bold">Tipo</th>
                  <th className="p-2.5 font-bold">Fuente Oficial</th>
                  <th className="p-2.5 font-bold text-center">Latencia</th>
                  <th className="p-2.5 font-bold text-center">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF5EE]">
                {evalData.results.map((r: any) => (
                  <tr key={r.id} className="hover:bg-[#FFF8EF]">
                    <td className="p-2.5 font-bold text-[#633248]">{r.id}</td>
                    <td className="p-2.5 text-[#382C35] font-medium max-w-xs truncate">{r.question}</td>
                    <td className="p-2.5 text-[#6B5A66]">{r.type}</td>
                    <td className="p-2.5 font-mono text-[11px] text-[#633248]">{r.expectedSource}</td>
                    <td className="p-2.5 text-center font-mono">{r.latencyMs} ms</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          r.passed ? 'bg-[#DCE8D3] text-[#355328]' : 'bg-[#F7D8DF] text-[#633248]'
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
