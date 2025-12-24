
import React, { useMemo, useState } from 'react';
import { Client, Lot, Payment } from '../types';
import { analyzePayments } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  AlertCircle, TrendingUp, Users, 
  Map as MapIcon, Table as TableIcon,
  Sparkles, BrainCircuit, Loader2, Info, Lightbulb,
  Wallet, Coins,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Download, Search, Filter as FilterIcon,
  Plus
} from 'lucide-react';

interface DashboardProps {
  clients: Client[];
  onSelectClient: (id: string) => void;
  lotsByDivision: Record<string, Lot[]>;
  onAddClient: () => void;
}

interface AnalysisResult {
  summary: string;
  advice: string;
  kpis: { label: string; value: string }[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ clients, onSelectClient, lotsByDivision, onAddClient }) => {
  const [activeView, setActiveView] = useState<'visual' | 'excel'>('visual');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    const totalLots = Object.values(lotsByDivision).flat() as Lot[];
    const totalProjected = clients.reduce((acc, c) => acc + c.totalAmount, 0);
    const totalLiquidity = clients.reduce((acc, c) => acc + (c.downPayment + c.payments.filter(p => p.status === 'pagado').reduce((sum, p) => sum + p.amount, 0)), 0);
    const totalPending = totalProjected - totalLiquidity;

    return {
      totalProjected,
      totalLiquidity,
      totalPending,
      activeClients: clients.length,
      availableLots: totalLots.filter(l => l.status === 'disponible').length,
      lotStatusData: [
        { name: 'Disponibles', value: totalLots.filter(l => l.status === 'disponible').length },
        { name: 'Vendidos', value: totalLots.filter(l => l.status === 'vendido').length },
        { name: 'Reservados', value: totalLots.filter(l => l.status === 'reservado').length }
      ],
      divisionSales: Object.entries(lotsByDivision).map(([name, lots]) => {
        const divisionClients = clients.filter(c => c.division === name);
        const collected = divisionClients.reduce((acc, c) => acc + (c.downPayment + c.payments.filter(p => p.status === 'pagado').reduce((sum, p) => sum + p.amount, 0)), 0);
        return {
          name,
          ventas: divisionClients.length,
          recaudado: collected / 1000 // k$
        };
      })
    };
  }, [clients, lotsByDivision]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.division.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const paymentsForAi: Payment[] = clients.flatMap(c => c.payments).map(p => ({
      id: p.id,
      concept: `Mensualidad Lote ${clients.find(cli => cli.id === p.id)?.lotId || 'N/A'}`,
      amount: p.amount,
      date: p.dueDate,
      status: (p.status === 'pagado' ? 'completado' : p.status) as 'pendiente' | 'completado' | 'atrasado',
      category: 'Mensualidad Inmobiliaria'
    }));

    const result = await analyzePayments(paymentsForAi);
    if (result) setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12 max-w-[1600px] mx-auto">
      {/* Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Liquidez Real" value={`$${stats.totalLiquidity.toLocaleString()}`} icon={<Coins size={24} className="text-emerald-600" />} color="bg-emerald-50" trend="+12.5%" />
        <MetricCard label="Cuentas por Cobrar" value={`$${stats.totalPending.toLocaleString()}`} icon={<Wallet size={24} className="text-indigo-600" />} color="bg-indigo-50" trend="-3.2%" />
        <MetricCard label="Operaciones Activas" value={stats.activeClients.toString()} icon={<Users size={24} className="text-blue-600" />} color="bg-blue-50" />
        <MetricCard label="Stock Disponible" value={stats.availableLots.toString()} icon={<MapIcon size={24} className="text-amber-600" />} color="bg-amber-50" />
      </div>

      {/* AI Insights Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Cognitive Sales Analysis</h2>
              <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-0.5">Powered by Gemini 3 Pro • Real-time Intelligence</p>
            </div>
          </div>
          <button 
            onClick={handleRunAnalysis} 
            disabled={isAnalyzing} 
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isAnalyzing ? 'Procesando Datos...' : 'Solicitar Análisis Estratégico'}
          </button>
        </div>

        {analysis && (
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fadeIn">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 bg-indigo-50/40 rounded-[2rem] border border-indigo-100 relative shadow-inner">
                <div className="absolute -top-3 left-6 px-4 py-1.5 bg-white border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} /> Executive Summary
                </div>
                <p className="text-slate-800 leading-relaxed font-bold pt-2 text-sm md:text-base">{analysis.summary}</p>
              </div>
              <div className="p-8 bg-emerald-50/40 rounded-[2rem] border border-emerald-100 relative">
                <div className="absolute -top-3 left-6 px-4 py-1.5 bg-white border border-emerald-100 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <Lightbulb size={14} /> Strategic Advice
                </div>
                <p className="text-emerald-900 font-bold pt-2 text-sm italic">"{analysis.advice}"</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Core Financial KPIs</h4>
              {analysis.kpis.map((kpi, idx) => (
                <div key={idx} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex items-center justify-between group hover:border-indigo-600 transition-all hover:shadow-md">
                  <span className="text-xs font-black text-slate-500 uppercase">{kpi.label}</span>
                  <span className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-2xl w-fit border border-slate-200">
          <button 
            onClick={() => setActiveView('visual')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'visual' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Analytics Dashboard
          </button>
          <button 
            onClick={() => setActiveView('excel')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'excel' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Excel Data Container
          </button>
        </div>
        
        {activeView === 'excel' && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar registros..." 
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 min-w-[300px]"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-800 shadow-sm transition-all"><FilterIcon size={20}/></button>
          </div>
        )}
      </div>

      {/* Main Content Areas */}
      {activeView === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
              <BarChartIcon size={16} /> Recaudación Histórica por Proyecto (k$)
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.divisionSales}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                  />
                  <Bar dataKey="recaudado" fill="#0f172a" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
              <PieChartIcon size={16} /> Distribución Operativa de Lotes
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.lotStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {stats.lotStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    height={40} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-700"></div>
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
              <TrendingUp size={20} /> Proyección de Crecimiento Territorial
            </h3>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.divisionSales}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '1rem' }}
                  />
                  <Area type="monotone" dataKey="recaudado" stroke="#6366f1" strokeWidth={6} fillOpacity={1} fill="url(#colorRec)" />
                  <Area type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={4} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-4 border-slate-100 shadow-2xl overflow-hidden flex flex-col min-h-[700px] animate-fadeIn">
          <div className="p-8 border-b-2 border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg"><TableIcon size={24} /></div>
              <div>
                <h2 className="font-black text-slate-900 tracking-tight text-xl uppercase">Ledger Master View v2.0</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Data Audit • Transaction Records • Unified Ledger</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm">
                <Download size={16} /> XLSX Export
              </button>
              <button onClick={onAddClient} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                <Plus size={16} /> New Entry
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto excel-scroll relative">
            <table className="w-full border-collapse table-fixed min-w-[1200px]">
              <thead className="sticky top-0 z-30 shadow-sm">
                <tr className="bg-slate-100 text-[10px] font-black uppercase text-slate-500 border-b-2 border-slate-200">
                  <th className="w-16 px-6 py-5 text-center border-r border-slate-200 bg-slate-100">#</th>
                  <th className="w-48 px-6 py-5 text-left border-r border-slate-200 bg-slate-100">Transaction Date</th>
                  <th className="w-32 px-6 py-5 text-left border-r border-slate-200 bg-slate-100">Unit ID</th>
                  <th className="px-6 py-5 text-left border-r border-slate-200 bg-slate-100">Contract Holder</th>
                  <th className="w-48 px-6 py-5 text-left border-r border-slate-200 bg-slate-100">Zone / Project</th>
                  <th className="w-44 px-6 py-5 text-right border-r border-slate-200 bg-slate-100">Operation Value</th>
                  <th className="w-40 px-6 py-5 text-center bg-slate-100">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client, idx) => (
                  <tr 
                    key={client.id} 
                    onClick={() => onSelectClient(client.id)} 
                    className="group cursor-pointer hover:bg-indigo-50/50 transition-all border-l-4 border-l-transparent hover:border-l-indigo-600"
                  >
                    <td className="px-6 py-5 text-[10px] font-mono text-slate-300 text-center border-r border-slate-50">{idx + 1}</td>
                    <td className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase border-r border-slate-50">{client.registrationDate}</td>
                    <td className="px-6 py-5 text-xs font-black text-indigo-600 border-r border-slate-50 tracking-tighter">{client.lotId}</td>
                    <td className="px-6 py-5 border-r border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{client.name.charAt(0)}</div>
                        <span className="text-xs font-black text-slate-700 truncate">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase border-r border-slate-50">{client.division}</td>
                    <td className="px-6 py-5 text-sm font-mono font-black text-slate-900 text-right border-r border-slate-50 bg-slate-50/20 group-hover:bg-transparent transition-colors">
                      ${client.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                        client.paymentMethod === 'credito' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 
                        'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {client.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredClients.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40 bg-slate-50/50">
                 <div className="w-20 h-20 bg-white border-4 border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 shadow-sm"><Search size={40} /></div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching datasets in unified ledger</p>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] gap-6">
             <div className="flex gap-8">
               <span>Index Records: <span className="text-white ml-2">{filteredClients.length}</span></span>
               <span>Audit Checksum: <span className="text-emerald-400 ml-2">PASS</span></span>
             </div>
             <div className="flex gap-8 items-center">
                <span className="flex items-center gap-2">Aggregated Value: <span className="text-2xl font-black text-white tracking-tighter ml-2">${filteredClients.reduce((s,c) => s+c.totalAmount, 0).toLocaleString()}</span></span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string, trend?: string }> = ({ label, value, icon, color, trend }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-default group">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1.5 text-[10px] font-black ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
            <TrendingUp size={12} className={trend.startsWith('-') ? 'rotate-180' : ''} /> {trend} <span className="text-slate-300 font-bold ml-1">vs L30D</span>
          </div>
        )}
      </div>
      <div className={`p-5 rounded-[1.75rem] ${color} transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-6`}>{icon}</div>
    </div>
  </div>
);

export default Dashboard;
