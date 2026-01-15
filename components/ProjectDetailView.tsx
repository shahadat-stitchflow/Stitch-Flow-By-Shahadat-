
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Project, StepStatus, WorkflowStep, StepRecord, TodoItem, UserProfile } from '../types';
import { StatusBadge } from './ui/StatusBadge';
import { getCostingAssistant, analyzeProductionRisks, getFollowUpPrompt } from '../services/geminiService';
import { useCollaboration } from '../hooks/useCollaboration';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onUpdateStep: (stepIdx: number, updates: Partial<WorkflowStep>) => void;
  onUpdateProject: (updates: Partial<Project>) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack, onUpdateStep, onUpdateProject }) => {
  const [activeStepIdx, setActiveStepIdx] = useState(project.currentStepIndex);
  const [activeTab, setActiveTab] = useState<'workflow' | 'planner' | 'techpack'>('workflow');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [followUpModal, setFollowUpModal] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  
  const [newNote, setNewNote] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTodoTask, setNewTodoTask] = useState('');

  const currentUser: UserProfile = useMemo(() => {
    const saved = localStorage.getItem('stitchflow_user_profile');
    const profile = saved ? JSON.parse(saved) : { id: 'user_1', name: 'You', color: '#6366f1' };
    return { ...profile, id: profile.id || 'user_1' };
  }, []);

  const { collaborators, onFocusSection } = useCollaboration(project.id, currentUser);

  const activeStep = project.workflow[activeStepIdx];
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const storageKey = `stitchflow_project_${project.id}`;
    const data = JSON.stringify(project);
    localStorage.setItem(storageKey, data);
  }, [project]);

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    let result = "";
    if (activeStep.id === 'costing_quotation') {
      result = await getCostingAssistant(project);
    } else {
      result = await analyzeProductionRisks(project);
    }
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  const handleTriggerFollowUp = async () => {
    setLoadingFollowUp(true);
    const result = await getFollowUpPrompt(project, activeStep);
    setFollowUpModal(result);
    setLoadingFollowUp(false);
  };

  const isOverdue = (step: WorkflowStep) => {
    return step.dueDate && step.dueDate < today && step.status !== StepStatus.COMPLETED && step.status !== StepStatus.APPROVED;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateStep(activeStepIdx, { dueDate: e.target.value });
  };

  const handleAddRecord = () => {
    if (!newNote && !newImage) return;
    const newRecord: StepRecord = {
      id: Date.now().toString(),
      note: newNote,
      imageUrl: newImage || undefined,
      timestamp: new Date().toLocaleString(),
    };
    const updatedRecords = [...(activeStep.records || []), newRecord];
    onUpdateStep(activeStepIdx, { records: updatedRecords });
    setNewNote('');
    setNewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTask.trim()) return;
    const newItem: TodoItem = {
      id: Date.now().toString(),
      task: newTodoTask,
      completed: false,
      priority: 'medium'
    };
    onUpdateProject({ todoItems: [...(project.todoItems || []), newItem] });
    setNewTodoTask('');
  };

  const toggleTodo = (id: string) => {
    const updated = (project.todoItems || []).map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateProject({ todoItems: updated });
  };

  const getSectionCollaborator = (sectionId: string) => {
    return Object.values(collaborators).find(c => c.activeSection === sectionId);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[85vh]">
      {/* Sidebar: Step List & Product Preview */}
      <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col shadow-xl">
        <div className="p-0 border-b border-slate-200">
          <div className="relative h-56 bg-slate-900 overflow-hidden">
             {project.productImageUrl ? (
               <img src={project.productImageUrl} alt={project.styleName} className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-110" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-700">No Image</div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-6">
                <button onClick={onBack} className="text-white text-[10px] font-black uppercase tracking-widest hover:text-indigo-300 transition mb-3 flex items-center gap-1.5 opacity-80">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                   Back
                </button>
                <div className="flex items-center gap-2 mb-1">
                   <h2 className="font-black text-white truncate text-xl leading-tight tracking-tight">{project.styleName}</h2>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{project.styleNumber}</p>
             </div>
          </div>
          
          <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar">
            <button onClick={() => setActiveTab('workflow')} className={`flex-1 py-4 px-2 text-[10px] font-black uppercase tracking-widest transition shrink-0 ${activeTab === 'workflow' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Workflow</button>
            <button onClick={() => setActiveTab('planner')} className={`flex-1 py-4 px-2 text-[10px] font-black uppercase tracking-widest transition shrink-0 ${activeTab === 'planner' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Planner</button>
            <button onClick={() => setActiveTab('techpack')} className={`flex-1 py-4 px-2 text-[10px] font-black uppercase tracking-widest transition shrink-0 ${activeTab === 'techpack' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Tech Pack</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          {activeTab === 'workflow' ? (
            <div className="workflow-scroll">
              {project.workflow.map((step, idx) => {
                const isActive = activeStepIdx === idx;
                return (
                  <button key={step.id} onClick={() => setActiveStepIdx(idx)} className={`w-full text-left p-5 border-b border-slate-100 flex items-center gap-4 transition-all duration-300 ${isActive ? 'bg-white border-l-4 border-l-indigo-600 shadow-inner' : 'hover:bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${idx <= project.currentStepIndex ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'} ${isActive ? 'scale-110' : ''}`}>{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-indigo-900' : 'text-slate-600'}`}>{step.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : activeTab === 'planner' ? (
            <div className="p-6 flex flex-col gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Today's Focus</h4>
                <div className="space-y-2">
                  {(project.todoItems || []).slice(0, 3).map(todo => (
                    <div key={todo.id} className="flex items-center gap-2">
                       <div className={`w-3 h-3 rounded-full ${todo.completed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                       <span className={`text-[11px] font-bold ${todo.completed ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{todo.task}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl shadow-xl border border-slate-800 flex-1 flex flex-col ring-1 ring-slate-800 relative group/notes">
                 <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">General Notes</h4>
                    {getSectionCollaborator('general_notes') && (
                      <div className="flex items-center gap-1.5 animate-pulse">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                         <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{getSectionCollaborator('general_notes')?.userName} is typing</span>
                      </div>
                    )}
                 </div>
                 <textarea value={project.merchandiserNotes || ''} onChange={(e) => onUpdateProject({ merchandiserNotes: e.target.value })} onFocus={() => onFocusSection('general_notes')} onBlur={() => onFocusSection('')} placeholder="Quick thoughts..." className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] text-white font-medium leading-relaxed resize-none placeholder:text-slate-800" />
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <h4 className="text-xs font-black text-slate-800 uppercase mb-1">Tech Pack File</h4>
                 <p className="text-[10px] text-slate-400 font-bold mb-4 italic">v1.2 - Updated 2 days ago</p>
                 <a href={project.techPackUrl} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">Open Specs</a>
              </div>
              <div className="bg-slate-950 p-5 rounded-2xl shadow-xl border border-slate-800 flex-1 flex flex-col ring-1 ring-slate-800">
                 <div className="flex justify-between items-center mb-3">
                   <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Technical Remarks</h4>
                   {getSectionCollaborator('tech_remarks') && (
                      <div className="flex items-center gap-1.5 animate-pulse">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                         <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{getSectionCollaborator('tech_remarks')?.userName} is technical</span>
                      </div>
                    )}
                 </div>
                 <textarea value={project.techPackNotes || ''} onChange={(e) => onUpdateProject({ techPackNotes: e.target.value })} onFocus={() => onFocusSection('tech_remarks')} onBlur={() => onFocusSection('')} placeholder="Add specific tech notes..." className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] text-white font-medium leading-relaxed resize-none placeholder:text-slate-800" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-8">
        {/* Collaborators Floating Bar */}
        <div className="flex justify-end -mb-4 px-2">
           <div className="flex -space-x-3 items-center">
              {Object.values(collaborators).map((c) => (
                <div key={c.userId} className="relative group/collab">
                   <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg overflow-hidden" style={{ backgroundColor: c.userColor }}>{c.userName.substring(0, 2).toUpperCase()}</div>
                   <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover/collab:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded pointer-events-none">{c.userName} {c.activeSection ? `· Editing ${c.activeSection.replace('_', ' ')}` : '· Viewing'}</div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-10 shadow-xl min-h-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 pb-8 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-lg">Stage {activeStepIdx + 1}</span>
                {isOverdue(activeStep) && <span className="text-[10px] text-red-600 font-black uppercase tracking-widest animate-pulse">⚠️ OVERDUE</span>}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{activeStep.label}</h2>
            </div>
            <div className="flex items-center gap-4">
               <button 
                 onClick={handleTriggerFollowUp}
                 disabled={loadingFollowUp}
                 className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
               >
                 {loadingFollowUp ? 'Drafting...' : 'AI Follow-up'}
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
               </button>
               <StatusBadge status={activeStep.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
            <div className="xl:col-span-3 space-y-8">
               <div className="bg-slate-50/50 rounded-[2rem] p-6 sm:p-8 border border-slate-100 relative overflow-hidden">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Execution Records</h3>
                  <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 mb-8 relative">
                    <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} onFocus={() => onFocusSection('records_input')} onBlur={() => onFocusSection('')} placeholder="Type update details here..." className="w-full border-none focus:ring-0 text-sm placeholder:text-slate-300 resize-none min-h-[100px] font-medium" />
                    <div className="flex justify-end mt-4">
                      <button onClick={handleAddRecord} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">Post Entry</button>
                    </div>
                  </div>
               </div>
            </div>
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                <label className="text-[10px] font-black text-slate-500 uppercase mb-4 block tracking-widest">Expected Completion</label>
                <input type="date" value={activeStep.dueDate || ''} onChange={handleDateChange} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <button onClick={handleAiAnalysis} disabled={loadingAi} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-[2rem] text-left relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-500"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">AI Production Sync</p>
                  <h4 className="text-xl font-black">{loadingAi ? 'Analyzing Stage...' : 'Analyze Workflow Risks'}</h4>
                  {aiAnalysis && <p className="mt-4 text-[11px] font-bold leading-relaxed opacity-90 line-clamp-3">{aiAnalysis}</p>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Draft Modal */}
      {followUpModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setFollowUpModal(null)}></div>
           <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 sm:p-12">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Generated Follow-up</h3>
                    <button onClick={() => setFollowUpModal(null)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
                 </div>
                 <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <div className="prose prose-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-700">
                       {followUpModal}
                    </div>
                 </div>
                 <div className="mt-8 flex gap-4">
                    <button onClick={() => { navigator.clipboard.writeText(followUpModal); setFollowUpModal(null); }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Copy Templates</button>
                    <button onClick={() => setFollowUpModal(null)} className="flex-1 bg-white border border-slate-200 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Close</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
