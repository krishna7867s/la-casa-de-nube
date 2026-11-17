// ==============================================================================
// AGENTE EXTRA (PUNTOS EXTRA): AGENTE DE ESCALAMIENTO CON TICKETS
// Crea un ticket formal para RRHH cuando la consulta no tiene respuesta en los documentos
// ==============================================================================

export interface HRTicket {
  id: string;
  employee_id: string;
  employee_name: string;
  unanswered_question: string;
  status: 'abierto' | 'en_revision' | 'resuelto';
  created_at: string;
  notes: string;
}

export class EscalationAgent {
  private tickets: HRTicket[] = [];

  createTicket(params: {
    employeeId: string;
    employeeName: string;
    question: string;
  }): HRTicket {
    const ticket: HRTicket = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      employee_id: params.employeeId,
      employee_name: params.employeeName,
      unanswered_question: params.question,
      status: 'abierto',
      created_at: new Date().toISOString(),
      notes: 'Generado automáticamente por el Agente de Escalamiento al detectar consulta sin cobertura en políticas.',
    };

    this.tickets.unshift(ticket);
    console.log(`[EscalationAgent] Ticket creado con éxito: ${ticket.id} para ${ticket.employee_name}`);
    return ticket;
  }

  getOpenTickets(): HRTicket[] {
    return this.tickets;
  }
}

export const escalationAgent = new EscalationAgent();

