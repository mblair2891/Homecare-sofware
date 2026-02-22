import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const reportLibrary = [
  { id: 'r1', category: 'Compliance', name: 'OAR Compliance Summary', desc: 'Complete compliance status across all regulatory requirements', icon: '🛡️' },
  { id: 'r2', category: 'Compliance', name: 'EVV Compliance Report', desc: 'GPS/telephony clock-in/out verification rates by caregiver and client', icon: '📍' },
  { id: 'r3', category: 'Compliance', name: 'Caregiver Training Status', desc: 'Orientation, initial training, annual training completion rates', icon: '📚' },
  { id: 'r4', category: 'Compliance', name: 'Background Check Renewal Report', desc: 'All caregivers with 3-year renewal dates', icon: '🔍' },
  { id: 'r5', category: 'Financial', name: 'Revenue by Location', desc: 'Monthly revenue breakdown by location and payer type', icon: '💰' },
  { id: 'r6', category: 'Financial', name: 'Payroll Summary', desc: 'Hours, OT, and gross pay by caregiver with Oregon OT calculations', icon: '💼' },
  { id: 'r7', category: 'Financial', name: 'Accounts Receivable Aging', desc: 'Outstanding invoices by age (30/60/90+ days)', icon: '📊' },
  { id: 'r8', category: 'Financial', name: 'Payer Mix Analysis', desc: 'Revenue breakdown by Medicaid, private pay, VA, and LTC insurance', icon: '📈' },
  { id: 'r9', category: 'Clinical', name: 'Client Census', desc: 'Active, inactive, on-hold, and discharged client counts by location', icon: '👥' },
  { id: 'r10', category: 'Clinical', name: 'Monitoring Visit Compliance', desc: 'Initial and quarterly monitoring visit completion rates', icon: '🏠' },
  { id: 'r11', category: 'Operations', name: 'Caregiver Utilization', desc: 'Scheduled hours vs. available hours by caregiver', icon: '⏱️' },
  { id: 'r12', category: 'Operations', name: 'Open Shift Report', desc: 'Unfilled shifts by location and date', icon: '📅' },
];

const scheduledReports = [
  { name: 'Weekly EVV Compliance Summary', frequency: 'Every Monday', recipients: 'Jennifer Adams, Michael Torres', format: 'PDF' },
  { name: 'Monthly Revenue Report', frequency: '1st of month', recipients: 'Jennifer Adams', format: 'Excel' },
  { name: 'Quarterly Compliance Report', frequency: 'Quarterly', recipients: 'All Administrators', format: 'PDF' },
];

const categories = ['All', 'Compliance', 'Financial', 'Clinical', 'Operations'];

export default function Reports() {
  const [filterCat, setFilterCat] = useState('All');
  const [generateModal, setGenerateModal] = useState<string | null>(null);

  const filtered = filterCat === 'All' ? reportLibrary : reportLibrary.filter(r => r.category === filterCat);
  const generateReport = reportLibrary.find(r => r.id === generateModal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm">{reportLibrary.length} reports available</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[['Reports Run (Feb)', '47', BarChart3, 'bg-blue-600'], ['Scheduled Reports', '3', Calendar, 'bg-teal-600'], ['Data Exports', '12', Download, 'bg-green-600'], ['Custom Reports', '5', TrendingUp, 'bg-purple-600']].map(([label, value, Icon, bg]) => (
          <div key={label as string} className="card p-4 flex items-start gap-3">
            <div className={`p-2.5 rounded-lg ${bg}`}><Icon size={18} className="text-white" /></div>
            <div><div className="text-xl font-bold">{value}</div><div className="text-xs text-slate-500">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterCat === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Report library */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(report => (
          <div key={report.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{report.icon}</span>
              <div>
                <div className="font-medium text-slate-800 text-sm">{report.name}</div>
                <span className="badge-blue mt-1 inline-block">{report.category}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3">{report.desc}</p>
            <button onClick={() => setGenerateModal(report.id)} className="btn-primary w-full text-sm">Generate Report</button>
          </div>
        ))}
      </div>

      {/* Scheduled reports */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Scheduled Reports</h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Report', 'Frequency', 'Recipients', 'Format', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduledReports.map((rep, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium">{rep.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{rep.frequency}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{rep.recipients}</td>
                  <td className="px-4 py-3"><span className="badge-gray">{rep.format}</span></td>
                  <td className="px-4 py-3"><button className="text-sm text-blue-600 hover:text-blue-800">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {generateModal && generateReport && (
        <Modal title={`Generate: ${generateReport.name}`} onClose={() => setGenerateModal(null)} size="md"
          footer={<><button className="btn-secondary" onClick={() => setGenerateModal(null)}>Cancel</button><button className="btn-primary flex items-center gap-2"><Download size={14} /> Generate & Download</button></>}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{generateReport.desc}</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">Date Range Start</label><input type="date" className="form-input" defaultValue="2026-02-01" /></div>
              <div><label className="form-label">Date Range End</label><input type="date" className="form-input" defaultValue="2026-02-28" /></div>
              <div><label className="form-label">Location</label><select className="form-input"><option>All Locations</option><option>Portland</option><option>Eugene</option><option>Salem</option></select></div>
              <div><label className="form-label">Format</label><select className="form-input"><option>PDF</option><option>Excel (.xlsx)</option><option>CSV</option></select></div>
              <div className="col-span-2"><label className="form-label">Email to (optional)</label><input className="form-input" placeholder="email@example.com" /></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
