
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
  Download
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
        { name: 'Libres', value: totalLots.filter(l => l.status === 'disponible').length },
        { name: 'Vendidos', value: totalLots.filter(l => l.status === 'vendido').length },
        { name: 'Apartados', value: totalLots.filter(l => l.status === 'reservado').length }
      ],
      divisionSales: Object.entries(lotsByDivision).map(([name, lots]) => ({
        name,
        ventas: clients.filter(c => c.division === name).length,
        recaudado: clients.filter(c => c.division === name).reduce((acc, c) => acc + (c.downPayment + c.payments.filter(p => p.status === 'pagado').reduce((sum, p) => sum + p.amount, 0)), 0) / 1000 // k$
      }))
    };
  }, [clients, lotsByDivision]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const paymentsForAi: Payment[] = clients.flatMap(c => c.payments).map(p => ({
      id: p.id,
      concept: `Pago Lote ${clients.find(cli => cli.id === p.id)?.lotId}`,
      amount: p.amount,
      date: p.dueDate,
      status: (p.status === 'pagado' ? 'completado' : p.status) as 'pendiente' | 'completado' | 'atrasado',
      category: 'Mensualidad'
    }));

    const result = await analyzePayments(paymentsForAi);
    if (result) setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Liquidez Recaudada" value={`$${stats.totalLiquidity.toLocaleString()}`} icon={<Coins className="text-emerald-600" />} color="bg-emerald-50" />
        <MetricCard label="Cartera por Cobrar" value={`$${stats.totalPending.toLocaleString()}`} icon={<Wallet className="text-indigo-600" />} color="bg-indigo-50" />
        <MetricCard label="Expedientes Activos" value={stats.activeClients.toString()} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
        <MetricCard label="Disponibilidad Lotes" value={stats.availableLots.toString()} icon={<MapIcon className="text-amber-600" />} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-indigo-100 shadow-xl shadow-indigo-50/50 overflow-hidden">
        <div className="p-8 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/10 to-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Financial Health Analysis</h2>
              <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Gemini 3 Cognitive Layer</p>
            </div>
          </div>
          <button onClick={handleRunAnalysis} disabled={isAnalyzing} className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl">
            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isAnalyzing ? 'Analizando...' : 'Generar Análisis de IA'}
          </button>
        </div>

        {analysis && (
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-7 bg-indigo-50/30 rounded-3xl border border-indigo-100 relative shadow-inner">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-indigo-100 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Info size={12} /> Executive Briefing</div>
                <p className="text-slate-800 leading-relaxed font-semibold pt-2 text-sm">{analysis.summary}</p>
              </div>
              <div className="p-7 bg-emerald-50/40 rounded-3xl border border-emerald-100 relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-emerald-100 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Lightbulb size={12} /> Sugerencia Estratégica</div>
                <p className="text-emerald-900 font-bold pt-2 text-sm italic">"{analysis.advice}"</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Data Points</h4>
              {analysis.kpis.map((kpi, idx) => (
                <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between hover:border-indigo-500 transition-all">
                  <span className="text-xs font-bold text-slate-500">{kpi.label}</span>
                  <span className="text-base font-black text-slate-900">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 p-1.5 bg-slate-200/50 backdrop-blur rounded-2xl w-fit">
        <button onClick={() => setActiveView('visual')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'visual' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Analytics Suite</button>
        <button onClick={() => setActiveView('excel')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'excel' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Spreadsheet View</button>
      </div>

      {activeView === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <BarChartIcon size={16} /> Volumen de Ventas por Zona
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.divisionSales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="ventas" fill="#1e293b" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <PieChartIcon size={16} /> Estatus de Inventario Total
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.lotStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.lotStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border-4 border-slate-200 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-6 border-b-2 border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg"><TableIcon size={20} /></div>
              <div>
                <h2 className="font-black text-slate-900 tracking-tight text-lg uppercase">Ledger Container v1.0</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Sales Record & Collection Status</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">
              <Download size={14} /> Export CSV
            </button>
          </div>
          
          <div className="flex-1 overflow-auto excel-scroll bg-white relative">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-100 text-[10px] font-black uppercase text-slate-500 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left border-r border-slate-200">Ref ID</th>
                  <th className="px-6 py-4 text-left border-r border-slate-200">Fecha Reg.</th>
                  <th className="px-6 py-4 text-left border-r border-slate-200">Lote</th>
                  <th className="px-6 py-4 text-left border-r border-slate-200">Titular del Contrato</th>
                  <th className="px-6 py-4 text-right border-r border-slate-200">Valor Operación</th>
                  <th className="px-6 py-4 text-right border-r border-slate-200">Enganche Rec.</th>
                  <th className="px-6 py-4 text-center">Modalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} onClick={() => onSelectClient(client.id)} className="group cursor-pointer hover:bg-indigo-50/40 transition-all">
                    <td className="px-6 py-4 text-[9px] font-mono text-slate-400 border-r border-slate-50">{client.id.toUpperCase()}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase border-r border-slate-50">{client.registrationDate}</td>
                    <td className="px-6 py-4 text-xs font-black text-indigo-600 border-r border-slate-50">{client.lotId}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700 border-r border-slate-50">{client.name}</td>
                    <td className="px-6 py-4 text-xs font-mono font-black text-slate-900 text-right border-r border-slate-50 bg-slate-50/30 group-hover:bg-transparent transition-colors">${client.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs font-mono font-black text-emerald-600 text-right border-r border-slate-50">${client.downPayment.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-tighter text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">{client.paymentMethod}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clients.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-300">
                 <TableIcon size={48} className="opacity-10 mb-4" />
                 <p className="text-xs font-black uppercase tracking-widest">No matching records found in database</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50 border-t-2 border-slate-200 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
             <span>Registros totales: {clients.length}</span>
             <div className="flex gap-4">
                <span>Sumatoria Total: <span className="text-slate-900">${clients.reduce((s,c) => s+c.totalAmount, 0).toLocaleString()}</span></span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-default group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-600 transition-colors">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${color} transition-all group-hover:scale-110 group-hover:shadow-lg`}>{icon}</div>
    </div>
  </div>
);

export default Dashboard;
