/**
 * demo.js
 *
 * An interactive demonstration of node-core-easy-kit.
 * Shows all 4 core Node.js concepts and 5 public API functions in action:
 *
 * 1. resolvePath   (node:path)
 * 2. writeText     (node:fs/promises)
 * 3. readText      (node:fs/promises)
 * 4. getRuntimeInfo(node:process)
 * 5. delay         (node:timers/promises)
 *
 * Run this demo:
 *   node examples/demo.js
 * or
 *   npm run demo
 */

import {
  resolvePath,
  writeText,
  readText,
  getRuntimeInfo,
  delay
} from '../src/index.js';

async function main() {
  console.log('====================================================');
  console.log('   🚀 Welcome to the node-core-easy-kit Live Demo   ');
  console.log('====================================================\n');

  // --------------------------------------------------------------------------
  // STEP 1: PATH RESOLUTION (node:path)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 1: Resolving a Cross-Platform Absolute Path');
  console.log('----------------------------------------------------');
  console.log('Concept: "path.resolve" normalizes relative segments into an unambiguous');
  console.log('absolute path from your current working directory.\n');

  const demoFilePath = resolvePath('examples', 'output', 'demo-note.txt');
  console.log(`Resolved Target File: \x1b[36m${demoFilePath}\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // STEP 2: FILE SYSTEM WRITE (node:fs/promises)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 2: Writing UTF-8 Text to Disk');
  console.log('----------------------------------------------------');
  console.log('Concept: "writeText" creates missing parent directories automatically');
  console.log('and writes UTF-8 text. Notice: writing to an existing file will overwrite it!\n');

  const timestamp = new Date().toLocaleString();
  const demoContent = [
    '========================================',
    ' Hello from node-core-easy-kit!',
    '========================================',
    `Timestamp : ${timestamp}`,
    'Status    : Written successfully with zero external dependencies.',
    'Rule      : Overwrites existing file content if present.',
    'Safety    : Missing parent directories created automatically.'
  ].join('\n');

  await writeText(demoFilePath, demoContent);
  console.log('✅ File successfully written to:');
  console.log(`   ${demoFilePath}\n`);

  // --------------------------------------------------------------------------
  // STEP 3: FILE SYSTEM READ (node:fs/promises)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 3: Reading UTF-8 Text from Disk');
  console.log('----------------------------------------------------');
  console.log('Concept: "readText" reads files asynchronously without blocking the');
  console.log('event loop and preserves original error codes (like ENOENT) if missing.\n');

  const fileContent = await readText(demoFilePath);
  console.log('📄 File Contents:');
  console.log('\x1b[32m' + fileContent + '\x1b[0m\n');

  // --------------------------------------------------------------------------
  // STEP 4: PROCESS METADATA (node:process)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 4: Diagnostic Runtime Information');
  console.log('----------------------------------------------------');
  console.log('Concept: Safe diagnostic telemetry. Never exposes process.env or secrets!\n');

  const runtimeInfo = getRuntimeInfo();
  console.log('⚙️  Host Runtime Details:');
  console.log(`   • Node Version     : \x1b[33m${runtimeInfo.nodeVersion}\x1b[0m`);
  console.log(`   • OS Platform      : \x1b[33m${runtimeInfo.platform}\x1b[0m`);
  console.log(`   • CPU Architecture : \x1b[33m${runtimeInfo.architecture}\x1b[0m`);
  console.log(`   • Working Directory: \x1b[33m${runtimeInfo.workingDirectory}\x1b[0m\n`);

  // --------------------------------------------------------------------------
  // STEP 5: TIMERS & ASYNC DELAY (node:timers/promises)
  // --------------------------------------------------------------------------
  console.log('📌 STEP 5: Asynchronous Non-Blocking Delay');
  console.log('----------------------------------------------------');
  console.log('Concept: Promises & async/await let the Node.js event loop breathe.');
  console.log('While waiting, Node can process incoming HTTP requests or file I/O.\n');

  const waitTimeMs = 1200;
  process.stdout.write(`⏳ Pausing execution for ${waitTimeMs}ms non-blockingly... `);
  await delay(waitTimeMs);
  console.log('✅ Resumed!\n');

  console.log('====================================================');
  console.log('   🎉 Demo Completed Successfully with Zero Errors! ');
  console.log('====================================================');
}

main().catch((error) => {
  console.error('❌ Demo encountered an unexpected error:', error);
  process.exitCode = 1;
});

