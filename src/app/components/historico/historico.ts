import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Serviços
import { AlunoService } from '../../services/aluno'; 
import { TurmaService } from '../../services/turma'; 
import { HistoricoAlunoService } from '../../services/historico-aluno';
import { ProfessorService } from 'src/app/services/professor';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './historico.html',
  styleUrls: ['./historico.css']
})
export class HistoricoComponent implements OnInit {
  alunoId!: string;
  aluno: any = null;
  nomeTurmaDoAluno: string = 'Sem Turma Assinalada';
  
  historicos: any[] = [];
  historicosFiltrados: any[] = [];

  filtroDescricao: string = '';
  exibirModal: boolean = false;
  modoEdicao: boolean = false;
  registroEdicao: any = null;

  // Propriedades do professor resolvidas dinamicamente
  professorId!: string;
  nomeProfessor: string = 'Buscando professor...';

  novoRegistro: any = {
    statusDesempenho: 1,
    statusComportamento: 1,
    descricao: ''
  };

  constructor(
    private route: ActivatedRoute,
    private alunoService: AlunoService,
    private turmaService: TurmaService,
    private historicoService: HistoricoAlunoService,
    private professorService: ProfessorService, // Injetado novamente
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.alunoId = this.route.snapshot.paramMap.get('alunoId') || '';
    if (this.alunoId) {
      this.carregarDadosDoAluno();
      this.carregarHistoricoDaTimeline();
    }
  }

  carregarDadosDoAluno(): void {
    this.alunoService.obterPorId(this.alunoId).subscribe({
      next: (alunoDados) => {
        this.aluno = alunoDados;
        
        // Verifica a turma do aluno para encontrar o professor responsável
        if (alunoDados && alunoDados.turmaId) {
          this.turmaService.obterTodas().subscribe({
            next: (turmas) => {
              const turmaEncontrada = turmas.find((t: any) => t.id === alunoDados.turmaId);
              
              if (turmaEncontrada) {
                this.nomeTurmaDoAluno = turmaEncontrada.nome;
                
                // Se houver a chave estrangeira do professor, busca os detalhes dele na service
                if (turmaEncontrada.professorId) {
                  this.professorId = turmaEncontrada.professorId;
                  this.carregarNomeDoProfessor(turmaEncontrada.professorId);
                } else {
                  this.nomeProfessor = 'Sem Professor Atribuído';
                }
              } else {
                this.nomeTurmaDoAluno = 'Sem Turma Assinalada';
                this.nomeProfessor = 'Sem Professor Atribuído';
              }
              this.cdRef.detectChanges();
            },
            error: () => {
              this.nomeTurmaDoAluno = 'Sem Turma Assinalada';
              this.nomeProfessor = 'Erro ao carregar';
            }
          });
        } else {
          this.nomeTurmaDoAluno = 'Sem Turma Assinalada';
          this.nomeProfessor = 'Sem Professor Atribuído';
        }
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar dados do aluno:', err)
    });
  }

  // Método que faz a busca do nome do professor usando a Service
  carregarNomeDoProfessor(profId: string): void {
    this.professorService.obterPorId(profId).subscribe({
      next: (profDados) => {
        if (profDados && profDados.nome) {
          this.nomeProfessor = profDados.nome;
        } else {
          this.nomeProfessor = 'Professor Não Identificado';
        }
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar dados do professor:', err);
        this.nomeProfessor = 'Erro ao carregar nome';
      }
    });
  }

  carregarHistoricoDaTimeline(): void {
    this.historicoService.obterHistoricosDoAluno(this.alunoId).subscribe({
      next: (dados) => {
        this.historicos = dados;
        this.historicosFiltrados = dados;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar timeline:', err)
    });
  }

  filtrar(): void {
    if (!this.filtroDescricao.trim()) {
      this.historicosFiltrados = this.historicos;
    } else {
      this.historicosFiltrados = this.historicos.filter(item => 
        item.descricao?.toLowerCase().includes(this.filtroDescricao.toLowerCase())
      );
    }
  }

  abrirModalCriar(): void {
    this.modoEdicao = false;
    this.registroEdicao = null;
    this.novoRegistro = { statusDesempenho: 1, statusComportamento: 1, descricao: '' };
    this.exibirModal = true;
  }

  abrirModalEditar(item: any): void {
    this.modoEdicao = true;
    this.registroEdicao = item;
    this.novoRegistro = {
      statusDesempenho: item.statusDesempenho,
      statusComportamento: item.statusComportamento,
      descricao: item.descricao
    };
    this.exibirModal = true;
  }

  fecharModal(): void {
    this.exibirModal = false;
    this.registroEdicao = null;
  }

  salvarRegistro(): void {
    if (!this.novoRegistro.descricao || !this.novoRegistro.descricao.trim()) {
      alert('Por favor, preencha a descrição da avaliação.');
      return;
    }

    if (this.modoEdicao) {
      const modelAtualizar = {
        statusDesempenho: Number(this.novoRegistro.statusDesempenho),
        statusComportamento: Number(this.novoRegistro.statusComportamento),
        descricao: this.novoRegistro.descricao.trim()
      };

      this.historicoService.atualizarHistorico(this.registroEdicao.id, modelAtualizar).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarHistoricoDaTimeline();
        },
        error: (err) => {
          console.error('Erro ao atualizar histórico:', err);
          alert('Não foi possível atualizar o histórico.');
        }
      });
    } else {
      const modelAdicionar = {
        alunoId: this.alunoId,
        professorId: this.professorId, // Envia o ID correto que foi descoberto na turma
        statusDesempenho: Number(this.novoRegistro.statusDesempenho),
        statusComportamento: Number(this.novoRegistro.statusComportamento),
        descricao: this.novoRegistro.descricao.trim()
      };

      this.historicoService.adicionarHistorico(modelAdicionar).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarHistoricoDaTimeline();
        },
        error: (err) => {
          console.error('Erro ao adicionar histórico:', err);
          alert('Erro ao salvar. Verifique se as propriedades no console estão corretas.');
        }
      });
    }
  }

  excluirRegistro(id: string): void {
    if (confirm('Tem certeza que deseja apagar essa anotação permanentemente?')) {
      this.historicoService.removerHistorico(id).subscribe({
        next: () => {
          this.carregarHistoricoDaTimeline();
        },
        error: (err) => console.error('Erro ao deletar registro:', err)
      });
    }
  }

  getCorStatus(status: number): string {
    if (status === 1) return 'status-green';
    if (status === 2) return 'status-orange';
    return 'status-red';
  }

  getTextoStatus(status: number): string {
    if (status === 1) return 'Excelente';
    if (status === 2) return 'Regular';
    return 'Ruim';
  }

  voltar(): void {
    window.history.back();
  }
}