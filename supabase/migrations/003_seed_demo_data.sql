-- LeadPilot AI - deterministic demo data
-- Safe to run repeatedly. It creates a fixed optional dataset only; it does not
-- create or link auth.users rows. Use the protected app loader for an org demo.

do $$
begin
  insert into public.organizations (id, name, slug, industry, website, description, contact_email)
  values (
    '10000000-0000-0000-0000-000000000001',
    'Nova Growth',
    'nova-growth',
    'Consultoría y automatización',
    'https://nova-growth.example',
    'Organización demo de LeadPilot AI.',
    'hola@nova-growth.example'
  )
  on conflict (id) do update set
    name = excluded.name,
    industry = excluded.industry,
    website = excluded.website,
    description = excluded.description,
    contact_email = excluded.contact_email,
    updated_at = now();

end;
$$;

insert into public.forms (
  id, organization_id, public_id, name, title, subtitle, privacy_text, is_active
)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '21000000-0000-0000-0000-000000000001',
  'Formulario web principal',
  'Cuéntanos cómo podemos ayudarte',
  'Nuestro equipo responderá lo antes posible.',
  'Acepto que Nova Growth trate mis datos para responder a esta solicitud.',
  true
)
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  privacy_text = excluded.privacy_text,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.leads (
  id, organization_id, form_id, public_reference, full_name, email, phone, company,
  service_interest, budget_range, urgency_input, message, source, status, priority,
  score, tags, analysis_status, analyzed_at, metadata
)
values
(
  '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001', 'LP-20260115-A001', 'Ana García', 'ana@sonrisa.example',
  '+34 600 000 001', 'Clínica Dental Sonrisa', 'Automatizar respuestas de WhatsApp', '2.000–5.000€',
  'Este mes', 'Queremos automatizar las respuestas de WhatsApp para captar y atender pacientes.',
  'demo', 'new', 'urgent', 88, array['whatsapp', 'alta-intención'], 'completed', now() - interval '2 days',
  jsonb_build_object('demo', true)
),
(
  '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001', 'LP-20260116-A002', 'Carlos Martín', 'carlos@horizonte.example',
  null, 'Inmobiliaria Horizonte', 'Información sobre automatización', null, 'Sin fecha definida',
  'Me gustaría recibir más información sobre cómo automatizar nuestro proceso comercial.',
  'demo', 'contacted', 'warm', 54, array['inmobiliaria'], 'completed', now() - interval '3 days',
  jsonb_build_object('demo', true)
),
(
  '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001', 'LP-20260117-A003', 'Laura Pérez', 'laura@academia.example',
  '+34 600 000 003', 'Academia Horizonte', 'Demo de LeadPilot AI', '1.000–2.000€', 'Este trimestre',
  'Solicito una demo para entender si puede ayudarnos a gestionar las solicitudes de cursos.',
  'demo', 'qualified', 'hot', 72, array['demo', 'educación'], 'completed', now() - interval '1 day',
  jsonb_build_object('demo', true)
),
(
  '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001', 'LP-20260118-A004', 'Mario López', 'mario@example.com',
  null, null, null, null, null, 'Hola, quisiera saber más.', 'demo', 'new', 'cold', 22,
  array['sin-teléfono'], 'completed', now() - interval '4 days', jsonb_build_object('demo', true)
),
(
  '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001', 'LP-20260119-A005', 'Sofía Navarro', 'sofia@ecommerce.example',
  '+34 600 000 005', 'Lumen E-commerce', 'Cualificación de leads', '5.000–10.000€', 'Este mes',
  'Buscamos mejorar el seguimiento de leads que llegan desde campañas de pago.',
  'demo', 'new', 'hot', 78, array['ecommerce', 'ads'], 'completed', now() - interval '5 hours',
  jsonb_build_object('demo', true)
),
(
  '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001', 'LP-20260120-A006', 'Diego Ruiz', 'diego@servicios.example',
  '+34 600 000 006', 'Servicios Norte', 'Automatización comercial', '2.000–5.000€', 'Próximo mes',
  'Estamos comparando opciones para automatizar tareas repetitivas del equipo.',
  'demo', 'new', 'cold', 61, array['automatización'], 'completed', now() - interval '6 days',
  jsonb_build_object('demo', true)
),
(
  '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001', 'LP-20260121-A007', 'Elena Torres', 'elena@legal.example',
  '+34 600 000 007', 'Torres Legal', 'Captación de clientes', null, 'Sin urgencia',
  'Nos interesa entender el flujo de trabajo y las integraciones disponibles.',
  'demo', 'new', 'warm', 48, array['servicios'], 'completed', now() - interval '7 days',
  jsonb_build_object('demo', true)
),
(
  '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001', 'LP-20260122-A008', 'Pablo Sánchez', 'pablo@finanzas.example',
  '+34 600 000 008', 'Finanzas Claro', 'Seguimiento de oportunidades', '10.000€+', 'Inmediato',
  'Necesitamos un sistema para priorizar oportunidades y avisar al equipo rápidamente.',
  'demo', 'new', 'warm', 91, array['prioritario', 'alerta'], 'completed', now() - interval '30 minutes',
  jsonb_build_object('demo', true)
)
on conflict (id) do update set
  status = excluded.status,
  priority = excluded.priority,
  score = excluded.score,
  analysis_status = excluded.analysis_status,
  analyzed_at = excluded.analyzed_at,
  updated_at = now();

