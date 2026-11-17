import { NextRequest, NextResponse } from 'next/server';
import { ingestionAgent } from '../../../../lib/agents/ingestion-agent';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET || 'nube_de_fresa_cron_secret_2026';
    const body = await req.json().catch(() => ({}));

    if (authHeader !== `Bearer ${cronSecret}` && body.role !== 'rrhh') {
      return NextResponse.json(
        { error: 'No autorizado para ejecutar sincronización de Google Drive.' },
        { status: 401 }
      );
    }

    const result = await ingestionAgent.syncDrivePolicies();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

