import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlatformStore, MRR_BY_PLAN, type Company, type CompanyStatus } from '../../store/usePlatformStore';
import type { NewAgencyData } from './AddAgencyModal';
import {
  Building2, Plus, Search, Users, UserCheck, DollarSign,
  ExternalLink, MoreHorizontal, CheckCircle, ChevronDown, ChevronRight,
  Shield,
} from 'lucide-react';
import AddAgencyModal from './AddAgencyModal';

// ─── Badge helpers ────────────────────────────────────────────────────────────

const statusColors: Record<CompanyStatus, string> = {
  Active: 'bg-green-100 text-green-700',
  Trial: 'bg-amber-100 text-amber-700',
  Suspended: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-100 text-slate-500',
};

const planColors: Record<string, string> = {
  Trial: 'bg-amber-100 text-amber-600',
  Starter: 'bg-slate-100 text-slate-600',
  Professional: 'bg-blue-100 text-blue-700',
  Enterprise: 'bg-purple-100 text-purple-700',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const { enterAgency } = useAuthStore();
  const { companies, addCompany, updateCompanyStatus, removeCompany } = usePlatformStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = companies.filter(
    (c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.primaryContactEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.agencies.some((a) => a.licenseNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const totalMrr = companies.filter((c) => c.status === 'Active').reduce((s, c) => s + c.mrr, 0);
  const allClients = companies.reduce((s, c) => s + c.agencies.reduce((a, ag) => a + ag.clients, 0), 0);
  const allCaregivers = companies.reduce((s, c) => s + c.agencies.reduce((a, ag) => a + ag.caregivers, 0), 0);
  const activeCount = companies.filter((c) => c.status === 'Active').length;

  const handleSave = (data: NewAgencyData) => {
    const companyId = `company-${Date.now()}`;
    const company: Company = {
      id: companyId,
      companyName: data.companyName || data.legalName,
      plan: data.plan,
      status: data.plan === 'Trial' ? 'Trial' : 'Active',
      billingCycle: data.billingCycle,
      mrr: MRR_BY_PLAN[data.plan],
      joinedDate: new Date().toISOString().slice(0, 10),
      notes: data.notes,
      primaryContactName: data.adminName,
      primaryContactEmail: data.adminEmail || data.agencyEmail,
      primaryContactPhone: data.adminPhone || data.agencyPhone,
      billingContactName: data.sameBillingContact ? data.adminName : data.billingName,
      billingContactEmail: data.sameBillingContact ? data.adminEmail : data.billingEmail,
      afterHoursName: data.afterHoursName,
      afterHoursPhone: data.afterHoursPhone,
      agencies: [
        {
          id: `agency-${Date.now()}`,
          companyId,
          name: data.legalName || data.companyName,
          state: data.state,
          classification: data.classification,
          licenseNumber: data.licenseNumber,
          licenseExpiry: data.licenseExpiry,
          licenseIssuedDate: data.licenseIssuedDate,
          licenseVerified: data.licenseVerified,
          licenseStatus: data.licenseStatus,
          physicalAddress: data.physicalAddress,
          physicalCity: data.physicalCity,
          physicalState: data.physicalState,
          physicalZip: data.physicalZip,
          physicalCounty: data.physicalCounty,
          agencyPhone: data.agencyPhone,
          agencyEmail: data.agencyEmail,
          taxId: data.taxId,
          npiNumber: data.npiNumber,
          medicareCertified: data.medicareCertified,
          medicareProviderNumber: data.medicareProviderNumber,
          medicaidCertified: data.medicaidCertified,
          medicaidProviderNumber: data.medicaidProviderNumber,
          servicesOffered: data.servicesOffered,
          serviceCounties: data.serviceCounties,
          payerTypes: data.payerTypes,
          languages: data.languages,
          clients: 0,
          caregivers: 0,
        },
      ],
    };
    addCompany(company);
    setShowAdd(false);
  };

  const handleSuspend = (company: Company) => {
    const next: CompanyStatus = company.status === 'Suspended' ? 'Active' : 'Suspended';
    updateCompanyStatus(company.id, next);
    setOpenMenu(null);
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Remove this company and all its agencies? This cannot be undone.')) {
      removeCompany(id);
    }
    setOpenMenu(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Companies', value: companies.length, sub: `${activeCount} active`, icon: Building2, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Clients', value: allClients, sub: 'across all agencies', icon: Users, color: 'text-teal-600 bg-teal-50' },
          { label: 'Total Caregivers', value: allCaregivers, sub: 'across all agencies', icon: UserCheck, color: 'text-green-600 bg-green-50' },
          { label: 'Monthly Recurring', value: `$${totalMrr.toLocaleString()}`, sub: 'active subscriptions', icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{value}</div>
              <div className="text-sm font-medium text-slate-600">{label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, license..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Company
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['', 'Company', 'Agencies', 'Contact', 'Plan', 'Status', 'Clients', 'Caregivers', 'MRR', 'Joined', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => {
                const compClients = company.agencies.reduce((s, a) => s + a.clients, 0);
                const compCaregivers = company.agencies.reduce((s, a) => s + a.caregivers, 0);
                const isExpanded = expandedId === company.id;

                return (
                  <React.Fragment key={company.id}>
                    {/* Company row */}
                    <tr className="border-t border-slate-100 hover:bg-slate-50 group transition-colors">
                      <td className="px-3 py-3 w-8">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : company.id)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{company.companyName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{company.primaryContactEmail}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${company.agencies.length > 1 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                          <Building2 size={11} />
                          {company.agencies.length} {company.agencies.length === 1 ? 'agency' : 'agencies'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-medium text-slate-700">{company.primaryContactName}</div>
                        <div className="text-xs text-slate-400">{company.primaryContactPhone}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planColors[company.plan]}`}>
                          {company.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[company.status]}`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">{compClients}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">{compCaregivers}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {company.mrr > 0 ? `$${company.mrr}/mo` : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(company.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => { const first = company.agencies[0]; if (first) enterAgency(first.id, company.companyName); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <ExternalLink size={12} /> Open
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === company.id ? null : company.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                              <MoreHorizontal size={15} />
                            </button>
                            {openMenu === company.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                <button onClick={() => { const first = company.agencies[0]; if (first) { enterAgency(first.id, company.companyName); } setOpenMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700">Open Dashboard</button>
                                <button onClick={() => handleSuspend(company)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700">
                                  {company.status === 'Suspended' ? 'Reactivate' : 'Suspend'} Company
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                                <button onClick={() => handleRemove(company.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600">Remove Company</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded agency sub-rows */}
                    {isExpanded && company.agencies.map((agency) => (
                      <tr key={agency.id} className="bg-slate-50/70 border-t border-slate-100">
                        <td className="pl-8" />
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-slate-700">{agency.name}</div>
                              <div className="text-xs text-slate-400">{agency.physicalCity}, {agency.physicalState}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-slate-500">{agency.licenseNumber}</span>
                            {agency.licenseVerified && <CheckCircle size={11} className="text-green-500" aria-label="Verified" />}
                            {agency.licenseStatus && agency.licenseStatus !== 'Active' && (
                              <Shield size={11} className="text-amber-500" aria-label={agency.licenseStatus} />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">{agency.classification}</td>
                        <td />
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            !agency.licenseStatus || agency.licenseStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {agency.licenseStatus || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-600 font-medium">{agency.clients}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600 font-medium">{agency.caregivers}</td>
                        <td /><td />
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => enterAgency(agency.id, `${company.companyName} — ${agency.name}`)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded-md transition-colors ml-auto"
                          >
                            <ExternalLink size={11} /> Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-5 py-12 text-center text-slate-400">No companies found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddAgencyModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
