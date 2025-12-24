
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Map, Users, Menu, X, 
  MapPin, Sparkles, UserCircle, Plus, Wallet, CreditCard, Calendar, FolderPlus
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import DivisionView from './components/DivisionView';
import ClientProfile from './components/ClientProfile';
import Profile from './components/Profile';
import AIConsultant from './components/AIConsultant';
import { Client, Lot, UserProfile, Payment, PaymentMethod, PaymentSchedule, LotHistoryEvent } from './types';

const INITIAL_DIVISIONS_LIST: string[] = [
  'San Rafael', 'Colonia Pedregal', 'Área Monte Bello', 
  'Unidad Lomas', 'Colonia Unión', 'Colonia Cabañas'
];

const STORAGE_KEY = 'inmobiliaria_app_data_v2';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'client' | 'profile'>('dashboard');
  const [selectedDivision, setSelectedDivision] = useState<string>(INITIAL_DIVISIONS_LIST[0]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIContextOpen, setIsAIContextOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddDivisionModalOpen, setIsAddDivisionModalOpen] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState('');

  // Estado persistente de divisiones
  const [divisions, setDivisions] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved).divisions || INITIAL_DIVISIONS_LIST;
    return INITIAL_DIVISIONS_LIST;
  });

  // Estado persistente
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved).userProfile;
    return {
      name: 'Administrador Inmobiliaria',
      role: 'Director de Ventas',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      email: 'admin@inmobiliaria.com',
      files: [],
      personalPaymentGoal: 50000
    };
  });

  const [personalPayments, setPersonalPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved).personalPayments;
    return [];
  });

  const [lotsByDivision, setLotsByDivision] = useState<Record<string, Lot[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved).lotsByDivision;
    
    const initial: Record<string, Lot[]> = {};
    INITIAL_DIVISIONS_LIST.forEach(d => initial[d] = []);

    // Datos específicos para Colonia Unión basados en la topografía proporcionada
    // Normalización de coordenadas para visualización 0-100
    initial['Colonia Unión'] = [{
      id: 'lot-union-topo',
      number: 'Macro-1',
      price: 1250000,
      status: 'disponible',
      // Centroide aproximado para el marcador
      x: 35.75,
      y: 44.02,
      boundary: [
        { x: 90.0, y: 30.8 }, // Vértice 1 (basado en coord del punto 4-1)
        { x: 21.1, y: 90.0 }, // Vértice 2
        { x: 10.0, y: 44.5 }, // Vértice 3
        { x: 21.8, y: 10.0 }  // Vértice 4
      ],
      history: [{
        id: 'h1',
        timestamp: new Date().toISOString(),
        action: 'CREACION',
        description: 'Lote creado con datos topográficos de precisión: Rumbos EST-PV y Coordenadas UTM.'
      }]
    }];

    return initial;
  });

  const [divisionMaps, setDivisionMaps] = useState<Record<string, string | null>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved).divisionMaps;
    const initial: Record<string, string | null> = {};
    INITIAL_DIVISIONS_LIST.forEach(d => initial[d] = null);
    return initial;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved).clients;
    return [];
  });

  useEffect(() => {
    try {
      const dataToSave = {
        userProfile,
        personalPayments,
        lotsByDivision,
        divisionMaps,
        clients,
        divisions
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage full');
      }
    }
  }, [userProfile, personalPayments, lotsByDivision, divisionMaps, clients, divisions]);

  const createHistoryEvent = (action: LotHistoryEvent['action'], description: string): LotHistoryEvent => ({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    action,
    description
  });

  const handleAddDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivisionName.trim() || divisions.includes(newDivisionName)) return;

    const name = newDivisionName.trim();
    setDivisions(prev => [...prev, name]);
    setLotsByDivision(prev => ({ ...prev, [name]: [] }));
    setDivisionMaps(prev => ({ ...prev, [name]: null }));
    setSelectedDivision(name);
    setActiveTab('inventory');
    setNewDivisionName('');
    setIsAddDivisionModalOpen(false);
  };

  const handleAddLot = (division: string, newLot: Lot) => {
    const lotWithHistory = {
      ...newLot,
      history: [createHistoryEvent('CREACION', `Lote ${newLot.number} creado en el plano.`)]
    };
    setLotsByDivision(prev => ({ ...prev, [division]: [...prev[division], lotWithHistory] }));
  };

  const handleUpdateLot = (division: string, updatedLot: Lot) => {
    setLotsByDivision(prev => {
      const divisionLots = prev[division] || [];
      const oldLot = divisionLots.find(l => l.id === updatedLot.id);
      let historyEvent: LotHistoryEvent | null = null;

      if (oldLot) {
        if (oldLot.status !== updatedLot.status) {
          historyEvent = createHistoryEvent('CAMBIO_ESTADO', `Estado cambiado de ${oldLot.status} a ${updatedLot.status}.`);
        } else if (oldLot.price !== updatedLot.price) {
          historyEvent = createHistoryEvent('CAMBIO_PRECIO', `Precio actualizado de $${oldLot.price.toLocaleString()} a $${updatedLot.price.toLocaleString()}.`);
        } else if (!updatedLot.boundary && oldLot.boundary) {
          historyEvent = createHistoryEvent('ELIMINACION_AREA', `Se eliminó la delimitación poligonal del lote.`);
        }
      }

      const finalLot = historyEvent 
        ? { ...updatedLot, history: [historyEvent, ...(updatedLot.history || [])] }
        : updatedLot;

      return {
        ...prev,
        [division]: divisionLots.map(l => l.id === updatedLot.id ? finalLot : l)
      };
    });
  };

  const handleAddFile = (clientId: string, file: any) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, files: [file, ...c.files] } : c));
  };

  const handleRegisterClientPayment = (clientId: string, payment: Omit<PaymentSchedule, 'id'>) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          payments: [...c.payments, { ...payment, id: Math.random().toString(36).substr(2, 9) }]
        };
      }
      return c;
    }));
  };

  const handleUpdateClientPaymentStatus = (clientId: string, paymentId: string, status: 'pagado' | 'pendiente' | 'atrasado') => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          payments: c.payments.map(p => p.id === paymentId ? { ...p, status } : p)
        };
      }
      return c;
    }));
  };

  const handleProfileFileUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.name.split('.').pop() || 'file',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toLocaleDateString()
      };
      setUserProfile(prev => ({ ...prev, files: [newFile, ...prev.files] }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddClient = (clientData: Omit<Client, 'id' | 'payments' | 'files'>) => {
    const clientId = Math.random().toString(36).substr(2, 9);
    const newClient: Client = {
      ...clientData,
      id: clientId,
      payments: [
        { 
          id: Math.random().toString(36).substr(2, 5), 
          amount: (clientData.totalAmount - clientData.downPayment) / 12, 
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], 
          status: 'pendiente' 
        }
      ],
      files: []
    };

    setLotsByDivision(prev => {
      const divisionLots = prev[clientData.division] || [];
      const historyEvent = createHistoryEvent('ASIGNACION_CLIENTE', `Cliente ${clientData.name} asignado al lote. Venta formalizada.`);
      
      const updatedLots = divisionLots.map(l => 
        l.number === clientData.lotId 
          ? { 
              ...l, 
              status: 'vendido' as const, 
              clientId, 
              history: [historyEvent, ...(l.history || []), createHistoryEvent('CAMBIO_ESTADO', 'Estado actualizado a vendido por venta formalizada.')] 
            } 
          : l
      );
      return { ...prev, [clientData.division]: updatedLots };
    });

    setClients(prev => [newClient, ...prev]);
    setIsAddClientModalOpen(false);
  };

  const handleAddPersonalPayment = (payment: Omit<Payment, 'id'>) => {
    setPersonalPayments(prev => [{ ...payment, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
  };

  const handleSetDivisionMap = (division: string, mapUrl: string | null) => {
    setDivisionMaps(prev => ({ ...prev, [division]: mapUrl }));
  };

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} bg-slate-900 text-slate-300 transition-all duration-300 overflow-hidden flex flex-col shrink-0 relative z-50`}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">I</div>
            <span className="text-xl font-bold text-white tracking-tight">Inmobiliaria</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto excel-scroll">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-4">Menu</p>
            <NavItem icon={<LayoutDashboard size={20} />} label="Tablero de Control" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<UserCircle size={20} />} label="Mi Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Zonas Geográficas</p>
              <button 
                onClick={() => setIsAddDivisionModalOpen(true)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                title="Nueva Zona"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {divisions.map(div => (
                <button key={div} onClick={() => { setSelectedDivision(div); setActiveTab('inventory'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${activeTab === 'inventory' && selectedDivision === div ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <MapPin size={16} className={activeTab === 'inventory' && selectedDivision === div ? 'text-indigo-200' : 'text-slate-500'} />
                  <span className="truncate">{div}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAIContextOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-100 hover:bg-indigo-100 transition-all">
              <Sparkles size={18} />
              Consultar IA
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all" onClick={() => setActiveTab('profile')}>
              <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 excel-scroll bg-slate-50/50">
          {activeTab === 'dashboard' && (
            <Dashboard 
              clients={clients} 
              onSelectClient={(id) => { setSelectedClientId(id); setActiveTab('client'); }} 
              lotsByDivision={lotsByDivision} 
              onAddClient={() => setIsAddClientModalOpen(true)}
            />
          )}
          {activeTab === 'inventory' && (
            <DivisionView 
              divisionName={selectedDivision} 
              clients={clients} 
              lots={lotsByDivision[selectedDivision] || []} 
              onAddLot={(lot) => handleAddLot(selectedDivision, lot)} 
              onUpdateLot={(lot) => handleUpdateLot(selectedDivision, lot)} 
              onSelectClient={(id) => { setSelectedClientId(id); setActiveTab('client'); }}
              mapImage={divisionMaps[selectedDivision]}
              onSetMapImage={(url) => handleSetDivisionMap(selectedDivision, url)}
              onAddClient={() => setIsAddClientModalOpen(true)}
            />
          )}
          {activeTab === 'client' && selectedClient && (
            <ClientProfile 
              client={selectedClient} 
              onAddFile={handleAddFile} 
              onRegisterPayment={handleRegisterClientPayment}
              onUpdatePaymentStatus={handleUpdateClientPaymentStatus}
              onBack={() => setActiveTab('inventory')} 
            />
          )}
          {activeTab === 'profile' && (
            <Profile 
              profile={userProfile} 
              setProfile={setUserProfile} 
              onFileUpload={handleProfileFileUpload} 
              payments={personalPayments}
              onAddPayment={handleAddPersonalPayment}
            />
          )}
        </div>

        {/* Modal Añadir Zona */}
        {isAddDivisionModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-slideUp">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FolderPlus size={20} /></div>
                  <h3 className="font-black text-slate-800 tracking-tight">Expandir Territorio</h3>
                </div>
                <button onClick={() => setIsAddDivisionModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddDivision} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Nombre de la Nueva Zona</label>
                  <input 
                    required 
                    autoFocus
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" 
                    placeholder="Ej. Bosques del Valle"
                    value={newDivisionName}
                    onChange={e => setNewDivisionName(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
                  Crear Zona de Desarrollo
                </button>
              </form>
            </div>
          </div>
        )}

        {isAddClientModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24} /></div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Registro de Venta y Apartado</h3>
                </div>
                <button onClick={() => setIsAddClientModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form 
                className="p-8 space-y-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddClient({
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    phone: formData.get('phone') as string,
                    division: formData.get('division') as string,
                    lotId: formData.get('lotId') as string,
                    registrationDate: formData.get('registrationDate') as string,
                    totalAmount: Number(formData.get('totalAmount')),
                    downPayment: Number(formData.get('downPayment')),
                    paymentMethod: formData.get('paymentMethod') as PaymentMethod,
                  });
                }}
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Nombre del Titular</label>
                    <input name="name" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Nombre completo" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Email</label>
                    <input name="email" type="email" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="correo@dominio.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Teléfono</label>
                    <input name="phone" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="55 0000 0000" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Fecha de Registro</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input name="registrationDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Zona Seleccionada</label>
                    <select name="division" defaultValue={selectedDivision} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                      {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Identificador de Lote</label>
                    <input name="lotId" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Ej. L-101" />
                  </div>

                  <div className="col-span-2 h-px bg-slate-100 my-2"></div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Monto Total de Operación</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input name="totalAmount" type="number" required className="w-full pl-8 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-600" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Anticipo / Enganche</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input name="downPayment" type="number" required className="w-full pl-8 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-600" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Método de Pago Inicial</label>
                    <div className="grid grid-cols-4 gap-3">
                      {['transferencia', 'efectivo', 'credito', 'cheque'].map(method => (
                        <label key={method} className="cursor-pointer">
                          <input type="radio" name="paymentMethod" value={method} className="hidden peer" defaultChecked={method === 'transferencia'} />
                          <div className="py-2.5 text-center bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition-all">
                            {method}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  <CreditCard size={18} /> Formalizar Venta
                </button>
              </form>
            </div>
          </div>
        )}

        <AIConsultant isOpen={isAIContextOpen} onClose={() => setIsAIContextOpen(false)} clients={clients} />
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg font-medium' : 'hover:bg-slate-800'}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default App;
