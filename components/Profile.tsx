
import React, { useState } from 'react';
import { UserProfile, UserFile, Payment } from '../types';
import { 
  Camera, Mail, Shield, Plus, FileText, Download, Trash2, Settings, Target, 
  BarChart3, UploadCloud, Clock, Landmark, X, CreditCard, ChevronRight,
  TrendingUp, AlertCircle, CheckCircle2, DollarSign, Loader2, Coins
} from 'lucide-react';

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
  const [isUploading, setIsUploading] = useState(false);
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
      setIsUploading(true);
      // Simulamos latencia de red para mejor feedback visual
      setTimeout(() => {
        onFileUpload(e.target.files![0]);
        setIsUploading(false);
      }, 800);
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
  const budgetAlert = progress > 90;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pb-20">
      {/* Profile Header Block */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl">
        <div className="h-56 bg-slate-900 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-black/40"></div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <button className="absolute bottom-8 right-10 bg-white/10 hover:bg-white text-white hover:text-slate-900 p-4 rounded-2xl transition-all backdrop-blur-md border border-white/20 shadow-xl group">
            <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
        
        <div className="px-16 pb-12 flex flex-col md:flex-row items-center md:items-end gap-10 -mt-24 relative z-20">
          <div className="relative group">
            <div className="w-48 h-48 rounded-[3rem] border-[10px] border-white shadow-2xl bg-slate-100 overflow-hidden">
              <img 
                src={profile.avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
            </div>
            <label className="absolute bottom-2 right-2 p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 border-4 border-white">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          
          <div className="flex-1 text-center md:text-left pt-6">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-3">{profile.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">{profile.role}</span>
              <span className="px-5 py-2 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100">Verified Identity</span>
            </div>
          </div>
          
          <div className="flex gap-4">
             <StatMiniCard label="Data Assets" value={profile.files.length.toString()} />
             <StatMiniCard label="Ledger Entries" value={payments.length.toString()} />
          </div>
        </div>

        <div className="border-t border-slate-100 px-16 bg-slate-50/40">
          <div className="flex gap-12">
            {[
              { id: 'info', label: 'Identity Briefing', icon: <Shield size={16} /> },
              { id: 'docs', label: 'Document Cloud', icon: <UploadCloud size={16} /> },
              { id: 'goals', label: 'Fiscal Ledger', icon: <Target size={16} /> }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-8 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] border-b-4 transition-all ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[600px] animate-fadeIn">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                <div className="w-2 h-10 bg-indigo-600 rounded-full"></div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Registry Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem icon={<Mail className="text-indigo-600" />} label="Corporate Email" value={profile.email} />
                <InfoItem icon={<Shield className="text-indigo-600" />} label="Security clearance" value={profile.role} />
                <InfoItem icon={<Clock className="text-indigo-600" />} label="Last Session" value="Active Now" />
                <InfoItem icon={<Landmark className="text-indigo-600" />} label="Entity Code" value="#ADM-TX-2025" />
              </div>
            </div>

            <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 blur-[60px] rounded-full group-hover:bg-indigo-600/40 transition-all duration-700"></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                   Security Protocol
                </h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">
                  Ensure your administrative access is restricted. Periodical password rotation is enforced for compliance.
                </p>
              </div>
              <div className="space-y-4">
                <button className="w-full py-5 bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all">
                  Rotate Access Key
                </button>
                <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 rounded-[1.5rem] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/40 transition-all flex items-center justify-center gap-3">
                  <Shield size={16} /> Update 2FA Vault
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Documentary Core</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Personal cloud for legal and fiscal records</p>
              </div>
              <div className="flex gap-4">
                <label className={`flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-widest cursor-pointer hover:bg-black shadow-2xl transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                  {isUploading ? 'Injecting Data...' : 'Store New Asset'}
                  <input type="file" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
                </label>
              </div>
            </div>
            
            <div className="p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {profile.files.length === 0 ? (
                <div className="col-span-full py-40 flex flex-col items-center text-slate-200">
                  <UploadCloud size={80} className="mb-8 opacity-20" />
                  <p className="font-black uppercase tracking-[0.3em] text-[10px]">Vault empty: No assets detected</p>
                </div>
              ) : (
                profile.files.map((file) => (
                  <div key={file.id} className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:border-indigo-600 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-8">
                      <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem] shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <FileText size={28} />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 transition-all"><Download size={18} /></button>
                        <button className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl shadow-sm border border-slate-100 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 truncate text-sm mb-2" title={file.name}>{file.name}</h4>
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">{file.type}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {file.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-12">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Unified Fiscal Ledger</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Personal expenditure control and capital allocation</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end mr-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
                    <span className={`text-xs font-black uppercase ${budgetAlert ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {budgetAlert ? 'Over Cap Threshold' : 'Within Safety Limits'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsAddingPayment(true)}
                    className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:-translate-y-1"
                  >
                    <Plus size={18} /> Log Capital Entry
                  </button>
                </div>
              </div>

              {isAddingPayment && (
                <div className="mb-12 p-10 bg-slate-50 border-2 border-indigo-100 rounded-[3rem] animate-slideDown shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6">
                    <button onClick={() => setIsAddingPayment(false)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all shadow-sm"><X size={24}/></button>
                  </div>
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-8 flex items-center gap-3">
                    <div className="w-2 h-6 bg-indigo-600 rounded-full"></div> New Transaction Registry
                  </h4>
                  <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FormGroup label="Description" icon={<FileText size={16}/>}>
                       <input 
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-500 font-bold transition-all"
                        placeholder="Ej. Office Operations"
                        value={newPayment.concept}
                        onChange={e => setNewPayment({...newPayment, concept: e.target.value})}
                        required
                      />
                    </FormGroup>
                    <FormGroup label="Amount (USD)" icon={<DollarSign size={16}/>}>
                       <input 
                        type="number"
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-500 font-bold transition-all text-indigo-600"
                        placeholder="0.00"
                        value={newPayment.amount || ''}
                        onChange={e => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                        required
                      />
                    </FormGroup>
                    <FormGroup label="Asset Category" icon={<BarChart3 size={16}/>}>
                       <select 
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-500 font-bold transition-all appearance-none"
                        value={newPayment.category}
                        onChange={e => setNewPayment({...newPayment, category: e.target.value})}
                      >
                        <option>Real Estate</option>
                        <option>Operational Expense</option>
                        <option>Fixed Services</option>
                        <option>Strategic Investment</option>
                        <option>Personnel</option>
                      </select>
                    </FormGroup>
                    <div className="flex items-end">
                      <button className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                        Verify & Commit <ChevronRight size={14} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                <div className="xl:col-span-1 space-y-8">
                  <div className={`p-10 rounded-[3rem] border-4 transition-all duration-500 ${budgetAlert ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Budget Burn</span>
                        <p className={`text-4xl font-black tracking-tighter ${budgetAlert ? 'text-rose-600' : 'text-indigo-600'}`}>{progress.toFixed(1)}%</p>
                      </div>
                      <div className={`p-4 rounded-2xl bg-white shadow-xl ${budgetAlert ? 'text-rose-600' : 'text-indigo-600'}`}>
                        {budgetAlert ? <AlertCircle size={32} /> : <TrendingUp size={32} />}
                      </div>
                    </div>
                    <div className="h-6 bg-white rounded-full overflow-hidden border-2 border-slate-200 p-1 mb-8 shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full shadow-lg ${budgetAlert ? 'bg-rose-500' : 'bg-indigo-600'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="space-y-4">
                      <BudgetStat label="Logged Flow" value={`$${totalExecuted.toLocaleString()}`} icon={<CheckCircle2 size={14}/>} />
                      <BudgetStat label="Target Cap" value={`$${profile.personalPaymentGoal.toLocaleString()}`} icon={<Target size={14}/>} />
                      <button onClick={() => {
                        const newGoal = prompt("Update monthly budget cap:", profile.personalPaymentGoal.toString());
                        if(newGoal) setProfile({...profile, personalPaymentGoal: parseInt(newGoal)});
                      }} className="w-full mt-4 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors py-2 border border-indigo-100 rounded-xl bg-white/50">Modify Strategic Target</button>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-2 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <LedgerCard label="Total Outflow" value={`$${totalExecuted.toLocaleString()}`} color="bg-indigo-600" icon={<Landmark size={24}/>} />
                    <LedgerCard label="Remaining Delta" value={`$${Math.max(0, profile.personalPaymentGoal - totalExecuted).toLocaleString()}`} color="bg-slate-900" icon={<Coins size={24}/>} inverse />
                  </div>

                  {/* High Density Ledger Table */}
                  <div className="overflow-hidden rounded-[3rem] border-4 border-slate-100 shadow-2xl bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                        <tr>
                          <th className="px-10 py-6 border-r border-slate-100">Tx Hash</th>
                          <th className="px-10 py-6 border-r border-slate-100">Ledger Entry</th>
                          <th className="px-10 py-6 border-r border-slate-100">Classification</th>
                          <th className="px-10 py-6 text-right">Credit Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                        {payments.length > 0 ? payments.map((p) => (
                          <tr key={p.id} className="hover:bg-indigo-50/40 transition-all group">
                            <td className="px-10 py-6 border-r border-slate-50 text-[10px] font-mono text-slate-300 uppercase tracking-tighter">{p.id.substring(0, 8)}</td>
                            <td className="px-10 py-6 border-r border-slate-50 text-slate-900 font-black">{p.concept}</td>
                            <td className="px-10 py-6 border-r border-slate-50">
                              <span className="bg-white border-2 border-slate-100 text-slate-500 px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">{p.category}</span>
                            </td>
                            <td className="px-10 py-6 text-right font-black text-slate-900 text-sm md:text-base tracking-tighter">-${p.amount.toLocaleString()}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-10 py-40 text-center">
                               <CreditCard size={64} className="mx-auto mb-6 text-slate-100" />
                               <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 italic">No capital movements recorded in current cycle</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatMiniCard: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-xl min-w-[140px] text-center group hover:border-indigo-600 transition-all">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

const InfoItem: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all group">
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-slate-800 font-black truncate max-w-[200px]">{value}</p>
    </div>
  </div>
);

const BudgetStat: React.FC<{ label: string, value: string, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight text-slate-500">
    <span className="flex items-center gap-2">{icon} {label}</span>
    <span className="text-slate-900">{value}</span>
  </div>
);

const LedgerCard: React.FC<{ label: string, value: string, color: string, icon: React.ReactNode, inverse?: boolean, trend?: string }> = ({ label, value, color, icon, inverse }) => (
  <div className={`p-10 rounded-[3rem] shadow-2xl flex items-center justify-between group hover:-translate-y-2 transition-all ${inverse ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100'}`}>
    <div>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${inverse ? 'text-slate-400' : 'text-slate-400 group-hover:text-indigo-600'}`}>{label}</p>
      <p className={`text-3xl font-black tracking-tighter ${inverse ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl transition-all group-hover:rotate-12 ${inverse ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
      {icon}
    </div>
  </div>
);

const FormGroup: React.FC<{ label: string, icon: React.ReactNode, children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2 ml-1">
      {icon} {label}
    </label>
    {children}
  </div>
);

export default Profile;
