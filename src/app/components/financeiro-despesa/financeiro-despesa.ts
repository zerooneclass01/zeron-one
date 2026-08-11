import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { FinanceiroService } from '../../services/financeiro';
import { AlunoService } from '../../services/aluno';
import { ProfessorService } from '../../services/professor';
import { Balancete, Despesa, Mensalidade } from '../../models/finaceiro.model';

// Mapeamento idêntico ao Enum C# do Backend
export enum FormaPagamento {
  CartaoCredito = 0,
  CartaoDebito = 1,
  Dinheiro = 2,
  Pix = 3
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financeiro-despesa.html',
  styleUrls: ['./financeiro-despesa.css']
})
export class FinanceiroDespesasComponent implements OnInit {
  abaAtiva: 'mensalidades' | 'despesas' = 'mensalidades';
  exibirModalDespesa = false;

  mesSelecionado: string = this.obterNomeMesAtual();
  anoAtual: number = new Date().getFullYear();

  balancete: Balancete = this.inicializarBalancete();
  listaAlunos: any[] = [];
  listaProfessores: any[] = [];

  // Controle de busca
  filtroAluno: string = '';
  mensalidadesFiltradas: any[] = [];

  categorias: string[] = ['Conta', 'Material', 'Aluguel', 'Marketing', 'Manutenção', 'Outros', 'Salário'];
  novaDespesa: Despesa = this.limparDespesa();
  statusTraducao: any = { '0': 'Pago', '1': 'Atrasado', '2': 'Pendente' };

  // --- CONTROLE DO MODAL DE PAGAMENTO ---
  exibirModalPagamento: boolean = false;
  mensalidadeSelecionada: any | null = null;
  formaPagamentoSelecionada: number = FormaPagamento.Dinheiro; // Padrão: 2
  valorRecebido: number = 0;
  troco: number = 0;

  constructor(
    private financeiroService: FinanceiroService,
    private alunoService: AlunoService,
    private professorService: ProfessorService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    forkJoin({
      alunos: this.alunoService.obterTodos().pipe(map(alunos=> (alunos ?? []).filter(aluno => aluno.ativo !== false))),
      professores: this.professorService.obterTodos()
    }).subscribe({
      next: (res) => {
        this.listaAlunos = res.alunos;
        this.listaProfessores = res.professores;
        this.carregarDados();
      },
      error: (err) => console.error('Erro ao carregar dados iniciais', err)
    });
  }

  carregarDados() {
    const meses: { [key: string]: number } = {
      'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4, 'Maio': 5, 'Junho': 6,
      'Julho': 7, 'Agosto': 8, 'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
    };
    const mesNum = meses[this.mesSelecionado];

    forkJoin({
      mensalidades: this.financeiroService.listarTodasMensalidades(),
      despesas: this.financeiroService.obterDespesas(mesNum, this.anoAtual)
    }).subscribe({
      next: (res) => {
        const mensalidadesMapeadas = res.mensalidades
          .filter(m => {
            const d = new Date(m.vencimento);
            return (d.getUTCMonth() + 1) === mesNum && d.getUTCFullYear() === this.anoAtual;
          })
          .map(m => {
            const aluno = this.listaAlunos.find(a => String(a.id) === String(m.alunoId));
            return { ...m, alunoNome: aluno ? aluno.nome : 'Aluno não encontrado' };
          });

        const despesasMapeadas = res.despesas.map(d => {
          let descFormatada = d.descricao;
          if (d.categoria === 6) {
            const prof = this.listaProfessores.find(p => String(p.id) === String((d as any).professorId));
            if (prof) descFormatada = `Salário: ${prof.nome}`;
          }
          return { ...d, descricaoFormatada: descFormatada };
        });

        this.processarBalanceteManual(mensalidadesMapeadas, despesasMapeadas);
        this.filtrarAlunos();
        this.cdRef.detectChanges();
      }
    });
  }

  filtrarAlunos() {
    const termo = this.filtroAluno.toLowerCase().trim();
    this.mensalidadesFiltradas = this.balancete.mensalidades.filter(m =>
      m.alunoNome?.toLowerCase().includes(termo)
    );
  }

  private processarBalanceteManual(mensalidades: any[], despesas: any[]) {
    let entradas = 0, gastos = 0, salarios = 0, pendente = 0;

    mensalidades.forEach(m => {
      if (m.status == 0 || m.status == '0') entradas += m.valor;
      else pendente += m.valor;
    });

    despesas.forEach(d => {
      gastos += d.valor;
      if (d.categoria === 6) salarios += d.valor;
    });

    this.balancete = {
      ...this.balancete,
      periodo: `${this.mesSelecionado}/${this.anoAtual}`,
      totalMensalidadesRecebidas: entradas,
      totalGeralDespesas: gastos,
      totalSalariosProfessores: salarios,
      saldoLiquido: entradas - gastos,
      valorPendenteReceber: pendente,
      quantidadeAlunosInadimplentes: mensalidades.filter(m => m.status != 0).length,
      mensalidades,
      despesas
    };
  }

