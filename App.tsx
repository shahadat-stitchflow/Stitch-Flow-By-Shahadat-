
import React, { useState } from 'react';
import { Project, WorkflowStep, TodoItem } from './types';
import { MOCK_PROJECTS, createInitialWorkflow } from './constants';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ProjectDetailView } from './components/ProjectDetailView';
import { MerchFeed } from './components/MerchFeed';
import { UserProfileView } from './components/UserProfileView';
import { AIAdvisor } from './components/AIAdvisor';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'feed' | 'settings' | 'profile' | 'advisor'>('dashboard');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newProject, setNewProject] = useState({
    styleName: '',
    styleNumber: '',
    buyerName: '',
    season: '',
    quantity: 0,
    shipDate: '',
    productImageUrl: ''
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleUpdateStep = (stepIdx: number, updates: Partial<WorkflowStep>) => {
    if (!selectedProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id !== selectedProjectId) return p;
      const newWorkflow = [...p.workflow];
      newWorkflow[stepIdx] = { ...newWorkflow[stepIdx], ...updates, updatedAt: new Date().toISOString() };
      return { ...p, workflow: newWorkflow };
    }));
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `p${Date.now()}`;
    const project: Project = {
      ...newProject,
      id,
      currentStepIndex: 0,
      workflow: createInitialWorkflow(),
      techPackUrl: '#',
      todoItems: [],
      merchandiserNotes: ''
    };
    setProjects([project, ...projects]);
    setIsAddModalOpen(false);
    setNewProject({
      styleName: '',
      styleNumber: '',
      buyerName: '',
      season: '',
      quantity: 0,
      shipDate: '',
      productImageUrl: ''
    });
    setSelectedProjectId(id);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    if (selectedProject) {
      return (
        <ProjectDetailView 
          project={selectedProject} 
          onBack={() => setSelectedProjectId(null)} 
          onUpdateStep={handleUpdateStep}
          onUpdateProject={(updates) => handleUpdateProject(selectedProjectId!, updates)}
        />
      );
    }

    switch (currentView) {
      case 'feed': return <MerchFeed projects={projects} />;
      case 'profile': return <UserProfileView projects={projects} onToggleAdmin={setIsAdminMode} isAdminMode={isAdminMode} />;
      case 'advisor': return <AIAdvisor projects={projects} />;
      case 'settings': return (
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center animate-in fade-in duration-500">
           <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-indigo-100">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
           </div>
           <h2 className="text-3xl font-black mb-4">Master Control Center</h2>
           <p className="text-slate-500 mb-8 font-medium max-w-lg mx-auto leading-relaxed">Administrator level access granted. Configure SaaS parameters, subscription tiers, and direct Google Ad placements.</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 hover:border-indigo-200 transition-all">
                 <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Monetization Engine</p>
                 <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all active:scale-95">Billing Configurations</button>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 hover:border-indigo-200 transition-all">
                 <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Marketing & Ads</p>
                 <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all active:scale-95">Ad Space Management</button>
              </div>
           </div>
        </div>
      );
      default: return <ProjectDashboard projects={projects} onSelectProject={(p) => setSelectedProjectId(p.id)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setSelectedProjectId(null); setCurrentView('dashboard');}}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight">STITCH<span className="text-indigo-600">FLOW</span></span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6 h-full">
              <button 
                onClick={() => {setSelectedProjectId(null); setCurrentView('dashboard');}} 
                className={`text-sm font-bold transition-all relative h-16 flex items-center ${currentView === 'dashboard' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Projects
              </button>
              
              <button 
                onClick={() => setCurrentView('advisor')} 
                className={`text-sm font-black transition-all flex items-center gap-2 relative h-16 ${currentView === 'advisor' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-slate-700 hover:text-indigo-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Advisor
              </button>

              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all transform hover:scale-110 active:scale-95 shadow-lg mx-2"
                title="Add New Style"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              </button>

              <button 
                onClick={() => setCurrentView('feed')} 
                className={`text-sm font-bold transition-all relative h-16 flex items-center ${currentView === 'feed' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Discover
              </button>
              <button 
                onClick={() => setCurrentView('profile')} 
                className={`text-sm font-bold transition-all relative h-16 flex items-center ${currentView === 'profile' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Profile
              </button>
              {isAdminMode && (
                <button 
                  onClick={() => setCurrentView('settings')} 
                  className={`text-sm font-bold transition-all relative h-16 flex items-center ${currentView === 'settings' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-slate-400 animate-pulse'}`}
                >
                  Admin
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentView('profile')} className="group flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 overflow-hidden">
                  <svg className="w-4 h-4 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <span className="text-xs font-black text-slate-600 group-hover:text-indigo-600">Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-slate-200 md:hidden sticky bottom-0 p-4 flex justify-around z-50 items-center">
        <button onClick={() => {setSelectedProjectId(null); setCurrentView('dashboard');}} className={currentView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}><svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg><span className="text-[10px] font-black uppercase tracking-widest mt-1 block">Home</span></button>
        
        <button onClick={() => setCurrentView('advisor')} className={currentView === 'advisor' ? 'text-indigo-600' : 'text-slate-400'}><svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg><span className="text-[10px] font-black uppercase tracking-widest mt-1 block">Advisor</span></button>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white active:scale-90 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
        </button>

        <button onClick={() => {setSelectedProjectId(null); setCurrentView('feed');}} className={currentView === 'feed' ? 'text-indigo-600' : 'text-slate-400'}><svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg><span className="text-[10px] font-black uppercase tracking-widest mt-1 block">Discover</span></button>
        <button onClick={() => {setSelectedProjectId(null); setCurrentView('profile');}} className={currentView === 'profile' ? 'text-indigo-600' : 'text-slate-400'}><svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span className="text-[10px] font-black uppercase tracking-widest mt-1 block">Profile</span></button>
      </footer>

      {/* Add New Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 sm:p-12">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Style Inquiry</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Style Name</label>
                    <input required type="text" placeholder="e.g. Vintage Denim Jacket" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={newProject.styleName} onChange={e => setNewProject({...newProject, styleName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Style Number</label>
                    <input required type="text" placeholder="e.g. VDJ-2025-01" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={newProject.styleNumber} onChange={e => setNewProject({...newProject, styleNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Buyer Name</label>
                    <input required type="text" placeholder="e.g. Levi Strauss" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={newProject.buyerName} onChange={e => setNewProject({...newProject, buyerName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Season</label>
                    <input required type="text" placeholder="e.g. Summer 25" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={newProject.season} onChange={e => setNewProject({...newProject, season: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Total Quantity</label>
                    <input required type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={newProject.quantity || ''} onChange={e => setNewProject({...newProject, quantity: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ship Date</label>
                    <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={newProject.shipDate} onChange={e => setNewProject({...newProject, shipDate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Style Image URL</label>
                  <input type="url" placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={newProject.productImageUrl} onChange={e => setNewProject({...newProject, productImageUrl: e.target.value})} />
                </div>
                <div className="pt-8">
                  <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-[0.98]">Initiate Development Workflow</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
