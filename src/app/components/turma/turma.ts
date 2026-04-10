import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TurmaService } from '../../services/turma';
import { ProfessorService } from '../../services/professor';
import { TurmaCadastroComponent } from './turma-cadastro/turma-cadastro';

@Component({
  selector: 'app-turma',
  standalone: true,
  imports: [CommonModule, FormsModule, TurmaCadastroComponent, RouterLink],
  templateUrl: './turma.html',
  styleUrls: ['./turma.css']
})
export class TurmaComponent implements OnInit {
  exibirModal = false;
  filtro: string = '';
  turmas: any[] = [];
  turmasFiltradas: any[] = []; // O HTML deve iterar sobre esta lista
  professores: any[] = [];
  carregando: boolean = false;

  diasDaSemanaMap = [
    { nome: 'Seg', valor: 2 },
    { nome: 'Ter', valor: 4 },
    { nome: 'Qua', valor: 8 },
    { nome: 'Qui', valor: 16 },
    { nome: 'Sex', valor: 32 },
    { nome: 'Sáb', valor: 64 },
    { nome: 'Dom', valor: 1 }
  ];

  constructor(
    private turmaService: TurmaService,
    private professorService: ProfessorService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.carregarTurmas();
    this.carregarProfessores();
  }

  // --- BUSCA DE DADOS ---

  carregarTurmas() {
    this.carregando = true;
    this.turmaService.obterTodas().subscribe({
      next: (data) => {
        this.turmas = data;
        // Faz a lista aparecer imediatamente ao carregar
        this.filtrarTurmas(); 
        this.carregando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error("Erro ao carregar turmas", err);
        this.carregando = false;
      }
    });
  }

  carregarProfessores() {
    this.professorService.obterTodos().subscribe({
      next: (data) => this.professores = data,
      error: (err) => console.error("Erro ao carregar professores", err)
    });
  }

  // --- LÓGICA DE FILTRO ---

  filtrarTurmas() {
    if (!this.filtro || this.filtro.trim() === '') {
      this.turmasFiltradas = [...this.turmas];
    } else {
      const termo = this.filtro.toLowerCase();
      this.turmasFiltradas = this.turmas.filter(t =>
        t.nome.toLowerCase().includes(termo)
      );
    }
  }

  // --- AÇÕES DA TABELA (Resolvendo os erros TS2339) ---

  alterarProfessor(turma: any) {
    this.turmaService.alterarProfessor(turma.id, turma.professorId).subscribe({
      next: () => console.log('Professor atualizado com sucesso!'),
      error: () => alert("Erro ao vincular professor.")
    });
  }

  alternarStatus(turma: any) {
    const acao$ = turma.ativo 
      ? this.turmaService.desativar(turma.id) 
      : this.turmaService.ativar(turma.id);

    acao$.subscribe({
      next: () => {
        turma.ativo = !turma.ativo;
      },
      error: () => alert("Erro ao alterar status da turma.")
    });
  }

  confirmarRemocao(turma: any) {
    if (confirm(`Deseja remover a turma ${turma.nome}?`)) {
      this.turmaService.remover(turma.id).subscribe({
        next: () => {
          this.turmas = this.turmas.filter(t => t.id !== turma.id);
          this.filtrarTurmas();
        }
      });
    }
  }

  // --- AUXILIARES ---

  formatarDias(valorBitwise: any): string {
    const valor = Number(valorBitwise);
    if (!valor || valor === 0) return 'Horário flexível';
    const selecionados = this.diasDaSemanaMap
      .filter(dia => (valor & dia.valor) === dia.valor)
      .map(dia => dia.nome);
    return selecionados.length > 0 ? selecionados.join(', ') : 'Horário flexível';
  }

  irParaDetalhe(id: string) {
    this.router.navigate(['/turma/turma-detalhe', id]);
  }

  abrirModal() { this.exibirModal = true; }
  fecharModal() { this.exibirModal = false; }
  
  aoSalvarTurma() {
    this.exibirModal = false;
    this.carregarTurmas();
  }
}