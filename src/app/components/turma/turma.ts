import { Component, OnInit } from '@angular/core';
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
  turmasFiltradas: any[] = [];
  professores: any[] = [];

  // Mapeamento para transformar o número Bitwise do banco em nomes de dias
  diasDaSemanaMap = [
    { nome: 'Seg', valor: 1 },
    { nome: 'Ter', valor: 2 },
    { nome: 'Qua', valor: 4 },
    { nome: 'Qui', valor: 8 },
    { nome: 'Sex', valor: 16 },
    { nome: 'Sáb', valor: 32 },
    { nome: 'Dom', valor: 64 }
  ];

  constructor(
    private turmaService: TurmaService,
    private professorService: ProfessorService,
    private router: Router
  ) { }

  ngOnInit() {
    this.carregarTurmas();
    this.carregarProfessores();
  }

  // --- CONTROLE DO MODAL E ATUALIZAÇÃO ---

  abrirModal() {
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
  }

  /**
   * Chamado quando o componente filho emite o evento de sucesso.
   * Fecha o modal e força um novo GET no servidor.
   */
  aoSalvarTurma() {
    this.exibirModal = false;
    // Delay de 300ms opcional para garantir que o banco persistiu o dado
    setTimeout(() => {
      this.carregarTurmas();
    }, 300);
  }

  // --- CHAMADAS DE API (GET) ---

  carregarTurmas() {
    this.turmaService.obterTodas().subscribe({
      next: (data) => {
        this.turmas = data;
        this.filtrarTurmas(); // Reaplica o filtro sobre a nova lista
      },
      error: (err) => console.error("Erro ao atualizar lista de turmas", err)
    });
  }

  carregarProfessores() {
    this.professorService.obterTodos().subscribe(data => {
      this.professores = data;
    });
  }

  // --- AÇÕES DA LISTA ---

  irParaDetalhe(id: string) {
    this.router.navigate(['/turma', id]);
  }

  formatarDias(valorBitwise: any): string {
    // Converte para número caso venha como string da API
    const valor = Number(valorBitwise);

    if (!valor || valor === 0) return 'Horário flexível';

    const selecionados = this.diasDaSemanaMap
      .filter(dia => (valor & dia.valor) !== 0)
      .map(dia => dia.nome);

    return selecionados.length > 0 ? selecionados.join(', ') : 'Horário flexível';
  }

  alterarProfessor(turma: any) {
    this.turmaService.alterarProfessor(turma.id, turma.professorId).subscribe({
      next: () => console.log('Professor vinculado com sucesso!'),
      error: (err) => alert("Erro ao trocar professor")
    });
  }

  alternarStatus(turma: any) {
    const acao$ = turma.ativo
      ? this.turmaService.desativar(turma.id)
      : this.turmaService.ativar(turma.id);

    acao$.subscribe({
      next: () => turma.ativo = !turma.ativo,
      error: (err) => console.error("Erro no status", err)
    });
  }

  confirmarRemocao(turma: any) {
    if (confirm(`Remover a turma ${turma.nome}?`)) {
      this.turmaService.remover(turma.id).subscribe({
        next: () => {
          this.turmas = this.turmas.filter(t => t.id !== turma.id);
          this.filtrarTurmas();
        }
      });
    }
  }

  filtrarTurmas() {
    this.turmasFiltradas = this.turmas.filter(t =>
      t.nome.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}