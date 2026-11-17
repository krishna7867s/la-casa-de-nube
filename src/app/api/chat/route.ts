import { NextRequest, NextResponse } from 'next/server';
import { orchestratorAgent } from '../../../lib/agents/orchestrator';
import { db } from '../../../lib/data-access';
import { UserRole } from '../../../types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, activeEmployeeId } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'La consulta es requerida.' }, { status: 400 });
    }

    // OBTENCIÓN VERIFICADA DE SESIÓN (SERVER-SIDE)
    // En modo demo o integración, el identificador se valida contra la base de datos oficial
    const empId = activeEmployeeId || 'emp-001'; // Default: Mariana Castro Solís (Colaboradora)
    const employee = await db.getEmployeeById(empId);

    if (!employee) {
      return NextResponse.json({ error: 'Sesión no válida o colaborador no encontrado.' }, { status: 401 });
    }

    // IGNORAR cualquier usuario falso inyectado en el texto
    const result = await orchestratorAgent.processQuery({
      query,
      employeeId: employee.id,
      employeeName: employee.full_name,
      role: employee.role as UserRole,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar tu consulta en La Casita de Nube.' },
      { status: 500 }
    );
  }
}

