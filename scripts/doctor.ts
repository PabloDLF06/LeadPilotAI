import { existsSync, readFileSync } from "node:fs";
import { createConnection } from "node:net";

const envPath = ".env.local";
const env = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const has = (name: string) => new RegExp(`^${name}=.+$`, "m").test(env);
const nodeMajor = Number(process.versions.node.split(".")[0]);
const demoMode = /^DEMO_MODE=true$/m.test(env);
const n8nEnabled = /^N8N_ENABLED=true$/m.test(env);
const supabaseConfigured = has("NEXT_PUBLIC_SUPABASE_URL") && has("NEXT_PUBLIC_SUPABASE_ANON_KEY") && has("SUPABASE_SERVICE_ROLE_KEY");
const openAiConfigured = has("OPENAI_API_KEY");
const resendConfigured = has("RESEND_API_KEY") && has("RESEND_FROM_EMAIL");
const port = Number(process.env.PORT || 3000);

function portAvailable(value: number) {
  return new Promise<boolean>((resolve) => {
    const server = createConnection({ host: "127.0.0.1", port: value });
    server.once("connect", () => { server.destroy(); resolve(false); });
    server.once("error", () => resolve(true));
  });
}

async function main() {
  const available = await portAvailable(port);
  console.log(`Node.js: ${process.versions.node} ${nodeMajor >= 20 ? "OK" : "ERROR: requiere Node 20+"}`);
  console.log(`.env.local: ${existsSync(envPath) ? "encontrado" : "no existe (se puede crear desde .env.example)"}`);
  console.log(`DEMO_MODE: ${demoMode ? "true (mock IA activo)" : "false o no definido"}`);
  console.log(`Supabase: ${supabaseConfigured ? "variables presentes" : "no configurado"}`);
  console.log(`OpenAI: ${openAiConfigured ? "API key presente" : "sin API key; se usará mock si DEMO_MODE=true"}`);
  console.log(`Resend: ${resendConfigured ? "variables presentes (el flujo actual sigue simulando)" : "sin credenciales; email simulado"}`);
  console.log(`n8n: ${n8nEnabled ? "habilitado; revisa URL y secretos" : "desactivado"}`);
  console.log(`Puerto ${port}: ${available ? "disponible" : "ocupado; usa npm run dev -- -p 3001"}`);

  if (nodeMajor < 20) process.exitCode = 1;
  else if (!existsSync(envPath)) console.log("Acción: ejecuta npm run setup:demo para crear .env.local sin sobrescribir archivos.");
  else if (!supabaseConfigured) console.log("Acción: para Auth y dashboard, crea Supabase y completa sus tres variables.");
  else console.log("Configuración suficiente para ejecutar la demo funcional.");
}

void main();
