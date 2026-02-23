import React, { useState } from 'react';
import { format } from 'date-fns';
import { DollarSign, AlertTriangle, CheckCircle, Clock, Download, Plus, TrendingUp } from 'lucide-react';
import Modal from '../../components/ui/Modal';

type BillingTab = 'invoices' | 'payroll' | 'revenue';

const invoices: { id: string; client: string; payer: string; period: string; amount: string; hours: number; status: string; dueDate: string }[] = [];
const payrollRuns: { id: string; caregiver: string; period: string; hours: number; regularHours: number; otHours: number; regularRate: string; otRate: string; gross: string; status: string }[] = [];
const revenueByLocation: { location: string; revenue: string; clients: number; margin: string }[] = [];

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
        {[['Total Billed', '—', 'bg-blue-600'], ['Collected', '—', 'bg-green-600'], ['Outstanding', '—', 'bg-amber-500'], ['Overdue', '—', 'bg-red-600']].map(([label, value, bg]) => (
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
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <DollarSign size={28} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No invoices yet</p>
                    <p className="text-xs mt-1">Create an invoice to get started</p>
                  </td>
                </tr>
              ) : invoices.map(inv => (
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
                {payrollRuns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      <CheckCircle size={28} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">No payroll runs yet</p>
                      <p className="text-xs mt-1">Payroll records will appear here once shifts are completed</p>
                    </td>
                  </tr>
                ) : (
                  <>
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
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVENUE */}
      {tab === 'revenue' && (
        <div className="space-y-4">
          {revenueByLocation.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <TrendingUp size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No revenue data yet</p>
              <p className="text-xs mt-1">Revenue by location will appear here once invoices are created</p>
            </div>
          ) : (
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
          )}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Payer Mix</h3>
            <div className="text-sm text-slate-400 text-center py-6">
              Payer mix will populate once invoices are recorded
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
