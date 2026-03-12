import { execSync } from 'child_process';
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
  // Censura a senha (ou qualquer conexão string sensível)
  let safeMessage = message.replace(/mysql:\/\/.*@/g, 'mysql://***:***@');
  const logMessage = `[${timestamp}] [MIGRATE] ${safeMessage}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

export function migrateDB() {
  try {
    log('Iniciando migração do Prisma (PostgreSQL/MySQL)...');
    // Prisma db push roda atualizando a schema diretamente do db de prod/dev para ser idempotente
    execSync('npx prisma generate', { stdio: 'pipe' });
    // Usando force-accept-data-loss pra forçar atualização de schemas
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    log('Migração de banco concluida com sucesso!');
    return true;
  } catch (error: any) {
    log(`ERRO FATAL NA MIGRAÇÃO: ${error.message}`);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const success = migrateDB();
  if (!success) process.exit(1);
}
