import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurmaService } from '../../services/turma';
import { ChamadaService, AdicionarChamadaModel, AlunoPresencaModel } from '../../services/chamada';

@Component({
  selector: 'app-chamada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chamadas.html',
  styleUrls: ['./chamadas.css']
})
export class ChamadaComponent implements OnInit {
  // Listas e Controles
  turmas: any[] = [];
  alunos: any[] = [];
  
  // Modelos de Vinculação
  idTurmaSelecionada: string = '';
  dataAula: string = new Date().toISOString().split('T')[0]; // Data atual padrão
  
  // Estados da UI
  carregando: boolean = false;

  constructor(
    private turmaService: TurmaService,
    private chamadaService: ChamadaService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.carregarTurmas();
  }

  /**
   * Busca as turmas disponíveis para o dropdown
   */
  carregarTurmas() {
    this.turmaService.obterTodas().subscribe({
      next: (res) => {
        this.turmas = res;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar turmas', err)
    });
  }

  /**
   * Executado quando o professor seleciona uma turma
   * Busca os alunos vinculados e já aplica a regra inicial de presença
   */
  onTurmaChange() {
    if (!this.idTurmaSelecionada) return;
    
    this.carregando = true;
    this.turmaService.obterAlunosDaTurma(this.idTurmaSelecionada).subscribe({
      next: (res) => {
        // Mapeia os alunos adicionando as propriedades de controle da tela
        this.alunos = res.map((a: any) => ({
          ...a,
          presente: true, // Todos começam com presença
          observacao: 'aluno presente', // Regra automática solicitada
          exibirObs: false // Controle do colapso da justificativa
        }));
        this.carregando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.carregando = false;
        console.error('Erro ao carregar alunos', err);
      }
    });
  }

  /**
   * Define a presença e aplica a regra de observação automática
   */
  setPresenca(aluno: any, status: boolean) {
    aluno.presente = status;
    
    // Regra: se presente "aluno presente", se falta "aluno não veio aula"
    aluno.observacao = status ? 'aluno presente' : 'aluno não veio aula';
    
    this.cdRef.detectChanges();
  }

  /**
   * Alterna a exibição do campo de texto para justificativa manual
   */
  toggleObservacao(aluno: any) {
    aluno.exibirObs = !aluno.exibirObs;
    this.cdRef.detectChanges();
  }

  /**
   * Envia os dados para o Backend (ChamadaController)
   */
  salvarChamada() {
    if (!this.idTurmaSelecionada) {
      alert("Por favor, selecione uma turma.");
      return;
    }

    if (this.alunos.length === 0) {
      alert("Não há alunos nesta turma para registrar presença.");
      return;
    }

    this.carregando = true;

    // Monta o payload exatamente como o seu AdicionarChamadaModel espera
    const payload: AdicionarChamadaModel = {
      turmaId: this.idTurmaSelecionada,
      dataAula: this.dataAula,
      alunos: this.alunos.map(a => ({
        alunoId: a.id,
        presente: a.presente,
        observacao: a.observacao // Envia a automática ou a manual se o prof editou
      }))
    };

    this.chamadaService.registrar(payload).subscribe({
      next: (res) => {
        this.carregando = false;
        alert(res.message || "Chamada registrada com sucesso!");
        // Opcional: limpar a tela ou redirecionar
      },
      error: (err) => {
        this.carregando = false;
        const msg = err.error?.message || "Erro ao salvar a chamada.";
        alert("Erro: " + msg);
      }
    });
  }

  voltar() {
    window.history.back();
  }
}