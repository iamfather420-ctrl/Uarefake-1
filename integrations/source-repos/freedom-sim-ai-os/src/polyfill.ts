import { Buffer } from 'buffer';

// Polyfill for Object.hasOwn
if (typeof Object.hasOwn !== 'function') {
  Object.hasOwn = function(object: any, property: string | symbol) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
}

// Polyfill for process, Buffer and global
if (typeof window !== 'undefined') {
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
  }
  if (typeof (window as any).Buffer === 'undefined') {
    (window as any).Buffer = Buffer;
  }
  if (typeof (window as any).process === 'undefined') {
    (window as any).process = {
      env: {},
      cwd: () => '/',
      nextTick: (cb: any) => setTimeout(cb, 0),
      browser: true,
      version: 'v18.0.0',
      versions: {},
      platform: 'browser',
      argv: [],
      execPath: '',
      binding: () => ({}),
      umask: () => 0,
      hrtime: () => [0, 0],
      stdout: { write: () => {} },
      stderr: { write: () => {} },
      stdin: { on: () => {}, once: () => {}, off: () => {}, emit: () => {}, read: () => null },
      exit: () => {},
      memoryUsage: () => ({ rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 }),
      uptime: () => performance.now() / 1000,
      getuid: () => 0,
      getgid: () => 0,
      setuid: () => {},
      setgid: () => {},
      groups: () => [],
      setgroups: () => {},
      chdir: () => {},
      kill: () => {},
      title: 'browser',
      arch: 'x64',
      config: {},
      execArgv: [],
      mainModule: undefined,
      release: { name: 'node' },
      features: {},
      cpuUsage: () => ({ user: 0, system: 0 }),
      resourceUsage: () => ({}),
      report: {},
      allowedNodeEnvironmentFlags: new Set(),
      send: () => {},
      disconnect: () => {},
      connected: false,
      channel: {},
      setUncaughtExceptionCaptureCallback: () => {},
      hasUncaughtExceptionCaptureCallback: () => false,
      emitWarning: () => {},
      on: () => {},
      once: () => {},
      off: () => {},
      emit: () => {},
      listeners: () => [],
    };
  } else {
    if (typeof (window as any).process.cwd !== 'function') {
      (window as any).process.cwd = () => '/';
    }
    if (typeof (window as any).process.nextTick !== 'function') {
      (window as any).process.nextTick = (cb: any) => setTimeout(cb, 0);
    }
  }
}
