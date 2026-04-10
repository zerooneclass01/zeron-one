import { Component, EventEmitter, Input, OnInit, Output,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlunoService } from '../../../services/aluno'; // Ajuste o path


@Component({
  selector: 'app-turma-vincular-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turma-vincular-aluno.html',
  styleUrls: ['./turma-vincular-aluno.css']
})
export class TurmaVincularAlunoComponent implements OnInit {
  @Input() turma: any; // Recebe os dados da turma do componente pai
  @Output() fechar = new EventEmitter<void>();
  @Output() alunoVinculado = new EventEmitter<any>(); // Emite o aluno para o pai atualizar a tabela

  alunosDisponiveis: any[] = [];
  alunosFiltrados: any[] = [];
  filtro: string = '';
  carregando: boolean = true;

  constructor(
    private alunoService: AlunoService,
    private  cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarAlunosNaoVinculados();
  }

  carregarAlunosNaoVinculados() {
    this.carregando = true;

    this.alunoService.obterTodos().subscribe({
      next: (data: any[]) => {
        // Filtra apenas os alunos que não possuem vínculo (Guid vazio/zerado)
        // Geralmente, o Guid vazio no .NET é "00000000-0000-0000-0000-000000000000"
        const GUID_VAZIO = '00000000-0000-0000-0000-000000000000';

        this.alunosDisponiveis = data.filter(aluno =>
          aluno.turmaId === GUID_VAZIO ||
          aluno.turmaId === null ||
          aluno.turmaId === ''
        );

        this.alunosFiltrados = [...this.alunosDisponiveis];
        this.carregando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error("Erro ao carregar alunos:", err);
        this.carregando = false;
      }
    });
  }

  filtrar() {
    const termo = this.filtro.toLowerCase();
    this.alunosFiltrados = this.alunosDisponiveis.filter(a =>
      a.nome.toLowerCase().includes(termo) ||
      a.matricula.toString().includes(termo)
    );
  }

  vincular(aluno: any) {
    this.alunoService.vincularTurma(aluno.id, this.turma.id).subscribe({
      next: () => {
        // 1. Remove da lista do modal localmente
        this.alunosDisponiveis = this.alunosDisponiveis.filter(a => a.id !== aluno.id);
        this.filtrar();

        // 2. IMPORTANTE: Emite o aluno para o componente de Detalhe atualizar a tabela de fundo
        this.alunoVinculado.emit(aluno);

        // Opcional: Mostrar um toast de sucesso aqui
      },
      error: (err) => alert("Erro ao vincular aluno: " + err.message)
    });
  }

  fecharModal() {
    this.fechar.emit();
  }
}