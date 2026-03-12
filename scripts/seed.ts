import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFile = path.join(logDir, `deploy-${new Date().toISOString().split('T')[0]}.log`);

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [SEED] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

const prisma = new PrismaClient();

export async function runSeed() {
  try {
    log('Iniciando processamento Idempotente do SEED das desculpas...');
    
    // Testa idenpotência (se existe o usuário de sistema)
    let adminUser = await prisma.user.findUnique({ where: { email: 'admin@producaoweb.com.br' } });
    
    if (!adminUser) {
      log('Usuário admin do sistema não encontrado. Criando base root...');
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@producaoweb.com.br',
          name: 'Sistema Automático',
          password: 'senha_criptografada_dummy',
          role: 'ADMIN'
        }
      });
      log('Semente Admin plantada!');
    } else {
      log('Aviso: Seed Admin User já estava plantado, mantendo a Idempotência.');
    }

    log('Seed do banco executada com sucesso.');
    return true;
  } catch (error: any) {
    log(`FATAL ERROR NO SEED: ${error.message}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed().then(success => {
    if (!success) process.exit(1);
  });
}
