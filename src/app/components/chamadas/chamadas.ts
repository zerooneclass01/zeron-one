import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { TurmaService } from '../../services/turma';
import { ChamadaService, AdicionarChamadaModel } from '../../services/chamada';
import { ChamadaItemService } from '../../services/chamada-item';
import { Router } from '@angular/router';

registerLocaleData(localePt);

@Component({
  selector: 'app-chamada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chamadas.html',
  styleUrls: ['./chamadas.css']
})
export class ChamadaComponent implements OnInit {
  turmas: any[] = [];
  alunos: any[] = [];
  idTurmaSelecionada: string = '';
  dataAula: string = new Date().toLocaleDateString('en-CA');

  carregando: boolean = false;
  chamadaIdExistente: string | null = null; // Controla se é edição ou criação

  constructor(
    private turmaService: TurmaService,
    private chamadaService: ChamadaService,
    private chamadaItemService: ChamadaItemService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.carregarTurmas();
  }

  onDataChange() {
    if (this.idTurmaSelecionada) {
      this.onTurmaChange();
    }
  }

  carregarTurmas() {
    this.turmaService.obterTodas().subscribe({
      next: (res) => {
        this.turmas = res;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar turmas', err)
    });
  }

  onTurmaChange() {
    if (!this.idTurmaSelecionada) return;
    this.carregando = true;
    this.chamadaIdExistente = null;

    // 1. Busca a lista oficial de alunos da turma
    this.turmaService.obterAlunosDaTurma(this.idTurmaSelecionada).subscribe({
      next: (alunosDaTurma) => {

        // 2. Busca se existe chamada para essa data específica
        this.chamadaService.obterPorTurmaEData(this.idTurmaSelecionada, this.dataAula).subscribe({
          next: (chamada) => {
            if (chamada) {
              this.chamadaIdExistente = chamada.idChamada;  

              // 3. Mapeia os alunos da turma trazendo o status salvo no banco
              this.alunos = alunosDaTurma.map((alunoOficial: any) => {
                const registroPresenca = chamada.alunos.find((a: any) => a.alunoId === alunoOficial.id);

                return {
                  ...alunoOficial,
                  id: alunoOficial.id,
                  presente: registroPresenca ? registroPresenca.presente : true,
                  observacao: registroPresenca ? registroPresenca.observacao : 'aluno presente',
                  exibirObs: !!(registroPresenca?.observacao && registroPresenca.observacao.length > 20)
                };
              });
            } else {
              this.carregarAlunosPadrao();
            }
            this.carregando = false;
            this.cdRef.detectChanges();
          },
          error: () => {
            this.chamadaIdExistente = null;
            this.carregarAlunosPadrao();
            this.carregando = false;
          }
        });
      }
    });
  }

  private carregarAlunosPadrao() {
    this.turmaService.obterAlunosDaTurma(this.idTurmaSelecionada).subscribe({
      next: (res) => {
        this.alunos = res.map((a: any) => ({
          ...a,
          id: a.id || a.alunoId,
          presente: true,
          observacao: 'aluno presente',
          exibirObs: false
        }));
        this.carregando = false;
        this.cdRef.detectChanges();
      },
      error: () => this.carregando = false
    });
  }

  setPresenca(aluno: any, status: boolean) {
    aluno.presente = status;
    aluno.observacao = status ? 'aluno presente' : 'aluno não veio aula';
    this.cdRef.detectChanges();
  }

  toggleObservacao(aluno: any) {
    aluno.exibirObs = !aluno.exibirObs;
    this.cdRef.detectChanges();
  }

  salvarChamada() {
    if (!this.idTurmaSelecionada) {
      alert("Selecione uma turma.");
      return;
    }

    // Corrigido: Agora aponta corretamente para os dois métodos de destino
    if (this.chamadaIdExistente) {
      this.executarAtualizacao();
    } else {
      this.executarRegistroChamadaNormal();
    }
  }

  private executarRegistroChamadaNormal() {
    this.carregando = true;
    const payload = this.montarPayload();

    this.chamadaService.registrar(payload).subscribe({
      next: (res: any) => {
        this.carregando = false;

        if (res && res.id) {
          this.chamadaIdExistente = res.id;
        }

        alert("Chamada registrada com sucesso!");
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.carregando = false;
        alert("Erro ao salvar.");
      }
    });
  }

  private executarAtualizacao() {
    if (!this.chamadaIdExistente) {
      console.error("Não foi possível atualizar: ID da chamada não encontrado.");
      alert("Erro interno: ID da chamada ausente.");
      return;
    }

    this.carregando = true;
    const alunosParaAtualizar = this.alunos.map(a => ({
      alunoId: a.id,
      presente: !!a.presente,
      observacao: a.observacao
    }));

    this.chamadaService.alterarPresencasEmLote(this.chamadaIdExistente, alunosParaAtualizar).subscribe({
      next: () => {
        this.carregando = false;
        alert("Chamada atualizada com sucesso!");
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.carregando = false;
        console.error("Erro na API:", err);
        alert("Erro ao atualizar.");
        this.cdRef.detectChanges();
      }
    });
  }

  private montarPayload(): AdicionarChamadaModel {
    return {
      turmaId: this.idTurmaSelecionada,
      dataAula: this.dataAula,
      alunos: this.alunos.map(a => ({
        alunoId: a.id,
        presente: !!a.presente,
        observacao: a.observacao || "aluno presente"
      }))
    };
  }

  irParaRelatorio() {
    if (!this.idTurmaSelecionada) return;
    this.router.navigate(['/relatorio-chamada', this.idTurmaSelecionada]);
  }

  voltar() {
    this.router.navigate(['/deshboard']);
  }
}