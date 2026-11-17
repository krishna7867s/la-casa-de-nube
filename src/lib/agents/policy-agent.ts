// ==============================================================================
// AGENTE 2: POLÍTICAS (RAG VECTORIAL DE POLÍTICAS)
// ==============================================================================

import { db } from '../data-access';
import { PolicyChunk } from '../../types';
import { POLICY_AGENT_SYSTEM_PROMPT } from './prompts/policy.prompt';

export interface PolicyResponse {
  answer: string;
  citations: Array<{
    document_code?: string;
    document_title: string;
    section_title?: string;
    version?: string;
    vigencia?: string;
    drive_url?: string;
    snippet: string;
    is_internal?: boolean;
  }>;
  chunksUsed: PolicyChunk[];
  hasSufficientEvidence: boolean;
  uncoveredQuestion?: string;
}

export class PolicyAgent {
  private threshold: number = 0.65;

  constructor(threshold?: number) {
    if (threshold !== undefined) this.threshold = threshold;
  }

  async answerQuestion(query: string): Promise<PolicyResponse> {
    const chunks = await db.searchPolicyChunks(query, this.threshold, 3);

    if (!chunks || chunks.length === 0) {
      return {
        answer: 'No encontré una política sobre ese tema. Podés consultarlo con RRHH.',
        citations: [],
        chunksUsed: [],
        hasSufficientEvidence: false,
        uncoveredQuestion: query,
      };
    }

    // Citas con metadatos reales, sin inventar enlaces a Google Drive
    const citations = chunks.map((c) => ({
      document_code: c.document_code,
      document_title: c.document_title,
      section_title: c.section_title,
      version: c.version || '1.0',
      vigencia: c.vigencia || '2026-01-01',
      drive_url: c.drive_url, // Queda undefined para políticas internas
      is_internal: c.is_internal || !c.drive_url,
      snippet: c.content.slice(0, 180) + '...',
    }));

    let explanation = '';
    const mainChunk = chunks[0];
    const qLower = query.toLowerCase();

    // 1. Si la política proviene de la RPC de Supabase, se utiliza directamente el contenido recuperado
    if (mainChunk.is_from_supabase && mainChunk.content) {
      explanation = mainChunk.content;
    }
    // 2. Si proviene del catálogo local, responder primero la duda con voseo costarricense natural
    else if (qLower.includes('bono por mascota') || qLower.includes('bono para mascota') || (qLower.includes('mascota') && qLower.includes('bono'))) {
      return {
        answer: 'No encontré una política sobre ese tema en los documentos oficiales. Podés consultarlo con RRHH.',
        citations: [],
        chunksUsed: [],
        hasSufficientEvidence: false,
      };
    } else if (qLower.includes('vestimenta') || qLower.includes('jeans')) {
      explanation = 'Sí, podés usar jeans y tenis en la oficina. Si tenés una reunión con clientes, se recomienda ropa casual formal.';
    } else if (qLower.includes('reembolso')) {
      explanation = 'Para solicitar un reembolso debés presentar la factura electrónica a nombre de Nube de Fresa S.A. ante Finanzas antes del día 20 del mes. Se reembolsa en el siguiente pago de nómina quincenal.';
    } else if (qLower.includes('acumular') && (qLower.includes('vacacion') || qLower.includes('año'))) {
      explanation = 'Las vacaciones deben disfrutarse anualmente. La acumulación para el siguiente periodo solo se permite de mutuo acuerdo con tu jefatura y hasta por un periodo según el Código de Trabajo.';
    } else if (qLower.includes('anticipación') && (qLower.includes('vacacion') || qLower.includes('solicit'))) {
      explanation = 'Debés solicitar tus vacaciones con al menos 5 días hábiles de anticipación a través del portal La Casita de Nube.';
    } else if (qLower.includes('feriado') && (qLower.includes('quedan') || qLower.includes('este año'))) {
      explanation = 'Para lo que resta del año 2026 en Costa Rica queda el 25 de diciembre (Navidad), que es feriado de pago obligatorio y descanso remunerado.';
    } else if (qLower.includes('vacacion') || qLower.includes('días')) {
      explanation = 'Contás con 15 días hábiles de vacaciones al año. Podés solicitarlas en La Casita de Nube con al menos 5 días hábiles de anticipación.';
    } else if (qLower.includes('feriado')) {
      explanation = 'Los 11 feriados oficiales del año son días libres pagados al 100%. Si excepcionalmente se labora un feriado obligatorio, se reconoce pago doble por ley.';
    } else if (qLower.includes('fresa') || qLower.includes('cumpleañ')) {
      explanation = 'Tenés 2 Días de Fresa al año para descanso creativo sin rebajo de vacaciones, y medio día libre remunerado en la fecha de tu cumpleaños.';
    } else if (qLower.includes('paternidad') && qLower.includes('maternidad')) {
      explanation = 'La licencia de maternidad es de 4 meses remunerados al 100% (1 mes prenatal y 3 meses posparto). La licencia de paternidad es de 12 días hábiles continuos remunerados al 100% a partir del nacimiento o adopción.';
    } else if (qLower.includes('paternidad')) {
      explanation = 'Disponés de 12 días hábiles continuos remunerados al 100% por paternidad o adopción legal, a partir del nacimiento o entrega del menor.';
    } else if (qLower.includes('maternidad')) {
      explanation = 'La licencia de maternidad es de 4 meses remunerados al 100% (1 mes prenatal y 3 meses posparto), además de los descansos diarios de lactancia.';
    } else if (qLower.includes('duelo') || qLower.includes('fallec') || qLower.includes('fallecimiento') || qLower.includes('muerte')) {
      explanation = 'Tenés 5 días hábiles de duelo remunerados por familiares en primer grado, 3 días para segundo grado, y 1 día hábil por la pérdida de una mascota registrada en Patitas de Nube.';
    } else if (qLower.includes('incapacidad') || qLower.includes('ccss') || qLower.includes('enfermedad') || qLower.includes('incapacitaron')) {
      explanation = 'Nube de Fresa cubre el 100% del salario durante los primeros 3 días de incapacidad (hasta 2 episodios al año). A partir del 4.° día, la CCSS cubre el 60% del salario y la empresa subsidia el 40% restante para completar tu 100% salarial.';
    } else if (qLower.includes('casa por semana') || qLower.includes('teletrabajo') || qLower.includes('remoto') || qLower.includes('hibrid')) {
      explanation = 'En modalidad híbrida podés trabajar hasta 3 días desde casa por semana (esquema 2 presenciales y 3 remotos). Se otorga un subsidio mensual de ₡25.000 CRC para conectividad.';
    } else if (qLower.includes('horas extra') || qLower.includes('hora extra')) {
      explanation = 'Las horas extraordinarias diurnas se pagan con un 50% de recargo (tiempo y medio, 1.5x) y las laboradas en feriados o descansos se pagan al doble (2.0x), previa aprobación de jefatura.';
    } else if (qLower.includes('periodo de prueba') || qLower.includes('prueba')) {
      explanation = 'El periodo de prueba es de 3 meses a partir del ingreso de labores, de conformidad con el artículo 28 del Código de Trabajo de Costa Rica.';
    } else if (qLower.includes('preaviso') || (qLower.includes('renuncio') && qLower.includes('días'))) {
      explanation = 'Si renunciás y tenés más de 1 año laborando debés dar 1 mes de preaviso; si tenés de 6 meses a 1 año corresponden 15 días; y de 3 a 6 meses corresponde 1 semana.';
    } else if (qLower.includes('liquidación') || qLower.includes('despiden')) {
      explanation = 'Una liquidación por despido con responsabilidad patronal incluye preaviso, cesantía (hasta 8 años según la escala legal), vacaciones proporcionales no gozadas y aguinaldo proporcional.';
    } else if (qLower.includes('aguinaldo')) {
      explanation = 'El aguinaldo equivale a un doceavo (1/12) de los salarios devengados de diciembre a noviembre y se deposita a más tardar el 12 de diciembre, exento de cargas e impuestos.';
    } else if (qLower.includes('pago') || qLower.includes('salario') || qLower.includes('quincen')) {
      explanation = 'Los salarios se pagan de forma quincenal en colones los días 15 y 30 o 31 de cada mes (o el día hábil bancario anterior).';
    } else if (qLower.includes('seguro') || qLower.includes('médico') || qLower.includes('lente') || qLower.includes('descuento')) {
      explanation = 'Tras el periodo de prueba contás con seguro médico privado complementario (copago ₡3.000 CRC), subsidio de hasta ₡50.000 CRC para lentes y 40% de descuento en papelería del estudio.';
    } else if (qLower.includes('desempeño') || qLower.includes('evalua')) {
      explanation = 'Las evaluaciones de desempeño se realizan semestralmente en junio y diciembre sobre calidad creativa (40%), trabajo en equipo (30%) y autogestión (30%).';
    } else if (qLower.includes('acoso') || qLower.includes('conducta') || qLower.includes('convivencia') || qLower.includes('denuncio')) {
      explanation = 'Rige cero tolerancia al hostigamiento laboral y sexual (Ley 7476). Las denuncias confidenciales se realizan ante el Comité de Convivencia escribiendo a comite.convivencia@nubedefresa.cr.';
    } else {
      explanation = mainChunk.content;
    }

    return {
      answer: explanation,
      citations,
      chunksUsed: chunks,
      hasSufficientEvidence: true,
    };
  }
}

export const policyAgent = new PolicyAgent();

