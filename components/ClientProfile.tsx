
import React, { useState } from 'react';
import { Client, ClientFile, PaymentSchedule } from '../types';
import { 
  ArrowLeft, FileText, Upload, Plus, Trash2, 
  CreditCard, Code, Image as ImageIcon, CheckCircle2, 
  Clock, AlertCircle, Eye, Download, X, File, DollarSign, Wallet, Calendar
} from 'lucide-react';

interface ClientProfileProps {
  client: Client;
  onAddFile: (clientId: string, file: ClientFile) => void;
  onRegisterPayment: (clientId: string, payment: Omit<PaymentSchedule, 'id'>) => void;
  onUpdatePaymentStatus: (clientId: string, paymentId: string, status: 'pagado' | 'pendiente' | 'atrasado') => void;
  onBack: () => void;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ client, onAddFile, onRegisterPayment, onUpdatePaymentStatus, onBack }) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'files'>('payments');
  const [viewingFile, setViewingFile] = useState<ClientFile | null>(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<Omit<PaymentSchedule, 'id'>>({
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pendiente'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: ClientFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.name.split('.').pop() || 'file',
          content: event.target?.result as string,
          date: new Date().toISOString().split('T')[0]
        };
        onAddFile(client.id, newFile);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayment.amount > 0) {
      onRegisterPayment(client.id, newPayment);
      setNewPayment({ amount: 0, dueDate: new Date().toISOString().split('T')[0], status: 'pendiente' });
      setIsAddingPayment(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
        <ArrowLeft size={18} />
        Volver a la Zona
      </button>

      {/* Client Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <div className="bg-indigo-50 text-indigo-700 px-6 py-2 rounded-2xl border border-indigo-100 font-black tracking-tighter text-xl shadow-sm">
            Lote {client.lotId}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-lg">
            {client.name.charAt(0)}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800">{client.name}</h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold">
                <CreditCard size={14} /> {client.email}
              </div>
              <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold">
                <Clock size={14} /> Registro: {client.registrationDate}
              </div>
              <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold">
                <Wallet size={14} /> Enganche: ${client.downPayment.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${activeTab === 'payments' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'}`}
        >
          Plan de Pagos
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${activeTab === 'files' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'}`}
        >
          Expediente Digital
        </button>
      </div>

      {activeTab === 'payments' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Estatus Financiero</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cronograma de abonos y liquidación</p>
              </div>
              <button 
                onClick={() => setIsAddingPayment(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                <Plus size={18} /> Registrar Nuevo Pago
              </button>
            </div>

            {isAddingPayment && (
              <div className="p-8 border-b border-indigo-100 bg-indigo-50/30 animate-slideDown">
                <form onSubmit={handleAddPaymentSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest px-1">Monto del Pago</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                      <input 
                        type="number" 
                        required 
                        className="w-full pl-10 pr-5 py-3 bg-white border border-indigo-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-indigo-600"
                        placeholder="0.00"
                        value={newPayment.amount || ''}
                        onChange={e => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest px-1">Fecha de Vencimiento</label>
                    <div className="relative">
                      {/* Fixed: Calendar icon now has corresponding import */}
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                      <input 
                        type="date" 
                        required 
                        className="w-full pl-10 pr-5 py-3 bg-white border border-indigo-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-indigo-600"
                        value={newPayment.dueDate}
                        onChange={e => setNewPayment({...newPayment, dueDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Guardar Registro</button>
                    <button type="button" onClick={() => setIsAddingPayment(false)} className="p-3 bg-white border border-indigo-100 text-indigo-600 rounded-2xl hover:bg-white transition-all"><X size={20}/></button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5 border-r border-slate-100">Fecha Límite</th>
                    <th className="px-8 py-5 border-r border-slate-100">Estado de Cuenta</th>
                    <th className="px-8 py-5 border-r border-slate-100">Monto Programado</th>
                    <th className="px-8 py-5 text-right">Gestión Cobranza</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-sm">
                  {client.payments.length > 0 ? client.payments.map(p => {
                    const isOverdue = new Date(p.dueDate) < new Date() && p.status !== 'pagado';
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-6 text-slate-600 border-r border-slate-50">{new Date(p.dueDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td className="px-8 py-6 border-r border-slate-50">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            p.status === 'pagado' ? 'bg-emerald-50 text-emerald-600' : 
                            isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {p.status === 'pagado' ? <CheckCircle2 size={14} /> : isOverdue ? <AlertCircle size={14} className="animate-pulse" /> : <Clock size={14} />}
                            {isOverdue ? 'En Mora' : p.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 font-black text-slate-900 border-r border-slate-50 text-lg">${p.amount.toLocaleString()}</td>
                        <td className="px-8 py-6 text-right">
                          {p.status !== 'pagado' ? (
                            <button 
                              onClick={() => onUpdatePaymentStatus(client.id, p.id, 'pagado')}
                              className="px-4 py-2 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                            >
                              Marcar Pagado
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                              <CheckCircle2 size={16} /> Operación Liquidada
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <DollarSign size={48} className="mx-auto mb-4 text-slate-100" />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No se han registrado pagos programados.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {client.payments.length > 0 && (
              <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Cálculo de Proyección</p>
                   <p className="text-2xl font-black">Total Adeudo: <span className="text-indigo-200">
                     ${(client.totalAmount - client.downPayment - client.payments.filter(p => p.status === 'pagado').reduce((acc, p) => acc + p.amount, 0)).toLocaleString()}
                   </span></p>
                 </div>
                 <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Recuperado</p>
                      <p className="text-xl font-black">${(client.downPayment + client.payments.filter(p => p.status === 'pagado').reduce((acc, p) => acc + p.amount, 0)).toLocaleString()}</p>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Total</p>
                      <p className="text-xl font-black">${client.totalAmount.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Expediente Digital</h3>
              <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                <Upload size={18} />
                Subir Documento
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {client.files.length > 0 ? client.files.map(file => (
                <div key={file.id} className="group relative bg-slate-50 border border-slate-100 rounded-3xl p-6 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-indigo-50 transition-colors">
                      {file.content.startsWith('data:image/') ? <ImageIcon className="text-indigo-600" /> : <FileText className="text-indigo-600" />}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewingFile(file)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 truncate mb-1 text-sm" title={file.name}>{file.name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{file.date} • {file.type}</p>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center text-slate-300">
                  <FileText className="mx-auto mb-4 opacity-10" size={48} />
                  <p className="font-black uppercase tracking-widest text-xs italic">Expediente vacío</p>
                </div>
              )}
            </div>
          </div>

          {/* Visor de Archivos */}
          {viewingFile && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
              <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-indigo-600" />
                    <h4 className="font-bold text-slate-800">{viewingFile.name}</h4>
                  </div>
                  <button onClick={() => setViewingFile(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-auto p-8 bg-slate-100 flex items-center justify-center">
                  {viewingFile.content.startsWith('data:image/') ? (
                    <img src={viewingFile.content} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" alt={viewingFile.name} />
                  ) : viewingFile.content.startsWith('data:application/pdf') ? (
                    <iframe src={viewingFile.content} className="w-full h-full min-h-[500px] border-none rounded-xl" />
                  ) : (
                    <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-sm">
                       <FileText size={64} className="text-indigo-600 mx-auto mb-4" />
                       <p className="text-slate-700 font-bold">Archivo: {viewingFile.type}</p>
                       <p className="text-xs text-slate-400 mt-2">No se puede previsualizar este formato. Por favor descárguelo.</p>
                       <a href={viewingFile.content} download={viewingFile.name} className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg">
                         <Download size={14} /> Descargar Archivo
                       </a>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                   <a href={viewingFile.content} download={viewingFile.name} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                    <Download size={14} /> Descargar
                   </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
