import { BarChart3, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { AllProjectsView } from '../features/dashboard/components/AllProjectsView';
import { ProjectFilter } from '../features/dashboard/components/ProjectFilter';
import { ProjectView } from '../features/dashboard/components/ProjectView';
import { MAX_PAGES, PAGE_LIMIT } from '../features/dashboard/loadDashboardData';
import { projectOptions } from '../features/dashboard/projects';
import { useDashboardData } from '../features/dashboard/useDashboardData';
import { useProjectFilter } from '../features/dashboard/useProjectFilter';

export function DashboardPage() {
  const { summaries, latestDetails, isTruncated, isLoading, error, reload } =
    useDashboardData();
  const projects = useMemo(() => projectOptions(summaries), [summaries]);
  const { projectId, setProjectId } = useProjectFilter(
    projects,
    !isLoading && !error,
  );
  const hasData = summaries.length > 0;

  const renderContent = () => {
    if (!hasData) {
      if (error) return <ErrorState message={error} onRetry={reload} />;
      if (isLoading) return <LoadingState message="Cargando panel…" />;
      return (
        <EmptyState
          icon={BarChart3}
          title="Aún no hay datos de cumplimiento"
          description="Inicia la primera auditoría para ver aquí el cumplimiento de tus proyectos."
          action={
            <Link
              to="/auditorias"
              className="rounded bg-accent-strong px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong-hover"
            >
              Ir a auditorías
            </Link>
          }
        />
      );
    }

    return (
      <>
        {error && <ErrorState message={error} onRetry={reload} />}
        <div
          aria-busy={isLoading}
          className={`space-y-6 transition-opacity ${isLoading ? 'opacity-60' : ''}`}
        >
          {projectId ? (
            <ProjectView
              projectId={projectId}
              summaries={summaries}
              latestDetails={latestDetails}
            />
          ) : (
            <AllProjectsView
              summaries={summaries}
              latestDetails={latestDetails}
              onSelectProject={setProjectId}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text">
            Panel de cumplimiento
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Resultado de las auditorías de tus repositorios.
          </p>
        </div>
        {hasData && (
          <div className="flex flex-wrap items-center gap-3">
            <ProjectFilter
              projects={projects}
              value={projectId}
              onChange={setProjectId}
            />
            <button
              type="button"
              onClick={reload}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Actualizar
            </button>
          </div>
        )}
      </header>
      {isTruncated && (
        <p className="text-xs text-text-muted">
          El panel considera las {MAX_PAGES * PAGE_LIMIT} auditorías más
          recientes.
        </p>
      )}
      {renderContent()}
    </div>
  );
}
