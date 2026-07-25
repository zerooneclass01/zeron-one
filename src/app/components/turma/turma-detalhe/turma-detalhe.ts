import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurmaService } from '../../../services/turma';
import { ProfessorService } from '../../../services/professor';

// Importação dos componentes filhos (Modais e Impressão)
import { TurmaVincularAlunoComponent } from '../turma-vincular-aluno/turma-vincular-aluno';
import { TurmaEdicaoComponent } from '../turma-atualizar/turma-atualizar';


@Component({
  selector: 'app-turma-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TurmaVincularAlunoComponent,
    TurmaEdicaoComponent,
  ],
  templateUrl: './turma-detalhe.html',
  styleUrls: ['./turma-detalhe.css']
})
export class TurmaDetalheComponent implements OnInit {
  turma: any = null;
  idTurma: string = '';
  carregando: boolean = true;

  // Controles de exibição dos Modais
  exibirModalAlunos: boolean = false;
  exibirModalEdicao: boolean = false;

  // Lista para alimentar o select de professores no modal de edição
  listaProfessores: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private turmaService: TurmaService,
    private professorService: ProfessorService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Usando paramMap reativo para garantir que o ID seja capturado sempre que a rota mudar
    this.route.paramMap.subscribe(params => {
      this.idTurma = params.get('id') ?? '';

      if (this.idTurma) {
        this.carregarDados();
        this.carregarProfessores();
      } else {
        this.router.navigate(['/turma']);
      }
    });
  }

  // --- GETTER PARA IMPRESSÃO DA CHAMADA ---
  get dadosParaChamada() {
    if (!this.turma) return null;

    return {
      nome: this.turma.nome,
      professorResponsavel: this.turma.professorNome || 'Não atribuído',
      horario: this.turma.horario,
      diaSemana: this.formatarDias(this.turma.diasDaAula),
      anoLectivo: new Date().getFullYear(),
      alunos: this.turma.alunos || []
    };
  }

  carregarDados() {
    this.carregando = true;
    this.turmaService.obterPorId(this.idTurma).subscribe({
      next: (data) => {
        this.turma = data;

        // Dispara a busca de alunos imediatamente
        this.obterAlunosTurma(this.idTurma);

        // Se a turma já trouxer o ID do professor, buscamos os detalhes dele
        if (this.turma && this.turma.professorId) {
          this.ObterProfessor();
        } else {
          this.carregando = false;
          this.cdRef.detectChanges();
        }
      },
      error: (err) => {
        console.error("Erro ao carregar detalhes da turma", err);
        this.carregando = false;
        this.cdRef.detectChanges();
      }
    });
  }

  carregarProfessores() {
    this.professorService.obterTodos().subscribe({
      next: (data) => {
        this.listaProfessores = data;
      },
      error: (err) => console.error("Erro ao carregar lista de professores", err)
    });
  }

  obterAlunosTurma(turmaId: string) {
    this.turmaService.obterAlunosDaTurma(turmaId).subscribe({
      next: (data) => {
        if (this.turma) {
          this.turma.alunos = data;
          this.cdRef.detectChanges();
        }
      },
      error: (err) => console.error("Erro ao obter alunos:", err)
    });
  }

  ObterProfessor() {
    this.professorService.obterPorId(this.turma.professorId).subscribe({
      next: (data) => {
        this.turma.professorNome = data.nome;
        this.carregando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error("Erro ao buscar professor:", err);
        this.turma.professorNome = "Professor não vinculado";
        this.carregando = false;
        this.cdRef.detectChanges();
      }
    });
  }

  formatarDias(dias: any): string {
    if (dias === null || dias === undefined || dias === '') return 'Não definido';

    const diasMap = [
      { nome: 'Segunda', valor: 2 },
      { nome: 'Terça', valor: 4 },
      { nome: 'Quarta', valor: 8 },
      { nome: 'Quinta', valor: 16 },
      { nome: 'Sexta', valor: 32 },
      { nome: 'Sábado', valor: 64 },
      { nome: 'Domingo', valor: 1 }
    ];

    const valorNumerico = Number(dias);
    const selecionados = diasMap
      .filter(dia => (valorNumerico & dia.valor) === dia.valor)
      .map(dia => dia.nome);

    return selecionados.length > 0 ? selecionados.join(', ') : 'Horário flexível';
  }

  // --- AÇÕES DA TELA ---

  imprimirChamada(): void {
    // Garante que as variáveis foram computadas no HTML antes de acionar a impressão
    this.router.navigate([`/turma/${this.turma.id}/chamada`], {
      state: { turma: this.turma }
    });
  }

  abrirModalEdicao() {
    this.exibirModalEdicao = true;
  }

  onTurmaAtualizada(turmaEditada: any) {
    this.exibirModalEdicao = false;
    this.carregarDados(); // Recarrega tudo para garantir sincronia com o banco
  }

  vincularNovoAluno() {
    this.exibirModalAlunos = true;
  }

  onAlunoVinculado(novoAluno: any) {
    this.exibirModalAlunos = false;
    this.carregarDados(); // Recarrega a lista para atualizar o contador e os nomes
  }

  confirmarRemocaoTurma() {
    if (confirm(`Deseja excluir permanentemente a turma ${this.turma?.nome}?`)) {
      this.turmaService.remover(this.idTurma).subscribe({
        next: () => {
          alert("Turma removida com sucesso!");
          this.router.navigate(['/turma']);
        },
        error: (err) => {
          const msg = err.error?.message || "Erro ao excluir a turma.";
          alert(msg);
        }
      });
    }
  }

  removerAluno(alunoId: string, nomeAluno: string) {
    if (confirm(`Remover o aluno ${nomeAluno} desta turma?`)) {
      this.turmaService.removerAlunoDaTurma(alunoId, this.turma.id).subscribe({
        next: () => {
          // Filtro local para resposta instantânea na UI
          this.turma.alunos = this.turma.alunos.filter((a: any) => a.id !== alunoId);
          this.cdRef.detectChanges();
        },
        error: (err) => {
          const msg = err.error?.message || "Erro ao remover vínculo.";
          alert(msg);
        }
      });
    }
  }
}