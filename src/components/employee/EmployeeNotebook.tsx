'use client';

import React, { useState } from 'react';
import { EmployeeProfile, LeaveRequest, LeaveRequestType } from '../../types';
import { CloudIcon, StrawberryIcon } from '../icons/StationeryIcons';
import { Calendar, Clock, DollarSign, Send, CheckCircle2, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { LEAVE_REQUESTS } from '../../data/mock-data';

interface EmployeeNotebookProps {
  employee: EmployeeProfile;
  onBalanceUpdate?: (newBalance: number) => void;
}

export function EmployeeNotebook({ employee, onBalanceUpdate }: EmployeeNotebookProps) {
  const [balance, setBalance] = useState(employee.vacation_days_balance);
  const [requests, setRequests] = useState<LeaveRequest[]>(
    LEAVE_REQUESTS.filter((r) => r.employee_id === employee.id)
  );

  // Formulario de nueva solicitud
  const [requestType, setRequestType] = useState<LeaveRequestType>('vacaciones');
  const [startDate, setStartDate] = useState('2026-12-08');
  const [endDate, setEndDate] = useState('2026-12-10');
  const [daysCount, setDaysCount] = useState(3);
  const [reason, setReason] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cálculo de Aguinaldo 2026 proyectado (Fórmula oficial CR: salario promedio anual / 12)
  const salary = employee.salary_colones || 950000;
  const projectedAguinaldo = Math.round(salary); // 12 meses completos devengados

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (requestType === 'vacaciones' && daysCount > balance) {
      setStatusMsg({
        type: 'error',
        text: `No podés solicitar ${daysCount} días porque tu saldo disponible es de ${balance} días.`,
      });
      return;
    }

    if (!reason.trim()) {
      setStatusMsg({
        type: 'error',
        text: 'Por favor escribí un breve motivo para el registro de tu solicitud.',
      });
      return;
    }

    const newReq: LeaveRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      employee_id: employee.id,
      employee_name: employee.full_name,
      request_type: requestType,
      start_date: startDate,
      end_date: endDate,
      days_requested: Number(daysCount),
      reason: reason.trim(),
      status: 'pendiente',
      submitted_at: new Date().toISOString(),
    };

    // Actualizar solicitudes y restar saldo si fueron vacaciones
    const updated = [newReq, ...requests];
    setRequests(updated);

    if (requestType === 'vacaciones') {
      const newBal = balance - Number(daysCount);
      setBalance(newBal);
      if (onBalanceUpdate) onBalanceUpdate(newBal);
    }

    // Agregar a la lista compartida en memoria para que RRHH la vea en el dashboard
    LEAVE_REQUESTS.unshift(newReq);

    setStatusMsg({
      type: 'success',
      text: `¡Listo! Tu solicitud de ${requestType} (${daysCount} días) fue radicada y está pendiente de aprobación por jefatura.`,
    });
    setReason('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Portada de la libreta personal */}
      <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7D8CF]/60 pb-5">
          <div className="flex items-center gap-4">
            <img
              src={employee.avatar_url}
              alt={employee.full_name}
              className="w-14 h-14 rounded-2xl bg-[#FFF8EF] p-1 border border-[#E7D8CF] shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-xl text-[#633248]">
                  {employee.full_name}
                </h2>
                <span className="stationery-stamp">
                  {employee.status === 'activo' ? 'ACTIVA' : employee.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#6B5A66] font-sans mt-0.5">
                {employee.position} · Departamento de {employee.department}
              </p>
              <p className="text-[11px] text-[#6B5A66] font-sans">
                Fecha de ingreso: {employee.hire_date} · Jornada híbrida 2/3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF8EF] border border-[#E7D8CF] px-3.5 py-2 rounded-xl text-xs text-[#633248]">
            <StrawberryIcon className="w-4 h-4" />
            <span className="font-sans font-medium">Estudio Nube de Fresa · San José</span>
          </div>
        </div>

        {/* Tarjetas de Saldo, Pagos y Beneficios */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-4 rounded-xl bg-[#FFF2F5] border border-[#F2D0D9] flex flex-col justify-between">
            <span className="text-xs text-[#633248] font-sans font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#633248]" />
              Saldo de vacaciones
            </span>
            <div className="font-heading font-bold text-2xl text-[#633248] my-1">
              {balance} días
            </div>
            <span className="text-[11px] text-[#6B5A66] font-sans">
              Hábiles acumulados (POL-01)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8F1] border border-[#D6E5CC] flex flex-col justify-between">
            <span className="text-xs text-[#3D5A32] font-sans font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3D5A32]" />
              Días de Fresa
            </span>
            <div className="font-heading font-bold text-2xl text-[#3D5A32] my-1">
              2 libres
            </div>
            <span className="text-[11px] text-[#6B5A66] font-sans">
              Descanso creativo anual
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF0] border border-[#EFE2C6] flex flex-col justify-between">
            <span className="text-xs text-[#634821] font-sans font-semibold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#634821]" />
              Próximo pago
            </span>
            <div className="font-heading font-bold text-base text-[#634821] my-1">
              30 de nov.
            </div>
            <span className="text-[11px] text-[#6B5A66] font-sans">
              Quincena en colones (₡)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8EBF5] border border-[#E8D0E3] flex flex-col justify-between">
            <span className="text-xs text-[#633248] font-sans font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#633248]" />
              Aguinaldo proyectado
            </span>
            <div className="font-heading font-bold text-base text-[#633248] my-1">
              ₡{projectedAguinaldo.toLocaleString('es-CR')}
            </div>
            <span className="text-[11px] text-[#6B5A66] font-sans">
              Pago oficial al 12 de dic.
            </span>
          </div>
        </div>
      </div>

      {/* Cuadrícula de 2 columnas: Formulario de solicitud + Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Solicitud de Trámites */}
        <div className="relative p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle space-y-4">
          {/* Cinta Washi decorativa */}
          <div className="absolute -top-2.5 left-8 w-16 h-4 bg-[#DCE8D3] opacity-85 rounded-xs shadow-xs border border-black/5" />

          <div className="flex items-center gap-2 pb-2 border-b border-[#E7D8CF]/60 pt-1">
            <FileText className="w-4 h-4 text-[#633248]" />
            <h3 className="font-heading font-bold text-base text-[#633248]">
              Radicar solicitud de vacaciones o permiso
            </h3>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-[#633248] block mb-1">
                Tipo de trámite
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as any)}
                className="w-full bg-[#FFF8EF] border border-[#E7D8CF] rounded-xl px-3 py-2 text-xs text-[#382C35] focus:outline-none focus:ring-1 focus:ring-[#633248]"
              >
                <option value="vacaciones">Vacaciones ordinarias (descuenta del saldo)</option>
                <option value="permiso">Permiso personal / trámite administrativo</option>
                <option value="estudio">Permiso para estudio / examen universitario</option>
                <option value="duelo">Licencia por duelo familiar</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#633248] block mb-1">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#FFF8EF] border border-[#E7D8CF] rounded-xl px-3 py-2 text-xs text-[#382C35] focus:outline-none focus:ring-1 focus:ring-[#633248]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#633248] block mb-1">
                  Fecha de finalización
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#FFF8EF] border border-[#E7D8CF] rounded-xl px-3 py-2 text-xs text-[#382C35] focus:outline-none focus:ring-1 focus:ring-[#633248]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#633248] block mb-1">
                Cantidad de días hábiles
              </label>
              <input
                type="number"
                min={0.5}
                max={15}
                step={0.5}
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full bg-[#FFF8EF] border border-[#E7D8CF] rounded-xl px-3 py-2 text-xs text-[#382C35] focus:outline-none focus:ring-1 focus:ring-[#633248]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#633248] block mb-1">
                Motivo de la solicitud
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ejemplo: Trámite personal o descanso familiar..."
                className="w-full bg-[#FFF8EF] border border-[#E7D8CF] rounded-xl px-3 py-2 text-xs text-[#382C35] focus:outline-none focus:ring-1 focus:ring-[#633248]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#633248] hover:bg-[#7A3F59] text-white font-heading font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Enviar a Jefatura y RRHH</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Historial de Solicitudes Radicadas */}
        <div className="relative p-6 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-card-subtle space-y-4">
          {/* Cinta Washi decorativa */}
          <div className="absolute -top-2.5 left-8 w-16 h-4 bg-[#F7D8DF] opacity-85 rounded-xs shadow-xs border border-black/5" />

          <div className="flex items-center justify-between pb-2 border-b border-[#E7D8CF]/60 pt-1">
            <h3 className="font-heading font-bold text-base text-[#633248]">
              Mis solicitudes registradas ({requests.length})
            </h3>
            <span className="text-[11px] text-[#6B5A66] font-sans">Actualizado al día</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {requests.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-[#FFF8EF] border border-[#E7D8CF] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#633248] uppercase tracking-wide font-heading">
                    {r.request_type} · {r.days_requested} día(s)
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'aprobada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'pendiente'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.status === 'aprobada' ? 'Aprobada' : 'Pendiente de jefatura'}
                  </span>
                </div>

                <p className="text-xs text-[#382C35] font-sans">
                  «{r.reason}»
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#6B5A66] pt-1 border-t border-[#E7D8CF]/50 font-sans">
                  <span>Periodo: {r.start_date} al {r.end_date}</span>
                  <span>ID: {r.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

