export interface Mensalidade {
  id: string; // Guid do C# vira string no TS
  alunoId: string;
  valor: number;
  vencimento: Date;
  dataPagamento?: Date;
 status: number | string;
  mesReferencia?: string;
  alunoNome?: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  dataPagamento:string;
  dataVencimento: string;
  pago: boolean;
  categoria: number;
}

export interface Balancete {
  periodo: string;
  mes: number;
  ano: number;
  totalMensalidadesRecebidas: number;
  totalGeralDespesas: number;
  saldoLiquido: number;
  totalSalariosProfessores: number;
  statusFinanceiro: string;
  valorPendenteReceber: number;
  quantidadeAlunosInadimplentes: number;
  mensalidades: Mensalidade[];
  despesas: Despesa[];
}

