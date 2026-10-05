import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
for (const script of ["lint", "typecheck", "test", "build"]) {
  console.log(`\n>>> npm run ${script}`);
  const result = spawnSync(npm, ["run", script], { stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) {
    console.error(`No se pudo ejecutar npm run ${script}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`Falló la fase: ${script}`);
    process.exit(result.status ?? 1);
  }
}
console.log("\nTodas las verificaciones han terminado correctamente.");
