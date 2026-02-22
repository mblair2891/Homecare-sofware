import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { format, addDays, startOfWeek } from 'date-fns';
import { Plus, CheckCircle, XCircle, Clock, MapPin, Phone, Radio } from 'lucide-react';
import Modal from '../../components/ui/Modal';

type ScheduleTab = 'week' | 'evv' | 'openShifts';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const demoEVV = [
  { id: 'e1', caregiver: 'Maria Santos', client: 'Margaret Thompson', date: '2026-02-22', clockIn: '08:02', clockOut: '12:15', method: 'GPS', verified: true, visitNotes: 'Client bathed, medications reminded, light housekeeping done.' },
  { id: 'e2', caregiver: 'James Wilson', client: 'Margaret Thompson', date: '2026-02-22', clockIn: '13:00', clockOut: '', method: 'GPS', verified: false, visitNotes: '' },
  { id: 'e3', caregiver: 'Angela Davis', client: 'Dorothy Williams', date: '2026-02-22', clockIn: '09:30', clockOut: '14:00', method: 'Telephony', verified: true, visitNotes: 'Medication administered. PT exercises assisted. Client mood: good.' },
  { id: 'e4', caregiver: 'Robert Kim', client: 'Frank Morales', date: '2026-02-21', clockIn: '10:00', clockOut: '14:00', method: 'GPS', verified: true, visitNotes: 'Personal care completed. Client calm and cooperative.' },
];

const openShifts = [
  { id: 'os1', client: 'Margaret Thompson', date: '2026-02-24', time: '8:00 AM – 12:00 PM', tasks: ['Personal Care', 'Medication Reminding'], location: 'Portland', priority: 'High' },
  { id: 'os2', client: 'Harold Jenkins', date: '2026-02-23', time: '2:00 PM – 6:00 PM', tasks: ['Personal Care', 'Medication Administration'], location: 'Portland', priority: 'Urgent' },
  { id: 'os3', client: 'Frank Morales', date: '2026-02-25', time: '10:00 AM – 2:00 PM', tasks: ['Personal Care', 'Housekeeping'], location: 'Salem', priority: 'Normal' },
];

