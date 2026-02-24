import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Users, UserCheck, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';
import { differenceInDays, parseISO, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

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
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const activeClients = clients.filter(c => c.status === 'Active').length;
  const activeCaregivers = caregivers.filter(c => c.status === 'Active').length;

  // Open shifts — scheduled with no caregiver assigned
  const openShifts = shifts.filter(s =>
    s.status === 'Scheduled' && (!s.caregiverId || s.caregiverId === '')
  ).length;

  // Visits completed this month
  const visitsThisMonth = shifts.filter(s =>
    s.status === 'Completed' &&
    isWithinInterval(parseISO(s.date), { start: monthStart, end: monthEnd })
  ).length;

  // EVV compliance — verified / total completed this month
  const completedThisMonth = shifts.filter(s =>
    s.status === 'Completed' &&
    isWithinInterval(parseISO(s.date), { start: monthStart, end: monthEnd })
  );
  const evvCompliance = completedThisMonth.length > 0
    ? Math.round((completedThisMonth.filter(s => s.evvVerified).length / completedThisMonth.length) * 100)
    : null;

  // Compliance alerts derived from real client/caregiver/location data
  const complianceAlerts: { name: string; issue: string; severity: 'red' | 'yellow' }[] = [];

  clients.forEach(c => {
    if (!c.disclosureSignedDate) complianceAlerts.push({ name: c.name, issue: 'Missing Disclosure Statement', severity: 'red' });
    if (!c.servicePlanDate) complianceAlerts.push({ name: c.name, issue: 'No Service Plan', severity: 'red' });
    if (c.lastMonitoringDate) {
      const days = differenceInDays(today, parseISO(c.lastMonitoringDate));
      if (days > 90) complianceAlerts.push({ name: c.name, issue: `Monitoring visit overdue (${days}d ago)`, severity: 'red' });
      else if (days > 75) complianceAlerts.push({ name: c.name, issue: 'Monitoring visit due soon', severity: 'yellow' });
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

  locations.forEach(loc => {
    if (loc.licenseExpiry) {
      const days = differenceInDays(parseISO(loc.licenseExpiry), today);
      if (days < 60) complianceAlerts.push({ name: loc.name, issue: `Agency license expires in ${days}d`, severity: days < 30 ? 'red' : 'yellow' });
    }
  });

  // Recent EVV activity — last 4 shifts with clock events recorded
  const evvFeed = shifts
    .filter(s => s.evvClockIn || s.evvClockOut)
    .sort((a, b) => {
      const aTime = a.evvClockOut || a.evvClockIn || '';
      const bTime = b.evvClockOut || b.evvClockIn || '';
      return bTime.localeCompare(aTime);
    })
    .slice(0, 4)
    .map(s => {
      const caregiver = caregivers.find(c => c.id === s.caregiverId);
      const client = clients.find(c => c.id === s.clientId);
      const isClockIn = !!s.evvClockIn && !s.evvClockOut;
      return {
        caregiver: caregiver?.name ?? 'Unknown Caregiver',
        client: client?.name ?? 'Unknown Client',
        action: isClockIn ? 'Clock In' : 'Clock Out',
        time: isClockIn ? (s.evvClockIn ?? '') : (s.evvClockOut ?? ''),
        method: s.evvMethod ?? 'GPS',
        status: s.evvVerified ? 'verified' : 'pending',
      };
    });

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
        <KPICard label="Visits This Month" value={visitsThisMonth} sub={format(today, 'MMMM yyyy')} icon={TrendingUp} color="bg-green-600" />
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
            {locations.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-400 text-center">No locations configured</div>
            ) : locations.map(loc => (
              <div key={loc.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{loc.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${loc.status === 'Active' ? 'bg-green-100 text-green-700' : loc.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                    {loc.status}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>{loc.activeClients} clients</span>
                  <span>{loc.activeCaregivers} caregivers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EVV Feed & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EVV Activity */}
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Activity size={16} className="text-green-500 animate-pulse" />
            <h2 className="font-semibold text-slate-900">Recent EVV Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {evvFeed.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-400 text-center">No EVV activity recorded yet</div>
            ) : evvFeed.map((ev, i) => (
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
              <span className="font-semibold text-slate-700">
                {evvCompliance !== null ? `${evvCompliance}%` : '—'}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full transition-all"
                style={{ width: evvCompliance !== null ? `${evvCompliance}%` : '0%' }}
              />
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Active Clients</span>
              <span className="font-semibold">{activeClients}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Active Caregivers</span>
              <span className="font-semibold">{activeCaregivers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Visits This Month</span>
              <span className="font-semibold">{visitsThisMonth}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Open Shifts</span>
              <span className="font-semibold">{openShifts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Urgent Alerts</span>
              <span className={`font-semibold ${complianceAlerts.filter(a => a.severity === 'red').length > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                {complianceAlerts.filter(a => a.severity === 'red').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
