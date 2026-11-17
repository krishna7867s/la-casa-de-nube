// ==============================================================================
// AGENTE EXTRA (PUNTOS EXTRA): AGENTE VALIDADOR Y GUARDRAILS DE SEGURIDAD
// Revisa entrada y salida de las consultas:
// 1. Detección de Prompt Injection / Jailbreaks adversariales
// 2. Enmascaramiento PII (Personally Identifiable Information)
// 3. Verificación de citas y ausencia de fuga de terceros
// ==============================================================================

import { UserRole } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  sanitizedContent: string;
  violationsDetected: string[];
}

export interface InputGuardResult {
  isSafe: boolean;
  blockedReason?: string;
}

export class ValidatorAgent {
  /**
   * Guardrail de entrada: detecta intentos adversariales de prompt injection o evasión.
   */
  inspectInputQuery(query: string): InputGuardResult {
    const q = query.toLowerCase().trim();

    const injectionPatterns = [
      'ignora las instrucciones',
      'ignore previous instructions',
      'olvida tus reglas',
      'forget your rules',
      'actúa como el administrador',
      'modo desarrollador',
      'developer mode',
      'system prompt',
      'muéstrame tus instrucciones',
      'dan mode',
      'desactiva las restricciones',
      'burlar el sistema',
    ];

    for (const pattern of injectionPatterns) {
      if (q.includes(pattern)) {
        return {
          isSafe: false,
          blockedReason: `Intento de alteración de directivas detectado ("${pattern}").`,
        };
      }
    }

    return { isSafe: true };
  }

  /**
   * Enmascara información de identificación personal (PII) en textos o registros de auditoría.
   */
  maskPIIData(text: string): string {
    let masked = text;

    // Enmascarar números de teléfono costarricenses (+506 8XXX-XXXX o 8 dígitos)
    masked = masked.replace(/(\+?506\s*)?[2678]\d{3}[-\s]?\d{4}/g, '+506 ****-****');

    // Enmascarar correos electrónicos personales
    masked = masked.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, user, domain) => {
      if (domain === 'nubedefresa.cr') return match; // conservar institucionales
      return `${user.slice(0, 2)}***@${domain}`;
    });

    return masked;
  }

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
    const { content, requesterRole, citationsCount, intent } = params;
    const violations: string[] = [];
    let sanitized = content;

    // 1. Validación de Privacidad: Fuga de datos de terceros
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
    }

    // 3. Enmascaramiento PII de salida preventiva
    sanitized = this.maskPIIData(sanitized);

    return {
      isValid: violations.length === 0,
      sanitizedContent: sanitized,
      violationsDetected: violations,
    };
  }
}

export const validatorAgent = new ValidatorAgent();
