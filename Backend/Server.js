const si = require("systeminformation");

/**
 * Monitoring Layer: Gathers real-time hardware telemetry.
 * Tracks Core Metrics and Advanced "Secret Sauce" Bottlenecks.
 */
async function getCurrentMetrics() {
    try {
        const [cpu, mem, processes, disk] = await Promise.all([
            si.currentLoad(), 
            si.mem(), 
            si.processes(), 
            si.disksIO().catch(() => null)
        ]);

        return {
            // Core Metrics [cite: 165]
            cpu_utility_pct: parseFloat(cpu.currentLoad.toFixed(1)),
            memory_in_use_pct: parseFloat(((mem.used / mem.total) * 100).toFixed(1)),
            disk_active_time_pct: disk ? parseFloat(disk.tIO_sec.toFixed(1)) : 0,

            // Advanced Metrics (Root Cause Focus) [cite: 170]
            virtual_memory_pct: mem.swaptotal > 0 ? parseFloat(((mem.swapused / mem.swaptotal) * 100).toFixed(1)) : 0,
            process_count: processes.all,
            disk_queue_length: disk ? parseFloat(disk.qIO.toFixed(1)) : 0
        };
    } catch (e) { 
        console.error("Hardware collection failed:", e);
        return null; 
    }
}

module.exports = { getCurrentMetrics };