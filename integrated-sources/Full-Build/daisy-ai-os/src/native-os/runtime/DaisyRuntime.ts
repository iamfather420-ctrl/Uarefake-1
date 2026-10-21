/**
 * Daisy native runtime state.
 * Activation is denied until an independently verified activation contract
 * and production dependencies are supplied by the host.
 */
import type { PlatformTarget, RuntimeState, ClaimScope } from '../types.ts';

export class DaisyRuntime {
  private static instance: DaisyRuntime | null = null;
  private startedAt = Date.now();
  private state: RuntimeState;

  private constructor(platform: PlatformTarget = 'linux') {
    this.state = {
      os_name: 'Daisy AI OS',
      version: '1.0.0-native',
      environment: 'local',
      platform,
      uptime_ms: 0,
      activation: 'INACTIVE',
    };
  }

  static getInstance(platform?: PlatformTarget): DaisyRuntime {
    if (!DaisyRuntime.instance) DaisyRuntime.instance = new DaisyRuntime(platform);
    return DaisyRuntime.instance;
  }

  boot(): RuntimeState {
    this.state.activation = 'BLOCKED';
    this.state.uptime_ms = Date.now() - this.startedAt;
    return this.snapshot();
  }

  halt(_reason = 'operator'): RuntimeState {
    this.state.activation = 'BLOCKED';
    this.state.uptime_ms = Date.now() - this.startedAt;
    return this.snapshot();
  }

  snapshot(): RuntimeState {
    this.state.uptime_ms = Date.now() - this.startedAt;
    return { ...this.state };
  }

  claimScope(): ClaimScope {
    return 'EXTERNAL_PROVIDER_REQUIRED';
  }
}
