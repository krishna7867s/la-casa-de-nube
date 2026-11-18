'use client';

import React, { useState } from 'react';
import { DEMO_COLABORADOR, DEMO_RRHH } from '../data/mock-data';
import { POLICY_DOCUMENTS } from '../data/policies';
import { EmployeeProfile } from '../types';
import { AgendaChat } from '../components/chat/AgendaChat';
import { HRDashboard } from '../components/dashboard/HRDashboard';
import { EmployeeNotebook } from '../components/employee/EmployeeNotebook';
import {
  CloudIcon,
  StrawberryIcon,
  ScallopHeaderLace,
  PostageStampIcon,
  PaperclipIcon,
  SpiralBinderRings,
} from '../components/icons/StationeryIcons';
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
  Building2,
  FolderOpen,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'perfil' | 'politicas' | 'reportes' | 'docs'>('chat');
  const [activeEmployee, setActiveEmployee] = useState<EmployeeProfile>(DEMO_COLABORADOR);

  const isRRHH = activeEmployee.role === 'rrhh';

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#F7D8DF] selection:text-[#633248]">
      {/* Encabezado Superior Estilo Papelería Fina */}
      <header className="bg-[#FFFDF8] border-b border-[#E7D8CF] sticky top-0 z-40 shadow-xs">
        {/* Encaje festoneado inspirado en la papelería japonesa de los 2000 */}
        <div className="w-full bg-[#FFF8EF]">
          <ScallopHeaderLace className="w-full h-2.5 text-[#F7D8DF]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Identidad del Estudio */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8EF] border border-[#E7D8CF] flex items-center justify-center p-1.5 shadow-xs">
              <CloudIcon className="w-full h-full text-[#633248]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-lg text-[#633248] tracking-tight leading-none">
                  La Casita de Nube
                </h1>
                <span className="stationery-stamp">
                  CR · 2026
                </span>
              </div>
              <p className="text-xs text-[#6B5A66] font-sans mt-0.5">
                Nube de Fresa S.A. · Estudio de Papelería e Ilustración Digital
              </p>
            </div>
          </div>

          {/* Gafete de Colaborador y Selector de Sesión */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FFF8EF] border border-[#E7D8CF] text-xs font-sans text-[#6B5A66]">
              <Clock className="w-3.5 h-3.5 text-[#633248]" />
              <span>San José, Costa Rica (GMT-6)</span>
            </div>

            {/* Selector de cuenta activa */}
            <div className="flex items-center gap-1.5 bg-[#FFF8EF] border border-[#E7D8CF] p-1 rounded-xl text-xs font-medium font-sans">
              <button
                type="button"
                onClick={() => {
                  setActiveEmployee(DEMO_COLABORADOR);
                  if (activeTab === 'reportes') setActiveTab('chat');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isRRHH
                    ? 'bg-[#633248] text-white shadow-xs font-semibold'
                    : 'text-[#6B5A66] hover:text-[#633248] hover:bg-[#F7D8DF]/40'
                }`}
              >
                <img
                  src={DEMO_COLABORADOR.avatar_url}
                  alt="Mariana"
                  className="w-4 h-4 rounded-full bg-white/30"
                />
                <span>Mariana (Diseño)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEmployee(DEMO_RRHH)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isRRHH
                    ? 'bg-[#633248] text-white shadow-xs font-semibold'
                    : 'text-[#6B5A66] hover:text-[#633248] hover:bg-[#F7D8DF]/40'
                }`}
              >
                <img
                  src={DEMO_RRHH.avatar_url}
                  alt="Laura"
                  className="w-4 h-4 rounded-full bg-white/30"
                />
                <span>Laura (Jefatura RRHH)</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal: Agenda Abierta con Pestañas */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-10 flex-1 w-full">
        {/* Fila de Pestañas Superiores Estilo Sanrio / Midori */}
        <div className="flex items-end gap-1 px-3 overflow-x-auto no-scrollbar border-b border-[#D8C3B5]">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`agenda-tab tab-pink ${activeTab === 'chat' ? 'agenda-tab-active' : ''}`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#633248]" />
            <span>Consultas de RRHH</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`agenda-tab tab-sage ${activeTab === 'perfil' ? 'agenda-tab-active' : ''}`}
          >
            <User className="w-3.5 h-3.5 text-[#633248]" />
            <span>Mi Libreta Personal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('politicas')}
            className={`agenda-tab tab-butter ${activeTab === 'politicas' ? 'agenda-tab-active' : ''}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#633248]" />
            <span>Políticas Oficiales</span>
          </button>

          {/* Pestaña de Reportes: Visible únicamente para Rol RRHH */}
          {isRRHH && (
            <button
              type="button"
              onClick={() => setActiveTab('reportes')}
              className={`agenda-tab tab-lavender ${activeTab === 'reportes' ? 'agenda-tab-active' : ''}`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#633248]" />
              <span>Reportes de RRHH</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`agenda-tab tab-sand ${activeTab === 'docs' ? 'agenda-tab-active' : ''}`}
          >
            <FileText className="w-3.5 h-3.5 text-[#633248]" />
            <span>Documentos de Drive</span>
          </button>
        </div>

        {/* Marco de Hoja de Libreta */}
        <div className="relative bg-[#FFFDF8] border-x border-b border-[#D8C3B5] rounded-b-2xl shadow-agenda-book p-4 sm:p-7 min-h-[680px]">
          {/* Anillas de libreta decorativas a la izquierda en pantallas grandes */}
          <div className="hidden xl:block absolute -left-4 top-16 bottom-16 pointer-events-none">
            <SpiralBinderRings count={14} />
          </div>

          {/* Vistas según pestaña activa */}
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
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Encabezado del catálogo oficial */}
              <div className="p-6 rounded-2xl bg-[#FFF8EF] border border-[#E7D8CF] shadow-card-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="stationery-stamp">NORMATIVA 2026</span>
                    <span className="text-xs text-[#6B5A66] font-sans">10 Dominios Laborales</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#633248]">
                    Catálogo de Políticas Oficiales de Nube de Fresa
                  </h3>
                  <p className="text-xs text-[#6B5A66] font-sans mt-1">
                    Redactadas conforme al Código de Trabajo de Costa Rica, Ministerio de Trabajo (MTSS) y beneficios del estudio.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#FFFDF8] border border-[#E7D8CF] px-3 py-2 rounded-xl text-xs text-[#633248] shrink-0">
                  <StrawberryIcon className="w-4 h-4" />
                  <span className="font-semibold">San José, Costa Rica</span>
                </div>
              </div>

              {/* Cuadrícula de 10 Políticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {POLICY_DOCUMENTS.map((doc, idx) => {
                  const washiColors = ['bg-[#F7D8DF]', 'bg-[#DCE8D3]', 'bg-[#FFF2D6]', 'bg-[#EED8EA]', 'bg-[#E5D7CE]'];
                  const washi = washiColors[idx % washiColors.length];
                  return (
                    <div
                      key={doc.id}
                      className="relative p-5 rounded-2xl bg-[#FFFDF8] border border-[#E7D8CF] hover:border-[#633248]/50 hover:shadow-card-subtle transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className={`absolute -top-2 left-8 w-14 h-3.5 ${washi} opacity-85 rounded-xs border border-black/5`} />
                      <div className="pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#633248] bg-[#FFF8EF] border border-[#E7D8CF] px-2.5 py-0.5 rounded-md font-heading">
                            {doc.code}
                          </span>
                          <span className="text-[11px] font-sans text-[#6B5A66]">
                            Versión {doc.version} · Vigente
                          </span>
                        </div>
                        <h4 className="font-heading font-semibold text-base text-[#633248] mt-2.5 leading-snug">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-[#6B5A66] font-sans mt-1">
                          Responsable: {doc.responsible_role}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E7D8CF]/60 flex items-center justify-between">
                        <span className="text-[11px] text-[#6B5A66] font-sans">
                          Base normativa oficial
                        </span>
                        <a
                          href={doc.drive_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#633248] hover:underline"
                        >
                          <span>Ver documento</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'reportes' && isRRHH && (
            <HRDashboard currentUserRole={activeEmployee.role} />
          )}

          {activeTab === 'docs' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="p-6 rounded-2xl bg-[#FFF8EF] border border-[#E7D8CF] shadow-card-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7D8CF]/70 pb-3">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#633248]">
                      Documentación Técnica y Fuentes del Sistema
                    </h3>
                    <p className="text-xs text-[#6B5A66] font-sans">
                      Mini Proyecto #2 · Portal de consulta de políticas de RRHH con RAG multiagente
                    </p>
                  </div>
                  <PostageStampIcon className="w-8 h-9" />
                </div>

                <div className="space-y-3 font-sans text-xs text-[#382C35]">
                  <div className="relative p-4.5 rounded-xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-xs">
                    <PaperclipIcon className="absolute top-3 right-3 w-4 h-6 text-[#633248]/40" />
                    <span className="font-semibold text-sm text-[#633248] block mb-1 font-heading">
                      1. Informe de Investigación Jurídica (Costa Rica)
                    </span>
                    <p className="text-[#6B5A66] mb-2 leading-relaxed">
                      Investigación a profundidad sobre el Código de Trabajo (Ley 2), criterios del MTSS, CCSS, feriados, aguinaldo, teletrabajo (Ley 9738), protocolo contra hostigamiento sexual (Ley 7476) y protección de datos personales (Ley 8968).
                    </p>
                    <span className="text-[11px] font-mono text-[#633248] bg-[#F7D8DF]/60 px-2 py-0.5 rounded border border-[#F2D0D9]">
                      INVESTIGACION_COSTA_RICA.md
                    </span>
                  </div>

                  <div className="relative p-4.5 rounded-xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-xs">
                    <PaperclipIcon className="absolute top-3 right-3 w-4 h-6 text-[#355328]/40" />
                    <span className="font-semibold text-sm text-[#633248] block mb-1 font-heading">
                      2. Informe Técnico de Arquitectura Multiagente
                    </span>
                    <p className="text-[#6B5A66] mb-2 leading-relaxed">
                      Estructura de los 5 agentes especializados, prompts versionados, estrategia de chunking (500–1000 tokens con 150 solapamiento), búsqueda híbrida con RRF, guardrails de seguridad y justificación del stack Next.js + Supabase.
                    </p>
                    <span className="text-[11px] font-mono text-[#355328] bg-[#DCE8D3]/60 px-2 py-0.5 rounded border border-[#D0E2C6]">
                      INFORME_TECNICO.md
                    </span>
                  </div>

                  <div className="relative p-4.5 rounded-xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-xs">
                    <PaperclipIcon className="absolute top-3 right-3 w-4 h-6 text-[#704820]/40" />
                    <span className="font-semibold text-sm text-[#633248] block mb-1 font-heading">
                      3. Matriz Oficial de Evaluación (45 Preguntas)
                    </span>
                    <p className="text-[#6B5A66] mb-2 leading-relaxed">
                      Las 25 preguntas base del enunciado oficial más 20 preguntas propias con respuestas esperadas, fuentes citadas, latencias y resultados (95.5% aciertos y 100% blindaje en preguntas 21 y 22).
                    </p>
                    <span className="text-[11px] font-mono text-[#704820] bg-[#FFF2D6] px-2 py-0.5 rounded border border-[#EFE1C3]">
                      HOJA_DE_EVALUACION_45_PREGUNTAS.md
                    </span>
                  </div>

                  <div className="relative p-4.5 rounded-xl bg-[#FFFDF8] border border-[#E7D8CF] shadow-xs">
                    <PaperclipIcon className="absolute top-3 right-3 w-4 h-6 text-[#552B46]/40" />
                    <span className="font-semibold text-sm text-[#633248] block mb-1 font-heading">
                      4. Archivos Simulados para el Pipeline de Google Drive
                    </span>
                    <p className="text-[#6B5A66] mb-2 leading-relaxed">
                      Muestras en múltiples formatos según el requisito del PDF: PDF oficial, documento de Google Docs (`.gdoc`) y hoja de cálculo de salarios (`.csv`).
                    </p>
                    <span className="text-[11px] font-mono text-[#552B46] bg-[#EED8EA]/70 px-2 py-0.5 rounded border border-[#E4C8E0]">
                      docs/archivos_drive_simulados/
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Pie de Página de Papelería Artesanal */}
      <footer className="py-5 border-t border-[#E7D8CF] bg-[#FFFDF8] text-center text-xs text-[#6B5A66] font-sans">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <StrawberryIcon className="w-4 h-4 text-[#633248]" />
            <span className="font-semibold text-[#633248]">Nube de Fresa S.A.</span>
            <span>· Estudio de Papelería e Ilustración Digital</span>
          </div>

          <div className="text-[11px] text-[#6B5A66]">
            <span>Barrio Amón, San José, Costa Rica · Horario 8:00 a. m. a 5:00 p. m.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
