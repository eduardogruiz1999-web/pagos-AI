
import React, { useState } from 'react';
import { Client, ClientFile, PaymentSchedule } from '../types';
import { 
  ArrowLeft, FileText, Upload, Plus, Trash2, 
  CreditCard, Code, Image as ImageIcon, CheckCircle2, 
  Clock, AlertCircle, Eye, Download, X
} from 'lucide-react';

interface ClientProfileProps {
  client: Client;
  onAddFile: (clientId: string, file: ClientFile) => void;
  onBack: () => void;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ client, onAddFile, onBack }) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'files'>('payments');
  const [viewingFile, setViewingFile] = useState<ClientFile | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: ClientFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.name.split('.').pop() || 'txt',
          content: event.target?.result as string,
          date: new Date().toISOString().split('T')[0]
        };
        onAddFile(client.id, newFile);
      };
      // Si es imagen lo leemos como base64, si es texto como string
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
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
                <Clock size={14} /> Zona: {client.division}
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
          Archivos & Formatos
        </button>
      </div>

      {activeTab === 'payments' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Vencimiento</th>
                <th className="px-8 py-4">Estado</th>
                <th className="px-8 py-4">Monto</th>
                <th className="px-8 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {client.payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6 font-bold text-slate-700">{new Date(p.dueDate).toLocaleDateString()}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === 'pagado' ? 'bg-emerald-50 text-emerald-700' : 
                      p.status === 'atrasado' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {p.status === 'pagado' ? <CheckCircle2 size={14} /> : p.status === 'atrasado' ? <AlertCircle size={14} /> : <Clock size={14} />}
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900">${p.amount.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-indigo-600 font-bold text-xs hover:underline">Marcar Pagado</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800">Repositorio Multi-Formato</h3>
              <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold cursor-pointer hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                <Upload size={18} />
                Subir Archivo / Formato
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {client.files.map(file => (
                <div key={file.id} className="group relative bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-indigo-50 transition-colors">
                      {file.type.match(/jpg|jpeg|png/) ? <ImageIcon className="text-indigo-600" /> : <Code className="text-indigo-600" />}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewingFile(file)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 truncate mb-1">{file.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{file.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visor de Archivos / Snippets */}
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
                <div className="flex-1 overflow-auto p-8 bg-slate-950">
                  {viewingFile.type.match(/jpg|jpeg|png/) ? (
                    <img src={viewingFile.content} className="max-w-full mx-auto" />
                  ) : (
                    <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
                      <code>{viewingFile.content}</code>
                    </pre>
                  )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                   <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                    <Download size={14} /> Descargar
                   </button>
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
