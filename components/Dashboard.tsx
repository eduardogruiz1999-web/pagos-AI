
import React, { useMemo } from 'react';
import { Client, PaymentSchedule, Lot } from '../types';
import { 
  Clock, AlertCircle, CheckCircle2, TrendingUp, Users, 
  Map as MapIcon, ChevronRight, Calendar, Landmark
} from 'lucide-react';

interface DashboardProps {
  clients: Client[];
  onSelectClient: (id: string) => void;
  lotsByDivision: Record<string, Lot[]>;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, onSelectClient, lotsByDivision }) => {
  const upcomingPayments = useMemo(() => {
    return clients.flatMap(client => 
      client.payments
        .filter(p => p.status !== 'pagado')
        .map(p => ({ ...p, clientName: client.name, clientId: client.id }))
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [clients]);

  const stats = useMemo(() => {
    // Explicitly cast to Lot[] to ensure 'totalLots' is not inferred as 'unknown[]' when using .flat()
    const totalLots = Object.values(lotsByDivision).flat() as Lot[];
    return {
      totalVentas: clients.length * 150000,
      clientesActivos: clients.length,
      pagosVencidos: upcomingPayments.filter(p => new Date(p.dueDate) < new Date()).length,
      lotesDisponibles: totalLots.filter(l => l.status === 'disponible').length || 42
    };
  }, [clients, upcomingPayments, lotsByDivision]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard label="Ventas Proyectadas" value={`$${stats.totalVentas.toLocaleString()}`} icon={<Landmark className="text-emerald-600" />} color="bg-emerald-50" />
        <MetricCard label="Clientes Activos" value={stats.clientesActivos.toString()} icon={<Users className="text-indigo-600" />} color="bg-indigo-50" />
        <MetricCard label="Pagos en Riesgo" value={stats.pagosVencidos.toString()} icon={<AlertCircle className="text-rose-600" />} color="bg-rose-50" />
        <MetricCard label="Lotes Libres" value={stats.lotesDisponibles.toString()} icon={<MapIcon className="text-amber-600" />} color="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Pagos Próximos y Vencidos</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase">En tiempo real</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
              {upcomingPayments.length} pendientes
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px] excel-scroll">
            <div className="divide-y divide-slate-100">
              {upcomingPayments.map((payment, idx) => {
                const isOverdue = new Date(payment.dueDate) < new Date();
                return (
                  <div key={idx} onClick={() => onSelectClient(payment.clientId)} className="p-4 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{payment.clientName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">${payment.amount.toLocaleString()}</p>
                      <span className={`text-[10px] font-bold uppercase ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                        {isOverdue ? 'Vencido' : 'Próximo'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl flex flex-col relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapIcon size={20} className="text-indigo-400" />
              Inventario Real por Zona
            </h3>
            <div className="space-y-4 flex-1">
              {/* Cast Object.entries result to explicitly tell TypeScript that 'lots' is Lot[] */}
              {(Object.entries(lotsByDivision) as [string, Lot[]][]).map(([name, lots]) => {
                const sold = lots.filter(l => l.status === 'vendido').length;
                const total = lots.length || 1;
                const progress = Math.round((sold / total) * 100);
                return <LotZone key={name} progress={progress} name={name} count={lots.length} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 mt-2">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    </div>
  </div>
);

const LotZone: React.FC<{ name: string, progress: number, count: number }> = ({ name, progress, count }) => (
  <div>
    <div className="flex justify-between text-xs font-bold mb-1.5 px-1">
      <span className="text-indigo-200 uppercase truncate pr-2">{name} ({count})</span>
      <span className="text-white shrink-0">{progress}% Ventas</span>
    </div>
    <div className="h-2.5 bg-indigo-950 rounded-full overflow-hidden p-0.5">
      <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export default Dashboard;
