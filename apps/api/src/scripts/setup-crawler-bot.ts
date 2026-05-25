/**
 * One-time setup script for the marketplace crawler bot user.
 * Run with: npm run setup:crawler (from apps/api)
 *
 * Creates (idempotent — safe to run multiple times):
 *   User        → bot@agrocontrole.internal
 *   Produtor    → linked to that user
 *   Propriedade → "Sistema Bot" linked to that Produtor
 *
 * Prints CRAWLER_PRODUTOR_ID=<uuid> at the end — paste into .env.
 */

import { prisma } from '../config/db';
import { hashPassword } from '../lib/bcrypt';

const BOT_EMAIL = 'bot@agrocontrole.internal';
const BOT_PASSWORD = 'Bot@123456';

async function main() {
  // ── 1. User ───────────────────────────────────────────────────────────────
  let user = await prisma.user.findUnique({
    where: { email: BOT_EMAIL },
    select: { id: true },
  });

  if (!user) {
    const passwordHash = await hashPassword(BOT_PASSWORD);
    user = await prisma.user.create({
      data: {
        name:               'Agro Controle Bot',
        email:              BOT_EMAIL,
        passwordHash,
        role:               'PRODUTOR',
        isActive:           true,
        onboardingCompleted: true,
      },
      select: { id: true },
    });
    console.log('  → Usuário criado:', BOT_EMAIL);
  } else {
    console.log('  → Usuário já existe, reutilizando.');
  }

  // ── 2. Produtor ───────────────────────────────────────────────────────────
  let produtor = await prisma.produtor.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!produtor) {
    produtor = await prisma.produtor.create({
      data: {
        userId:           user.id,
        estado:           'RS',
        cidade:           'Porto Alegre',
        tipoProducao:     'vegetal',
        producoesVegetais: ['Soja'],
        producoesAnimais:  [],
      },
      select: { id: true },
    });
    console.log('  → Produtor criado:', produtor.id);
  } else {
    console.log('  → Produtor já existe:', produtor.id);
  }

  // ── 3. Propriedade ────────────────────────────────────────────────────────
  const propriedadeExists = await prisma.propriedade.findFirst({
    where: { produtorId: produtor.id, nome: 'Sistema Bot' },
    select: { id: true },
  });

  if (!propriedadeExists) {
    await prisma.propriedade.create({
      data: {
        produtorId:   produtor.id,
        nome:         'Sistema Bot',
        areaHectares: 1,
        municipio:    'Porto Alegre',
        estado:       'RS',
      },
    });
    console.log('  → Propriedade criada: Sistema Bot');
  } else {
    console.log('  → Propriedade já existe, pulando.');
  }

  // ── Output ─────────────────────────────────────────────────────────────────
  console.log('\n✅ Bot criado com sucesso\n');
  console.log(`CRAWLER_PRODUTOR_ID=${produtor.id}`);
  console.log('\nCole essa linha no seu .env e reinicie o backend.');
}

main()
  .catch((err) => {
    console.error('\n❌ Erro durante o setup:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
