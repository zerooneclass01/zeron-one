export interface Mensalidade {
  id: string; // Guid do C# vira string no TS
  alunoId: string;
  valor: number;
  vencimento: Date;
  dataPagamento?: Date;
  status: string;
  mesReferencia?: string;
}

export interface Balancete {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  mes: number;
  ano: number;
}

