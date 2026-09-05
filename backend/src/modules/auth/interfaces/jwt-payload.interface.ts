/** Contenido del token emitido por la aplicación. */
export interface JwtPayload {
  /** Identificador del usuario. */
  sub: string;
  email: string;
}
