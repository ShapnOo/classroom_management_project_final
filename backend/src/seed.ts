import { resetAndSeedInitialData } from "./db/init.js";

async function main() {
  console.log("Triggering database re-seed for 12 Programs and 15 Departments...");
  await resetAndSeedInitialData();
  console.log("Database successfully populated with 12 Academic Programs and 15 Departments under Programs!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
