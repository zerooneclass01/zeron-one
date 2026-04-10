// Representa cada aluno na lista de presença
// Model de retorno para visualização de histórico
export interface ChamadaItem {
  id: string;
  alunoId: string;
  nomeAluno: string;
  presente: boolean;
  observacao: string;
  dataAula: Date;
}