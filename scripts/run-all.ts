import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { gitPush } from './git-push.js';
import { migrateDB } from './migrate.js';
import { deployFTP } from './deploy.js';
import { runSeed } from './seed.js';
import { validateDeploy } from './validate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFile = path.join(logDir, `deploy-${new Date().toISOString().split('T')[0]}.log`);

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [CI/CD MASTER] ${message}\n`;
  console.log('\n=======================================');
  console.log(logMessage.trim());
  console.log('=======================================\n');
  fs.appendFileSync(logFile, logMessage);
}

async function runDeployPipeline() {
  log('INICIANDO ESTEIRA DE DEPLOY AUTOMATIZADA');

  // STEP 1: COMMIT & PUSH
  log('ETAPA 1/5: GIT PUSH');
  const gitOk = gitPush();
  if (!gitOk) {
    log('ABORTANDO DEPLOY: Git falhou.');
    process.exit(1);
  }

  // STEP 2: MIGRATE
  log('ETAPA 2/5: BANCO DE DADOS E MIGRATE');
  const migrateOk = migrateDB();
  if (!migrateOk) {
    log('ABORTANDO DEPLOY: Migrações de Banco de Dados falharam.');
    process.exit(1);
  }

  // STEP 3: SEED
  log('ETAPA 3/5: SEED (Idempotente)');
  const seedOk = await runSeed();
  if (!seedOk) {
    log('ABORTANDO DEPLOY: Injeção de dependências falhou.');
    process.exit(1);
  }

  // STEP 4: DEPLOY FTP
  log('ETAPA 4/5: COMPILAÇÃO NEXT E FTP DEPLOY');
  const deployOk = await deployFTP();
  if (!deployOk) {
    log('ABORTANDO DEPLOY: Falha pesada na rede/FTP.');
    process.exit(1);
  }

  // STEP 5: VALIDATE
  log('ETAPA 5/5: VALIDAÇÃO EM PRODUÇÃO (PING)');
  const pingOk = await validateDeploy();
  if (!pingOk) {
    log('WARNING: DEPLOY ENVIADO MAS A VALIDAÇÃO DO SITE CAIU.');
    process.exit(1);
  }

  log('SUCESSO ABSOLUTO! Sua aplicação está rodando em Produção na Host externa!');
}

runDeployPipeline();
