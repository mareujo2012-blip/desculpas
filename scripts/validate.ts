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
  const logMessage = `[${timestamp}] [VALIDADOR] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

export async function validateDeploy() {
  const url = process.env.APP_URL || 'https://desculpas.producaoweb.com.br';
  log(`Iniciando sonda de validação HTTP em: ${url}`);
  
  try {
    const res = await fetch(url, { method: 'GET' });
    if (res.ok) {
      log(`SUCESSO - Recebido Código HTTP ${res.status}`);
      return true;
    } else {
      log(`FALHOU - Status code problemático ${res.status}: ${res.statusText}`);
      return false;
    }
  } catch (err: any) {
    log(`FATAL: Site inacessível ou fora do ar de imediato. Erro: ${err.message}`);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateDeploy().then(success => {
    if (!success) process.exit(1);
  });
}
