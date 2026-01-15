
import React from 'react';
import { Project } from '../types';
import { StatusBadge } from './ui/StatusBadge';
import { LiquidProgressButton } from './ui/LiquidProgressButton';
import { MerchandisingSkillsMeter } from './MerchandisingSkillsMeter';

interface ProjectDashboardProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onSelectProject }) => {
  // Mock performance stats for the meter
  const mockStats = {
    avgDaysToComplete: 3.4,
    totalTasksUpdated: 42,
    overdueCount: 1,
    aiFollowupCount: 15
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Dashboard Header & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Merchandising Dashboard</h1>
              <p className="text-slate-500 font-medium">Tracking {projects.length} active garment styles across global supply chains.</p>
            </div>
            <button className="hidden sm:flex bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              New Inquiry
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const progressPercentage = ((project.currentStepIndex + 1) / 16) * 100;
              return (
                <div 
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col relative ${
                    project.isUrgent ? 'border-orange-400 ring-4 ring-orange-50' : 'border-slate-200'
                  }`}
                >
                  {/* Project Image Header */}
                  <div className="h-40 bg-slate-100 overflow-hidden relative">
                    {project.productImageUrl ? (
                      <img src={project.productImageUrl} alt={project.styleName} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    
                    {project.isUrgent && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-bounce shadow-lg">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                        Urgent
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={project.workflow[project.currentStepIndex].status} />
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="font-black text-xl text-slate-800 group-hover:text-indigo-600 transition truncate">{project.styleName}</h3>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{project.styleNumber}</p>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold uppercase">Buyer</span>
                        <span className="font-bold text-slate-700">{project.buyerName}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold uppercase">Delivery</span>
                        <span className={`font-black ${project.isUrgent ? 'text-orange-600' : 'text-slate-900'}`}>{project.shipDate}</span>
                      </div>
                    </div>

                    <LiquidProgressButton 
                      progress={progressPercentage} 
                      label={project.workflow[project.currentStepIndex].label}
                      className="mt-auto"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Skills Meter & Personal Stats */}
        <div className="space-y-6 lg:sticky lg:top-24">
           <MerchandisingSkillsMeter stats={mockStats} />
           
           {/* Achievement Card */}
           <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <h3 className="text-sm font-black uppercase text-indigo-400 mb-4 tracking-widest">Active Achievement</h3>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900 shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                 </div>
                 <div>
                    <p className="font-bold text-lg">Speed Merchant</p>
                    <p className="text-xs text-slate-400">Maintained &lt;4 day submission average for 3 months.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
