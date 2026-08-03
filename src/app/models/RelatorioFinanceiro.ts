export interface AlunoAtrasado {
  nomeAluno: string;
  valorDevido: number;
  diasEmAtraso: number;
}

export interface RelatorioFinanceiro {
  periodoInicio: string;
  periodoFim: string;
  totalArrecadado: number;
  totalPix: number;
  totalCartaoCredito: number;
  totalCartaoDebito: number;
  totalDinheiro: number;
  totalGastosOperacionais: number;
  custoFixoMensal: number;
  totalAlunosAtivos: number;
  totalAlunosAtrasados: number;
  valorTotalEmAtraso: number;
  valorRecadado: number;
  alunosAtrasados: AlunoAtrasado[];
}

export interface AnaliseIA {
  diagnosticoEstabilidade: string;
  nivelRiscoInadimplencia: string;
  lucroLiquidoEstimado: number;
  margemLucroPercentual: number;
  justificativaReserva: string;
  acoesRecomendadas: string[];
  piorCasoInadimplencia: string;
  estrategiaMelhoriaProximoMes: string;
}