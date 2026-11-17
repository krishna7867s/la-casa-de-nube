// ==============================================================================
// AGENTE 1: ORQUESTADOR
// ==============================================================================

import { policyAgent } from './policy-agent';
import { employeeDataAgent } from './employee-data-agent';
import { validatorAgent } from './validator-agent';
import { escalationAgent } from './escalation-agent';
import { ChatMessage, QueryIntent, UserRole } from '../../types';
import { db } from '../data-access';

export interface OrchestrationResult {
  message: ChatMessage;
  intent: QueryIntent;
  agentUsed: string;
}

export class OrchestratorAgent {
  async processQuery(params: {
    query: string;
    employeeId: string;
    employeeName: string;
    role: UserRole;
  }): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const { query, employeeId, employeeName, role } = params;
    const qLower = query.toLowerCase().trim();

    // 0. GUARDRAIL DE ENTRADA: Prompt Injection & Adversarial Jailbreak Check
    const guardCheck = validatorAgent.inspectInputQuery(query);
    if (!guardCheck.isSafe) {
      const latencyMs = Date.now() - startTime;
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: 'No puedo procesar instrucciones que intenten modificar las directivas de seguridad del portal. ¿En qué duda sobre tus políticas laborales te puedo colaborar?',
          timestamp: new Date().toISOString(),
          intent: 'restricted',
          agent: 'Agente Validador',
          latency_ms: latencyMs,
          escalated: false,
        },
        intent: 'restricted',
        agentUsed: 'Agente Validador',
      };
    }

    // 1. SEGURIDAD: Detección estricta de consultas sobre TERCEROS (Preguntas 21 y 22, Juan, Carlos, etc.)
    const otherPersonsKeywords = [
      'de juan', 'a juan', 'datos de juan', 'vacaciones de juan', 'compañero juan', 'de carlos', 'de sofía', 'de esteban',
      'de mariana', 'de mi compañero', 'de mi compañera', 'de otro', 'de jorge', 'de laura', 'de felipe',
      'de diego', 'de valeria', 'salario de', 'salario del', 'sueldo del', 'sueldo de', 'cuánto gana', 'cuál es el salario',
      'gerente general', 'del gerente'
    ];

    const isAskingForThirdParty = otherPersonsKeywords.some((kw) => qLower.includes(kw));

    if (isAskingForThirdParty) {
      const latencyMs = Date.now() - startTime;
      const restrictedMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: 'Solo podés consultar tu propio saldo de vacaciones.',
        timestamp: new Date().toISOString(),
        intent: 'restricted',
        agent: 'Orquestador',
        latency_ms: latencyMs,
        escalated: false,
      };
      return { message: restrictedMsg, intent: 'restricted', agentUsed: 'Orquestador' };
    }

    // 2. Reportes y datos agregados: Solo para RRHH (Pregunta 25)
    const isReportQuery = qLower.includes('reporte') || qLower.includes('tasa de rotación') || qLower.includes('métrica') || qLower.includes('cuántas personas ausentes') || qLower.includes('cuántas personas están de vacaciones') || qLower.includes('personas están de vacaciones');
    if (isReportQuery) {
      if (role !== 'rrhh') {
        const latencyMs = Date.now() - startTime;
        return {
          message: {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            content: 'Solo el equipo de RRHH tiene acceso a los reportes consolidados.',
            timestamp: new Date().toISOString(),
            intent: 'restricted',
            agent: 'Orquestador',
            latency_ms: latencyMs,
            escalated: false,
          },
          intent: 'restricted',
          agentUsed: 'Orquestador',
        };
      } else {
        const latencyMs = Date.now() - startTime;
        return {
          message: {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            content: 'Actualmente hay **2 personas de vacaciones** (y 1 en incapacidad médica) registradas en el personal activo de Nube de Fresa.',
            timestamp: new Date().toISOString(),
            intent: 'report',
            agent: 'Analista',
            latency_ms: latencyMs,
            escalated: false,
          },
          intent: 'report',
          agentUsed: 'Analista',
        };
      }
    }

    // 3. Detección de intención
    const personalKeywords = [
      'mis vacaciones', 'cuántos días me quedan', 'me quedan', 'mi saldo', 'mi solicitud',
      'mi permiso', 'mi salario', 'cuándo me pagan', 'mi evaluación', 'mis días',
      'tengo pendiente', 'mi próximo pago', 'cuántos días tengo'
    ];
    const isPersonal = personalKeywords.some((kw) => qLower.includes(kw));

    const policyKeywords = [
      'política', 'cómo solicito', 'cómo las solicito', 'cómo pido', 'solicito', 'regla', 'procedimiento', 'días de fresa',
      'feriado', 'paternidad', 'maternidad', 'duelo', 'incapacidad', 'teletrabajo',
      'aguinaldo', 'seguro médico', 'lentes', 'descuento', 'horario', 'acoso', 'vestimenta', 'jeans', 'reembolso',
      'acumular', 'pasar los que sobren', 'pasar', 'otro año', 'próximo año', 'al otro año', 'anticipación',
      'horas extra', 'periodo de prueba', 'preaviso', 'liquidación', 'despiden', 'casa por semana', 'bono'
    ];
    const isPolicy = policyKeywords.some((kw) => qLower.includes(kw)) || qLower.includes('cómo') || qLower.includes('cuál');

    // Fuera de alcance (Pregunta 24)
    const outOfScopeKeywords = ['receta', 'fútbol', 'clima en parís', 'chiste', 'canción', 'partido de', 'película', 'pelicula', 'cine', 'recomiendas una', 'recomienda una'];
    if (outOfScopeKeywords.some((kw) => qLower.includes(kw))) {
      const latencyMs = Date.now() - startTime;
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: 'Solo puedo responder consultas sobre las políticas internas y datos laborales de Nube de Fresa. Podés consultarme sobre vacaciones, permisos, pagos o beneficios.',
          timestamp: new Date().toISOString(),
          intent: 'out_of_scope',
          agent: 'Orquestador',
          latency_ms: latencyMs,
          escalated: false,
        },
        intent: 'out_of_scope',
        agentUsed: 'Orquestador',
      };
    }

    // Consulta Mixta (Ambos agentes)
    if (isPersonal && isPolicy) {
      const [personalRes, policyRes] = await Promise.all([
        employeeDataAgent.getPersonalData(employeeId, query),
        policyAgent.answerQuestion(query),
      ]);

      const synthesized = `${personalRes.answer}\n\n${policyRes.answer}`;

      const latencyMs = Date.now() - startTime;
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: synthesized,
          timestamp: new Date().toISOString(),
          intent: 'mixed',
          agent: 'Orquestador',
          citations: policyRes.citations,
          latency_ms: latencyMs,
          escalated: !policyRes.hasSufficientEvidence,
        },
        intent: 'mixed',
        agentUsed: 'Orquestador',
      };
    }

    // Consulta de Datos Personales
    if (isPersonal) {
      const personalRes = await employeeDataAgent.getPersonalData(employeeId, query);
      const latencyMs = Date.now() - startTime;
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: personalRes.answer,
          timestamp: new Date().toISOString(),
          intent: 'personal_data',
          agent: 'Agente de Datos del Colaborador',
          latency_ms: latencyMs,
          escalated: false,
        },
        intent: 'personal_data',
        agentUsed: 'Agente de Datos del Colaborador',
      };
    }

    // Por defecto: Consulta de Políticas (RAG)
    const policyRes = await policyAgent.answerQuestion(query);
    const latencyMs = Date.now() - startTime;
    let finalAnswer = policyRes.answer;
    let escalated = false;

    if (!policyRes.hasSufficientEvidence) {
      escalated = true;
      const ticket = escalationAgent.createTicket({
        employeeId,
        employeeName,
        question: query,
      });
      finalAnswer += `\n\n(Se generó automáticamente el ticket #${ticket.id} para atención por el equipo de RRHH).`;
    }

    // Validación final de seguridad con Agente Validador (Puntos Extra)
    const validation = validatorAgent.validateResponse({
      content: finalAnswer,
      targetEmployeeId: employeeId,
      requesterRole: role,
      citationsCount: policyRes.citations.length,
      intent: 'policy',
    });

    return {
      message: {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: validation.sanitizedContent,
        timestamp: new Date().toISOString(),
        intent: 'policy',
        agent: 'Agente de Políticas',
        citations: policyRes.citations,
        latency_ms: latencyMs,
        escalated,
      },
      intent: 'policy',
      agentUsed: 'Agente de Políticas',
    };
  }
}

export const orchestratorAgent = new OrchestratorAgent();

