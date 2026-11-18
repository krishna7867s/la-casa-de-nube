'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EmployeeProfile } from '../../types';
import { CloudIcon, StrawberryIcon, ScallopHeaderLace, PaperclipIcon } from '../icons/StationeryIcons';
import { Send, ExternalLink, BookOpen, Volume2, Mic, MicOff, Check, Sparkles } from 'lucide-react';

interface AgendaChatProps {
  activeEmployee: EmployeeProfile;
}

// Subcomponente de texto progresivo efecto "tinta en agenda"
function TypewriterContent({ text, isStreaming }: { text: string; isStreaming?: boolean }) {
  const [displayed, setDisplayed] = useState(isStreaming ? '' : text);
  const [typing, setTyping] = useState(isStreaming);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayed(text);
      setTyping(false);
      return;
    }

    let i = 0;
    setTyping(true);
    const interval = setInterval(() => {
      i += 3;
      if (i >= text.length) {
        setDisplayed(text);
        setTyping(false);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, 12);

    return () => clearInterval(interval);
  }, [text, isStreaming]);

  return (
    <div className="text-base leading-relaxed whitespace-pre-wrap font-sans text-[#382C35]">
      {displayed}
      {typing && <span className="inline-block w-1.5 h-4 ml-1 bg-[#633248] animate-pulse align-middle" />}
    </div>
  );
}

