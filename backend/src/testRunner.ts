import { execSync } from 'child_process';

console.log('====================================================');
console.log('   EcoPulse Backend Unified Test Suite Execution    ');
console.log('====================================================\n');

try {
  console.log('>> Running Test Suite 1: Campus Energy Simulator');
  execSync('npx tsx src/simulator/energySimulator.test.ts', { stdio: 'inherit' });

  console.log('\n>> Running Test Suite 2: Gemini Vision & Food Waste Audit');
  execSync('npx tsx src/services/geminiVision.test.ts', { stdio: 'inherit' });

  console.log('\n>> Running Test Suite 3: /api/scan-plate API Integration');
  execSync('npx tsx src/services/apiIntegration.test.ts', { stdio: 'inherit' });

  console.log('\n====================================================');
  console.log('   ALL ECOPULSE TEST SUITES COMPLETED SUCCESSFULLY!  ');
  console.log('====================================================\n');
} catch (error) {
  console.error('\nTest runner failed!');
  process.exit(1);
}
