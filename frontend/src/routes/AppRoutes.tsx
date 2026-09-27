import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from '../components/LoadingState';
import { AppLayout } from '../layouts/AppLayout';
import { AuditDetailPage } from '../pages/AuditDetailPage';
import { AuditsPage } from '../pages/AuditsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProtectedRoute } from './ProtectedRoute';

/** Carga diferida: Recharts queda fuera del paquete principal. */
const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<LoadingState />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route path="/auditorias" element={<AuditsPage />} />
          <Route path="/auditorias/:id" element={<AuditDetailPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
