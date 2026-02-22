import React, { useState } from 'react';
import { MessageSquare, Send, Radio, Users } from 'lucide-react';

const threads = [
  { id: 't1', name: 'Maria Santos', role: 'Caregiver', lastMsg: 'I will be 10 minutes late tomorrow morning', time: '10:32 AM', unread: 1, avatar: 'MS' },
  { id: 't2', name: 'James Wilson', role: 'Caregiver', lastMsg: "Client's daughter called, wants to discuss care plan", time: 'Yesterday', unread: 0, avatar: 'JW' },
  { id: 't3', name: 'Angela Davis', role: 'Caregiver/RN', lastMsg: "Dorothy's medication was administered at 9:45 AM", time: 'Yesterday', unread: 0, avatar: 'AD' },
  { id: 't4', name: 'Thompson Family', role: 'Family Portal', lastMsg: 'Thank you for the update on Mom!', time: '2 days ago', unread: 2, avatar: 'TF' },
];

const demoMessages: Record<string, { from: string; text: string; time: string; mine: boolean }[]> = {
  't1': [
    { from: 'Maria Santos', text: "Good morning! Just confirming I'll be there for Mrs. Thompson at 8 AM.", time: '8:00 AM', mine: false },
    { from: 'You', text: "Great, thank you Maria. The medication reminder log needs to be completed today.", time: '8:05 AM', mine: true },
    { from: 'Maria Santos', text: "Understood. I completed the morning ADLs and documented in the app.", time: '10:15 AM', mine: false },
    { from: 'Maria Santos', text: "I will be 10 minutes late tomorrow morning", time: '10:32 AM', mine: false },
  ],
  't2': [
    { from: 'You', text: "James, reminder that Mr. Jenkins' quarterly monitoring visit is due this month.", time: 'Yesterday 9:00 AM', mine: true },
    { from: 'James Wilson', text: "Got it. I'll let the coordinator know.", time: 'Yesterday 9:30 AM', mine: false },
    { from: 'James Wilson', text: "Client's daughter called, wants to discuss care plan", time: 'Yesterday 2:15 PM', mine: false },
  ],
};

export default function Messaging() {
  const [active, setActive] = useState('t1');
  const [message, setMessage] = useState('');
  const [msgs, setMsgs] = useState(demoMessages);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const send = () => {
    if (!message.trim()) return;
    setMsgs(m => ({ ...m, [active]: [...(m[active] || []), { from: 'You', text: message, time: 'Just now', mine: true }] }));
    setMessage('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Messaging</h1>
        <button onClick={() => setShowBroadcast(true)} className="btn-primary flex items-center gap-2"><Radio size={16} /> Broadcast Message</button>
      </div>

      <div className="card flex overflow-hidden" style={{ height: '600px' }}>
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-200 flex flex-col">
          <div className="p-3 border-b border-slate-100">
            <input className="form-input text-sm" placeholder="Search messages..." />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {threads.map(t => (
              <div key={t.id} onClick={() => setActive(t.id)}
                className={`p-3 cursor-pointer hover:bg-slate-50 ${active === t.id ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{t.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 truncate">{t.name}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{t.time}</span>
                    </div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{t.lastMsg}</div>
                  </div>
                  {t.unread > 0 && <span className="w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{t.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{threads.find(t => t.id === active)?.avatar}</div>
            <div>
              <div className="font-medium text-slate-800">{threads.find(t => t.id === active)?.name}</div>
              <div className="text-xs text-slate-400">{threads.find(t => t.id === active)?.role}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(msgs[active] || []).map((m, i) => (
              <div key={i} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.mine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  <div>{m.text}</div>
                  <div className={`text-xs mt-1 ${m.mine ? 'text-blue-200' : 'text-slate-400'}`}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 flex gap-2">
            <input className="form-input flex-1 text-sm" placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()} />
            <button onClick={send} className="btn-primary px-3"><Send size={16} /></button>
          </div>
        </div>
      </div>

      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBroadcast(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Radio size={18} className="text-blue-600" /> Broadcast Message</h2>
            <div className="space-y-3">
              <div><label className="form-label">Recipients</label>
                <div className="flex flex-col gap-1">
                  {['All Caregivers', 'Portland Caregivers', 'Eugene Caregivers', 'Salem Caregivers', 'Caregivers with Open Shifts'].map(r => (
                    <label key={r} className="flex items-center gap-2 text-sm"><input type="checkbox" /> {r}</label>
                  ))}
                </div>
              </div>
              <div><label className="form-label">Message</label><textarea className="form-input" rows={4} placeholder="Type your broadcast message..." /></div>
              <div><label className="form-label">Send Via</label>
                <div className="flex gap-3">
                  {['In-App', 'SMS', 'Email'].map(m => <label key={m} className="flex items-center gap-1.5 text-sm"><input type="checkbox" defaultChecked={m === 'In-App'} /> {m}</label>)}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn-secondary" onClick={() => setShowBroadcast(false)}>Cancel</button>
                <button className="btn-primary" onClick={() => setShowBroadcast(false)}>Send Broadcast</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
