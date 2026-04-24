import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FinanceiroService } from '../../services/financeiro';
 import { AlunoService} from '../../services/aluno';
import { Balancete, Despesa } from '../../models/finaceiro.model';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financeiro-despesa.html',
  styleUrls: ['./financeiro-despesa.css']
})
export class FinanceiroDespesasComponent implements OnInit {
  abaAtiva: 'mensalidades' | 'despesas' = 'despesas';
  exibirModalDespesa: boolean = false;
  exibirModalMensalidade: boolean = false;
  loading: boolean = false;

  mesSelecionado: string = 'Janeiro'; // Sempre inicia em Janeiro
  anoAtual: number = new Date().getFullYear();

  balancete: Balancete = {
    periodo: '',
    mes: 1,
    ano: this.anoAtual,
    totalMensalidadesRecebidas: 0,
    totalSalariosProfessores: 0,
    totalGeralDespesas: 0,
    saldoLiquido: 0,
    statusFinanceiro: 'Estável',
    valorPendenteReceber: 0,
    quantidadeAlunosInadimplentes: 0,
    mensalidades: [],
    despesas: []
  };

  listaAlunos: any[] = [];
  novaDespesa: Despesa = this.limparDespesa();
  novaMensalidade = { alunoId: '', valor: 0, vencimento: new Date().toISOString().split('T')[0] };

  private readonly mesesMap: { [key: string]: number } = {
    'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
    'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
    'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
  };

  constructor(
    private financeiroService: FinanceiroService,
    private alunoservice:AlunoService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarDados();
    this.carregarAlunos();
  }

  carregarDados() {
    this.loading = true;
    const mesNumero = this.mesesMap[this.mesSelecionado];
    this.financeiroService.obterBalancete(mesNumero, this.anoAtual).subscribe({
      next: (res) => {
        // Fazemos o merge dos dados do JSON com as listas (caso venham separadas ou no mesmo objeto)
        this.balancete = { ...this.balancete, ...res };
        this.balancete.saldoLiquido = this.balancete.totalMensalidadesRecebidas - this.balancete.totalGeralDespesas;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  carregarAlunos() {
    // Aqui usamos a service para buscar a lista de alunos para o modal
    this.alunoservice.obterTodos().subscribe(res => this.listaAlunos = res);
  }

  // --- Métodos de Ação ---
  confirmarPagamento(id: string) {
    if (confirm('Deseja dar baixa nesta mensalidade?')) {
      this.financeiroService.pagarMensalidade(id).subscribe(() => this.carregarDados());
    }
  }

  gerarMensalidade() {
    this.financeiroService.gerarMensalidade(
      this.novaMensalidade.alunoId,
      this.novaMensalidade.valor,
      new Date(this.novaMensalidade.vencimento)
    ).subscribe(() => {
      this.exibirModalMensalidade = false;
      this.carregarDados();
    });
  }

  fecharModalDespesa() {
    this.exibirModalDespesa = false;
    this.novaDespesa = this.limparDespesa();
  }

  fecharModalMensalidade() {
    this.exibirModalMensalidade = false;
    this.novaMensalidade = { alunoId: '', valor: 0, vencimento: new Date().toISOString().split('T')[0] };
  }

  salvarDespesa() {
    this.financeiroService.registrarDespesa(this.novaDespesa).subscribe(() => {
      this.exibirModalDespesa = false;
      this.carregarDados();
    });
  }

  limparDespesa(): Despesa {
    return { descricao: '', valor: 0, dataVencimento: new Date().toISOString().split('T')[0], status: 'Pendente' };
  }

  voltar() { this.router.navigate(['/dashboard']); }
}