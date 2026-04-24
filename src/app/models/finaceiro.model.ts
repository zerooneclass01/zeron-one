export interface Mensalidade {
  id: string; // Guid do C# vira string no TS
  alunoId: string;
  valor: number;
  vencimento: Date;
  dataPagamento?: Date;
  status: string;
  mesReferencia?: string;
}

export interface Despesa {
  id?: string;
  descricao: string;
  valor: number;
  dataVencimento: Date | string;
  status: string;
}

export interface Balancete {
  periodo: string;
  mes: number;
  ano: number;
  totalMensalidadesRecebidas: number; // Mapeado do JSON
  totalSalariosProfessores: number;   // Mapeado do JSON
  totalGeralDespesas: number;         // Mapeado do JSON
  saldoLiquido: number;               // Mapeado do JSON
  statusFinanceiro: string;           // Mapeado do JSON
  valorPendenteReceber: number;       // Mapeado do JSON
  quantidadeAlunosInadimplentes: number;
 mensalidades: any[]; // Adicionado
  despesas: Despesa[];
}

