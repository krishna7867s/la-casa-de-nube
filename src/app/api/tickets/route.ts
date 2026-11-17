import { NextRequest, NextResponse } from 'next/server';
import { escalationAgent } from '../../../lib/agents/escalation-agent';

export async function GET() {
  const tickets = escalationAgent.getOpenTickets();
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  try {
    const { ticketId, officialAnswer } = await req.json();
    const tickets = escalationAgent.getOpenTickets();
    const ticket = tickets.find((t) => t.id === ticketId);

    if (ticket) {
      ticket.status = 'resuelto';
      ticket.notes = `Resuelto por RRHH: ${officialAnswer}`;
      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar ticket' }, { status: 500 });
  }
}
