const si = require("systeminformation");

/**
 * Service to gather real-time hardware telemetry.
 * Formats data specifically for the AI prediction model.
 */
async function getCurrentMetrics() {
    try {
        // Run promises concurrently for faster execution
        const [cpu, mem, processes, disk] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.processes(),
            si.disksIO().catch(() => null) // Fallback for Windows permissions
        ]);

        // Calculate usage percentages
        const cpuUsage = cpu.currentLoad || 0;
        const memoryPct = mem.total > 0 ? (mem.used / mem.total) * 100 : 0;
        const virtualMemPct = mem.swaptotal > 0 ? (mem.swapused / mem.swaptotal) * 100 : 0;
        
        // Return structured dataset
        return {
            cpu_utility_pct: parseFloat(cpuUsage.toFixed(2)),
            memory_in_use_pct: parseFloat(memoryPct.toFixed(2)),
            disk_active_time_pct: disk ? parseFloat(disk.tIO_sec.toFixed(2)) : 0,
            virtual_memory_pct: parseFloat(virtualMemPct.toFixed(2)),
            process_count: processes.all || 0,
            disk_queue_length: disk ? parseFloat(disk.qIO.toFixed(2)) : 0
        };

    } catch (error) {
        console.error("Data Collection Error:", error.message);
        throw new Error("Failed to gather system metrics.");
    }
}

module.exports = { getCurrentMetrics };
