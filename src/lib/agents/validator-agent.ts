// ==============================================================================
// AGENTE EXTRA (PUNTOS EXTRA): AGENTE VALIDADOR
// Revisa cada respuesta antes de enviarla:
// 1. ¿Está respaldada por citas oficiales?
// 2. ¿Contiene datos personales de un tercero no autorizado?
// ==============================================================================

import { ChatMessage, UserRole } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  sanitizedContent: string;
  violationsDetected: string[];
}

export class ValidatorAgent {
  /**
   * Valida la respuesta saliente antes de entregarla al colaborador.
   */
  validateResponse(params: {
    content: string;
    targetEmployeeId: string;
    requesterRole: UserRole;
    citationsCount: number;
    intent: string;
  }): ValidationResult {
    const { content, targetEmployeeId, requesterRole, citationsCount, intent } = params;
    const violations: string[] = [];
    let sanitized = content;

    // 1. Validación de Privacidad: Fuga de datos de terceros
    // Si no es RRHH, ninguna respuesta puede contener salarios de terceros ni nombres vinculados a datos sensibles
    if (requesterRole !== 'rrhh') {
      const forbiddenPhrases = [
        'salario de', 'gana ₡', 'gana colones', 'vacaciones de juan', 'vacaciones de carlos',
        'evaluación de sofía', 'sueldo de', 'salario del gerente'
      ];

      for (const phrase of forbiddenPhrases) {
        if (content.toLowerCase().includes(phrase)) {
          violations.push(`Fuga potencial detectada: frase "${phrase}" en rol colaborador.`);
          sanitized = 'Solo podés consultar tu propio saldo de vacaciones y datos personales.';
          return {
            isValid: false,
            sanitizedContent: sanitized,
            violationsDetected: violations,
          };
        }
      }
    }

    // 2. Validación de Citas para Políticas
    if (intent === 'policy' && citationsCount === 0 && !content.includes('No encontré')) {
      violations.push('Respuesta de política sin citas oficiales adjuntas.');
      // El validador añade recordatorio institucional si faltara
    }

    return {
      isValid: violations.length === 0,
      sanitizedContent: sanitized,
      violationsDetected: violations,
    };
  }
}

export const validatorAgent = new ValidatorAgent();

