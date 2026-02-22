import React, { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import { useAppStore } from './store/useAppStore';

const Dashboard = lazy(() => import('./modules/dashboard/Dashboard'));
const Clients = lazy(() => import('./modules/clients/index'));
const Caregivers = lazy(() => import('./modules/caregivers/index'));
const Scheduling = lazy(() => import('./modules/scheduling/index'));
const Billing = lazy(() => import('./modules/billing/index'));
const HR = lazy(() => import('./modules/hr/index'));
const Messaging = lazy(() => import('./modules/messaging/index'));
const Locations = lazy(() => import('./modules/locations/index'));
const Recruiting = lazy(() => import('./modules/recruiting/index'));
const Reports = lazy(() => import('./modules/reports/index'));
const Compliance = lazy(() => import('./modules/compliance/index'));
const Policies = lazy(() => import('./modules/policies/index'));
const SettingsModule = lazy(() => import('./modules/settings/index'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-slate-500">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

const moduleMap: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  clients: Clients,
  caregivers: Caregivers,
  scheduling: Scheduling,
  billing: Billing,
  hr: HR,
  messaging: Messaging,
  locations: Locations,
  recruiting: Recruiting,
  reports: Reports,
  compliance: Compliance,
  policies: Policies,
  settings: SettingsModule,
};

export default function App() {
  const activeModule = useAppStore((s) => s.activeModule);
  const Component = moduleMap[activeModule] || Dashboard;

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </Layout>
  );
}
