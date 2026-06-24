import { spawn, ChildProcess } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const EXTENSION_ID = 'gcbalfbdmfieckjlnblleoemohcganoc';
const EXTENSION_VERSION = '9.6.0_0';
const LOG_PATH = join(__dirname, '../../report-output/rpa-log.txt');

async function runRpaMacro() {
  console.log('🚀 Ui.Vision RPA - Wind Terminal Automation');
  console.log('='.repeat(60));

  if (!existsSync(EDGE_PATH)) {
    console.error(`❌ Edge browser not found: ${EDGE_PATH}`);
    console.error('Please install Edge browser or modify EDGE_PATH variable');
    process.exit(1);
  }

  const macroPath = join(__dirname, 'stock-browser-macro.csv');
  if (!existsSync(macroPath)) {
    console.error(`❌ Macro file not found: ${macroPath}`);
    process.exit(1);
  }

  console.log(`📋 Macro file: ${macroPath}`);
  console.log(`📊 Log file: ${LOG_PATH}`);
  console.log(`🔧 Edge path: ${EDGE_PATH}`);
  console.log(`🔧 Extension version: ${EXTENSION_VERSION}`);
  console.log();

  const fileUrl = `file:///${macroPath.replace(/\\/g, '/').replace(/:/, '')}`;
  const rpaUrl = `file:///C:/Users/gyy/AppData/Local/Microsoft/Edge/User Data/Default/Extensions/${EXTENSION_ID}/${EXTENSION_VERSION}/html/index.html?direct=1&file=${fileUrl}&storage=file&savelog=${LOG_PATH}`;

  console.log('▶️ Starting Ui.Vision RPA...');
  console.log('Please ensure Wind Terminal is open and in foreground');
  console.log();

  const child = spawn(EDGE_PATH, [rpaUrl], {
    detached: true,
    stdio: 'ignore',
  });

  child.unref();

  console.log('✅ Ui.Vision RPA started!');
  console.log('Edge browser will open and execute the test flow');
  console.log();
  console.log('='.repeat(60));
}

runRpaMacro().catch((error) => {
  console.error('❌ 启动失败:', error);
  process.exit(1);
});
