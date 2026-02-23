import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { format, addDays, startOfWeek } from 'date-fns';
import { Plus, CheckCircle, XCircle, Clock, MapPin, Phone, Radio } from 'lucide-react';
import Modal from '../../components/ui/Modal';

type ScheduleTab = 'week' | 'evv' | 'openShifts';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


export default function Scheduling() {
  const { clients, caregivers, shifts } = useAppStore();
  const [tab, setTab] = useState<ScheduleTab>('week');
  const [weekStart] = useState(startOfWeek(new Date()));
  const [showNewShift, setShowNewShift] = useState(false);

  const weekDays = DAYS.map((_, i) => addDays(weekStart, i));


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
        {([['week', 'Weekly Schedule'], ['evv', 'EVV Log'], ['openShifts', 'Open Shifts']] as [ScheduleTab, string][]).map(([id, label]) => (
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
          {caregivers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Clock size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No caregivers added yet</p>
              <p className="text-xs mt-1">Add caregivers to start building the schedule</p>
            </div>
          ) : (
            caregivers.slice(0, 10).map(cg => (
              <div key={cg.id} className="grid grid-cols-8 border-b border-slate-100">
                <div className="p-3 border-r border-slate-100">
                  <div className="text-sm font-medium text-slate-700">{cg.name.split(' ')[0]}</div>
                  <div className="text-xs text-slate-400">{cg.location}</div>
                </div>
                {weekDays.map((day, dayIdx) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const shift = shifts.find(s => s.caregiverId === cg.id && s.date === dayStr);
                  return (
                    <div key={dayIdx} className="p-1.5 border-l border-slate-100 min-h-16">
                      {shift && (
                        <div className="text-xs p-1.5 rounded border bg-blue-100 border-blue-300 text-blue-800">
                          <div className="font-medium truncate">
                            {clients.find(c => c.id === shift.clientId)?.name.split(' ')[0] ?? 'Client'}
                          </div>
                          <div className="opacity-75">{shift.startTime}–{shift.endTime}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
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
                {shifts.filter(s => s.evvClockIn).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      <Radio size={28} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">No EVV records yet</p>
                      <p className="text-xs mt-1">Clock-in records will appear here once caregivers begin shifts</p>
                    </td>
                  </tr>
                ) : (
                  shifts.filter(s => s.evvClockIn).map(ev => {
                    const cg = caregivers.find(c => c.id === ev.caregiverId);
                    const cl = clients.find(c => c.id === ev.clientId);
                    return (
                      <tr key={ev.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{cg?.name ?? ev.caregiverId}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{cl?.name ?? ev.clientId}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{ev.date}</td>
                        <td className="px-4 py-3 text-sm">{ev.evvClockIn}</td>
                        <td className="px-4 py-3 text-sm">{ev.evvClockOut || <span className="text-amber-500">Active</span>}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs">
                            {ev.evvMethod === 'GPS' ? <MapPin size={12} className="text-green-600" /> : <Phone size={12} className="text-blue-600" />}
                            {ev.evvMethod ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {ev.evvVerified ? <span className="badge-green flex items-center gap-1 w-fit"><CheckCircle size={11} /> Verified</span> : <span className="badge-yellow flex items-center gap-1 w-fit"><Clock size={11} /> Pending</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-32 truncate">{ev.notes || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPEN SHIFTS */}
      {tab === 'openShifts' && (
        <div className="space-y-3">
          {shifts.filter(s => !s.caregiverId || s.status === 'Scheduled').length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <CheckCircle size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No open shifts</p>
              <p className="text-xs mt-1">Unassigned shifts will appear here once created</p>
            </div>
          ) : (
            shifts.filter(s => !s.caregiverId).map(shift => {
              const cl = clients.find(c => c.id === shift.clientId);
              return (
                <div key={shift.id} className="card p-4 flex items-center gap-4">
                  <div className="w-2 h-12 rounded-full flex-shrink-0 bg-amber-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{cl?.name ?? shift.clientId}</div>
                    <div className="text-sm text-slate-500">{shift.date} · {shift.startTime}–{shift.endTime} · {shift.location}</div>
                    <div className="flex gap-1 mt-1">{shift.tasks.map(t => <span key={t} className="badge-blue">{t}</span>)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs">Assign</button>
                    <button className="btn-primary text-xs flex items-center gap-1"><Radio size={12} /> Broadcast</button>
                  </div>
                </div>
              );
            })
          )}
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
