/**
 * Real-time CPU and Memory stress workload simulator.
 * Allows users to deliberately induce CPU load and memory usage
 * to test and observe performance snapshots capturing the spikes.
 */

class StressEngine {
  private cpuTimer: number | null = null;
  private memoryHolders: Uint8Array[] = [];

  /**
   * Starts a controlled CPU load loop running busy work slices
   */
  public startCpuStress(intensity = 0.75): void {
    if (this.cpuTimer !== null) return;

    // Run active burst calculations
    const workSliceMs = Math.round(intensity * 40);
    const restSliceMs = Math.round((1 - intensity) * 40);

    const step = () => {
      const start = performance.now();
      // Burn CPU for workSliceMs
      while (performance.now() - start < workSliceMs) {
        Math.atan(Math.random()) * Math.tan(Math.random());
      }
      this.cpuTimer = window.setTimeout(step, restSliceMs);
    };

    step();
  }

  /**
   * Stops the CPU stress loop
   */
  public stopCpuStress(): void {
    if (this.cpuTimer !== null) {
      clearTimeout(this.cpuTimer);
      this.cpuTimer = null;
    }
  }

  /**
   * Allocates physical array buffer memory in blocks
   */
  public allocateMemoryMB(megabytes: number): number {
    try {
      const bytesPerBlock = 1024 * 1024; // 1MB
      for (let i = 0; i < megabytes; i++) {
        const buffer = new Uint8Array(bytesPerBlock);
        // Fill memory so browser engine does not lazy-optimize away
        buffer.fill(42);
        this.memoryHolders.push(buffer);
      }
    } catch (err) {
      console.warn('Memory allocation hit browser quota', err);
    }
    return this.memoryHolders.length;
  }

  /**
   * Releases allocated memory
   */
  public releaseMemory(): void {
    this.memoryHolders = [];
  }

  public getAllocatedMB(): number {
    return this.memoryHolders.length;
  }

  public isCpuStressing(): boolean {
    return this.cpuTimer !== null;
  }
}

export const stressEngine = new StressEngine();
