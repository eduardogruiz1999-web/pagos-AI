
import React, { useState } from 'react';
import { UserProfile, UserFile, Payment } from '../types';
// Fixed missing 'Clock' import
import { Camera, Mail, Shield, Plus, FileText, Download, Trash2, Settings, Target, BarChart3, UploadCloud, Clock } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onFileUpload: (file: File) => void;
  payments: Payment[];
}

const Profile: React.FC<ProfileProps> = ({ profile, setProfile, onFileUpload, payments }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'docs' | 'goals'>('info');

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

  const progress = Math.min(100, (payments.reduce((acc, p) => acc + (p.status === 'completado' ? p.amount : 0), 0) / profile.personalPaymentGoal) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Profile Banner/Header */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors backdrop-blur-md">
            <Camera size={20} />
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col items-center -mt-16 sm:flex-row sm:items-end sm:gap-6 sm:-mt-12">
          <div className="relative">
            <img 
              src={profile.avatar} 
              alt="Avatar" 
              className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl bg-white object-cover" 
            />
            <label className="absolute bottom-2 right-2 p-2 bg-indigo-600 rounded-xl text-white shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="mt-4 sm:mt-0 flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
            <p className="text-slate-500 font-medium">{profile.role}</p>
          </div>
          <div className="mt-6 sm:mt-0 flex gap-2">
            <button className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
              <Settings size={18} />
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="border-t border-slate-100 px-8">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('info')}
              className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Información General
            </button>
            <button 
              onClick={() => setActiveTab('docs')}
              className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'docs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Documentos & Archivos
            </button>
            <button 
              onClick={() => setActiveTab('goals')}
              className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'goals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Control de Pagos
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-lg text-slate-800 mb-2">Datos de Contacto</h3>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Correo Electrónico</p>
                  <p className="text-slate-700 font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rol de Acceso</p>
                  <p className="text-slate-700 font-medium">{profile.role}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-6">Seguridad</h3>
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Mantén tu cuenta segura habilitando la autenticación de dos pasos o cambiando tu contraseña periódicamente.</p>
                <button className="w-full py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                  Cambiar Contraseña
                </button>
                <button className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-colors">
                  Configurar 2FA
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Repositorio de Documentos</h3>
                <p className="text-sm text-slate-500">Sube comprobantes, identificaciones o contratos.</p>
              </div>
              <label className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                <Plus size={18} />
                Subir Archivo
                <input type="file" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
            
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.files.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center text-slate-400">
                  <UploadCloud size={48} className="mb-4 opacity-20" />
                  <p>No hay archivos cargados aún.</p>
                </div>
              ) : (
                profile.files.map((file) => (
                  <div key={file.id} className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                        <FileText className="text-indigo-600" size={24} />
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Download size={16} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>{file.type}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">Subido el {file.uploadDate}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Control Personal de Pagos</h3>
                  <p className="text-sm text-slate-500">Seguimiento de tu meta de ahorro o gasto mensual.</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                  <Target size={24} />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">Progreso de Meta: ${profile.personalPaymentGoal}</span>
                    <span className="text-sm font-bold text-indigo-600">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-1000 ease-out rounded-full shadow-inner shadow-indigo-400/20"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                      <BarChart3 size={16} />
                      <span className="text-xs font-bold uppercase">Ejecutado</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-800">
                      ${payments.reduce((acc, p) => acc + (p.status === 'completado' ? p.amount : 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Clock size={16} />
                      <span className="text-xs font-bold uppercase">Por Pagar</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                      ${payments.reduce((acc, p) => acc + (p.status !== 'completado' ? p.amount : 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={() => {
                            const newGoal = prompt("Introduce tu nueva meta mensual de pagos:", profile.personalPaymentGoal.toString());
                            if(newGoal) setProfile({...profile, personalPaymentGoal: parseInt(newGoal)});
                        }}
                        className="text-sm text-indigo-600 font-bold hover:underline"
                    >
                        Configurar meta mensual
                    </button>
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
