import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Serviços
import { AlunoService } from '../../services/aluno'; 
import { TurmaService } from '../../services/turma'; 

@Component({
  selector: 'app-historico-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './historico-aluno.html',
  styleUrls: ['./historico-aluno.css']
})
export class HistoricoAlunoComponent implements OnInit {
  alunos: any[] = [];
  alunosFiltrados: any[] = [];
  listaTurmas: any[] = [];

  filtroNome: string = '';
  turmaSelecionada: string = '';

  constructor(
    private alunoService: AlunoService,
    private turmaService: TurmaService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarTurmas();
    this.carregarAlunos();
  }

  carregarTurmas(): void {
    this.turmaService.obterTodas().subscribe({
      next: (dados) => {this.listaTurmas = dados;
         this.cdRef.detectChanges();
      },
      
      error: (err) => console.error('Erro ao carregar turmas:', err)
      
    });
  }

  carregarAlunos(): void {
    this.alunoService.obterTodos().subscribe({
      next: (dados) => {
        this.alunos = dados;
        this.alunosFiltrados = dados;
         this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar alunos:', err)
    });
  }

  filtrar(): void {
    this.alunosFiltrados = this.alunos.filter(aluno => {
      const bateNome = aluno.nome.toLowerCase().includes(this.filtroNome.toLowerCase());
      const bateTurma = this.turmaSelecionada === '' || aluno.turmaId === this.turmaSelecionada;
      return bateNome && bateTurma;
    });
  }

  // Quando clicar na linha do aluno, leva ele para a timeline passando a ID
  verHistorico(alunoId: string): void {
    this.router.navigate(['/historico', alunoId]);
  }

  getPrimeiraLetra(nome: string): string {
    if (!nome) return '';
    return nome.trim().charAt(0).toUpperCase();
  }

  voltar(): void {
    window.history.back();
  }
}