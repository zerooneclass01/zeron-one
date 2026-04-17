// usuario.model.ts
export interface CriarUsuarioRequest {
  username: string;
  senha?: string;
  role: string; // Admin, RH, Professor, etc.
}