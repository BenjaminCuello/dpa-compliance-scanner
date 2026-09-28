import { useEffect } from 'react';

export const APP_NAME = 'DPA Compliance Scanner';

/** Fija el título de la pestaña con el formato `<título> · DPA Compliance Scanner`. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`;
  }, [title]);
}
