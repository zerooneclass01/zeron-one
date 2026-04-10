export interface RelatorioTurma {
  turmaNome: string;
  totalAulasNoPeriodo: number;
  alunos: AlunoRelatorio[];
}

export interface AlunoRelatorio {
  nome: string;
  totalPresencas: number;
  totalFaltas: number;
  frequencia: number;
  // Nome deve ser IGUAL ao que o C# envia no JSON (PascalCase ou camelCase)
  presencasDetalhes: PresencaDetalhe[]; 
}

export interface PresencaDetalhe {
  data: Date;
  presente: boolean;
  justificativa?: string;
}