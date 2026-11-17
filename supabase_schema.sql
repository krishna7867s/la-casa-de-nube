-- ==============================================================================
-- NUBE DE FRESA - LA CASITA DE NUBE
-- Esquema Supabase (PostgreSQL + pgvector + RLS)
-- Mini Proyecto #2: Portal de Políticas de RRHH con RAG Multiagente
-- ==============================================================================

-- 1. Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Enumeración de roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('colaborador', 'rrhh');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pendiente', 'aprobada', 'rechazada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla de Perfiles / Empleados (60 colaboradores simulados)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Vínculo opcional con auth.users si se usa Supabase Auth
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'colaborador',
    department TEXT NOT NULL, -- e.g., 'Ilustración', 'Papelería y Producción', 'Diseño Digital', 'Finanzas', 'RRHH', 'Operaciones'
    position TEXT NOT NULL,
    hire_date DATE NOT NULL,
    salary_colones NUMERIC(12, 2) NOT NULL,
    vacation_days_balance NUMERIC(4, 1) NOT NULL DEFAULT 12.0,
    status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'incapacitado', 'vacaciones')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now())
);

-- 4. Tabla de Evaluaciones de Desempeño
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_evaluation_date DATE,
    next_evaluation_date DATE NOT NULL,
    last_score NUMERIC(3, 1),
    evaluator_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now())
);

-- 5. Tabla de Solicitudes (Vacaciones, Permisos, Estudio)
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('vacaciones', 'estudio', 'maternidad_paternidad', 'duelo', 'personal')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested NUMERIC(4, 1) NOT NULL,
    reason TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'pendiente',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now()),
    reviewed_at TIMESTAMPTZ,
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewer_comments TEXT
);

-- 6. Tabla de Incapacidades (CCSS y Riesgos del Trabajo)
CREATE TABLE IF NOT EXISTS public.incapacities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('enfermedad_comun', 'accidente_trabajo', 'maternidad')),
    ccss_boleta_number TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'finalizada')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now())
);

-- 7. Tabla de Movimientos de Personal (Ingresos, Salidas, Ascensos - min 3 meses)
CREATE TABLE IF NOT EXISTS public.personnel_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('ingreso', 'salida', 'promocion', 'cambio_departamento', 'ajuste_salarial')),
    movement_date DATE NOT NULL,
    department TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now())
);

-- 8. Tabla de Documentos de Políticas (Google Drive metadata)
CREATE TABLE IF NOT EXISTS public.policy_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_file_id TEXT UNIQUE NOT NULL,
    code TEXT NOT NULL, -- e.g., 'POL-01'
    title TEXT NOT NULL,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('pdf', 'gdoc', 'gsheet')),
    version TEXT NOT NULL DEFAULT '1.0',
    effective_date DATE NOT NULL,
    responsible_role TEXT NOT NULL DEFAULT 'Gerencia de RRHH',
    drive_url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now())
);

-- 9. Tabla de Fragmentos Vectorizados (pgvector)
CREATE TABLE IF NOT EXISTS public.policy_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.policy_documents(id) ON DELETE CASCADE,
    document_code TEXT NOT NULL,
    document_title TEXT NOT NULL,
    section_title TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    drive_url TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    embedding vector(768), -- Compatible con text-embedding-004 o configurable a 1536
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now())
);

-- Crear índice para similitud de coseno
CREATE INDEX IF NOT EXISTS policy_chunks_embedding_idx 
ON public.policy_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 20);

-- 10. Función RPC para Búsqueda Vectorial por Similitud
CREATE OR REPLACE FUNCTION public.match_policy_chunks(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.70,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    document_code TEXT,
    document_title TEXT,
    section_title TEXT,
    content TEXT,
    drive_url TEXT,
    similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pc.id,
        pc.document_id,
        pc.document_code,
        pc.document_title,
        pc.section_title,
        pc.content,
        pc.drive_url,
        1 - (pc.embedding <=> query_embedding) AS similarity
    FROM public.policy_chunks pc
    WHERE 1 - (pc.embedding <=> query_embedding) > match_threshold
    ORDER BY pc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 11. Tabla de Reportes Diarios de RRHH (Generado por Agente Analista a las 7:00 a.m. CR)
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE UNIQUE NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now()),
    report_json JSONB NOT NULL,
    executive_summary TEXT NOT NULL,
    created_by TEXT NOT NULL DEFAULT 'Agente Analista (Automático)'
);

-- 12. Tabla de Logs de Auditoría y Consultas (con anonimización/redacción estricta)
CREATE TABLE IF NOT EXISTS public.chat_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    role user_role NOT NULL,
    intent TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    redacted_query TEXT NOT NULL, -- Datos sensibles redactados
    chunks_used JSONB DEFAULT '[]'::jsonb,
    latency_ms INTEGER NOT NULL,
    escalated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now())
);

-- 13. Tabla de Estado de Sincronización de Google Drive
CREATE TABLE IF NOT EXISTS public.drive_sync_state (
    id TEXT PRIMARY KEY DEFAULT 'google_drive_main',
    start_page_token TEXT,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('America/Costa_Rica', now()),
    files_indexed_count INTEGER DEFAULT 0
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incapacities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_audit_logs ENABLE ROW LEVEL SECURITY;

-- Reglas para documentos y fragmentos: lectura para cualquier usuario autenticado
CREATE POLICY "Documentos legibles por usuarios autenticados"
ON public.policy_documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Fragmentos legibles por usuarios autenticados"
ON public.policy_chunks FOR SELECT
TO authenticated
USING (true);

-- Reglas para reportes diarios: SOLO accesibles por rol RRHH
CREATE POLICY "Reportes solo para rol RRHH"
ON public.daily_reports FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.auth_user_id = auth.uid() 
        AND profiles.role = 'rrhh'
    )
);

-- Reglas para solicitudes: colaborador solo ve las suyas; RRHH ve todas
CREATE POLICY "Colaborador ve sus propias solicitudes"
ON public.leave_requests FOR SELECT
TO authenticated
USING (
    employee_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role = 'rrhh')
);

