/**
 * Create the single app user.
 * Usage: npx tsx prisma/create-user.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "readline/promises";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const name = await rl.question("Name: ");
  const email = await rl.question("Email: ");
  const password = await rl.question("Password (min 6 chars): ");
  rl.close();

  if (password.length < 6) {
    console.error("Password too short.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists. Delete it first with prisma studio or psql.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, email: true, name: true },
  });

  console.log("User created:", user);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
