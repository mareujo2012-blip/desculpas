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
  const logMessage = `[${timestamp}] [GIT-PUSH] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

export function gitPush() {
  try {
    log('Iniciando sincronização com Git...');
    execSync('git add .', { stdio: 'inherit' });
    
    // Testa se há mudanças para dar commit
    try {
      execSync('git commit -m "Auto-deploy commit"', { stdio: 'inherit' });
      log('Commit realizado com sucesso.');
    } catch (e: any) {
      log('Nenhuma mudança pendente para commit, pulando etapa.');
    }
    
    execSync('git push', { stdio: 'inherit' });
    log('Push realizado com sucesso para o branch default.');
    return true;
  } catch (error: any) {
    log(`ERRO: ${error.message}`);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const success = gitPush();
  if (!success) process.exit(1);
}
