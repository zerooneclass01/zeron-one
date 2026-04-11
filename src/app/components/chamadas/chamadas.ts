import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { TurmaService } from '../../services/turma';
import { ChamadaService, AdicionarChamadaModel, AlunoPresencaModel } from '../../services/chamada';
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
  isDataRetroativa: boolean = false;
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
    this.validarData();
  }

  onDataChange() {
    this.validarData();
    if (this.idTurmaSelecionada) {
      this.onTurmaChange();
    }
  }

  validarData() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const [ano, mes, dia] = this.dataAula.split('-').map(Number);
    const dataSelecionada = new Date(ano, mes - 1, dia);
    this.isDataRetroativa = dataSelecionada.getTime() < hoje.getTime();
    this.cdRef.detectChanges();
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
    this.chamadaIdExistente = null; // Reseta o estado

    // Tenta buscar chamada existente para esta data
    this.chamadaService.obterPorTurmaEData(this.idTurmaSelecionada, this.dataAula).subscribe({
      next: (chamada) => {
        if (chamada) {
          // MODO EDIÇÃO: Preenche com dados do banco
          this.chamadaIdExistente = chamada.id;
          this.alunos = chamada.alunos.map((a: any) => ({
            ...a,
            id: a.alunoId,
            presente: a.presente,
            observacao: a.observacao,
            exibirObs: !!(a.observacao && a.observacao.length > 20)
          }));
          this.carregando = false;
        } else {
          this.carregarAlunosPadrao();
        }
        this.cdRef.detectChanges();
      },
      error: () => {
        // MODO CRIAÇÃO: Se der erro (404), carrega lista limpa
        this.carregarAlunosPadrao();
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
      next: () => {
        this.carregando = false;
        alert("Chamada registrada!");
        this.irParaRelatorio();
      },
      error: (err) => {
        this.carregando = false;
        alert("Erro ao salvar.");
      }
    });
  }

  private executarAtualizacao() {
    this.carregando = true;
    const alunosParaAtualizar = this.alunos.map(a => ({
      alunoId: a.id,
      presente: !!a.presente,
      observacao: a.observacao
    }));

    this.chamadaService.alterarPresencasEmLote(this.chamadaIdExistente!, alunosParaAtualizar).subscribe({
      next: () => {
        this.carregando = false;
        alert("Chamada atualizada com sucesso!");
        this.irParaRelatorio();
      },
      error: () => {
        this.carregando = false;
        alert("Erro ao atualizar.");
      }
    });
  }

  private montarPayload(): AdicionarChamadaModel {
    return {
      turmaId: this.idTurmaSelecionada,
      dataAula: this.dataAula,
      alunos: this.alunos.filter(a => a.id).map(a => ({
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
     this.router.navigate(['/deshboard'])
  }
}