export default function Scheduling() {
  const { clients, caregivers } = useAppStore();
  const [tab, setTab] = useState<ScheduleTab>('week');
  const [weekStart] = useState(startOfWeek(new Date()));
  const [showNewShift, setShowNewShift] = useState(false);

  const weekDays = DAYS.map((_, i) => addDays(weekStart, i));

  // Demo weekly shifts
  const weekShifts = [
    { day: 1, caregiver: 'Maria Santos', client: 'Margaret Thompson', start: '08:00', end: '12:00', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { day: 1, caregiver: 'Angela Davis', client: 'Dorothy Williams', start: '09:30', end: '14:00', color: 'bg-teal-100 border-teal-300 text-teal-800' },
    { day: 2, caregiver: 'James Wilson', client: 'Margaret Thompson', start: '08:00', end: '16:00', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { day: 3, caregiver: 'Robert Kim', client: 'Frank Morales', start: '10:00', end: '14:00', color: 'bg-green-100 border-green-300 text-green-800' },
    { day: 4, caregiver: 'Maria Santos', client: 'Harold Jenkins', start: '14:00', end: '18:00', color: 'bg-amber-100 border-amber-300 text-amber-800' },
    { day: 5, caregiver: 'Angela Davis', client: 'Dorothy Williams', start: '09:00', end: '14:00', color: 'bg-teal-100 border-teal-300 text-teal-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheduling & EVV</h1>
          <p className="text-slate-500 text-sm">Week of {format(weekStart, 'MMMM d, yyyy')}</p>
        </div>
        <button onClick={() => setShowNewShift(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Shift</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {([['week', 'Weekly Schedule'], ['evv', 'EVV Log'], ['openShifts', `Open Shifts (${openShifts.length})`]] as [ScheduleTab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{label}</button>
        ))}
      </div>

      {/* WEEK VIEW */}
      {tab === 'week' && (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-8 border-b border-slate-200">
            <div className="p-3 text-xs font-semibold text-slate-400 uppercase">Caregiver</div>
            {weekDays.map((day, i) => (
              <div key={i} className={`p-3 text-center border-l border-slate-200 ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-blue-50' : ''}`}>
                <div className="text-xs font-semibold text-slate-500 uppercase">{DAYS[i]}</div>
                <div className="text-sm font-bold text-slate-700">{format(day, 'd')}</div>
              </div>
            ))}
          </div>
          {caregivers.slice(0, 4).map(cg => (
            <div key={cg.id} className="grid grid-cols-8 border-b border-slate-100">
              <div className="p-3 border-r border-slate-100">
                <div className="text-sm font-medium text-slate-700">{cg.name.split(' ')[0]}</div>
                <div className="text-xs text-slate-400">{cg.location}</div>
              </div>
              {weekDays.map((_, dayIdx) => {
                const shift = weekShifts.find(s => s.day === dayIdx && s.caregiver.split(' ')[0] === cg.name.split(' ')[0]);
                return (
                  <div key={dayIdx} className="p-1.5 border-l border-slate-100 min-h-16">
                    {shift && (
                      <div className={`text-xs p-1.5 rounded border ${shift.color}`}>
                        <div className="font-medium truncate">{shift.client.split(' ')[0]}</div>
                        <div className="opacity-75">{shift.start}–{shift.end}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* EVV LOG */}
      {tab === 'evv' && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /><span className="text-slate-600">GPS Verified</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /><span className="text-slate-600">Telephony</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-400 rounded-full" /><span className="text-slate-600">Pending</span></div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Caregiver', 'Client', 'Date', 'Clock In', 'Clock Out', 'Method', 'Status', 'Notes'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demoEVV.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{ev.caregiver}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ev.client}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ev.date}</td>
                    <td className="px-4 py-3 text-sm">{ev.clockIn}</td>
                    <td className="px-4 py-3 text-sm">{ev.clockOut || <span className="text-amber-500">Active</span>}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs">
                        {ev.method === 'GPS' ? <MapPin size={12} className="text-green-600" /> : <Phone size={12} className="text-blue-600" />}
                        {ev.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ev.verified ? <span className="badge-green flex items-center gap-1 w-fit"><CheckCircle size={11} /> Verified</span> : <span className="badge-yellow flex items-center gap-1 w-fit"><Clock size={11} /> Pending</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-32 truncate">{ev.visitNotes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPEN SHIFTS */}
      {tab === 'openShifts' && (
        <div className="space-y-3">
          {openShifts.map(shift => (
            <div key={shift.id} className="card p-4 flex items-center gap-4">
              <div className={`w-2 h-12 rounded-full flex-shrink-0 ${shift.priority === 'Urgent' ? 'bg-red-500' : shift.priority === 'High' ? 'bg-amber-400' : 'bg-slate-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900">{shift.client}</div>
                <div className="text-sm text-slate-500">{shift.date} · {shift.time} · {shift.location}</div>
                <div className="flex gap-1 mt-1">{shift.tasks.map(t => <span key={t} className="badge-blue">{t}</span>)}</div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${shift.priority === 'Urgent' ? 'bg-red-100 text-red-700' : shift.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{shift.priority}</span>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs">Assign</button>
                <button className="btn-primary text-xs flex items-center gap-1"><Radio size={12} /> Broadcast</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewShift && (
        <Modal title="New Shift" onClose={() => setShowNewShift(false)} size="md"
          footer={<><button className="btn-secondary" onClick={() => setShowNewShift(false)}>Cancel</button><button className="btn-primary">Create Shift</button></>}>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Client</label>
              <select className="form-input">{clients.map(c => <option key={c.id}>{c.name}</option>)}</select>
            </div>
            <div><label className="form-label">Caregiver</label>
              <select className="form-input">{caregivers.map(c => <option key={c.id}>{c.name}</option>)}</select>
            </div>
            <div><label className="form-label">Date</label><input type="date" className="form-input" /></div>
            <div><label className="form-label">Start Time</label><input type="time" className="form-input" /></div>
            <div><label className="form-label">End Time</label><input type="time" className="form-input" /></div>
            <div><label className="form-label">EVV Method</label>
              <select className="form-input"><option>GPS</option><option>Telephony</option><option>Manual</option></select>
            </div>
            <div className="col-span-2"><label className="form-label">Tasks</label>
              <div className="flex flex-wrap gap-2">{['Personal Care', 'Medication Reminding', 'Medication Assistance', 'Medication Administration', 'Housekeeping', 'Transportation'].map(t => (
                <label key={t} className="flex items-center gap-1.5 text-sm"><input type="checkbox" /> {t}</label>
              ))}</div>
            </div>
            <div className="col-span-2"><label className="form-label">Notes</label><textarea className="form-input" rows={2} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
