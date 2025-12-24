
import React, { useState } from 'react';
import { UserProfile, UserFile, Payment } from '../types';
import { Camera, Mail, Shield, Plus, FileText, Download, Trash2, Settings, Target, BarChart3, UploadCloud, Clock, Landmark, X, CreditCard } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onFileUpload: (file: File) => void;
  payments: Payment[];
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, setProfile, onFileUpload, payments, onAddPayment }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'docs' | 'goals'>('info');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<Omit<Payment, 'id'>>({
    concept: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'completado',
    category: 'Vivienda'
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfile(prev => ({ ...prev, avatar: url }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayment.concept && newPayment.amount > 0) {
      onAddPayment(newPayment);
      setNewPayment({
        concept: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'completado',
        category: 'Vivienda'
      });
      setIsAddingPayment(false);
    }
  };

  const totalExecuted = payments.reduce((acc, p) => acc + (p.status === 'completado' ? p.amount : 0), 0);
  const progress = Math.min(100, (totalExecuted / profile.personalPaymentGoal) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn">
      {/* Dynamic Profile Header */}
      <div className="bg-white rounded-[3rem] border-4 border-slate-100 overflow-hidden shadow-2xl relative">
        <div className="h-40 bg-slate-900 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
          <button className="absolute bottom-6 right-8 bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-colors backdrop-blur-xl border border-white/20">
            <Settings size={20} />
          </button>
        </div>
        <div className="px-12 pb-10 flex flex-col items-center -mt-20 sm:flex-row sm:items-end sm:gap-10 sm:-mt-16 relative z-10">
          <div className="relative group">
            <img 
              src={profile.avatar} 
              alt="Avatar" 
              className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white shadow-2xl bg-slate-50 object-cover transform group-hover:scale-[1.02] transition-transform" 
            />
            <label className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110">
              <Camera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="mt-6 sm:mt-0 flex-1 text-center sm:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
            <p className="text-indigo-600 font-black uppercase tracking-widest text-[10px] bg-indigo-50 px-3 py-1 rounded-full w-fit mt-2 mx-auto sm:mx-0">{profile.role}</p>
          </div>
          <div className="mt-8 sm:mt-0 flex gap-4">
             <div className="text-center p-4 bg-slate-50 rounded-3xl border border-slate-100 min-w-[120px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Archivos</p>
                <p className="text-xl font-black text-slate-900">{profile.files.length}</p>
             </div>
             <div className="text-center p-4 bg-slate-50 rounded-3xl border border-slate-100 min-w-[120px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Pagos Reg.</p>
                <p className="text-xl font-black text-slate-900">{payments.length}</p>
             </div>
          </div>
        </div>

        <div className="border-t-2 border-slate-100 px-12 bg-slate-50/20">
          <div className="flex gap-10">
            {['info', 'docs', 'goals'].map((t) => (
              <button 
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`py-6 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {t === 'info' ? 'Account Details' : t === 'docs' ? 'Document Vault' : 'Financial Control'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
              <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                 Direct Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-indigo-200 transition-all">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm group-hover:text-indigo-600 group-hover:rotate-6 transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Business Email</p>
                    <p className="text-slate-800 font-bold">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-indigo-200 transition-all">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm group-hover:text-indigo-600 group-hover:rotate-6 transition-all">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Access Level</p>
                    <p className="text-slate-800 font-bold">{profile.role}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full"></div>
              <h3 className="font-black text-xl uppercase tracking-tight mb-6 flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-white rounded-full"></div>
                 Security Hub
              </h3>
              <div className="space-y-5">
                <p className="text-sm text-slate-400 font-medium">Protect your administrative credentials. Last security audit: Yesterday.</p>
                <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all">
                  Update Password
                </button>
                <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all">
                  Enable 2FA Auth
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Digital Vault</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Encrypted storage for sensitive documentation</p>
              </div>
              <label className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-black shadow-xl transition-all">
                <Plus size={18} />
                Upload New File
                <input type="file" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
            
            <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.files.length === 0 ? (
                <div className="col-span-full py-32 flex flex-col items-center text-slate-300">
                  <UploadCloud size={64} className="mb-6 opacity-10" />
                  <p className="font-black uppercase tracking-widest text-[10px]">Your repository is empty</p>
                </div>
              ) : (
                profile.files.map((file) => (
                  <div key={file.id} className="p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:bg-white hover:border-indigo-100 hover:shadow-2xl transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <FileText size={24} />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 transition-all">
                          <Download size={18} />
                        </button>
                        <button className="p-2 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm border border-slate-100 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="font-black text-slate-900 truncate text-sm mb-1">{file.name}</p>
                      <div className="flex items-center gap-3 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm">{file.type}</span>
                        <span>{file.size}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Ledger Control</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Monthly collection goal & budget execution</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsAddingPayment(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    <CreditCard size={18} />
                    Log Transaction
                  </button>
                </div>
              </div>

              {isAddingPayment && (
                <div className="mb-10 p-8 bg-indigo-50/50 border-2 border-indigo-100 rounded-[2rem] animate-slideDown shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Transaction Entry</h4>
                    <button onClick={() => setIsAddingPayment(false)} className="p-2 text-indigo-400 hover:text-indigo-600"><X size={24}/></button>
                  </div>
                  <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-indigo-400 ml-1">Concept</label>
                       <input 
                        className="w-full px-5 py-3 bg-white border border-indigo-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                        placeholder="Ej. Office Rent"
                        value={newPayment.concept}
                        onChange={e => setNewPayment({...newPayment, concept: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-indigo-400 ml-1">Amount ($)</label>
                       <input 
                        type="number"
                        className="w-full px-5 py-3 bg-white border border-indigo-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                        placeholder="0.00"
                        value={newPayment.amount || ''}
                        onChange={e => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-indigo-400 ml-1">Category</label>
                       <select 
                        className="w-full px-5 py-3 bg-white border border-indigo-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                        value={newPayment.category}
                        onChange={e => setNewPayment({...newPayment, category: e.target.value})}
                      >
                        <option>Vivienda</option>
                        <option>Servicios</option>
                        <option>Inversión</option>
                        <option>Gasto Op.</option>
                      </select>
                    </div>
                    <button className="mt-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl py-3 shadow-lg hover:bg-indigo-700 transition-all">Submit Entry</button>
                  </form>
                </div>
              )}

              <div className="space-y-10">
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Budget Execution Progress</span>
                    <span className={`text-sm font-black ${progress > 90 ? 'text-rose-600' : 'text-indigo-600'}`}>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-6 bg-white rounded-full overflow-hidden border-2 border-slate-100 p-1">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out rounded-full shadow-lg ${progress > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div> Total Logged: ${totalExecuted.toLocaleString()}</span>
                    <span className="flex items-center gap-2">Target Cap: ${profile.personalPaymentGoal.toLocaleString()} <button onClick={() => {
                          const newGoal = prompt("Introduce tu nueva meta mensual:", profile.personalPaymentGoal.toString());
                          if(newGoal) setProfile({...profile, personalPaymentGoal: parseInt(newGoal)});
                      }} className="text-indigo-600 hover:underline">Edit</button></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between group hover:bg-emerald-100/50 transition-all">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <BarChart3 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Net Outflow</span>
                      </div>
                      <p className="text-3xl font-black text-slate-900">${totalExecuted.toLocaleString()}</p>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-xl group-hover:rotate-6 transition-all"><Landmark size={32}/></div>
                  </div>
                  <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between group">
                    <div>
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Target size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Available Budget</span>
                      </div>
                      <p className="text-3xl font-black text-white">
                        ${Math.max(0, profile.personalPaymentGoal - totalExecuted).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-all"><Target size={32}/></div>
                  </div>
                </div>

                {/* Optimized Excel-style Ledger for personal payments */}
                <div className="mt-10 overflow-hidden rounded-[2.5rem] border-4 border-slate-50 shadow-inner">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/80 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-8 py-5 border-r border-slate-200">Transaction ID</th>
                        <th className="px-8 py-5 border-r border-slate-200">Concept</th>
                        <th className="px-8 py-5 border-r border-slate-200">Class</th>
                        <th className="px-8 py-5 border-r border-slate-200">Log Date</th>
                        <th className="px-8 py-5 text-right">Debit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700 bg-white">
                      {payments.length > 0 ? payments.map((p) => (
                        <tr key={p.id} className="hover:bg-indigo-50/30 transition-all">
                          <td className="px-8 py-5 border-r border-slate-50 text-[9px] font-mono text-slate-300 uppercase">{p.id}</td>
                          <td className="px-8 py-5 border-r border-slate-50 text-slate-900 font-black">{p.concept}</td>
                          <td className="px-8 py-5 border-r border-slate-50">
                            <span className="bg-white border-2 border-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">{p.category}</span>
                          </td>
                          <td className="px-8 py-5 border-r border-slate-50 text-slate-400 font-bold uppercase">{p.date}</td>
                          <td className="px-8 py-5 text-right font-black text-slate-900 text-sm">-${p.amount.toLocaleString()}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-8 py-32 text-center text-slate-300 italic">
                             <CreditCard size={48} className="mx-auto mb-6 opacity-10" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Zero historical transactions recorded</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
