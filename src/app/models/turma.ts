export interface AdicionarAtualizarTurmaModel {
  nome: string;
  professorId?: string | null;
  // ADICIONE ESTAS DUAS LINHAS:
  horario?: string;      
  diasDaSemana?: number; 
}

