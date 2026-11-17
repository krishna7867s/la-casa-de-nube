'use client';

import React, { useState } from 'react';
import { DEMO_COLABORADOR, DEMO_RRHH } from '../data/mock-data';
import { POLICY_DOCUMENTS } from '../data/policies';
import { EmployeeProfile } from '../types';
import { AgendaChat } from '../components/chat/AgendaChat';
import { HRDashboard } from '../components/dashboard/HRDashboard';
import { EmployeeNotebook } from '../components/employee/EmployeeNotebook';
import { CloudIcon, StrawberryIcon, ScallopHeaderLace } from '../components/icons/StationeryIcons';
import {
  MessageSquare,
  User,
  BookOpen,
  BarChart3,
  ExternalLink,
  Calendar,
  Clock,
  Shield,
  FileText,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'perfil' | 'politicas' | 'reportes' | 'docs'>('chat');
  const [activeEmployee, setActiveEmployee] = useState<EmployeeProfile>(DEMO_COLABORADOR);

  const isRRHH = activeEmployee.role === 'rrhh';

  return (
    <div className="min-h-screen flex flex-col justify-between agenda-grid-bg">
      {/* Encabezado compacto */}
      <header className="bg-[#FFFDF8] border-b border-[#E7D8CF] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo e identidad */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F7D8DF] flex items-center justify-center border border-[#E7D8CF]">
              <CloudIcon className="w-4 h-4 text-[#633248]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-semibold text-base text-[#633248] tracking-tight leading-none">
                  La Casita de Nube
                </h1>
                <span className="text-[11px] font-sans text-[#6B5A66] bg-[#FFF8EF] px-2 py-0.5 rounded border border-[#E7D8CF]">
                  Nube de Fresa
                </span>
              </div>
            </div>
          </div>

          {/* Navegación y selector de cuenta activa */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right font-sans">
              <span className="text-xs font-semibold text-[#633248]">{activeEmployee.full_name}</span>
              <span className="text-[11px] text-[#6B5A66]">
                {activeEmployee.position} · {isRRHH ? 'Rol RRHH' : 'Colaborador'}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#FFF8EF] border border-[#E7D8CF] p-1 rounded-xl text-xs font-medium font-sans">
              <button
                onClick={() => {
                  setActiveEmployee(DEMO_COLABORADOR);
                  if (activeTab === 'reportes') setActiveTab('chat');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  !isRRHH
                    ? 'bg-[#633248] text-white'
                    : 'text-[#6B5A66] hover:text-[#633248]'
                }`}
              >
                Mariana (Colaboradora)
              </button>
              <button
                onClick={() => setActiveEmployee(DEMO_RRHH)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  isRRHH
                    ? 'bg-[#633248] text-white'
                    : 'text-[#6B5A66] hover:text-[#633248]'
                }`}
              >
                Laura (RRHH)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-5xl mx-auto px-4 pt-4 flex-1 w-full">
        {/* Pestañas de Libreta / Agenda Japonesa */}
        <div className="flex items-end gap-1 border-b border-[#E7D8CF] px-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('chat')}
            className={`agenda-tab-btn flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'agenda-tab-btn-active' : ''
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#633248]" />
            <span>Consultas</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`agenda-tab-btn flex items-center gap-1.5 ${
              activeTab === 'perfil' ? 'agenda-tab-btn-active' : ''
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#633248]" />
            <span>Mis datos</span>
          </button>

          <button
            onClick={() => setActiveTab('politicas')}
            className={`agenda-tab-btn flex items-center gap-1.5 ${
              activeTab === 'politicas' ? 'agenda-tab-btn-active' : ''
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#633248]" />
            <span>Políticas</span>
          </button>

          {/* «Reportes» se muestra ÚNICAMENTE si el rol es RRHH */}
          {isRRHH && (
            <button
              onClick={() => setActiveTab('reportes')}
              className={`agenda-tab-btn flex items-center gap-1.5 ${
                activeTab === 'reportes' ? 'agenda-tab-btn-active' : ''
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#633248]" />
              <span>Reportes</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('docs')}
            className={`agenda-tab-btn flex items-center gap-1.5 ${
              activeTab === 'docs' ? 'agenda-tab-btn-active' : ''
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#633248]" />
            <span>Documentación</span>
          </button>
        </div>

        {/* Contenido según pestaña activa */}
        <div className="pt-4 pb-8">
          {activeTab === 'chat' && <AgendaChat activeEmployee={activeEmployee} />}

          {activeTab === 'perfil' && (
            <EmployeeNotebook
              employee={activeEmployee}
              onBalanceUpdate={(newBal) => {
                setActiveEmployee((prev) => ({ ...prev, vacation_days_balance: newBal }));
              }}
            />
          )}

          {activeTab === 'politicas' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="p-5 rounded-agenda bg-[#FFFDF8] border border-[#E7D8CF] shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-semibold text-base text-[#633248]">
                    Políticas Oficiales de Nube de Fresa
                  </h3>
                  <p className="text-xs text-[#6B5A66] font-sans mt-0.5">
                    Documentos vigentes para consulta interna y cumplimiento legal
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#633248] bg-[#F7D8DF] px-3 py-1 rounded-full border border-[#E7D8CF]">
                  Vigencia 2026
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {POLICY_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-agenda bg-[#FFFDF8] border border-[#E7D8CF] hover:border-[#633248]/40 transition-colors flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#633248] bg-[#F7D8DF] px-2 py-0.5 rounded">
                          {doc.code}
                        </span>
                        <span className="text-[11px] font-sans text-[#6B5A66]">
                          Versión {doc.version}
                        </span>
                      </div>
                      <h4 className="font-heading font-semibold text-sm text-[#633248] mt-2 leading-snug">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-[#6B5A66] font-sans mt-1">
                        Responsable: {doc.responsible_role}
                      </p>
                    </div>

                    <a
                      href={doc.drive_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#633248] hover:underline pt-2 border-t border-[#E7D8CF]/60"
                    >
                      <span>Ver documento oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reportes' && isRRHH && (
            <HRDashboard currentUserRole={activeEmployee.role} />
          )}

          {activeTab === 'docs' && (
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="p-6 rounded-agenda bg-[#FFFDF8] border border-[#E7D8CF] shadow-xs space-y-4">
                <h3 className="font-heading font-semibold text-base text-[#633248] border-b border-[#E7D8CF]/60 pb-3">
                  Documentación del Sistema
                </h3>

                <div className="space-y-3 text-xs leading-relaxed text-[#382C35] font-sans">
                  <div className="p-3.5 rounded-xl bg-[#FFF8EF] border border-[#E7D8CF]">
                    <span className="font-semibold text-sm text-[#633248] block mb-1">
                      Investigación Jurídica de Costa Rica
                    </span>
                    <p className="text-[#6B5A66] mb-1.5">
                      Estudio normativo sobre Código de Trabajo (Ley 2), MTSS, CCSS, teletrabajo (Ley 9738), feriados, aguinaldo y protección de datos (Ley 8968).
                    </p>
                    <span className="text-[11px] text-[#633248] font-mono">
                      Archivo: INVESTIGACION_COSTA_RICA.md
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FFF8EF] border border-[#E7D8CF]">
                    <span className="font-semibold text-sm text-[#633248] block mb-1">
                      Informe Técnico de Arquitectura Multiagente
                    </span>
                    <p className="text-[#6B5A66] mb-1.5">
                      Detalle de los 5 agentes, prompts desacoplados, fragmentación, esquema Supabase pgvector y justificación del stack.
                    </p>
                    <span className="text-[11px] text-[#633248] font-mono">
                      Archivo: INFORME_TECNICO.md
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FFF8EF] border border-[#E7D8CF]">
                    <span className="font-semibold text-sm text-[#633248] block mb-1">
                      Esquema de Base de Datos Remota
                    </span>
                    <p className="text-[#6B5A66] mb-1.5">
                      Estructura SQL para PostgreSQL con pgvector, perfiles, solicitudes, reportes diarios y políticas RLS.
                    </p>
                    <span className="text-[11px] text-[#633248] font-mono">
                      Archivo: supabase_schema.sql
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Pie de página discreto */}
      <footer className="py-4 border-t border-[#E7D8CF] bg-[#FFFDF8] text-center text-xs text-[#6B5A66] font-sans">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <StrawberryIcon className="w-3.5 h-3.5 text-[#633248]" />
          <span className="font-semibold text-[#633248]">Nube de Fresa</span>
          <span>· San José, Costa Rica</span>
        </div>
        <p className="text-[11px] text-[#6B5A66]/80">
          La Casita de Nube · Portal interno de Recursos Humanos
        </p>
      </footer>
    </div>
  );
}
