import { NextRequest, NextResponse } from 'next/server';
import { analystAgent } from '../../../../lib/agents/analyst-agent';
import { db } from '../../../../lib/data-access';
import { UserRole } from '../../../../types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || '2026-11-17';
    const role = (searchParams.get('role') as UserRole) || 'rrhh';

    if (role !== 'rrhh') {
      return NextResponse.json(
        { error: 'Acceso no autorizado: Solo el rol RRHH puede consultar reportes.' },
        { status: 403 }
      );
    }

    const report = await db.getDailyReportByDate(date, role);
    const availableDates = await db.getReportDatesList(role);

    if (!report) {
      return NextResponse.json(
        { error: `No se encontró reporte para la fecha ${date}.`, availableDates },
        { status: 404 }
      );
    }

    return NextResponse.json({ report, availableDates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET || 'nube_de_fresa_cron_secret_2026';
    
    // Verificación de token cron o sesión administrativa
    const body = await req.json().catch(() => ({}));
    const isCronAuthorized = authHeader === `Bearer ${cronSecret}`;
    const isRoleRRHH = body.role === 'rrhh';

    if (!isCronAuthorized && !isRoleRRHH) {
      return NextResponse.json(
        { error: 'No autorizado para generar o actualizar reportes diarios.' },
        { status: 401 }
      );
    }

    const report = await analystAgent.generateDailyReport(body.date);
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

