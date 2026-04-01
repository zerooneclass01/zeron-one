export interface AlunoResponser {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  idade: number; 
  dataNascimento: string;
  valorMensalidade: number;
  diaVencimento: number;
  turmaId: string | null;
  matricula?: number;
 nomeTurma?: string | null;
  ativo?: boolean;
  nomeProfessor?: string | null;
}