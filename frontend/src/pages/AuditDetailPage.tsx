import { ArrowLeft, SearchX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { AuditChecksList } from '../features/audits/components/AuditChecksList';
import { AuditDetailHeader } from '../features/audits/components/AuditDetailHeader';
import { AuditProgress } from '../features/audits/components/AuditProgress';
import { AuditTotalsCards } from '../features/audits/components/AuditTotalsCards';
import type { AuditDetail } from '../features/audits/types';
import { useAuditPolling } from '../features/audits/useAuditPolling';

const HISTORY_PATH = '/auditorias';

function AuditResult({ audit }: { audit: AuditDetail }) {
  switch (audit.status) {
    case 'pending':
    case 'running':
      return <AuditProgress status={audit.status} />;
    case 'failed':
      return (
        <ErrorState
          message={
            audit.errorMessage ??
            'La auditoría no pudo completarse. Intenta volver a auditar.'
          }
        />
      );
    case 'completed':
      return (
        <>
          <AuditTotalsCards totals={audit.totals} />
          <AuditChecksList checks={audit.checks} />
        </>
      );
  }
}

export function AuditDetailPage() {
  const { id = '' } = useParams();
  const { audit, error, notFound, retry } = useAuditPolling(id);

  const renderContent = () => {
    if (notFound) {
      return (
        <EmptyState
          icon={SearchX}
          title="Auditoría no encontrada"
          description="No existe o no tienes acceso a ella."
          action={
            <Link
              to={HISTORY_PATH}
              className="text-sm font-medium text-accent-text hover:underline"
            >
              Ir al historial
            </Link>
          }
        />
      );
    }

    if (!audit) {
      return error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <LoadingState message="Cargando auditoría…" />
      );
    }

    return (
      <>
        <AuditDetailHeader audit={audit} />
        {error && <ErrorState message={error} onRetry={retry} />}
        <AuditResult audit={audit} />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Link
        to={HISTORY_PATH}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al historial
      </Link>
      {renderContent()}
    </div>
  );
}
