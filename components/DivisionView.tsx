
import React, { useState, useRef } from 'react';
import { Client, Lot, LotStatus } from '../types';
import { Map as MapIcon, Upload, Users, MousePointer2, X, Plus, Target, Save } from 'lucide-react';

interface DivisionViewProps {
  divisionName: string;
  clients: Client[];
  lots: Lot[];
  onAddLot: (lot: Lot) => void;
  onUpdateLot: (lot: Lot) => void;
  onSelectClient: (id: string) => void;
}

const DivisionView: React.FC<DivisionViewProps> = ({ 
  divisionName, clients, lots, onAddLot, onUpdateLot, onSelectClient 
}) => {
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setMapImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isEditMode || !mapRef.current || !mapImage) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Crear nuevo lote con número predeterminado y estado disponible
    const nextNumber = lots.length + 101;
    const newLot: Lot = {
      id: Math.random().toString(36).substr(2, 9),
      number: `L-${nextNumber}`,
      price: 150000,
      status: 'disponible',
      x,
      y
    };
    
    onAddLot(newLot);
  };

  const getStatusColor = (status: LotStatus) => {
    switch(status) {
      case 'disponible': return 'bg-emerald-500';
      case 'vendido': return 'bg-rose-500';
      case 'reservado': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">{divisionName}</h1>
          <p className="text-slate-500">Haz clic en el plano para sembrar nuevos lotes.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all border-2 ${
              isEditMode 
                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'
            }`}
          >
            <Target size={18} />
            {isEditMode ? 'Finalizar Marcado' : 'Modo Marcado'}
          </button>
          {!mapImage && (
            <label className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold cursor-pointer hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">
              <Upload size={18} />
              Cargar Plano
              <input type="file" className="hidden" onChange={handleMapUpload} accept="image/*" />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
          {/* Instrucciones flotantes */}
          {isEditMode && mapImage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-900/90 text-white px-6 py-2 rounded-full text-xs font-bold animate-slideDown flex items-center gap-2 backdrop-blur-md">
              <Plus size={14} className="animate-pulse" />
              Modo Marcado Activo: Haz clic en el mapa para añadir lotes
            </div>
          )}

          <div 
            className={`relative flex-1 bg-slate-100 min-h-[500px] overflow-hidden ${isEditMode ? 'cursor-crosshair' : 'cursor-default'}`} 
            ref={mapRef} 
            onClick={handleMapClick}
          >
            {mapImage ? (
              <div className="w-full h-full">
                <img src={mapImage} className="w-full h-full object-contain pointer-events-none" alt="Plano" />
                {lots.map(lot => (
                  <div
                    key={lot.id}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if(!isEditMode) setSelectedLot(lot); 
                    }}
                    className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-white shadow-lg transition-all hover:scale-125 flex items-center justify-center text-[9px] font-black text-white ${getStatusColor(lot.status)} ${!isEditMode && 'cursor-pointer'}`}
                    style={{ left: `${lot.x}%`, top: `${lot.y}%` }}
                  >
                    {lot.number.split('-')[1]}
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                <MapIcon size={48} className="opacity-10" />
                <p className="font-bold text-sm">Sube el plano oficial de {divisionName}</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-6 text-[10px] font-bold uppercase text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>Disponible</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>Vendido</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>Reservado</div>
            <div className="flex-1 text-right">Total Lotes: {lots.length}</div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedLot ? (
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl animate-slideUp">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-black">{selectedLot.number}</h4>
                  <p className="text-slate-500 text-xs font-bold uppercase">Gestión de Lote</p>
                </div>
                <button onClick={() => setSelectedLot(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Estado de Venta</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['disponible', 'vendido', 'reservado'] as LotStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => onUpdateLot({...selectedLot, status})}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                          selectedLot.status === status 
                            ? 'bg-white text-slate-900 border-white' 
                            : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Precio de Lista</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input 
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-8 pr-4 text-white font-bold outline-none focus:border-indigo-500 transition-all"
                      value={selectedLot.price}
                      onChange={(e) => onUpdateLot({...selectedLot, price: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Save size={16} /> Guardar Cambios
                  </button>
                  {selectedLot.status === 'vendido' && (
                    <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-xs transition-all">
                      Ver Cliente Asignado
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                Clientes en Zona
              </h3>
              <div className="space-y-3">
                {clients.map(client => (
                  <div 
                    key={client.id}
                    onClick={() => onSelectClient(client.id)}
                    className="p-4 border border-slate-100 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-800 group-hover:text-indigo-600 truncate">{client.name}</p>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-bold text-slate-500 uppercase tracking-wider">
                        {client.lotId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>{client.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DivisionView;
