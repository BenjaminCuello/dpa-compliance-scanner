import { Play } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ErrorState } from '../../../components/ErrorState';
import { useStartAudit } from '../useStartAudit';

/** Id del campo de repositorio, para enfocarlo desde el estado vacío. */
export const REPOSITORY_URL_INPUT_ID = 'repositoryUrl';

const inputClasses =
  'mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none';

/** Formulario para auditar un repositorio nuevo. */
export function NewAuditForm() {
  const { start, isSubmitting, error } = useStartAudit();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [projectName, setProjectName] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = projectName.trim();
    void start({
      repositoryUrl: repositoryUrl.trim(),
      ...(name ? { projectName: name } : {}),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="nueva-auditoria-titulo"
      className="space-y-4 rounded-md border border-border bg-bg p-5"
    >
      <h2
        id="nueva-auditoria-titulo"
        className="text-base font-semibold text-text"
      >
        Nueva auditoría
      </h2>

      {error && <ErrorState message={error} />}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <label className="block text-sm font-medium text-text">
          URL del repositorio
          <input
            id={REPOSITORY_URL_INPUT_ID}
            type="url"
            required
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            placeholder="https://github.com/organizacion/proyecto"
            aria-describedby="repositoryUrl-ayuda"
            className={`${inputClasses} font-mono`}
          />
          <span
            id="repositoryUrl-ayuda"
            className="mt-1 block text-xs font-normal text-text-muted"
          >
            Solo repositorios públicos de GitHub, GitLab o Bitbucket por HTTPS.
          </span>
        </label>

        <label className="block text-sm font-medium text-text">
          Nombre del proyecto{' '}
          <span className="text-text-muted">(opcional)</span>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={inputClasses}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        <Play size={16} aria-hidden="true" />
        {isSubmitting ? 'Iniciando…' : 'Iniciar auditoría'}
      </button>
    </form>
  );
}
