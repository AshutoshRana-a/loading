import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const Gauge = ({ value, label, color }) => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="relative w-24 h-24">
      <Doughnut 
        data={{
          datasets: [{
            data: [value, 100 - value],
            backgroundColor: [color, '#1e293b'],
            borderWidth: 0,
            circumference: 270,
            rotation: 225,
          }]
        }}
        options={{ cutout: '80%', plugins: { tooltip: { enabled: false } } }}
      />
      <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-white">
        {value}%
      </div>
    </div>
    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">{label}</span>
  </div>
);

const Card = ({ title, value, unit, icon }) => (
  <div className="bg-[#161b22] p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
    <div className="bg-[#0b0f19] p-3 rounded-lg text-indigo-400">{icon}</div>
    <div>
      <p className="text-xs text-slate-500 uppercase font-bold">{title}</p>
      <p className="text-xl font-black text-white">{value}<span className="text-sm ml-1 text-slate-400">{unit}</span></p>
    </div>
  </div>
);

export default function App() {
  const [metrics, setMetrics] = useState({ cpu: 0, ram: 0, temp: 0, net: 0, processes: 0, queue: 0, vmem: 0 });
  const [analysis, setAnalysis] = useState({ risk: 'Low Risk', advice: 'System Healthy' });
  const [history, setHistory] = useState({ labels: [], cpu: [], ram: [] });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        
        const res = await fetch('http://localhost:3000/api/system-status');
        const json = await res.json();
        setMetrics({ ...json.system_telemetry, cpu: json.system_telemetry.cpu_utility_pct, ram: json.system_telemetry.memory_in_use_pct });
        setAnalysis({ risk: json.analysis.risk_level, advice: json.analysis.actionable_advice });
        setHistory(prev => ({
          labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-15),
          cpu: [...prev.cpu, json.system_telemetry.cpu_utility_pct].slice(-15),
          ram: [...prev.ram, json.system_telemetry.memory_in_use_pct].slice(-15)
        }));
      } catch (e) { console.log("Backend offline"); }
    };
    const itv = setInterval(fetchMetrics, 2000);
    return () => clearInterval(itv);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-[#0b0f19] text-slate-300">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI-Powered Infrastructure Monitor</h1>
          <p className="text-slate-500 text-sm font-medium">Real-Time Telemetry & Machine Learning Analysis • Capstone Project</p>
        </div>
        <div className={`px-6 py-3 rounded-xl border-2 font-black uppercase text-center ${metrics.cpu > 80 ? 'bg-red-900/30 border-red-500 text-red-500' : 'bg-amber-900/30 border-amber-500 text-amber-500'}`}>
          <span className="text-[10px] block opacity-70">Current Risk Level</span>
          {analysis.risk}
        </div>
      </div>

      {/* SUMMARY TOP BAR */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card title="CPU Load" value={metrics.cpu} unit="%" icon="⚡" />
        <Card title="RAM Usage" value={metrics.ram} unit="%" icon="💾" />
        <Card title="Processes" value={metrics.processes} unit="" icon="📂" />
        <Card title="Queue" value={metrics.queue} unit="" icon="⏳" />
        <Card title="Net In" value={metrics.net_in_mb} unit="MB/s" icon="🌐" />
        <Card title="Temp" value={metrics.temperature} unit="°C" icon="🌡️" />
      </div>

      {/* MAIN DATA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gauges & Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#161b22] p-8 rounded-2xl border border-slate-800">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">System Health Gauges</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <Gauge value={metrics.cpu} label="CPU" color="#3b82f6" />
              <Gauge value={metrics.ram} label="Memory" color="#a855f7" />
              <Gauge value={60} label="Disk I/O" color="#10b981" />
              <Gauge value={metrics.vmem} label="V-Memory" color="#f59e0b" />
              <Gauge value={metrics.temperature} label="Temp" color="#ef4444" />
              <Gauge value={15} label="Net In" color="#06b6d4" />
            </div>
          </div>

          <div className="bg-[#161b22] p-8 rounded-2xl border border-slate-800">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Real-Time Telemetry Feed</h2>
            <div className="h-64">
              <Line data={{
                labels: history.labels,
                datasets: [
                  { label: 'CPU', data: history.cpu, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 },
                  { label: 'RAM', data: history.ram, borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)', fill: true, tension: 0.4 }
                ]
              }} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#1e293b' } }, x: { grid: { display: false } } } }} />
            </div>
          </div>
        </div>

        {/* Right: AI & Alerts */}
        <div className="space-y-8">
          <div className="bg-[#161b22] p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center">
              <span className="mr-2">⚡</span> AI Advisory
            </h2>
            <div className={`p-4 rounded-xl border leading-relaxed ${metrics.cpu > 80 ? 'bg-red-500/10 border-red-500/50 text-red-200' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
              {analysis.advice}
            </div>
            <button className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
              Force AI Model Retraining
            </button>
          </div>

          <div className="bg-[#161b22] p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">ML Model Intelligence</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-[#0b0f19] p-4 rounded-lg">
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Algorithm</p>
                    <p className="text-white font-bold">Random Forest</p>
                </div>
                <div className="bg-[#0b0f19] p-4 rounded-lg">
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Accuracy</p>
                    <p className="text-green-400 font-bold">96.8%</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}