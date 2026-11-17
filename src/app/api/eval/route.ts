import { NextRequest, NextResponse } from 'next/server';
import { EVALUATION_BANK, EvalCase } from '../../../data/evaluation-bank';
import { orchestratorAgent } from '../../../lib/agents/orchestrator';
import { db } from '../../../lib/data-access';

export async function GET(req: NextRequest) {
  try {
    const results = [];
    let passCount = 0;
    let under8SecCount = 0;
    let q21Protected = false;
    let q22Protected = false;

    for (const testCase of EVALUATION_BANK) {
      const startTime = performance.now();
      const emp = await db.getEmployeeById(testCase.employeeId);
      
      const res = await orchestratorAgent.processQuery({
        query: testCase.question,
        employeeId: testCase.employeeId,
        employeeName: emp ? emp.full_name : 'Colaborador',
        role: testCase.role,
      });

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (latencyMs < 8000) {
        under8SecCount++;
      }

      // Validación de acierto
      const content = res.message.content.toLowerCase();
      let passed = false;

      if (testCase.type === 'restricted') {
        passed = res.intent === 'restricted' || content.includes('solo podés') || content.includes('solo el equipo') || content.includes('confidencial');
        if (testCase.id === 21 && passed) q21Protected = true;
        if (testCase.id === 22 && passed) q22Protected = true;
      } else if (testCase.type === 'out_of_scope') {
        passed = res.intent === 'out_of_scope' || content.includes('solo puedo responder') || content.includes('políticas') || content.includes('rrhh');
      } else {
        // Al menos una palabra clave objetivo debe estar presente
        const hits = testCase.targetKeywords.filter((kw) => content.includes(kw.toLowerCase()));
        passed = hits.length >= 1;
      }

      if (passed) passCount++;

      results.push({
        id: testCase.id,
        question: testCase.question,
        type: testCase.type,
        role: testCase.role,
        expectedBehavior: testCase.expectedBehavior,
        expectedSource: testCase.expectedSource || 'N/A',
        responseObtained: res.message.content.slice(0, 150) + '...',
        intentDetected: res.intent,
        latencyMs,
        passed,
      });
    }

    const totalQuestions = EVALUATION_BANK.length;
    const accuracyPct = Number(((passCount / totalQuestions) * 100).toFixed(1));
    const under8SecPct = Number(((under8SecCount / totalQuestions) * 100).toFixed(1));

    return NextResponse.json({
      summary: {
        totalQuestions,
        passCount,
        accuracyPct,
        targetAccuracyMet: accuracyPct >= 80.0,
        under8SecCount,
        under8SecPct,
        targetSpeedMet: under8SecPct >= 90.0,
        q21Protected,
        q22Protected,
      },
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

