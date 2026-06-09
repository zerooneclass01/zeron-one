
// Mapeamento dos Enums do seu .NET
export enum StatusEnum {
  Excelente = 1,
  Regular = 2,
  Ruim = 3
}

export interface HistoricoAlunoAdicionarModel {
  alunoId: string;
  descricao: string;
  professorId: string;
  statusComportamento: StatusEnum;
  statusDesempenho: StatusEnum;
}

export interface HistoricoAlunoModel {
  id: string;
  alunoId: string;
  professorId: string;
  nomeProfessor: string;
  descricao: string;
  statusComportamento: StatusEnum;
  statusDesempenho: StatusEnum;
  dataRegistro: string;      // ISO String (date-time)
  dataAtualizacao?: string | null;
}

export interface HistoricoAtualizarModel {
  descricao: string;
  statusComportamento: StatusEnum;
  statusDesempenho: StatusEnum;
}