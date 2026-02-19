import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, RefreshCw, Edit2, Eraser, Search, BarChart3, Layout, Waves, ShoppingCart, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';

// --- MARKET VERİSİ ---
const STORE_ITEMS = [
  { id: 'fish_1', name: 'Balon Balığı', price: 100, type: 'fish', oceanSize: 'w-20 h-20', image: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f421.png', gifImage: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f421/512.gif' }, 
  { id: 'fish_2', name: 'Mavi Balık', price: 200, type: 'fish', oceanSize: 'w-20 h-20', image: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f41f.png', gifImage: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f41f/512.gif' }, 
  { id: 'item_1', name: 'Yengeç', price: 150, type: 'fish', oceanSize: 'w-16 h-16', image: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f980.png', gifImage: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f980/512.gif' }, 
  { id: 'item_2', name: 'Ahtapot', price: 300, type: 'fish', oceanSize: 'w-24 h-24', image: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f419.png', gifImage: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f419/512.gif' }, 
  { id: 'fish_3', name: 'Yunus', price: 500, type: 'fish', oceanSize: 'w-32 h-32', image: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f42c.png', gifImage: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f42c/512.gif' }, 
  { id: 'fish_4', name: 'Balina', price: 1000, type: 'fish', oceanSize: 'w-44 h-44', image: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f433.png', gifImage: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f433/512.gif' }, 
  { id: 'food_1', name: 'Basit Yem', price: 30, type: 'food', feedValue: 0.15, oceanSize: 'w-10 h-10', image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f33f.svg' }, 
  { id: 'food_2', name: 'Orta Yem', price: 70, type: 'food', feedValue: 0.30, oceanSize: 'w-12 h-12', image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f990.svg' }, 
  { id: 'food_3', name: 'Kaliteli Yem', price: 150, type: 'food', feedValue: 0.50, oceanSize: 'w-14 h-14', image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f96b.svg' }, 
  { id: 'decor_2', name: 'Deniz Kabuğu', price: 75, type: 'decor', oceanSize: 'w-16 h-16', image: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f41a.png' }, 
  { id: 'decor_1', name: 'Pembe Mercan', price: 50, type: 'decor', oceanSize: 'w-20 h-20', image: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1fab8.png' }, 
  { id: 'decor_3', name: 'Antik Heykel', price: 400, type: 'decor', oceanSize: 'w-40 h-40', image: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f5ff.png' }, 
];

const defaultData = {
  todo: { id: 'todo', title: 'Yapılacaklar 📋', tasks: [{ id: '1', content: 'SeaBits\'e hoş geldin!', priority: 'high' }] },
  inProgress: { id: 'inProgress', title: 'Sürüyor 🚧', tasks: [] },
  done: { id: 'done', title: 'Bitti ✅', tasks: [] },
};

const priorityColors = { high: 'bg-red-500/20 text-red-300 border-red-500/50', medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', low: 'bg-green-500/20 text-green-300 border-green-500/50' };

function App() {
  const [activeTab, setActiveTab] = useState('board');
  
  // --- KAYIT SİSTEMİ ANAHTARLARI ---
  const STORAGE_KEY_COLS = 'seabits_tasks_final';
  const STORAGE_KEY_COINS = 'seabits_coins_final';
  const STORAGE_KEY_OCEAN = 'seabits_ocean_final';
  const STORAGE_KEY_INV = 'seabits_inv_final';

  // --- BAŞLANGIÇTA VERİLERİ YÜKLEME ---
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLS);
      return saved ? JSON.parse(saved) : defaultData;
    } catch { return defaultData; }
  });
  const [coins, setCoins] = useState(() => Number(localStorage.getItem(STORAGE_KEY_COINS)) || 0);
  const [myOcean, setMyOcean] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OCEAN);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INV);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [draggingFish, setDraggingFish] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', columnId: '', taskId: '', text: '' });
  const oceanRef = useRef(null);

  // --- VERİLER DEĞİŞTİĞİNDE KAYDETME ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLS, JSON.stringify(columns));
    localStorage.setItem(STORAGE_KEY_COINS, coins.toString());
    localStorage.setItem(STORAGE_KEY_OCEAN, JSON.stringify(myOcean));
    localStorage.setItem(STORAGE_KEY_INV, JSON.stringify(inventory));
  }, [columns, coins, myOcean, inventory]);

  const stats = useMemo(() => {
    const total = Object.values(columns).reduce((acc, col) => acc + col.tasks.length, 0);
    const done = columns.done.tasks.length;
    return { total, done, percentage: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [columns]);

  const handleTitleClick = () => { setSearchQuery(''); setActiveTab('board'); };

  // --- SÜREKLİ SÜZÜLME VE AKILLI ANİMASYON ---
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setMyOcean(prevOcean => {
        return prevOcean.map(item => {
          if (item.type === 'decor' || item.type === 'food' || draggingFish === item.instanceId) return item;
          let newX = item.x + (Math.random() * 20 - 10); 
          let newY = item.y + (Math.random() * 14 - 7); 
          newX = Math.max(5, Math.min(85, newX)); 
          newY = Math.max(10, Math.min(70, newY));
          let willAnimate = Math.random() > 0.5;
          return { ...item, x: newX, y: newY, isAnimating: willAnimate };
        });
      });
      setTimeout(() => {
          setMyOcean(currentOcean => currentOcean.map(item => item.isAnimating ? { ...item, isAnimating: false } : item));
      }, 2000);
    }, 4000); 
    return () => clearInterval(moveInterval);
  }, [draggingFish]);

  const handleMouseMove = (e) => {
    if (!draggingFish || !oceanRef.current) return;
    const rect = oceanRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMyOcean(prev => prev.map(f => f.instanceId === draggingFish ? { ...f, x: Math.max(0, Math.min(92, x - 3)), y: Math.max(0, Math.min(88, y - 3)) } : f));
  };

  const handleMouseUp = () => {
    if (!draggingFish) return;
    const draggedItem = myOcean.find(i => i.instanceId === draggingFish);
    if (draggedItem?.type === 'food') {
        let closestFish = null;
        let minDistance = 8; 
        myOcean.forEach(target => {
            if (target.type === 'fish' && target.instanceId !== draggingFish) {
                const dx = target.x - draggedItem.x, dy = target.y - draggedItem.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) { minDistance = distance; closestFish = target; }
            }
        });
        if (closestFish) {
            setMyOcean(prev => {
                let newOcean = prev.filter(i => i.instanceId !== draggedItem.instanceId); 
                return newOcean.map(i => i.instanceId === closestFish.instanceId ? { ...i, scale: Math.min((i.scale || 1) + draggedItem.feedValue, 1.8), isAnimating: true } : i);
            });
            setTimeout(() => { setMyOcean(prev => prev.map(item => item.instanceId === closestFish.instanceId ? { ...item, isAnimating: false } : item)); }, 2000);
            confetti({ particleCount: 40, spread: 50, origin: { x: (closestFish.x + 5) / 100, y: (closestFish.y + 5) / 100 }, colors: ['#4ade80', '#fbbf24', '#38bdf8'] });
            setDraggingFish(null); return;
        }
    }
    setDraggingFish(null);
  };

  const onDragEnd = (result) => {
    if (searchQuery || !result.destination) return;
    const { source, destination } = result;
    if (destination.droppableId === 'done' && source.droppableId !== 'done') { setCoins(prev => prev + 50); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); }
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const sourceCol = columns[source.droppableId], destCol = columns[destination.droppableId];
    const sourceTasks = [...sourceCol.tasks], destTasks = [...destCol.tasks];
    const [removed] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, removed);
    setColumns({ ...columns, [source.droppableId]: { ...sourceCol, tasks: sourceTasks }, [destination.droppableId]: { ...destCol, tasks: destTasks } });
  };

  const buyItem = (item) => {
    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      if (item.type === 'food') { setInventory(prev => ({...prev, [item.id]: (prev[item.id] || 0) + 1})); } 
      else { setMyOcean(prev => [...prev, { ...item, instanceId: uuidv4(), x: Math.random() * 80 + 5, y: item.type === 'decor' ? 70 : 40, delay: Math.random() * 5, scale: 1, isAnimating: false }]); }
    } else { alert("Yeterli coinin yok!"); }
  };

  const spawnFoodFromInventory = (foodId) => {
      if (inventory[foodId] > 0) {
          setInventory(prev => ({...prev, [foodId]: prev[foodId] - 1}));
          const foodDef = STORE_ITEMS.find(i => i.id === foodId);
          setMyOcean(prev => [...prev, { ...foodDef, instanceId: uuidv4(), x: Math.random() * 60 + 20, y: 10, scale: 1 }]);
      }
  };

  const removeFromOcean = (e, instanceId) => { e.stopPropagation(); setMyOcean(prev => prev.filter(item => item.instanceId !== instanceId)); };
  const openAddModal = (columnId) => setModal({ isOpen: true, type: 'add', columnId, taskId: '', text: '' });
  const openEditModal = (columnId, taskId, currentText) => setModal({ isOpen: true, type: 'edit', columnId, taskId, text: currentText });
  const deleteTask = (columnId, taskId) => setColumns(prev => ({...prev, [columnId]: {...prev[columnId], tasks: prev[columnId].tasks.filter(t => t.id !== taskId)}}));
  const togglePriority = (columnId, taskId) => setColumns(prev => ({...prev, [columnId]: {...prev[columnId], tasks: prev[columnId].tasks.map(t => t.id === taskId ? {...t, priority: t.priority === 'low' ? 'medium' : t.priority === 'medium' ? 'high' : 'low'} : t)}}));
  const handleModalSubmit = (e) => {
      e.preventDefault(); if (!modal.text.trim()) return;
      if (modal.type === 'add') { setColumns(prev => ({...prev, [modal.columnId]: {...prev[modal.columnId], tasks: [...prev[modal.columnId].tasks, {id: uuidv4(), content: modal.text, priority: 'low'}]}})); } 
      else { setColumns(prev => ({...prev, [modal.columnId]: {...prev[modal.columnId], tasks: prev[modal.columnId].tasks.map(t => t.id === modal.taskId ? {...t, content: modal.text} : t)}})); }
      setModal({ isOpen: false, type: '', columnId: '', taskId: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500/30" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <nav className="bg-[#1e293b] border-b border-gray-700 p-4 sticky top-0 z-[1000] shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex bg-[#0f172a] rounded-xl p-1 gap-1 border border-gray-700">
            <button onClick={() => setActiveTab('board')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${activeTab === 'board' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><Layout size={18}/> Pano</button>
            <button onClick={() => setActiveTab('ocean')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${activeTab === 'ocean' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><Waves size={18}/> Okyanusum</button>
            <button onClick={() => setActiveTab('store')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${activeTab === 'store' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><ShoppingCart size={18}/> Mağaza</button>
          </div>
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-full"><span className="text-xl font-bold">💰 {coins}</span></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        {activeTab === 'board' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col gap-6 mb-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <button onClick={handleTitleClick} className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer">SeaBits 📘</button>
                    <div className="flex gap-3">
                        <div className="relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Görev ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-[#1e293b] border border-gray-700 text-sm py-2 pl-10 pr-4 rounded-lg outline-none focus:border-blue-500 transition-all w-48 focus:w-64" /></div>
                        <button onClick={() => {if(window.confirm("Tüm pano sıfırlansın mı?")) setColumns(defaultData)}} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 border border-red-500/30 transition-all"><RefreshCw size={18} /></button>
                    </div>
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700/50 flex items-center gap-4 shadow-lg"><div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><BarChart3 size={24} /></div><div className="flex-1"><div className="flex justify-between text-sm mb-1 text-gray-400 font-bold"><span>Genel İlerleme</span><span>%{stats.percentage}</span></div><div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden"><div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${stats.percentage}%` }}></div></div></div></div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}><div className="flex flex-col md:flex-row gap-6 items-start justify-center select-none">{Object.entries(columns).map(([columnId, column]) => { const displayTasks = column.tasks.filter(t => t.content.toLowerCase().includes(searchQuery.toLowerCase())); return ( <div key={columnId} className="flex flex-col w-full md:w-1/3 bg-[#1e293b] rounded-xl p-4 shadow-2xl border border-gray-700/50"><div className="flex justify-between items-center mb-4 px-2"><h2 className="font-bold text-lg text-gray-200 flex items-center gap-2">{column.title} <span className="bg-gray-700 text-xs px-2 py-1 rounded-full text-gray-400">{displayTasks.length}</span></h2>{column.tasks.length > 0 && !searchQuery && (<button onClick={() => { if(window.confirm("Silinsin mi?")) setColumns(prev => ({...prev, [columnId]: {...prev[columnId], tasks: []}}))}} className="text-gray-600 hover:text-red-400"><Eraser size={18} /></button>)}</div><Droppable droppableId={columnId}>{(provided, snapshot) => ( <div {...provided.droppableProps} ref={provided.innerRef} className={`flex flex-col gap-3 min-h-[150px] transition-all duration-200 rounded-lg p-2 ${snapshot.isDraggingOver ? 'bg-gray-800/80 ring-2 ring-blue-500/20' : ''}`}>{displayTasks.map((task, index) => ( <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!!searchQuery}>{(provided, snapshot) => ( <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ ...provided.draggableProps.style, zIndex: snapshot.isDragging ? 9999 : 'auto' }} className={`bg-[#334155] p-4 rounded-lg shadow-sm border border-gray-600 hover:border-gray-500 group relative transition-all ${snapshot.isDragging ? 'rotate-2 ring-2 ring-blue-500 scale-105' : ''}`}><div onClick={() => togglePriority(columnId, task.id)} className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer uppercase tracking-wider ${priorityColors[task.priority || 'low']}`}>{task.priority || 'LOW'}</div><p className="text-sm text-gray-100 font-medium leading-relaxed pr-6">{task.content}</p><div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600/50"><div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEditModal(columnId, task.id, task.content)} className="text-gray-400 hover:text-blue-400"><Edit2 size={14} /></button><button onClick={() => deleteTask(columnId, task.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button></div></div></div>)}</Draggable>))}{provided.placeholder}</div>)}</Droppable>{!searchQuery && (<button onClick={() => openAddModal(columnId)} className="mt-4 w-full py-3 border border-gray-700/50 border-dashed text-gray-400 hover:text-white hover:bg-blue-600/20 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"><Plus size={18} /> Yeni Görev Ekle</button>)}</div> ); })}</div></DragDropContext>
          </div>
        )}

        {activeTab === 'ocean' && (
          <div ref={oceanRef} className="relative w-full h-[650px] rounded-[3rem] border-[6px] border-[#0f172a] overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 ocean-animated-bg select-none">
            <div className="absolute top-0 left-1/4 w-32 h-[800px] bg-cyan-200/10 blur-[50px] transform -rotate-12 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-0 w-full h-32 bg-[#e1c699] opacity-80 pointer-events-none blur-[4px]"></div>
            <div className="absolute bottom-0 w-full h-16 bg-[#c2b280] pointer-events-none"></div>
            {[...Array(10)].map((_, i) => ( <div key={i} className="absolute bg-white/30 rounded-full animate-bubble pointer-events-none" style={{ left: `${Math.random() * 100}%`, width: `${Math.random() * 12 + 4}px`, height: `${Math.random() * 12 + 4}px`, bottom: '-20px', animationDuration: `${Math.random() * 4 + 3}s` }}></div> ))}
            {myOcean.length === 0 && ( <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-50/70 gap-4 pointer-events-none z-10"><Waves size={64} className="animate-bounce" /><p className="text-2xl font-bold tracking-wider">OKYANUSUNUZ ÇOK SESSİZ...</p></div> )}
            {myOcean.map((item) => { const isDragging = draggingFish === item.instanceId; const storeRef = STORE_ITEMS.find(s => s.id === item.id); const currentImage = (isDragging || item.isAnimating) && storeRef?.gifImage ? storeRef.gifImage : (storeRef ? storeRef.image : item.image); return ( <div key={item.instanceId} onMouseDown={() => setDraggingFish(item.instanceId)} className={`absolute z-40 group select-none ${isDragging ? 'cursor-grabbing z-[9999]' : 'cursor-grab'} transition-all duration-[4000ms] ease-in-out`} style={{ left: `${item.x}%`, top: `${item.y}%`, transition: isDragging ? 'none' : '' }}> <div className="relative pointer-events-none flex items-center justify-center" style={{ transform: `scale(${isDragging ? (item.scale || 1) * 1.1 : (item.scale || 1)})`, transition: 'transform 0.4s ease' }}> <img src={currentImage} alt={item.name} className={`${storeRef?.oceanSize || 'w-24 h-24'} object-contain outline-none drop-shadow-xl ${item.type === 'food' ? 'animate-float-simple' : ''}`} draggable={false}/> </div> <button onMouseDown={(e) => { e.stopPropagation(); removeFromOcean(e, item.instanceId); }} className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-auto"><X size={14} /></button> </div> ); })}
            <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 z-50 pointer-events-none flex flex-col gap-3">
                <div><div className="text-[10px] text-cyan-300 font-bold uppercase mb-1">Popülasyon</div><div className="text-xl font-black text-white">{myOcean.filter(i => i.type === 'fish').length}</div></div>
                <div className="h-px w-full bg-white/20"></div>
                <div><div className="text-[10px] text-amber-300 font-bold uppercase mb-1">Dekorasyon</div><div className="text-xl font-black text-white">{myOcean.filter(i => i.type === 'decor').length}</div></div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-lg px-6 py-3 rounded-3xl border border-white/10 z-50 flex items-center gap-6 pointer-events-auto shadow-2xl">
                <div className="flex gap-4">{STORE_ITEMS.filter(i => i.type === 'food').map(food => ( <button key={food.id} onClick={() => spawnFoodFromInventory(food.id)} disabled={!inventory[food.id]} className={`relative transition-all ${inventory[food.id] ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'opacity-40'}`}> <img src={food.image} alt={food.name} className="w-10 h-10" /><span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0f172a]">{inventory[food.id] || 0}</span> </button> ))}</div>
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-500">
            {STORE_ITEMS.map((item) => (
                <div key={item.id} className={`bg-[#1e293b] p-8 rounded-[2rem] border transition-all group shadow-xl flex flex-col items-center relative overflow-hidden ${item.type === 'decor' ? 'border-indigo-900/50' : item.type === 'food' ? 'border-green-900/50' : 'border-gray-800'}`}>
                    <span className="absolute top-6 left-6 text-[10px] font-black uppercase bg-black/40 px-3 py-1 rounded-full text-gray-300">{item.type === 'decor' ? '🌿 DEKOR' : item.type === 'food' ? '🥫 YEM' : '🐠 CANLI'}</span>
                    <div className="h-40 flex items-center justify-center mb-6"><img src={item.gifImage || item.image} alt={item.name} className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-300" /></div>
                    <h3 className="text-2xl font-black mb-1 text-gray-100">{item.name}</h3>
                    <div className="text-yellow-500 font-black text-2xl mb-8 tracking-tight">💰 {item.price}</div>
                    <button onClick={() => buyItem(item)} disabled={coins < item.price} className={`w-full py-4 rounded-2xl font-black transition-all ${coins >= item.price ? 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95' : 'bg-gray-800 text-gray-600'}`}>{coins >= item.price ? 'SATIN AL' : 'YETERSİZ COİN'}</button>
                </div>
            ))}
          </div>
        )}
      </main>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-black mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{modal.type === 'add' ? 'Yeni Görev Ekle' : 'Düzenle'}</h3>
            <form onSubmit={handleModalSubmit}><input autoFocus type="text" value={modal.text} onChange={(e) => setModal({ ...modal, text: e.target.value })} className="w-full bg-[#0f172a] border-2 border-gray-600 rounded-xl p-4 text-white outline-none mb-6"/><div className="flex justify-end gap-3"><button type="button" onClick={() => setModal({ isOpen: false, type: '', columnId: '', taskId: '', text: '' })} className="px-6 py-3 text-gray-400 font-bold">İptal</button><button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Kaydet</button></div></form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.ocean-animated-bg { background: linear-gradient(270deg, #001f3f, #003366, #004e92, #002b55); background-size: 800% 800%; animation: oceanShift 20s ease infinite; } @keyframes oceanShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } @keyframes floatSimple { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } } .animate-float-simple { animation: floatSimple 3s ease-in-out infinite; } @keyframes bubble { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-700px); opacity: 0; } } .animate-bubble { animation: bubble linear infinite; }`}} />
    </div>
  );
}

export default App;