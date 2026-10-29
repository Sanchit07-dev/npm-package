/**
 * demo.js
 *
 * An interactive demonstration of node-core-easy-kit.
 * Shows core Node.js concepts and public API functions in action:
 *
 * 1. Path Utilities: resolvePath, getFileName, getFileExtension
 * 2. File System Utilities: writeText, readText, writeJson, readJson, fileExists, removeFile
 * 3. Process & Telemetry: getRuntimeInfo, getMemoryUsage
 * 4. Timers & Async: delay
 * 5. Crypto Utilities: hashText
 *
 * Run this demo:
 *   node examples/demo.js
 * or
 *   npm run demo
 */

import {
  resolvePath,
  getFileName,
  getFileExtension,
  writeText,
  readText,
  writeJson,
  readJson,
  fileExists,
  removeFile,
  getRuntimeInfo,
  getMemoryUsage,
  delay,
  hashText
} from '../src/index.js';

async function main() {
  console.log('====================================================');
  console.log('   🚀 Welcome to the node-core-easy-kit Demo        ');
  console.log('====================================================\n');

  // --------------------------------------------------------------------------
  // STEP 1: PATH UTILITIES (node:path)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 1: Path Utilities (node:path)');
  console.log('----------------------------------------------------');

  const demoFilePath = resolvePath('examples', 'output', 'demo-note.txt');
  console.log(`• Resolved Path : \x1b[36m${demoFilePath}\x1b[0m`);
  console.log(`• File Name     : \x1b[36m${getFileName(demoFilePath)}\x1b[0m`);
  console.log(`• Base (no ext) : \x1b[36m${getFileName(demoFilePath, false)}\x1b[0m`);
  console.log(`• Extension     : \x1b[36m${getFileExtension(demoFilePath)}\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // STEP 2: FILE SYSTEM WRITE & READ (node:fs/promises)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 2: File System Operations (node:fs/promises)');
  console.log('----------------------------------------------------');

  const textContent = 'Hello from node-core-easy-kit! Written with zero dependencies.';
  await writeText(demoFilePath, textContent);
  console.log('✅ Wrote UTF-8 text file.');

  const readBack = await readText(demoFilePath);
  console.log(`📄 Read text back: "\x1b[32m${readBack}\x1b[0m"`);

  const jsonFilePath = resolvePath('examples', 'output', 'config.json');
  const sampleConfig = {
    appName: 'easy-kit-demo',
    features: ['fs', 'path', 'process', 'timers', 'crypto'],
    ready: true,
    createdAt: new Date().toISOString()
  };

  await writeJson(jsonFilePath, sampleConfig);
  console.log('✅ Wrote JSON file with automatic directory creation.');

  const configRead = await readJson(jsonFilePath);
  console.log(`📊 Read JSON back: \x1b[33m${configRead.appName}\x1b[0m with \x1b[33m${configRead.features.length}\x1b[0m features`);

  const exists = await fileExists(jsonFilePath);
  console.log(`🔍 File exists check: \x1b[32m${exists}\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // STEP 3: CRYPTO HASHING (node:crypto)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 3: Cryptographic Hashing (node:crypto)');
  console.log('----------------------------------------------------');

  const textDigest = hashText(textContent, 'sha256');
  console.log(`• Content: "${textContent}"`);
  console.log(`• SHA-256: \x1b[35m${textDigest}\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // STEP 4: PROCESS & MEMORY TELEMETRY (node:process)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 4: Safe Process Telemetry (node:process)');
  console.log('----------------------------------------------------');

  const runtimeInfo = getRuntimeInfo();
  console.log(`• Node Version : \x1b[33m${runtimeInfo.nodeVersion}\x1b[0m`);
  console.log(`• Platform     : \x1b[33m${runtimeInfo.platform} (${runtimeInfo.architecture})\x1b[0m`);
  console.log(`• Directory    : \x1b[33m${runtimeInfo.workingDirectory}\x1b[0m`);

  const memory = getMemoryUsage();
  console.log(`• Memory RSS   : \x1b[33m${memory.rssMb} MB\x1b[0m`);
  console.log(`• Heap Used    : \x1b[33m${memory.heapUsedMb} MB / ${memory.heapTotalMb} MB\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // STEP 5: TIMERS & ASYNC DELAY (node:timers/promises)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 5: Asynchronous Non-Blocking Delay');
  console.log('----------------------------------------------------');

  const delayMs = 600;
  process.stdout.write(`⏳ Pausing for ${delayMs}ms non-blockingly... `);
  await delay(delayMs);
  console.log('✅ Resumed!\n');

  // --------------------------------------------------------------------------
  // CLEANUP DEMO OUTPUT FILES
  // --------------------------------------------------------------------------
  await removeFile(demoFilePath);
  await removeFile(jsonFilePath);
  console.log('🧹 Cleaned up temporary demo files safely using removeFile.');

  console.log('\n====================================================');
  console.log('   🎉 Enhanced Demo Completed with Zero Errors!     ');
  console.log('====================================================');
}

main().catch((error) => {
  console.error('❌ Demo encountered an error:', error);
  process.exitCode = 1;
});
