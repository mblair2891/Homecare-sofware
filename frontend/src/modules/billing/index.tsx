import React, { useState } from 'react';
import { format } from 'date-fns';
import { DollarSign, AlertTriangle, CheckCircle, Clock, Download, Plus, TrendingUp } from 'lucide-react';
import Modal from '../../components/ui/Modal';

type BillingTab = 'invoices' | 'payroll' | 'revenue';

const invoices = [
  { id: 'INV-2026-001', client: 'Margaret Thompson', payer: 'Medicaid', period: 'Feb 1–15, 2026', amount: '$3,220.00', hours: 115, status: 'Submitted', dueDate: '2026-03-15' },
  { id: 'INV-2026-002', client: 'Harold Jenkins', payer: 'Private Pay', period: 'Feb 1–15, 2026', amount: '$2,016.00', hours: 72, status: 'Paid', dueDate: '2026-03-01' },
  { id: 'INV-2026-003', client: 'Dorothy Williams', payer: 'Veterans', period: 'Feb 1–15, 2026', amount: '$4,480.00', hours: 160, status: 'Paid', dueDate: '2026-03-01' },
  { id: 'INV-2026-004', client: 'Frank Morales', payer: 'Long-Term Care Insurance', period: 'Feb 1–15, 2026', amount: '$2,688.00', hours: 96, status: 'Pending', dueDate: '2026-03-10' },
  { id: 'INV-2026-005', client: 'Margaret Thompson', payer: 'Medicaid', period: 'Jan 16–31, 2026', amount: '$3,080.00', hours: 110, status: 'Paid', dueDate: '2026-02-28' },
  { id: 'INV-2026-006', client: 'Harold Jenkins', payer: 'Private Pay', period: 'Jan 16–31, 2026', amount: '$1,680.00', hours: 60, status: 'Overdue', dueDate: '2026-02-15' },
];

const payrollRuns = [
  { id: 'PR-2026-004', caregiver: 'Maria Santos', period: 'Feb 8–21, 2026', hours: 78, regularHours: 72, otHours: 6, regularRate: '$21.00', otRate: '$31.50', gross: '$1,701.00', status: 'Pending' },
  { id: 'PR-2026-005', caregiver: 'James Wilson', period: 'Feb 8–21, 2026', hours: 42, regularHours: 40, otHours: 2, regularRate: '$19.00', otRate: '$28.50', gross: '$817.00', status: 'Pending' },
  { id: 'PR-2026-006', caregiver: 'Angela Davis', period: 'Feb 8–21, 2026', hours: 88, regularHours: 40, otHours: 48, regularRate: '$32.00', otRate: '$48.00', gross: '$3,584.00', status: 'Pending' },
  { id: 'PR-2026-007', caregiver: 'Robert Kim', period: 'Feb 8–21, 2026', hours: 36, regularHours: 36, otHours: 0, regularRate: '$18.00', otRate: '$27.00', gross: '$648.00', status: 'Pending' },
];

const revenueByLocation = [
  { location: 'Portland', revenue: '$82,400', clients: 42, margin: '34%' },
  { location: 'Eugene', revenue: '$41,200', clients: 31, margin: '31%' },
  { location: 'Salem', revenue: '$19,250', clients: 18, margin: '28%' },
];

const statusColor: Record<string, string> = {
  Paid: 'badge-green', Submitted: 'badge-blue', Pending: 'badge-yellow', Overdue: 'badge-red',
};

