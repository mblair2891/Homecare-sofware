import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Users, UserCheck, DollarSign, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';

function KPICard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { clients, caregivers, shifts, locations } = useAppStore();
  const today = new Date();

  const activeClients = clients.filter(c => c.status === 'Active').length;
  const activeCaregivers = caregivers.filter(c => c.status === 'Active').length;

  // Compliance alerts
  const complianceAlerts: { name: string; issue: string; severity: 'red' | 'yellow' }[] = [];

  clients.forEach(c => {
    if (!c.disclosureSignedDate) complianceAlerts.push({ name: c.name, issue: 'Missing Disclosure Statement', severity: 'red' });
    if (!c.servicePlanDate) complianceAlerts.push({ name: c.name, issue: 'No Service Plan', severity: 'red' });
    if (c.lastMonitoringDate) {
      const days = differenceInDays(today, parseISO(c.lastMonitoringDate));
      if (days > 90) complianceAlerts.push({ name: c.name, issue: `Monitoring visit overdue (${days}d ago)`, severity: 'red' });
      else if (days > 75) complianceAlerts.push({ name: c.name, issue: `Monitoring visit due soon`, severity: 'yellow' });
    }
    if (c.canSelfDirect && c.lastSelfDirectionEvalDate) {
      const days = differenceInDays(today, parseISO(c.lastSelfDirectionEvalDate));
      if (days > 90) complianceAlerts.push({ name: c.name, issue: 'Self-direction eval overdue', severity: 'red' });
    }
  });

  caregivers.forEach(cg => {
    if (cg.backgroundCheckDate) {
      const years = differenceInDays(today, parseISO(cg.backgroundCheckDate)) / 365;
      if (years > 3) complianceAlerts.push({ name: cg.name, issue: 'Background check renewal overdue (3yr)', severity: 'red' });
      else if (years > 2.75) complianceAlerts.push({ name: cg.name, issue: 'Background check renewal due soon', severity: 'yellow' });
    }
    if (cg.licenseExpiry) {
      const days = differenceInDays(parseISO(cg.licenseExpiry), today);
      if (days < 0) complianceAlerts.push({ name: cg.name, issue: 'License EXPIRED', severity: 'red' });
      else if (days < 30) complianceAlerts.push({ name: cg.name, issue: `License expires in ${days}d`, severity: 'yellow' });
    }
    if (cg.lastAnnualTrainingDate) {
      const days = differenceInDays(today, parseISO(cg.lastAnnualTrainingDate));
      if (days > 365) complianceAlerts.push({ name: cg.name, issue: 'Annual training overdue', severity: 'red' });
    }
  });

  // License expiry alerts
  locations.forEach(loc => {
    if (loc.licenseExpiry) {
      const days = differenceInDays(parseISO(loc.licenseExpiry), today);
      if (days < 60) complianceAlerts.push({ name: loc.name, issue: `Agency license expires in ${days}d`, severity: days < 30 ? 'red' : 'yellow' });
    }
  });

  const openShifts = 7; // demo
  const monthlyRevenue = '$142,850';
  const evvCompliance = 94;

  // Recent EVV activity (demo)
  const evvFeed = [
    { caregiver: 'Maria Santos', client: 'Margaret Thompson', action: 'Clock In', time: '8:02 AM', method: 'GPS', status: 'verified' },
    { caregiver: 'James Wilson', client: 'Margaret Thompson', action: 'Clock Out', time: '12:15 PM', method: 'GPS', status: 'verified' },
    { caregiver: 'Angela Davis', client: 'Dorothy Williams', action: 'Clock In', time: '9:30 AM', method: 'Telephony', status: 'verified' },
    { caregiver: 'Robert Kim', client: 'Frank Morales', action: 'Clock In', time: '10:00 AM', method: 'GPS', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">{format(today, 'EEEE, MMMM d, yyyy')} — All Locations</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Clients" value={activeClients} sub={`${clients.length} total`} icon={Users} color="bg-blue-600" />
        <KPICard label="Active Caregivers" value={activeCaregivers} sub={`${caregivers.length} total`} icon={UserCheck} color="bg-teal-600" />
        <KPICard label="Monthly Revenue" value={monthlyRevenue} sub="Feb 2026" icon={DollarSign} color="bg-green-600" />
        <KPICard label="Open Shifts" value={openShifts} sub="Need coverage" icon={Clock} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Alerts */}
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Compliance Alerts
              {complianceAlerts.length > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">{complianceAlerts.length}</span>
              )}
            </h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {complianceAlerts.length === 0 ? (
              <div className="flex items-center gap-3 px-5 py-8 text-slate-400">
                <CheckCircle size={20} className="text-green-500" />
                <span>No compliance issues detected</span>
              </div>
            ) : complianceAlerts.slice(0, 10).map((alert, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-700 text-sm">{alert.name}</span>
                  <span className="text-slate-400 text-sm"> — {alert.issue}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${alert.severity === 'red' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {alert.severity === 'red' ? 'URGENT' : 'DUE SOON'}
                </span>
              </div>
            ))}
            {complianceAlerts.length > 10 && (
              <div className="px-5 py-3 text-xs text-slate-400">+{complianceAlerts.length - 10} more alerts</div>
            )}
          </div>
        </div>

        {/* Location Summary */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Locations</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {locations.filter(l => l.status !== 'Planning').map(loc => (
              <div key={loc.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{loc.name}</span>
                  <span className="badge-blue">{loc.classification}</span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>{loc.activeClients} clients</span>
                  <span>{loc.activeCaregivers} caregivers</span>
                </div>
              </div>
            ))}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">Bend (Planned)</span>
                <span className="badge-gray">Planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EVV Feed & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live EVV */}
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Activity size={16} className="text-green-500 animate-pulse" />
            <h2 className="font-semibold text-slate-900">Live EVV Feed</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {evvFeed.map((ev, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className={`p-1.5 rounded-full ${ev.action === 'Clock In' ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {ev.action === 'Clock In' ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} className="text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700">{ev.caregiver} → {ev.client}</div>
                  <div className="text-xs text-slate-400">{ev.action} at {ev.time} via {ev.method}</div>
                </div>
                <span className={`text-xs font-medium ${ev.status === 'verified' ? 'text-green-600' : 'text-amber-500'}`}>
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Key Metrics</h2>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">EVV Compliance</span>
              <span className="font-semibold text-slate-700">{evvCompliance}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: `${evvCompliance}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Caregiver Utilization</span>
              <span className="font-semibold text-slate-700">82%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">90-Day Retention</span>
              <span className="font-semibold text-slate-700">78%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-teal-500 rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Training Compliance</span>
              <span className="font-semibold text-slate-700">91%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-purple-500 rounded-full" style={{ width: '91%' }} />
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Avg Client Rating</span>
              <span className="font-semibold">4.8 / 5.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Visits This Month</span>
              <span className="font-semibold">1,284</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Open Incidents</span>
              <span className="font-semibold text-red-600">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
