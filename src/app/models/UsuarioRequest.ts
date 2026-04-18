// usuario.model.ts
export interface CriarUsuarioRequest {
  username: string;
  senha?: string;
  role: number; // Admin, RH, Professor, etc.
}