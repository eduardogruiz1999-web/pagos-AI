
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Map, Users, Wallet, Bell, Search, Menu, X, 
  MapPin, Landmark, Filter, Plus, PieChart, FileCode, Image as ImageIcon, Sparkles
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import DivisionView from './components/DivisionView';
import ClientProfile from './components/ClientProfile';
import AIConsultant from './components/AIConsultant';
// Fix: removed 'Division' from the import list as it's not exported from types.ts and unused here.
import { Client, Lot, LotStatus } from './types';

const INITIAL_DIVISIONS: string[] = [
  'San Rafael', 'Colonia Pedregal', 'Área Monte Bello', 
  'Unidad Lomas', 'Colonia Unión', 'Colonia Cabañas'
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'client'>('dashboard');
  const [selectedDivision, setSelectedDivision] = useState<string>(INITIAL_DIVISIONS[0]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIContextOpen, setIsAIContextOpen] = useState(false);

  const [lotsByDivision, setLotsByDivision] = useState<Record<string, Lot[]>>({
    'San Rafael': [], 'Colonia Pedregal': [], 'Área Monte Bello': [], 
    'Unidad Lomas': [], 'Colonia Unión': [], 'Colonia Cabañas': []
  });

  const [clients, setClients] = useState<Client[]>([
    {
      id: 'c1',
      name: 'Roberto Gómez',
      email: 'roberto@email.com',
      phone: '555-0102',
      division: 'San Rafael',
      lotId: 'L-101',
      payments: [
        { id: 'p1', amount: 5000, dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], status: 'pendiente' },
        { id: 'p2', amount: 5000, dueDate: '2023-08-01', status: 'pagado' }
      ],
      files: []
    },
    {
      id: 'c2',
      name: 'Elena Martínez',
      email: 'elena.m@email.com',
      phone: '555-0199',
      division: 'Colonia Pedregal',
      lotId: 'P-202',
      payments: [
        { id: 'p3', amount: 3500, dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: 'atrasado' }
      ],
      files: []
    }
  ]);

  const handleAddLot = (division: string, newLot: Lot) => {
    setLotsByDivision(prev => ({ ...prev, [division]: [...prev[division], newLot] }));
  };

  const handleUpdateLot = (division: string, updatedLot: Lot) => {
    setLotsByDivision(prev => ({ ...prev, [division]: prev[division].map(l => l.id === updatedLot.id ? updatedLot : l) }));
  };

  const handleAddFile = (clientId: string, file: any) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, files: [file, ...c.files] } : c));
  };

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} bg-indigo-950 text-slate-300 transition-all duration-300 overflow-hidden flex flex-col shrink-0 relative z-50`}>
        <div className="p-6 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">T</div>
            <span className="text-xl font-bold text-white tracking-tight">Terranova</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3 px-4">Principal</p>
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3 px-4">Divisiones</p>
            <div className="space-y-1">
              {INITIAL_DIVISIONS.map(div => (
                <button key={div} onClick={() => { setSelectedDivision(div); setActiveTab('inventory'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${activeTab === 'inventory' && selectedDivision === div ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-900/50 hover:text-white'}`}>
                  <MapPin size={16} className={activeTab === 'inventory' && selectedDivision === div ? 'text-indigo-200' : 'text-indigo-500'} />
                  {div}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAIContextOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-100 hover:bg-indigo-100 transition-all">
              <Sparkles size={18} />
              Consultar IA
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 excel-scroll bg-slate-50/50">
          {activeTab === 'dashboard' && <Dashboard clients={clients} onSelectClient={(id) => { setSelectedClientId(id); setActiveTab('client'); }} lotsByDivision={lotsByDivision} />}
          {activeTab === 'inventory' && <DivisionView divisionName={selectedDivision} clients={clients.filter(c => c.division === selectedDivision)} lots={lotsByDivision[selectedDivision]} onAddLot={(lot) => handleAddLot(selectedDivision, lot)} onUpdateLot={(lot) => handleUpdateLot(selectedDivision, lot)} onSelectClient={(id) => { setSelectedClientId(id); setActiveTab('client'); }} />}
          {activeTab === 'client' && selectedClient && <ClientProfile client={selectedClient} onAddFile={handleAddFile} onBack={() => setActiveTab('inventory')} />}
        </div>

        {/* Floating AI Button */}
        {!isAIContextOpen && (
          <button 
            onClick={() => setIsAIContextOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[90]"
          >
            <Sparkles size={28} />
          </button>
        )}

        <AIConsultant 
          isOpen={isAIContextOpen} 
          onClose={() => setIsAIContextOpen(false)} 
          clients={clients} 
        />
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-medium' : 'hover:bg-indigo-900/50'}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default App;
