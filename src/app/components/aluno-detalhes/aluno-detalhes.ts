import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AlunoService } from '../../services/aluno';
import { FinanceiroService } from '../../services/financeiro';
import { AlunoResponser } from '../../models/AlunoResponser.model';
import { Mensalidade } from '../../models/finaceiro.model';
import { AlunoAtualizar } from '../aluno-atualizar/aluno-atualizar';

// Mapeamento idêntico ao Enum C# do Backend
export enum FormaPagamento {
  CartaoCredito = 0,
  CartaoDebito = 1,
  Dinheiro = 2,
  Pix = 3
}

@Component({
  selector: 'app-aluno-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule, AlunoAtualizar],
  templateUrl: './aluno-detalhes.html',
  styleUrl: './aluno-detalhes.css',
})
export class AlunoDetalhes implements OnInit {
  response: AlunoResponser | null = null;
  alunoEdicao: any = {};
  exibirModal: boolean = false;
  mensalidades: Mensalidade[] = [];
  resumo = { pago: 0, atrasado: 0, pendente: 0 };
  mensagem: string = '';
  tipoMensagem: string = 'success';

  // --- PROPRIEDADES DO MODAL DE PAGAMENTO ---
  exibirModalPagamento: boolean = false;
  mensalidadeSelecionada: Mensalidade | null = null;
  formaPagamentoSelecionada: number = FormaPagamento.Dinheiro; // Valor padrão = 2
  valorRecebido: number = 0;
  troco: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alunoService: AlunoService,
    private financeiroService: FinanceiroService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      setTimeout(() => this.carregarDados(id!), 0);
    }
  }

  voltar(): void {
    this.router.navigate(['/aluno']);
  }

  carregarDados(id: string): void {
    forkJoin({
      aluno: this.alunoService.obterPorId(id),
      mensalidades: this.financeiroService.listarPorAluno(id)
    }).subscribe({
      next: (res) => {
        this.response = res.aluno;
        this.mensalidades = res.mensalidades.sort((a, b) => {
          return new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime();
        });
        this.calcularResumo();
        this.cdRef.detectChanges();
      },
      error: () => this.exibirNotificacao('Erro ao carregar dados', 'danger')
    });
  }

  statusTraducao: any = {
    2: 'Pendente',
    0: 'Pago',
    1: 'Atrasado',
    'Pendente': 'Pendente',
    'Pago': 'Pago',
    'Atrasado': 'Atrasado'
  };

  abrirModalEdicao(): void {
    this.exibirModal = true;
    if (this.response) {
      this.alunoEdicao = { ...this.response };
      this.cdRef.detectChanges();
    }
  }

  fechar(): void {
    this.exibirModal = false;
  }

  salvar(): void {
    if (this.response?.id) {
      this.alunoService.atualizar(this.response.id, this.alunoEdicao).subscribe({
        next: () => {
          this.response = { ...this.alunoEdicao };
          this.exibirNotificacao('Aluno atualizado com sucesso!', 'success');
          this.fechar();
          this.cdRef.detectChanges();
        },
        error: () => this.exibirNotificacao('Erro ao atualizar aluno', 'danger')
      });
    }
  }

  calcularResumo(): void {
    if (!this.mensalidades) return;

    this.resumo.pago = this.mensalidades
      .filter(m => String(m.status) === 'Pago' || String(m.status) === '0')
      .reduce((sum, m) => sum + m.valor, 0);

    this.resumo.atrasado = this.mensalidades
      .filter(m => String(m.status) === 'Atrasado' || String(m.status) === '1')
      .reduce((sum, m) => sum + m.valor, 0);

    this.resumo.pendente = this.mensalidades
      .filter(m => String(m.status) === 'Pendente' || String(m.status) === '2')
      .reduce((sum, m) => sum + m.valor, 0);
  }

  // --- LÓGICA DO MODAL DE PAGAMENTO ---
  abrirModalPagamento(mensalidade: Mensalidade): void {
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
        this.exibirNotificacao('Pagamento registrado com sucesso!', 'success');
        this.fecharModalPagamento();
        this.recarregarMensalidades();
      },
      error: () => this.exibirNotificacao('Erro ao registrar pagamento', 'danger')
    });
  }

  private recarregarMensalidades(): void {
    if (this.response?.id) {
      this.financeiroService.listarPorAluno(this.response.id).subscribe(res => {
        this.mensalidades = res;
        this.calcularResumo();
        this.cdRef.detectChanges();
      });
    }
  }

  private exibirNotificacao(msg: string, tipo: string): void {
    this.mensagem = msg;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
      this.cdRef.detectChanges();
    }, 3000);
  }

  trackByMensalidadeId(index: number, item: Mensalidade): string {
    return item.id;
  }

  imprimirCarteirinha(): void {
    if (this.response) {
      this.router.navigate([`/aluno/${this.response.id}/student-id-card`], {
        state: { aluno: this.response }
      });
    }
  }
}