insert into public.lead_ai_analyses (
  id, lead_id, organization_id, model, prompt_version, summary, intent, service_interest,
  estimated_budget, urgency_level, sentiment, pain_points, objections, recommended_next_action,
  score_reasoning, confidence, structured_data, raw_response
)
select
  ('40000000-0000-0000-0000-' || lpad((row_number() over (order by l.public_reference))::text, 12, '0'))::uuid,
  l.id, l.organization_id, 'demo-mock-v1', 'v1',
  'Lead demo analizado de forma determinista para mostrar el flujo de cualificación.',
  'interés comercial', l.service_interest, l.budget_range, l.urgency_input, 'positive',
  jsonb_build_array('necesidad de seguimiento', 'respuesta rápida'), '[]'::jsonb,
  'Contactar y confirmar necesidades concretas.', 'Score demo basado en intención, urgencia y presupuesto.',
  86, jsonb_build_object('demo', true, 'score', l.score), jsonb_build_object('demo', true)
from public.leads l
where l.organization_id = '10000000-0000-0000-0000-000000000001'
on conflict (lead_id) do update set
  summary = excluded.summary,
  updated_at = now();

insert into public.lead_activities (
  id, lead_id, organization_id, type, title, description, metadata, created_at
)
select
  ('50000000-0000-0000-0000-' || lpad((row_number() over (order by l.public_reference))::text, 12, '0'))::uuid,
  l.id, l.organization_id, 'lead_created', 'Lead recibido',
  'Lead creado como parte del conjunto de datos demo.', jsonb_build_object('demo', true), l.created_at
from public.leads l
where l.organization_id = '10000000-0000-0000-0000-000000000001'
on conflict (id) do nothing;

insert into public.lead_activities (
  id, lead_id, organization_id, type, title, description, metadata
)
select
  ('51000000-0000-0000-0000-' || lpad((row_number() over (order by l.public_reference))::text, 12, '0'))::uuid,
  l.id, l.organization_id, 'lead_analyzed', 'Análisis IA completado',
  'Análisis mock determinista guardado para la demo.', jsonb_build_object('model', 'demo-mock-v1')
from public.leads l
where l.organization_id = '10000000-0000-0000-0000-000000000001'
on conflict (id) do nothing;

insert into public.lead_messages (
  id, lead_id, organization_id, direction, channel, subject, body, status, metadata
)
select
  ('60000000-0000-0000-0000-' || lpad((row_number() over (order by l.public_reference))::text, 12, '0'))::uuid,
  l.id, l.organization_id, 'outbound', 'email', 'Seguimiento de tu solicitud',
  'Este correo es una simulación del modo demo de LeadPilot AI.', 'simulated',
  jsonb_build_object('demo', true)
from public.leads l
where l.public_reference in ('LP-20260115-A001', 'LP-20260117-A003')
on conflict (id) do nothing;

insert into public.automation_logs (
  id, organization_id, lead_id, automation_name, event_name, status,
  request_payload, response_payload, executed_at
)
values
(
  '70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001', 'lead-received', 'telegram-notification', 'success',
  jsonb_build_object('demo', true), jsonb_build_object('simulated', true), now() - interval '2 days'
),
(
  '70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000008', 'lead-received', 'telegram-notification', 'skipped',
  jsonb_build_object('demo', true), jsonb_build_object('reason', 'no telegram token in demo'), now()
)
on conflict (id) do update set
  status = excluded.status,
  response_payload = excluded.response_payload,
  executed_at = excluded.executed_at;
