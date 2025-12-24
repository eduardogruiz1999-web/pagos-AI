
import React, { useState } from 'react';
import { Payment } from '../types';
import { Plus, Trash2, Edit2, Search, Filter, ChevronRight, FileText, Check, X, AlertCircle } from 'lucide-react';

interface PaymentsListProps {
  payments: Payment[];
  onAdd: (payment: Omit<Payment, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (payment: Payment) => void;
}

const PaymentsList: React.FC<PaymentsListProps> = ({ payments, onAdd, onDelete, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPayment, setNewPayment] = useState<Omit<Payment, 'id'>>({
    concept: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'pendiente',
    category: 'Vivienda'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayment.concept && newPayment.amount > 0) {
      onAdd(newPayment);
      setNewPayment({
        concept: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'pendiente',
        category: 'Vivienda'
      });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial de Pagos</h1>
          <p className="text-slate-500">Gestión detallada de todas las transacciones.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? 'Cancelar' : 'Registrar Pago'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-xl shadow-indigo-50/50 space-y-6 animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Concepto</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ej. Renta casa"
                value={newPayment.concept}
                onChange={e => setNewPayment({...newPayment, concept: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monto ($)</label>
              <input 
                type="number" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="0.00"
                value={newPayment.amount || ''}
                onChange={e => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={newPayment.category}
                onChange={e => setNewPayment({...newPayment, category: e.target.value})}
              >
                <option>Vivienda</option>
                <option>Servicios</option>
                <option>Transporte</option>
                <option>Alimentación</option>
                <option>Entretenimiento</option>
                <option>Salud</option>
                <option>Otros</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={newPayment.date}
                onChange={e => setNewPayment({...newPayment, date: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
              Guardar Pago
            </button>
          </div>
        </form>
      )}

      {/* Modern Table List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filtrar por concepto o categoría..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-8 py-4">Pago</th>
                <th className="px-8 py-4">Monto</th>
                <th className="px-8 py-4">Estado</th>
                <th className="px-8 py-4">Categoría</th>
                <th className="px-8 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{p.concept}</p>
                        <p className="text-xs text-slate-400">{p.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-800">${p.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === 'completado' ? 'bg-emerald-50 text-emerald-700' : 
                      p.status === 'atrasado' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {p.status === 'completado' ? <Check size={14} /> : p.status === 'atrasado' ? <AlertCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">{p.category}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="py-20 flex flex-col items-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="opacity-20" />
              </div>
              <p className="font-medium">No se encontraron pagos registrados.</p>
              <button onClick={() => setIsAdding(true)} className="mt-4 text-indigo-600 font-bold hover:underline">
                Crea tu primer pago ahora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsList;
