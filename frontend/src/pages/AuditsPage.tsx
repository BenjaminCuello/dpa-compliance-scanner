import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { Pagination } from '../components/Pagination';
import { AuditHistoryFilter } from '../features/audits/components/AuditHistoryFilter';
import { AuditHistoryTable } from '../features/audits/components/AuditHistoryTable';
import {
  NewAuditForm,
  REPOSITORY_URL_INPUT_ID,
} from '../features/audits/components/NewAuditForm';
import type { AuditStatus } from '../features/audits/types';
import { useAuditHistory } from '../features/audits/useAuditHistory';
import { usePageTitle } from '../lib/document/usePageTitle';

/** Auditorías por página del historial. */
const PAGE_SIZE = 20;

function focusRepositoryInput() {
  document.getElementById(REPOSITORY_URL_INPUT_ID)?.focus();
}

export function AuditsPage() {
  usePageTitle('Auditorías');
  const [status, setStatus] = useState<AuditStatus | ''>('');
  const [page, setPage] = useState(1);
  const { data, error, isLoading, reload } = useAuditHistory({
    status,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const handleStatusChange = (next: AuditStatus | '') => {
    setStatus(next);
    setPage(1);
  };

  const renderHistory = () => {
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (!data) return <LoadingState message="Cargando historial…" />;

    if (data.items.length === 0) {
      return status ? (
        <EmptyState
          icon={ClipboardList}
          title="No hay auditorías con este estado"
          description="Prueba con otro estado o elige “Todos”."
        />
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="Aún no tienes auditorías"
          description="Audita tu primer repositorio para ver aquí su historial."
          action={
            <button
              type="button"
              onClick={focusRepositoryInput}
              className="rounded bg-accent-strong px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong-hover"
            >
              Iniciar una auditoría
            </button>
          }
        />
      );
    }

    return (
      <>
        <AuditHistoryTable audits={data.items} isRefreshing={isLoading} />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={isLoading}
        />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold text-text">Auditorías</h1>
        <p className="mt-1 text-sm text-text-muted">
          Audita un repositorio público y revisa el historial de resultados.
        </p>
      </header>

      <NewAuditForm />

      <section aria-labelledby="historial-titulo" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="historial-titulo"
            className="text-base font-semibold text-text"
          >
            Historial
          </h2>
          <AuditHistoryFilter value={status} onChange={handleStatusChange} />
        </div>
        {renderHistory()}
      </section>
    </div>
  );
}