  alterarStatus(id: string, novoStatus: any) {
    const statusNum = parseInt(novoStatus);
    this.financeiroService.mudarStatusMensalidade(id, statusNum).subscribe(() => this.carregarDados());
  }

  // --- LÓGICA DO MODAL DE PAGAMENTO ---
  abrirModalPagamento(mensalidade: any): void {
    this.mensalidadeSelecionada = mensalidade;
    this.formaPagamentoSelecionada = FormaPagamento.Dinheiro; // Padrão: 2
    this.valorRecebido = mensalidade.valor;
    this.troco = 0;
    this.exibirModalPagamento = true;
    this.cdRef.detectChanges();
  }

  fecharModalPagamento(): void {
    this.exibirModalPagamento = false;
    this.mensalidadeSelecionada = null;
  }

  calcularTroco(): void {
    if (this.mensalidadeSelecionada && this.valorRecebido > this.mensalidadeSelecionada.valor) {
      this.troco = this.valorRecebido - this.mensalidadeSelecionada.valor;
    } else {
      this.troco = 0;
    }
  }

  confirmarPagamento(): void {
    if (!this.mensalidadeSelecionada) return;

    const id = this.mensalidadeSelecionada.id;
    const valor = this.mensalidadeSelecionada.valor;
    const formaPagamento = Number(this.formaPagamentoSelecionada);

    this.financeiroService.pagarMensalidade(id, valor, formaPagamento).subscribe({
      next: () => {
        this.fecharModalPagamento();
        this.carregarDados();
      },
      error: (err) => console.error('Erro ao processar pagamento:', err)
    });
  }

  salvarDespesa() {
    const tratarDataParaBackend = (valor: any) => {
      if (!valor) return null;

      if (valor instanceof Date) return valor.toISOString().split('T')[0];

      if (typeof valor === 'string' && valor.includes('/')) {
        const [dia, mes, ano] = valor.split('/');
        if (ano && ano.length === 4) {
          return `${ano}-${mes}-${dia}`;
        }
      }

      if (typeof valor === 'string' && valor.includes('-')) {
        return valor.split('T')[0];
      }

      return null;
    };

    const payload = {
      descricao: this.novaDespesa.descricao,
      valor: this.novaDespesa.valor,
      dataVencimento: tratarDataParaBackend(this.novaDespesa.dataVencimento) || new Date().toISOString().split('T')[0],
      dataPagamento: tratarDataParaBackend(this.novaDespesa.dataPagamento),
      pago: this.novaDespesa.pago,
      categoria: parseInt(this.novaDespesa.categoria.toString())
    };

    this.financeiroService.registrarDespesa(payload).subscribe({
      next: () => {
        this.fecharModalDespesa();
        this.carregarDados();
      },
      error: (err) => console.error("Erro 400 detalhes:", err.error)
    });
  }

  fecharModalDespesa() {
    this.exibirModalDespesa = false;
    this.novaDespesa = this.limparDespesa();
  }

  limparDespesa(): Despesa {
    return { id: '', descricao: '', valor: 0, dataVencimento: new Date().toISOString().split('T')[0], dataPagamento: new Date().toISOString().split('T')[0], pago: true, categoria: 0 };
  }

  traduzirCategoria(cat: number) { return this.categorias[cat] || 'Outros'; }

  obterNomeMesAtual() {
    return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][new Date().getMonth()];
  }

  voltar() { this.router.navigate(['/dashboard']); }
  relatorio() { this.router.navigate(['/relatorio-financeiro']); }

  private inicializarBalancete(): Balancete {
    return { periodo: '', mes: 0, ano: 0, totalMensalidadesRecebidas: 0, totalGeralDespesas: 0, saldoLiquido: 0, totalSalariosProfessores: 0, statusFinanceiro: '', valorPendenteReceber: 0, quantidadeAlunosInadimplentes: 0, mensalidades: [], despesas: [] };
  }

  removerDespesa(id: string) {
    if (confirm('Deseja excluir esta despesa permanentemente?')) {
      this.financeiroService.excluirDespesa(id).subscribe({
        next: () => {
          this.carregarDados();
        },
        error: (err) => {
          console.error("Erro ao excluir despesa:", err);
          alert("Não foi possível excluir a despesa.");
        }
      });
    }
  }

  formatarData(dataIso: string): string {
    if (!dataIso) return '';
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}