
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Client, Lot, LotStatus, LotBoundaryPoint } from '../types';
import { 
  Map as MapIcon, Upload, Users, X, Plus, 
  Sparkles, Loader2, DollarSign, Filter, Wallet, Globe, ImageIcon, Pencil, MousePointer2, History, Maximize2, Navigation, Ruler, CheckCircle2, AlertCircle, Bookmark,
  ZoomIn, ZoomOut, RotateCcw, Move, Undo2, MousePointer, Hand
} from 'lucide-react';

interface DivisionViewProps {
  divisionName: string;
  clients: Client[];
  lots: Lot[];
  onAddLot: (lot: Lot) => void;
  onUpdateLot: (lot: Lot) => void;
  onSelectClient: (id: string) => void;
  mapImage: string | null;
  onSetMapImage: (url: string | null) => void;
  onAddClient: () => void;
}

const LotMiniMap: React.FC<{ lot: Lot; allLots: Lot[] }> = ({ lot, allLots }) => {
  const boundary = lot.boundary;
  if (!boundary || boundary.length === 0) return null;

  const minX = Math.min(...boundary.map(p => p.x));
  const maxX = Math.max(...boundary.map(p => p.x));
  const minY = Math.min(...boundary.map(p => p.y));
  const maxY = Math.max(...boundary.map(p => p.y));

  const margin = 5;
  const viewX = minX - margin;
  const viewY = minY - margin;
  const viewWidth = (maxX - minX) + (margin * 2);
  const viewHeight = (maxY - minY) + (margin * 2);

  const area = useMemo(() => {
    let a = 0;
    for (let i = 0; i < boundary.length; i++) {
      const p1 = boundary[i];
      const p2 = boundary[(i + 1) % boundary.length];
      a += p1.x * p2.y - p2.x * p1.y;
    }
    return Math.abs(a / 2) * 10;
  }, [boundary]);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Navigation size={14} className="text-indigo-400" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Localización Georeferenciada</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
           <Ruler size={10} /> {area.toFixed(1)} m² est.
        </div>
      </div>
      
      <div className="aspect-square bg-slate-800 rounded-3xl border border-white/10 overflow-hidden relative shadow-inner group">
        <svg viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`} className="w-full h-full transform transition-transform duration-700 group-hover:scale-110">
          {allLots.filter(l => l.id !== lot.id && l.boundary).map(otherLot => (
            <polygon 
              key={otherLot.id}
              points={otherLot.boundary?.map(p => `${p.x},${p.y}`).join(' ')}
              className="fill-white/5 stroke-white/10 stroke-[0.2]"
            />
          ))}
          <polygon 
            points={boundary.map(p => `${p.x},${p.y}`).join(' ')}
            className="fill-indigo-500/30 stroke-indigo-400 stroke-[0.5] animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
};

const DivisionView: React.FC<DivisionViewProps> = ({ 
  divisionName, clients, lots, onAddLot, onUpdateLot, onSelectClient, mapImage, onSetMapImage, onAddClient
}) => {
  const [viewMode, setViewMode] = useState<'plan' | 'google-maps'>('plan');
  const [interactMode, setInteractMode] = useState<'view' | 'draw' | 'pan'>('view');
  const [statusFilter, setStatusFilter] = useState<LotStatus | 'todos'>('todos');
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<LotBoundaryPoint[]>([]);
  const [tempMousePos, setTempMousePos] = useState<LotBoundaryPoint | null>(null);
  const [isNearFirstPoint, setIsNearFirstPoint] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const mapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedLot = useMemo(() => lots.find(l => l.id === selectedLotId) || null, [lots, selectedLotId]);
  const getClientForLot = (lotId: string) => clients.find(c => c.lotId === lotId && c.division === divisionName);

  const screenToPlan = useCallback((clientX: number, clientY: number) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    let x = (clientX - rect.left - offset.x) / zoom;
    let y = (clientY - rect.top - offset.y) / zoom;
    return {
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    };
  }, [zoom, offset]);

  const finishDrawing = useCallback(() => {
    if (drawingPoints.length < 3) return;
    const centerX = drawingPoints.reduce((sum, p) => sum + p.x, 0) / drawingPoints.length;
    const centerY = drawingPoints.reduce((sum, p) => sum + p.y, 0) / drawingPoints.length;
    const nextNumber = lots.length + 101;
    const newLot: Lot = {
      id: Math.random().toString(36).substr(2, 9),
      number: `L-${nextNumber}`,
      price: 150000,
      status: 'disponible',
      x: centerX,
      y: centerY,
      boundary: drawingPoints,
      history: []
    };
    onAddLot(newLot);
    setDrawingPoints([]);
    setTempMousePos(null);
    setInteractMode('view');
    setIsNearFirstPoint(false);
  }, [drawingPoints, lots, onAddLot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && interactMode === 'draw') {
        setDrawingPoints([]);
        setInteractMode('view');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (interactMode === 'pan' || (interactMode === 'view' && !e.shiftKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }

    if (interactMode === 'draw') {
      const pos = screenToPlan(e.clientX, e.clientY);
      setTempMousePos(pos);

      if (drawingPoints.length > 2) {
        const first = drawingPoints[0];
        const dist = Math.sqrt(Math.pow(pos.x - first.x, 2) + Math.pow(pos.y - first.y, 2));
        setIsNearFirstPoint(dist < 3 / zoom);
      } else {
        setIsNearFirstPoint(false);
      }
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.5), 10);

    // Zoom centrado en el mouse
    const x = (mouseX - offset.x) / zoom;
    const y = (mouseY - offset.y) / zoom;

    setZoom(newZoom);
    setOffset({
      x: mouseX - x * newZoom,
      y: mouseY - y * newZoom
    });
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (interactMode !== 'draw' || isDragging || !mapImage) return;
    const pos = screenToPlan(e.clientX, e.clientY);

    if (isNearFirstPoint) {
      finishDrawing();
    } else {
      setDrawingPoints(prev => [...prev, pos]);
    }
  };

  const resetView = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };
  const updateLotStatus = (newStatus: LotStatus) => selectedLot && onUpdateLot({ ...selectedLot, status: newStatus });

  const getStatusColor = (status: LotStatus, isPolygon = false, isMarker = false) => {
    const isFiltered = statusFilter !== 'todos' && statusFilter !== status;
    const opacity = isFiltered ? 'opacity-10' : 'opacity-100';

    if (isPolygon) {
      switch(status) {
        case 'disponible': return `fill-emerald-400/30 stroke-emerald-500 ${opacity}`;
        case 'vendido': return `fill-indigo-400/30 stroke-indigo-600 ${opacity}`;
        case 'reservado': return `fill-amber-400/30 stroke-amber-500 ${opacity}`;
        default: return `fill-slate-400/30 stroke-slate-500 ${opacity}`;
      }
    }
    
    if (isMarker) {
      switch(status) {
        case 'disponible': return `bg-emerald-500 shadow-emerald-500/40 ${opacity}`;
        case 'vendido': return `bg-indigo-600 shadow-indigo-600/40 ${opacity}`;
        case 'reservado': return `bg-amber-500 shadow-amber-500/40 ${opacity}`;
        default: return `bg-slate-400 ${opacity}`;
      }
    }
    return '';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <MapIcon className="text-indigo-600" size={32} />
            {divisionName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{lots.filter(l => l.status === 'disponible').length} Disponibles</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
            <button onClick={() => setViewMode('plan')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'plan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Plano Maestro</button>
            <button onClick={() => setViewMode('google-maps')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'google-maps' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Ubicación Real</button>
          </div>

          <div className="flex items-center gap-3">
            {viewMode === 'plan' && mapImage && (
              <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => { setInteractMode('view'); setDrawingPoints([]); }} 
                  title="Selección y Consulta"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${interactMode === 'view' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <MousePointer size={14} /> Vista
                </button>
                <button 
                  onClick={() => setInteractMode('pan')} 
                  title="Arrastrar Mapa"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${interactMode === 'pan' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <Hand size={14} /> Paneo
                </button>
                <button 
                  onClick={() => { setInteractMode('draw'); setSelectedLotId(null); }} 
                  title="Dibujar Polígono de Lote"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${interactMode === 'draw' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <Pencil size={14} /> Dibujar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative min-h-[600px] select-none">
            {viewMode === 'plan' ? (
              <div 
                className={`relative flex-1 bg-slate-50 overflow-hidden ${interactMode === 'draw' ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : interactMode === 'pan' ? 'cursor-grab' : 'cursor-default'}`} 
                ref={mapRef} 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onClick={handleContainerClick}
              >
                {/* Indicadores de Control del Mapa */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 z-[60]">
                  <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-2xl flex flex-col gap-1">
                    <button 
                      onClick={() => {
                        const nextZoom = Math.min(zoom + 0.5, 10);
                        setZoom(nextZoom);
                      }} 
                      className="p-3 bg-white text-slate-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <ZoomIn size={18}/>
                    </button>
                    <button 
                      onClick={() => {
                        const nextZoom = Math.max(zoom - 0.5, 0.5);
                        setZoom(nextZoom);
                      }} 
                      className="p-3 bg-white text-slate-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <ZoomOut size={18}/>
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    <button 
                      onClick={resetView} 
                      className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-sm"
                    >
                      <RotateCcw size={18}/>
                    </button>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 shadow-2xl text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Math.round(zoom * 100)}%</span>
                  </div>
                </div>

                {/* Controles de Dibujo Activos */}
                {interactMode === 'draw' && drawingPoints.length > 0 && (
                  <div className="absolute top-6 left-6 flex flex-col gap-2 z-[60] animate-fadeIn">
                    <div className="flex gap-2">
                      <button onClick={() => setDrawingPoints(p => p.slice(0, -1))} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl font-black text-[10px] uppercase border border-slate-200 shadow-xl hover:bg-slate-50"><Undo2 size={14}/> Deshacer</button>
                      <button onClick={() => { setDrawingPoints([]); setInteractMode('view'); }} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-rose-700"><X size={14}/> Cancelar</button>
                    </div>
                    <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-xl w-fit">Vértices: {drawingPoints.length}</div>
                    <p className="text-[9px] font-bold text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-100 w-fit">Haz clic en el primer punto para cerrar el lote</p>
                  </div>
                )}

                {mapImage ? (
                  <div 
                    className="w-full h-full relative origin-top-left transition-transform duration-75 ease-out" 
                    style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
                  >
                    <img src={mapImage} className="w-full h-full object-contain pointer-events-none opacity-90" alt="Plano" />
                    
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      {lots.map(lot => lot.boundary && (
                        <g key={lot.id} className="cursor-pointer pointer-events-auto" onClick={(e) => { e.stopPropagation(); if(interactMode === 'view') setSelectedLotId(lot.id); }}>
                          <polygon 
                            points={lot.boundary.map(p => `${p.x},${p.y}`).join(' ')} 
                            className={`${getStatusColor(lot.status, true)} stroke-2 transition-all duration-300 hover:fill-opacity-50`} 
                            vectorEffect="non-scaling-stroke" 
                          />
                        </g>
                      ))}

                      {interactMode === 'draw' && drawingPoints.length > 0 && (
                        <g>
                          <polyline 
                            points={[...drawingPoints, tempMousePos].filter(Boolean).map(p => `${p?.x},${p?.y}`).join(' ')} 
                            className="fill-none stroke-indigo-600 stroke-2" 
                            strokeDasharray="4 2" 
                            vectorEffect="non-scaling-stroke" 
                          />
                          {drawingPoints.map((p, i) => (
                            <circle 
                              key={i} 
                              cx={p.x} 
                              cy={p.y} 
                              r={1.2/zoom} 
                              className={`${i === 0 && isNearFirstPoint ? 'fill-emerald-500 stroke-[4] stroke-emerald-200 animate-pulse' : 'fill-indigo-600'}`} 
                            />
                          ))}
                        </g>
                      )}
                    </svg>

                    {lots.map(lot => (
                      <div 
                        key={lot.id} 
                        className={`absolute flex flex-col items-center gap-1 group z-10 pointer-events-none transition-opacity duration-300 ${statusFilter !== 'todos' && statusFilter !== lot.status ? 'opacity-20' : 'opacity-100'}`} 
                        style={{ left: `${lot.x}%`, top: `${lot.y}%` }}
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(interactMode === 'view') setSelectedLotId(lot.id); }} 
                          className={`w-10 h-10 -ml-5 -mt-5 rounded-full border-2 border-white shadow-xl transition-all flex items-center justify-center text-[10px] font-black text-white pointer-events-auto hover:scale-125 ${getStatusColor(lot.status, false, true)}`} 
                          style={{ transform: `scale(${1 / Math.sqrt(zoom)})` }}
                        >
                          {lot.number.split('-')[1]}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <ImageIcon size={64} className="text-slate-200" />
                    <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Subir Plano Base</button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => onSetMapImage(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 bg-slate-100 flex items-center justify-center">
                 <Globe size={48} className="text-indigo-400 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 h-full">
          {selectedLot ? (
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl animate-slideUp border border-white/5 h-full overflow-y-auto excel-scroll">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-4xl font-black tracking-tighter text-indigo-400">{selectedLot.number}</h4>
                  <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedLot.status === 'disponible' ? 'bg-emerald-500/20 text-emerald-400' : selectedLot.status === 'reservado' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    Estado: {selectedLot.status}
                  </div>
                </div>
                <button onClick={() => setSelectedLotId(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
              </div>

              <div className="mb-8"><LotMiniMap lot={selectedLot} allLots={lots} /></div>

              <div className="space-y-4 mb-8">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Actualizar Estado de Marcado</p>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => updateLotStatus('disponible')} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${selectedLot.status === 'disponible' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                    <CheckCircle2 size={16} /><span className="text-[9px] font-black uppercase">Libre</span>
                  </button>
                  <button onClick={() => updateLotStatus('reservado')} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${selectedLot.status === 'reservado' ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                    <Bookmark size={16} /><span className="text-[9px] font-black uppercase">Apartado</span>
                  </button>
                  <button onClick={() => updateLotStatus('vendido')} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${selectedLot.status === 'vendido' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                    <Wallet size={16} /><span className="text-[9px] font-black uppercase">Vendido</span>
                  </button>
                </div>
              </div>

              {getClientForLot(selectedLot.number) ? (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-3">Venta Formalizada con:</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-lg">{getClientForLot(selectedLot.number)?.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-lg leading-none mb-1 truncate">{getClientForLot(selectedLot.number)?.name}</p>
                        <button onClick={() => onSelectClient(getClientForLot(selectedLot.number)!.id)} className="text-[10px] text-indigo-400 font-bold hover:underline uppercase tracking-widest">Expediente Completo</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedLot.status === 'disponible' ? (
                    <div className="text-center py-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10">
                       <DollarSign size={40} className="text-emerald-500 mx-auto mb-4" />
                       <p className="font-black text-emerald-400 uppercase text-xs tracking-widest">Oportunidad Comercial</p>
                       <button onClick={onAddClient} className="mt-6 w-[80%] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Iniciar Venta</button>
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] text-center">
                       <AlertCircle size={32} className="text-amber-500 mx-auto mb-3" />
                       <p className="font-black text-amber-500 uppercase text-[10px] tracking-widest">En Proceso de Apartado</p>
                       <button onClick={onAddClient} className="mt-4 text-xs font-bold text-amber-400 hover:underline">Vincular con Cliente</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800">Directorio de la Zona</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Titulares de {divisionName}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto excel-scroll pr-2">
                {clients.filter(c => c.division === divisionName).length > 0 ? (
                  clients.filter(c => c.division === divisionName).map(client => (
                    <div key={client.id} onClick={() => onSelectClient(client.id)} className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] hover:bg-white hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors truncate pr-4">{client.name}</p>
                        <span className="shrink-0 text-[9px] bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-black text-slate-500 uppercase tracking-tighter">{client.lotId}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 italic">
                    <Users size={32} className="opacity-20 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sin registros activos</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DivisionView;