export default function Billing() {
  const [tab, setTab] = useState<BillingTab>('invoices');
  const [showNewInvoice, setShowNewInvoice] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Payroll</h1>
          <p className="text-slate-500 text-sm">Oregon overtime rules applied automatically</p>
        </div>
        <button onClick={() => setShowNewInvoice(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Invoice</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[['Total Billed (Feb)', '$142,850', 'bg-blue-600'], ['Collected (Feb)', '$98,400', 'bg-green-600'], ['Outstanding', '$44,450', 'bg-amber-500'], ['Overdue', '$1,680', 'bg-red-600']].map(([label, value, bg]) => (
          <div key={label} className="card p-4 flex items-start gap-3">
            <div className={`p-2.5 rounded-lg ${bg}`}><DollarSign size={18} className="text-white" /></div>
            <div><div className="text-xl font-bold text-slate-900">{value}</div><div className="text-xs text-slate-500">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {([['invoices', 'Invoices'], ['payroll', 'Payroll'], ['revenue', 'Revenue Analysis']] as [BillingTab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{label}</button>
        ))}
      </div>

      {/* INVOICES */}
      {tab === 'invoices' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Invoice #', 'Client', 'Payer', 'Period', 'Hours', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-mono text-slate-600">{inv.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{inv.client}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{inv.payer}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{inv.period}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{inv.hours}h</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{inv.amount}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{inv.dueDate}</td>
                  <td className="px-4 py-3"><span className={statusColor[inv.status]}>{inv.status}</span></td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAYROLL */}
      {tab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 flex-1 mr-4">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Oregon Overtime Notice:</strong> OT applies after 40hrs/week (1.5x) AND after 10hrs/day (1.5x). Weekly OT calculated first. All rates calculated automatically.
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary flex items-center gap-2"><Download size={14} /> Export ADP</button>
              <button className="btn-secondary flex items-center gap-2"><Download size={14} /> Export QuickBooks</button>
            </div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Caregiver', 'Pay Period', 'Regular Hrs', 'OT Hrs', 'Reg Rate', 'OT Rate', 'Gross Pay', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollRuns.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{pr.caregiver}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{pr.period}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{pr.regularHours}h</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={pr.otHours > 0 ? 'font-semibold text-amber-600' : 'text-slate-500'}>{pr.otHours}h{pr.otHours > 0 && ' ⚠'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{pr.regularRate}/hr</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{pr.otRate}/hr</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">{pr.gross}</td>
                    <td className="px-4 py-3"><span className="badge-yellow">{pr.status}</span></td>
                  </tr>
                ))}
                <tr className="bg-slate-50 border-t-2 border-slate-300">
                  <td className="px-4 py-3 text-sm font-bold text-slate-700" colSpan={6}>TOTAL PAYROLL (Feb 8–21)</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">$6,750.00</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVENUE */}
      {tab === 'revenue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {revenueByLocation.map(loc => (
              <div key={loc.location} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700">{loc.location}</h3>
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{loc.revenue}</div>
                <div className="text-sm text-slate-500">{loc.clients} clients · {loc.margin} margin</div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Payer Mix (February 2026)</h3>
            <div className="space-y-3">
              {[['Medicaid', '42%', 'bg-blue-500'], ['Private Pay', '28%', 'bg-green-500'], ['Veterans', '19%', 'bg-purple-500'], ['LTC Insurance', '11%', 'bg-amber-500']].map(([label, pct, color]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-semibold text-slate-700">{pct}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNewInvoice && (
        <Modal title="New Invoice" onClose={() => setShowNewInvoice(false)} size="md"
          footer={<><button className="btn-secondary" onClick={() => setShowNewInvoice(false)}>Cancel</button><button className="btn-primary">Create Invoice</button></>}>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Client</label><select className="form-input"><option>Margaret Thompson</option><option>Harold Jenkins</option><option>Dorothy Williams</option><option>Frank Morales</option></select></div>
            <div><label className="form-label">Payer</label><select className="form-input"><option>Medicaid</option><option>Private Pay</option><option>Veterans</option><option>Long-Term Care Insurance</option></select></div>
            <div><label className="form-label">Period Start</label><input type="date" className="form-input" /></div>
            <div><label className="form-label">Period End</label><input type="date" className="form-input" /></div>
            <div><label className="form-label">Hours</label><input type="number" className="form-input" placeholder="0" /></div>
            <div><label className="form-label">Rate ($/hr)</label><input type="number" className="form-input" defaultValue="28" /></div>
            <div><label className="form-label">Due Date</label><input type="date" className="form-input" /></div>
            <div><label className="form-label">Notes</label><textarea className="form-input" rows={2} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
