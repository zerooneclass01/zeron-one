import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Adicionado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AlunoService } from '../../services/aluno';
import { FinanceiroService } from '../../services/financeiro';
import { Aluno } from '../../models/aluno.model';
import { Mensalidade } from '../../models/finaceiro.model';

@Component({
  selector: 'app-aluno-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aluno-detalhes.html',
  styleUrl: './aluno-detalhes.css',
})
export class AlunoDetalhes implements OnInit {
  aluno: Aluno | null = null;
  alunoEdicao: any = {}; 
  exibirModal: boolean = false;
  mensalidades: Mensalidade[] = [];
  resumo = { pago: 0, atrasado: 0, pendente: 0 };
  mensagem: string = '';
  tipoMensagem: string = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alunoService: AlunoService,
    private financeiroService: FinanceiroService,
    private cdRef: ChangeDetectorRef // 2. Injetado aqui
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Pequeno delay ou uso do detector resolvem o erro NG0100
      this.carregarDados(id);
    }
  }

  carregarDados(id: string): void {
    forkJoin({
      aluno: this.alunoService.obterPorId(id),
      mensalidades: this.financeiroService.listarPorAluno(id)
    }).subscribe({
      next: (res) => {
        // Atribuímos os dados
        this.aluno = res.aluno;
        this.mensalidades = res.mensalidades;
        this.calcularResumo();

        // 3. Forçamos a detecção de mudanças para evitar o erro de ciclo
        this.cdRef.detectChanges(); 
      },
      error: () => this.exibirNotificacao('Erro ao carregar dados', 'danger')
    });
  }

  voltar(): void {
    this.router.navigate(['/aluno']);
  }

  abrirModalEdicao(): void {
    if (this.aluno) {
      this.alunoEdicao = { ...this.aluno };
      this.exibirModal = true;
    }
  }

  fechar(): void {
    this.exibirModal = false;
  }

  salvar(): void {
    if (this.aluno?.id) {
      this.alunoService.atualizar(this.aluno.id, this.alunoEdicao).subscribe({
        next: () => {
          this.aluno = { ...this.alunoEdicao };
          this.exibirNotificacao('Aluno atualizado com sucesso!', 'success');
          this.fechar();
          this.cdRef.detectChanges(); // Atualiza a tela após salvar
        },
        error: () => this.exibirNotificacao('Erro ao atualizar aluno', 'danger')
      });
    }
  }

  calcularResumo(): void {
    if (!this.mensalidades) return;

    this.resumo.pago = this.mensalidades
      .filter(m => m.status === 'Pago')
      .reduce((sum, m) => sum + m.valor, 0);

    this.resumo.atrasado = this.mensalidades
      .filter(m => m.status === 'Atrasado')
      .reduce((sum, m) => sum + m.valor, 0);

    this.resumo.pendente = this.mensalidades
      .filter(m => m.status === 'Pendente')
      .reduce((sum, m) => sum + m.valor, 0);
  }

  marcarPago(id: string): void {
    this.financeiroService.pagarMensalidade(id).subscribe({
      next: () => {
        this.exibirNotificacao('Status atualizado!', 'success');
        this.recarregarMensalidades();
      }
    });
  }

  private recarregarMensalidades(): void {
    if (this.aluno?.id) {
      this.financeiroService.listarPorAluno(this.aluno.id).subscribe(res => {
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
}