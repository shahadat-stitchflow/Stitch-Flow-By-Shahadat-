
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Project } from '../types';

interface UserProfileViewProps {
  projects: Project[];
  onToggleAdmin: (val: boolean) => void;
  isAdminMode: boolean;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ projects, onToggleAdmin, isAdminMode }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('stitchflow_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Senior Merchandiser',
      email: 'merch@stitchflow.io',
      phone: '+880 1700 000000',
      companyRole: 'Lead Merchandiser',
      isAdmin: true,
      photoUrl: ''
    };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('stitchflow_user_profile', JSON.stringify(profile));
  }, [profile]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Derive current context
  const activeProjects = projects.filter(p => p.currentStepIndex < 15);
  const currentBuyer = activeProjects.length > 0 ? activeProjects[0].buyerName : 'N/A';
  const totalCompletion = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + ((p.currentStepIndex + 1) / 16), 0) / projects.length * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-xl border border-slate-200 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center ring-8 ring-slate-50">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl hover:bg-indigo-700 transition transform hover:scale-110 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} accept="image/*" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 justify-center md:justify-start">
              <input 
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="text-4xl font-black text-slate-900 border-none bg-transparent p-0 focus:ring-0 w-full md:w-auto"
                placeholder="Your Name"
              />
              <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block w-fit mx-auto md:mx-0">
                {profile.companyRole}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-slate-500 justify-center md:justify-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <input 
                  value={profile.email}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  className="text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                />
              </div>
              <div className="flex items-center gap-3 text-slate-500 justify-center md:justify-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <input 
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  className="text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-slate-200">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Current Working Status</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">Lead Buyer Portfolio</p>
              <p className="text-2xl font-black text-slate-900">{currentBuyer}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold mb-2">Overall Workflow Progress</p>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
                  style={{ width: `${totalCompletion}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Velocity</span>
                <span className="text-[10px] font-black text-slate-400">{totalCompletion}% Overall</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" /></svg>
           </div>
           <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Admin Controls</h3>
           <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">This panel is restricted to the App Owner. Switch to admin view to manage subscription settings and global configurations.</p>
           <button 
             onClick={() => onToggleAdmin(!isAdminMode)}
             className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
               isAdminMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
             }`}
           >
             {isAdminMode ? 'Disable Admin Mode' : 'Switch to Admin View'}
           </button>
        </div>
      </div>
    </div>
  );
};
