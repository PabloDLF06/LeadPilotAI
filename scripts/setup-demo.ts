import { copyFileSync, existsSync } from "node:fs";

if (existsSync(".env.local")) {
  console.log(".env.local ya existe; no se ha sobrescrito.");
  console.log("Revisa que DEMO_MODE=true y N8N_ENABLED=false estén definidos.");
} else {
  copyFileSync(".env.example", ".env.local");
  console.log("Se ha creado .env.local desde .env.example sin credenciales reales.");
  console.log("Para landing visual: ejecuta npm run dev.");
  console.log("Para dashboard: completa las tres variables de Supabase y aplica las migraciones.");
}
