/**
 * demo.js
 *
 * An interactive demonstration of node-core-easy-kit.
 * Shows core Node.js concepts and public API functions in action:
 *
 * 1. Path Utilities: resolvePath, getFileName, getFileExtension
 * 2. URL Utilities: pathToUrl, urlToPath
 * 3. File System: writeText, readText, writeJson, readJson, listDirectory, getFileSize, fileExists, removeFile
 * 4. Process & System: getRuntimeInfo, getMemoryUsage, getSystemInfo
 * 5. Performance & Timers: delay, measureTime
 * 6. Crypto Utilities: hashText, generateUuid
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
  pathToUrl,
  urlToPath,
  writeText,
  readText,
  writeJson,
  readJson,
  listDirectory,
  getFileSize,
  fileExists,
  removeFile,
  getRuntimeInfo,
  getMemoryUsage,
  getSystemInfo,
  delay,
  measureTime,
  hashText,
  generateUuid
} from '../src/index.js';

async function main() {
  console.log('====================================================');
  console.log('   🚀 Welcome to the node-core-easy-kit Demo        ');
  console.log('====================================================\n');

  // --------------------------------------------------------------------------
  // STEP 1: PATH & URL UTILITIES (node:path, node:url)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 1: Path & URL Utilities (node:path, node:url)');
  console.log('----------------------------------------------------');

  const demoFilePath = resolvePath('examples', 'output', 'demo-note.txt');
  const fileUrl = pathToUrl(demoFilePath);
  const backToPath = urlToPath(fileUrl);

  console.log(`• Resolved Path : \x1b[36m${demoFilePath}\x1b[0m`);
  console.log(`• File Name     : \x1b[36m${getFileName(demoFilePath)}\x1b[0m`);
  console.log(`• Base (no ext) : \x1b[36m${getFileName(demoFilePath, false)}\x1b[0m`);
  console.log(`• Extension     : \x1b[36m${getFileExtension(demoFilePath)}\x1b[0m`);
  console.log(`• File URL      : \x1b[36m${fileUrl}\x1b[0m`);
  console.log(`• URL to Path   : \x1b[36m${backToPath}\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // STEP 2: FILE SYSTEM OPERATIONS (node:fs/promises)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 2: File System Operations (node:fs/promises)');
  console.log('----------------------------------------------------');

  const textContent = 'Hello from node-core-easy-kit! Zero third-party dependencies.';
  await writeText(demoFilePath, textContent);
  console.log('✅ Wrote UTF-8 text file.');

  const readBack = await readText(demoFilePath);
  console.log(`📄 Read text back: "\x1b[32m${readBack}\x1b[0m"`);

  const jsonFilePath = resolvePath('examples', 'output', 'config.json');
  const sampleConfig = {
    appName: 'easy-kit-demo',
    id: generateUuid(),
    features: ['fs', 'path', 'url', 'process', 'os', 'timers', 'perf', 'crypto'],
    active: true,
    timestamp: new Date().toISOString()
  };

  await writeJson(jsonFilePath, sampleConfig);
  console.log('✅ Wrote JSON file with automatic directory creation.');

  const configRead = await readJson(jsonFilePath);
  console.log(`📊 Read JSON: \x1b[33m${configRead.appName}\x1b[0m (UUID: \x1b[35m${configRead.id}\x1b[0m)`);

  const size = await getFileSize(jsonFilePath);
  console.log(`📏 JSON File Size: \x1b[33m${size.formatted}\x1b[0m (${size.bytes} bytes)`);

  const dirEntries = await listDirectory(resolvePath('examples', 'output'));
  console.log(`📁 Directory Entries (${dirEntries.length} items): \x1b[36m${dirEntries.map(e => e.name).join(', ')}\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // STEP 3: CRYPTO UTILITIES (node:crypto)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 3: Crypto Utilities (node:crypto)');
  console.log('----------------------------------------------------');

  const textDigest = hashText(textContent, 'sha256');
  const randomId = generateUuid();
  console.log(`• SHA-256 Digest : \x1b[35m${textDigest}\x1b[0m`);
  console.log(`• Generated UUID : \x1b[35m${randomId}\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // STEP 4: PROCESS & HARDWARE TELEMETRY (node:process, node:os)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 4: Process & Hardware Telemetry (node:process, node:os)');
  console.log('----------------------------------------------------');

  const runtimeInfo = getRuntimeInfo();
  console.log(`• Node Version : \x1b[33m${runtimeInfo.nodeVersion}\x1b[0m on \x1b[33m${runtimeInfo.platform} (${runtimeInfo.architecture})\x1b[0m`);

  const memory = getMemoryUsage();
  console.log(`• Memory RSS   : \x1b[33m${memory.rssMb} MB\x1b[0m | Heap Used: \x1b[33m${memory.heapUsedMb} MB\x1b[0m`);

  const sys = getSystemInfo();
  console.log(`• Host Machine : \x1b[33m${sys.hostname}\x1b[0m (${sys.cpuCount} CPUs, ${sys.totalMemoryGb} GB RAM)\n`);

  // --------------------------------------------------------------------------
  // STEP 5: TIMERS & PERFORMANCE BENCHMARKING (node:timers, node:perf_hooks)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 5: Timers & Benchmarking (node:timers/promises, node:perf_hooks)');
  console.log('----------------------------------------------------');

  const { durationMs } = await measureTime(async () => {
    process.stdout.write('⏳ Benchmarking async delay(300)... ');
    await delay(300);
  });
  console.log(`✅ Completed in \x1b[32m${durationMs}ms\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // CLEANUP DEMO OUTPUT FILES
  // --------------------------------------------------------------------------
  await removeFile(demoFilePath);
  await removeFile(jsonFilePath);
  console.log('🧹 Cleaned up temporary demo files safely using removeFile.');

  console.log('\n====================================================');
  console.log('   🎉 Complete Demo Finished with Zero Errors!      ');
  console.log('====================================================');
}

main().catch((error) => {
  console.error('❌ Demo encountered an error:', error);
  process.exitCode = 1;
});