export function AgendaChat({ activeEmployee }: AgendaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastStreamingId, setLastStreamingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    {
      question: '¿Puedo ir en jeans?',
      subtitle: 'Código de vestimenta',
      color: 'bg-[#FFF2F5] border-[#F2D0D9] text-[#633248]',
      tape: 'bg-[#F7D8DF]',
    },
    {
      question: '¿Cómo pido un reembolso?',
      subtitle: 'Gastos y viáticos antes del 20',
      color: 'bg-[#F4F8F1] border-[#D6E5CC] text-[#3D5A32]',
      tape: 'bg-[#DCE8D3]',
    },
    {
      question: '¿Cuántos días de vacaciones me quedan?',
      subtitle: 'Consulta de saldo personal',
      color: 'bg-[#FFFDF0] border-[#EFE2C6] text-[#634821]',
      tape: 'bg-[#FFF2D6]',
    },
  ];

  const speakMessage = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#•]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-CR';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Tu navegador no cuenta con soporte nativo de micrófono. Recomendamos Google Chrome.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'es-CR';
      recognition.interimResults = false;
      setIsListening(true);
      recognition.onresult = (e: any) => {
        const spoken = e.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${spoken}` : spoken));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

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
        setLastStreamingId(data.message.id);
      } else {
        const errMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'No encontré una política sobre ese tema. Podés consultarlo con RRHH.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
        setLastStreamingId(errMsg.id);
      }
    } catch {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'No encontré una política sobre ese tema. Podés consultarlo con RRHH.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
      setLastStreamingId(errMsg.id);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="relative flex flex-col h-[740px] max-w-4xl mx-auto rounded-2xl border border-[#D8C3B5] bg-[#FFFDF8] shadow-agenda-book overflow-hidden">
      {/* Encaje festoneado decorativo superior */}
      <div className="w-full bg-[#FFF8EF]">
        <ScallopHeaderLace className="w-full h-2.5 text-[#F7D8DF]" />
      </div>

      {/* Barra de título de la hoja de agenda */}
      <div className="bg-[#FFFDF8] border-b border-[#E7D8CF] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#FFF8EF] flex items-center justify-center border border-[#E7D8CF] shadow-xs">
            <CloudIcon className="w-5 h-5 text-[#633248]" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-[#633248] tracking-tight leading-none">
              Consultas de RRHH
            </h2>
            <p className="text-xs text-[#6B5A66] mt-1 font-sans">
              La Casita de Nube · Sesión de {activeEmployee.full_name} ({activeEmployee.role === 'rrhh' ? 'Rol RRHH' : 'Colaboradora'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="stationery-stamp hidden sm:inline-flex">
            SELLO OFICIAL
          </span>
          <div className="w-7 h-7 rounded-full bg-[#FFF8EF] border border-[#E7D8CF] flex items-center justify-center text-[#633248]">
            <StrawberryIcon className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Área Principal de Conversación con Líneas Tenues de Agenda */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 planner-ruled-lines">
        {/* Estado Inicial: 3 Memos de Papel Adhesivo Washi */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-6">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF8EF] border border-[#E7D8CF] flex items-center justify-center mb-4 shadow-card-subtle">
              <CloudIcon className="w-9 h-9 text-[#633248]" />
            </div>

            <h3 className="font-heading font-bold text-xl text-[#633248] mb-1.5">
              ¿Qué querés consultar hoy?
            </h3>
            <p className="text-xs text-[#6B5A66] mb-8 font-sans max-w-md">
              Escribí tu pregunta sobre normativas, vacaciones, feriados o pagos. El orquestador consultará los documentos oficiales del estudio.
            </p>

            {/* Tres Notas Memos con Washi Tape */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
              {initialSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSend(sug.question);
                  }}
                  className={`relative p-4 rounded-xl border text-left transition-all hover:-translate-y-1 hover:shadow-card-subtle cursor-pointer ${sug.color}`}
                >
                  {/* Cinta Washi decorativa */}
                  <div
                    className={`absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 rounded-xs opacity-90 shadow-xs border border-black/5 ${sug.tape}`}
                  />
                  <div className="pt-1">
                    <span className="font-heading font-semibold text-sm block leading-snug">
                      {sug.question}
                    </span>
                    <span className="text-[11px] font-sans opacity-70 block mt-1.5">
                      {sug.subtitle}
                    </span>
                  </div>
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
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-5 ${
                  isUser
                    ? 'bg-[#633248] text-white shadow-memo rounded-br-xs'
                    : 'bg-[#FFFDF8] text-[#382C35] border border-[#E7D8CF] shadow-memo rounded-bl-xs'
                }`}
              >
                {/* Cabecera del mensaje */}
                {!isUser ? (
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#E7D8CF]/70 font-heading">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#633248] uppercase tracking-wide">
                        {isPersonal ? 'Tus datos registrados' : 'Políticas de Nube de Fresa'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speakMessage(msg.content)}
                        className="p-1 text-[#6B5A66] hover:text-[#633248] rounded hover:bg-[#F7D8DF]/60 transition-colors cursor-pointer"
                        title="Escuchar respuesta en voz alta"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] font-semibold text-white/70 mb-1 font-heading">
                    {activeEmployee.full_name.split(' ')[0]} pregunta:
                  </div>
                )}

                {/* Texto de respuesta con tamaño mínimo de 16px e interlineado cómodo */}
                {isUser ? (
                  <div className="text-base leading-relaxed whitespace-pre-wrap font-sans text-white">
                    {msg.content}
                  </div>
                ) : (
                  <TypewriterContent
                    text={msg.content}
                    isStreaming={msg.id === lastStreamingId}
                  />
                )}

                {/* Fuentes debajo de la respuesta: Supabase (título, versión, vigencia) o Drive */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-dashed border-[#E7D8CF] space-y-1.5">
                    <span className="text-[11px] font-bold text-[#6B5A66] uppercase tracking-wider block font-heading">
                      Fuente oficial verificada:
                    </span>
                    <div className="space-y-1 text-xs text-[#382C35]">
                      {msg.citations.map((cite, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#FFF8EF] border border-[#E7D8CF]">
                          <BookOpen className="w-3.5 h-3.5 text-[#633248] shrink-0" />
                          <span className="font-semibold text-[#633248] font-heading">
                            {cite.document_title}
                          </span>
                          <span className="text-[#6B5A66] font-sans">
                            · Versión {cite.version || '1.0'} · Vigencia {cite.vigencia || '2026-01-01'}
                          </span>

                          {/* Ver documento solo si existe enlace real a Google Drive */}
                          {cite.drive_url && (
                            <a
                              href={cite.drive_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-[#633248] hover:underline ml-auto"
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
            <div className="bg-[#FFFDF8] border border-[#E7D8CF] rounded-2xl rounded-bl-xs px-4 py-3 text-sm text-[#633248] flex items-center gap-2.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#633248] animate-pulse" />
              <span className="font-sans text-xs">Consultando el catálogo oficial...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Campo de escritura fijo en la parte inferior */}
      <div className="p-4 sm:p-5 bg-[#FFFDF8] border-t border-[#E7D8CF]">
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
            placeholder={isListening ? "Escuchando... podés hablar" : "Escribí tu pregunta sobre políticas o trámites"}
            disabled={loading}
            className="flex-1 bg-[#FFF8EF] border border-[#E7D8CF] rounded-xl px-4 py-3 text-base text-[#382C35] placeholder-[#6B5A66]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#633248] transition-colors"
          />

          <button
            type="button"
            onClick={toggleListening}
            disabled={loading}
            title={isListening ? "Detener dictado" : "Dictar por voz"}
            className={`p-3 rounded-xl border border-[#E7D8CF] transition-colors cursor-pointer ${
              isListening
                ? 'bg-[#F7D8DF] text-[#633248] animate-pulse border-[#633248]'
                : 'bg-[#FFF8EF] text-[#6B5A66] hover:bg-[#F7D8DF] hover:text-[#633248]'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#633248] hover:bg-[#7A3F59] text-white font-heading font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs active:translate-y-0.5"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
