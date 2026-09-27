import type { AuditProject } from '../../audits/types';

interface ProjectFilterProps {
  projects: AuditProject[];
  /** `null` para "Todos los proyectos". */
  value: string | null;
  onChange: (projectId: string | null) => void;
}

/** Filtro del panel por proyecto; afecta a toda la página. */
export function ProjectFilter({
  projects,
  value,
  onChange,
}: ProjectFilterProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-text">
      Proyecto
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="max-w-60 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
      >
        <option value="">Todos los proyectos</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}
