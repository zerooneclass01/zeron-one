import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Serviços
import { AlunoService } from '../../services/aluno'; 
import { TurmaService } from '../../services/turma'; 
import { HistoricoAlunoService } from '../../services/historico-aluno';

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

  // Mock padrão do ID do professor para inserções
  professorId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6'; 
  nomeProfessor: string = 'Eduardo Ferreira';

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
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Captura o id do aluno baseado na sua configuração de rota
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
        
        // Resolve dinamicamente o nome da turma para não ficar "Sem Turma Assinalada"
        if (alunoDados && alunoDados.turmaId) {
          this.turmaService.obterTodas().subscribe({
            next: (turmas) => {
              const turmaEncontrada = turmas.find((t: any) => t.id === alunoDados.turmaId);
              this.nomeTurmaDoAluno = turmaEncontrada ? turmaEncontrada.nome : 'Sem Turma Assinalada';
              this.cdRef.detectChanges();
            },
            error: () => this.nomeTurmaDoAluno = 'Sem Turma Assinalada'
          });
        }
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar dados do aluno:', err)
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
    if (this.modoEdicao) {
      // CORREÇÃO: Enviando apenas os campos editáveis pedidos (status e descrição)
      const modelAtualizar = {
        statusDesempenho: Number(this.novoRegistro.statusDesempenho),
        statusComportamento: Number(this.novoRegistro.statusComportamento),
        descricao: this.novoRegistro.descricao
      };

      this.historicoService.atualizarHistorico(this.registroEdicao.id, modelAtualizar).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarHistoricoDaTimeline();
        },
        error: (err) => console.error('Erro ao atualizar histórico:', err)
      });
    } else {
      const modelAdicionar = {
        alunoId: this.alunoId,
        professorId: this.professorId,
        statusDesempenho: Number(this.novoRegistro.statusDesempenho),
        statusComportamento: Number(this.novoRegistro.statusComportamento),
        descricao: this.novoRegistro.descricao
      };

      this.historicoService.adicionarHistorico(modelAdicionar).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarHistoricoDaTimeline();
        },
        error: (err) => console.error('Erro ao adicionar histórico:', err)
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