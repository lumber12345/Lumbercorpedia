import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ItemsPage = lazy(() => import('./pages/ItemsPage'));
const WeaponsPage = lazy(() => import('./pages/WeaponsPage'));
const DrugsPage = lazy(() => import('./pages/DrugsPage'));
const GymsPage = lazy(() => import('./pages/GymsPage'));
const EducationPage = lazy(() => import('./pages/EducationPage'));
const CrimesPage = lazy(() => import('./pages/CrimesPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const GymCalculator = lazy(() => import('./pages/tools/GymCalculator'));
const StatProjection = lazy(() => import('./pages/tools/StatProjection'));
const BoosterPlanner = lazy(() => import('./pages/tools/BoosterPlanner'));
const EducationPlanner = lazy(() => import('./pages/tools/EducationPlanner'));
const TravelProfit = lazy(() => import('./pages/tools/TravelProfit'));
const CompanyProfit = lazy(() => import('./pages/tools/CompanyProfit'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

function Loading() {
  return (
    <div className="flex items-center justify-center py-24 text-sm text-slate-500">
      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-amber-500" />
      Loading Lumbercorpedia…
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/items"
          element={
            <Suspense fallback={<Loading />}>
              <ItemsPage />
            </Suspense>
          }
        />
        <Route
          path="/weapons"
          element={
            <Suspense fallback={<Loading />}>
              <WeaponsPage />
            </Suspense>
          }
        />
        <Route
          path="/drugs"
          element={
            <Suspense fallback={<Loading />}>
              <DrugsPage />
            </Suspense>
          }
        />
        <Route
          path="/gyms"
          element={
            <Suspense fallback={<Loading />}>
              <GymsPage />
            </Suspense>
          }
        />
        <Route
          path="/education"
          element={
            <Suspense fallback={<Loading />}>
              <EducationPage />
            </Suspense>
          }
        />
        <Route
          path="/crimes"
          element={
            <Suspense fallback={<Loading />}>
              <CrimesPage />
            </Suspense>
          }
        />
        <Route
          path="/companies"
          element={
            <Suspense fallback={<Loading />}>
              <CompaniesPage />
            </Suspense>
          }
        />
        <Route
          path="/tools"
          element={
            <Suspense fallback={<Loading />}>
              <ToolsPage />
            </Suspense>
          }
        />
        <Route
          path="/tools/gym"
          element={
            <Suspense fallback={<Loading />}>
              <GymCalculator />
            </Suspense>
          }
        />
        <Route
          path="/tools/stats"
          element={
            <Suspense fallback={<Loading />}>
              <StatProjection />
            </Suspense>
          }
        />
        <Route
          path="/tools/boosters"
          element={
            <Suspense fallback={<Loading />}>
              <BoosterPlanner />
            </Suspense>
          }
        />
        <Route
          path="/tools/education"
          element={
            <Suspense fallback={<Loading />}>
              <EducationPlanner />
            </Suspense>
          }
        />
        <Route
          path="/tools/travel"
          element={
            <Suspense fallback={<Loading />}>
              <TravelProfit />
            </Suspense>
          }
        />
        <Route
          path="/tools/company"
          element={
            <Suspense fallback={<Loading />}>
              <CompanyProfit />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<Loading />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<Loading />}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
