export interface Aluno {
  id?: string; 
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  valorMensalidade: number;
  diaVencimento: number;
  turmaId: string | null;
  matricula?: number; 
  nomeTurma?: string; 
  ativo?: boolean;
}