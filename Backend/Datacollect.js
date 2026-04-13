const fs = require("fs");
const si = require("systeminformation");

const CONFIG = { intervalMs: 2000, csvPath: "./win_system_metrics_v2.csv" };

if (!fs.existsSync(CONFIG.csvPath)) {
    const headers = ["timestamp","cpu_utility_pct","memory_in_use_pct","disk_active_time_pct","virtual_memory_pct","process_count","disk_queue_length"].join(",");
    fs.writeFileSync(CONFIG.csvPath, headers + "\n");
}

async function collectMetrics() {
    try {
        const timestamp = new Date().toISOString();
        const cpu = await si.currentLoad();
        const mem = await si.mem();
        const processes = await si.processes();
        const disk = await si.disksIO().catch(() => null);
        const cpuUsage = cpu.currentLoad;
        const memoryPct = (mem.used / mem.total) * 100;
        const virtualMemPct = mem.swaptotal > 0 ? (mem.swapused / mem.swaptotal) * 100 : 0;
        const processCount = processes.all;
        const diskActive = disk && disk.tIO_sec ? disk.tIO_sec : 0;
        const diskQueue = disk && disk.qIO ? disk.qIO : 0;
        const row = [timestamp, cpuUsage.toFixed(2), memoryPct.toFixed(2), diskActive.toFixed(2), virtualMemPct.toFixed(2), processCount, diskQueue.toFixed(2)].join(",") + "\n";
        fs.appendFileSync(CONFIG.csvPath, row);
        console.log(`[${timestamp}] CPU:${cpuUsage.toFixed(2)}% MEM:${memoryPct.toFixed(2)}% PROCS:${processCount} DISK:${diskActive.toFixed(2)}`);
    } catch (error) {
        console.error("Error collecting metrics:", error);
    }
}

console.log("Starting System Collector...");
setInterval(collectMetrics, CONFIG.intervalMs);
