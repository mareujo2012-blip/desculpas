import * as ftp from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { execSync } from 'child_process';

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
  safeMessage = safeMessage.replace(/90860Placa8010\!\@\#\$\%/g, '***');
  const logMessage = `[${timestamp}] [DEPLOY-FTP] ${safeMessage}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

config(); // Load variables from .env

export async function deployFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    log('Iniciando o Build de Produção do Next.js...');
    execSync('npm run build', { stdio: 'inherit' });
    log('Build finalizado.');

    log(`Conectando ao FTP ${process.env.FTP_HOST}...`);
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      port: Number(process.env.FTP_PORT || 21),
      secure: false
    });

    log(`Acessando pasta remota ${process.env.FTP_ROOT}...`);
    await client.cd(process.env.FTP_ROOT || '/');

    const projectRoot = path.join(__dirname, '..');

    log('Limpando diretório remoto .next (evitando lixo de builds velhos)...');
    try {
      await client.removeDir('.next');
    } catch(e) { /* Ignore se nao existir */ }
    
    log('Enviando pasta .next...');
    await client.uploadFromDir(path.join(projectRoot, '.next'), '.next');

    log('Enviando pasta public...');
    await client.uploadFromDir(path.join(projectRoot, 'public'), 'public');

    log('Enviando package.json e env...');
    await client.uploadFrom(path.join(projectRoot, 'package.json'), 'package.json');
    await client.uploadFrom(path.join(projectRoot, 'package-lock.json'), 'package-lock.json');
    await client.uploadFrom(path.join(projectRoot, '.env'), '.env');
    
    // Se fosse preciso, envia a pasta do Prisma também
    log('Enviando esquema do prisma...');
    try { await client.ensureDir('prisma'); } catch(e){}
    await client.uploadFrom(path.join(projectRoot, 'prisma', 'schema.prisma'), 'prisma/schema.prisma');
    client.cd('/');

    log('Upload concluído com sucesso!');
    return true;
  } catch (err: any) {
    log(`FATAL ERROR DEPLOY FTP: ${err.message}`);
    return false;
  } finally {
    client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  deployFTP().then(success => {
    if (!success) process.exit(1);
  });
}
