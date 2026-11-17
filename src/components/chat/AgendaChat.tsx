'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EmployeeProfile } from '../../types';
import { CloudIcon, StrawberryIcon, ScallopHeaderLace } from '../icons/StationeryIcons';
import { Send, ExternalLink, BookOpen } from 'lucide-react';

interface AgendaChatProps {
  activeEmployee: EmployeeProfile;
}

export function AgendaChat({ activeEmployee }: AgendaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Las 3 preguntas exactas del estado inicial solicitadas por la especificación
  const initialSuggestions = [
    '¿Puedo ir en jeans?',
    '¿Cómo pido un reembolso?',
    '¿Cuántos días de vacaciones me quedan?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend.trim(),
          activeEmployeeId: activeEmployee.id,
        }),
      });

      const data = await response.json();

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            content: 'No encontré una política sobre ese tema. Podés consultarlo con RRHH.',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'No encontré una política sobre ese tema. Podés consultarlo con RRHH.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="relative flex flex-col h-[720px] max-w-4xl mx-auto rounded-agenda border border-[#E7D8CF] bg-[#FFFDF8] shadow-sm overflow-hidden">
      {/* Encaje festoneado decorativo superior inspirado en la referencia My Melody */}
      <div className="w-full bg-[#FFF8EF]">
        <ScallopHeaderLace className="w-full h-2.5 text-[#F7D8DF]" />
      </div>

      {/* Encabezado compacto */}
      <div className="bg-[#FFFDF8] border-b border-[#E7D8CF] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F7D8DF] flex items-center justify-center border border-[#E7D8CF]">
            <CloudIcon className="w-4 h-4 text-[#633248]" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg text-[#633248] tracking-tight leading-none">
              Consultas de RRHH
            </h2>
            <p className="text-xs text-[#6B5A66] mt-1 font-sans">
              La Casita de Nube · Sesión activa de {activeEmployee.full_name}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#6B5A66]">
          <StrawberryIcon className="w-4 h-4 text-[#633248]" />
          <span className="font-sans">Nube de Fresa · Costa Rica</span>
        </div>
      </div>

      {/* Área Principal de Conversación */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FFFDF8]">
        {/* Estado Inicial: Ilustración sutil y 3 sugerencias que desaparecen al iniciar */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF8EF] border border-[#E7D8CF] flex items-center justify-center mb-4">
              <CloudIcon className="w-8 h-8 text-[#633248]" />
            </div>

            <h3 className="font-heading font-semibold text-lg text-[#633248] mb-1">
              ¿Qué querés consultar hoy?
            </h3>
            <p className="text-sm text-[#6B5A66] mb-6 font-sans">
              Podés consultar las políticas internas, tu saldo de vacaciones o tus trámites de personal.
            </p>

            {/* Tres sugerencias exactas solicitadas */}
            <div className="w-full space-y-2">
              {initialSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSend(sug);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl border border-[#E7D8CF] bg-[#FFF8EF] hover:bg-[#F7D8DF] text-[#382C35] text-sm font-medium transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>{sug}</span>
                  <span className="text-xs text-[#633248] opacity-0 group-hover:opacity-100 transition-opacity">
                    Consultar
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensajes del chat */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isPersonal = msg.intent === 'personal_data';

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 ${
                  isUser
                    ? 'bg-[#633248] text-white rounded-br-xs'
                    : 'bg-[#FFF8EF] text-[#382C35] border border-[#E7D8CF] rounded-bl-xs'
                }`}
              >
                {/* Etiqueta de procedencia simple (oculta nombres técnicos de agentes y latencia) */}
                {!isUser && (
                  <div className="text-xs font-semibold text-[#633248] mb-2 pb-1 border-b border-[#E7D8CF]/60 font-heading">
                    {isPersonal ? 'Tus datos' : 'Políticas de Nube de Fresa'}
                  </div>
                )}

                {/* Texto de respuesta con tamaño mínimo de 16px (text-base) e interlineado cómodo */}
                <div className="text-base leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Fuentes debajo de la respuesta: Supabase (título, versión, vigencia) o Drive */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-[#E7D8CF]/70 space-y-1.5">
                    <span className="text-xs font-semibold text-[#6B5A66] block">
                      Fuente:
                    </span>
                    <div className="space-y-1 text-xs text-[#382C35]">
                      {msg.citations.map((cite, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-1.5 py-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#633248] shrink-0" />
                          <span className="font-semibold text-[#633248]">
                            {cite.document_title}
                          </span>
                          <span className="text-[#6B5A66]">
                            · Versión {cite.version || '1.0'} · Vigencia {cite.vigencia || '2026-01-01'}
                          </span>

                          {/* Ver documento solo si existe enlace real a Google Drive */}
                          {cite.drive_url && (
                            <a
                              href={cite.drive_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-[#633248] hover:underline ml-1"
                            >
                              <span>Ver documento</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#FFF8EF] border border-[#E7D8CF] rounded-2xl rounded-bl-xs px-4 py-3 text-sm text-[#633248] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#633248] animate-pulse" />
              <span>Consultando las políticas...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Campo de escritura fijo en la parte inferior */}
      <div className="p-4 bg-[#FFFDF8] border-t border-[#E7D8CF]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribí tu pregunta"
            disabled={loading}
            className="flex-1 bg-[#FFF8EF] border border-[#E7D8CF] rounded-xl px-4 py-3 text-base text-[#382C35] placeholder-[#6B5A66]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#633248]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#633248] hover:bg-[#7A3F59] text-white font-heading font-semibold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-none"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
