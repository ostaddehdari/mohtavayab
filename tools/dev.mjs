import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const previewMode = args.includes('--host') || args.includes('--port');
const command = previewMode
  ? [
      'pnpm@12.18.0',
      '--filter',
      '@mohtavayab/web',
      'exec',
      'next',
      'dev',
      '--hostname',
      option('--host', '127.0.0.1'),
      '--port',
      option('--port', '4173'),
    ]
  : ['pnpm@12.18.0', 'exec', 'turbo', 'run', 'dev', '--parallel'];

const child = spawn('corepack', command, { stdio: 'inherit', shell: false });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
