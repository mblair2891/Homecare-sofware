import React from 'react';
import { TrendingUp, Users, Building2, DollarSign, UserCheck, Activity } from 'lucide-react';

const monthlyData = [
  { month: 'Aug', agencies: 1, clients: 12, mrr: 149 },
  { month: 'Sep', agencies: 2, clients: 25, mrr: 298 },
  { month: 'Oct', agencies: 2, clients: 38, mrr: 448 },
  { month: 'Nov', agencies: 3, clients: 56, mrr: 747 },
  { month: 'Dec', agencies: 3, clients: 68, mrr: 747 },
  { month: 'Jan', agencies: 4, clients: 84, mrr: 1047 },
  { month: 'Feb', agencies: 4, clients: 94, mrr: 1047 },
];

const maxMrr = Math.max(...monthlyData.map((d) => d.mrr));

const metrics = [
  { label: 'Active Agencies', value: '3', change: '+1 this month', icon: Building2, color: 'text-blue-600 bg-blue-50' },
  { label: 'Total Clients', value: '94', change: '+10 this month', icon: Users, color: 'text-teal-600 bg-teal-50' },
  { label: 'Total Caregivers', value: '63', change: '+7 this month', icon: UserCheck, color: 'text-green-600 bg-green-50' },
  { label: 'MRR', value: '$1,047', change: '+$300 this month', icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
];

const planBreakdown = [
  { plan: 'Enterprise', count: 1, mrr: 599, color: 'bg-purple-500' },
  { plan: 'Professional', count: 1, mrr: 299, color: 'bg-blue-500' },
  { plan: 'Starter', count: 1, mrr: 149, color: 'bg-slate-400' },
  { plan: 'Trial', count: 1, mrr: 0, color: 'bg-amber-400' },
];

export default function PlatformAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp size={11} />
                {change.split(' ')[0]}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
            <div className="text-xs text-slate-400 mt-1">{change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* MRR Chart */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Monthly Recurring Revenue</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 months</p>
            </div>
            <Activity size={16} className="text-slate-300" />
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlyData.map(({ month, mrr }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="text-xs font-medium text-slate-500">
                  ${mrr >= 1000 ? `${(mrr / 1000).toFixed(1)}k` : mrr}
                </div>
                <div className="w-full flex items-end">
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all"
                    style={{ height: `${Math.max(8, (mrr / maxMrr) * 120)}px` }}
                  />
                </div>
                <div className="text-xs text-slate-400">{month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Plan Distribution</h3>
          <p className="text-xs text-slate-400 mb-5">Current subscribers</p>
          <div className="space-y-3">
            {planBreakdown.map(({ plan, count, mrr, color }) => (
              <div key={plan}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                    <span className="text-sm text-slate-700">{plan}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-600">{count} agency</span>
                    <span className="text-xs text-slate-400 ml-1">{mrr > 0 ? `$${mrr}/mo` : 'free'}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${(count / planBreakdown.reduce((s, p) => s + p.count, 0)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total MRR</span>
              <span className="text-lg font-bold text-slate-800">$1,047</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-400">Projected ARR</span>
              <span className="text-sm font-semibold text-slate-600">$12,564</span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Monthly Growth</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Month', 'Agencies', 'Clients', 'MRR', 'MoM Growth'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...monthlyData].reverse().map((row, i, arr) => {
                const prev = arr[i + 1];
                const growth = prev ? (((row.mrr - prev.mrr) / (prev.mrr || 1)) * 100).toFixed(0) : null;
                return (
                  <tr key={row.month} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-700">{row.month} 2025</td>
                    <td className="px-5 py-3 text-slate-600">{row.agencies}</td>
                    <td className="px-5 py-3 text-slate-600">{row.clients}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">${row.mrr.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      {growth !== null ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          Number(growth) > 0 ? 'text-green-700 bg-green-50' : 'text-slate-500 bg-slate-100'
                        }`}>
                          {Number(growth) > 0 ? '+' : ''}{growth}%
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
