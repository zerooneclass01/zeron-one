import { Component, OnInit, ChangeDetectorRef,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AlunoService } from '../../services/aluno';
import { FinanceiroService } from '../../services/financeiro';
import { AlunoResponser } from '../../models/AlunoResponser.model';
import { Mensalidade } from '../../models/finaceiro.model';
import { AlunoAtualizar } from '../aluno-atualizar/aluno-atualizar';


import { StudentIdCardComponent} from '../student-id-card/student-id-card';



@Component({
  selector: 'app-aluno-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule, AlunoAtualizar,StudentIdCardComponent],
  templateUrl: './aluno-detalhes.html',
  styleUrl: './aluno-detalhes.css',
})
export class AlunoDetalhes implements OnInit {
  @ViewChild('printer') printer!: StudentIdCardComponent;
  // Centralizamos tudo no 'response' para evitar conflitos de tipos
  response: AlunoResponser | null = null;
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
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // O setTimeout garante que o Angular termine o ciclo de checagem inicial
      // resolvendo de vez o erro NG0100.
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
    'Pendente': 'Pendente', // Caso a API mude para string no futuro
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
          // Atualiza a visualização com os novos dados salvos
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

    // Convertemos para String e comparamos com o valor desejado
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
  marcarPago(id: string): void {
    this.financeiroService.pagarMensalidade(id).subscribe({
      next: () => {
        this.exibirNotificacao('Status financeiro atualizado!', 'success');
        this.recarregarMensalidades();
      }
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
      // O comando window.print() acionará o CSS @media print que configuramos
      window.print();
    }
  }
}