import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { TurmaService } from '../../services/turma';
import { ChamadaService, AdicionarChamadaModel } from '../../services/chamada';
import { ChamadaItemService } from '../../services/chamada-item';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { routes } from '../../app.routes';

registerLocaleData(localePt);

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
  dataAula: string = new Date().toISOString().split('T')[0];

  // Estados da UI
  carregando: boolean = false;
  isDataRetroativa: boolean = false;

  constructor(
    private turmaService: TurmaService,
    private chamadaService: ChamadaService,
    private chamadaItemService: ChamadaItemService,
    private cdRef: ChangeDetectorRef,
    private router: Router, // INJETADO AQUI
    private route: ActivatedRoute

  ) { }

  ngOnInit() {
    this.carregarTurmas();
    this.validarData();
  }

  /**
   * Executado quando o input de data invisível sofre alteração
   */
  onDataChange() {
    this.validarData();
    // Se já tiver uma turma selecionada, recarrega a lista para a nova data
    if (this.idTurmaSelecionada) {
      this.onTurmaChange();
    }
    this.cdRef.detectChanges();
  }

  /**
   * Compara a data da aula com o dia de hoje
   */
  validarData() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Criamos a data a partir do string do input (AAAA-MM-DD)
    const [ano, mes, dia] = this.dataAula.split('-').map(Number);
    const dataSelecionada = new Date(ano, mes - 1, dia);

    this.isDataRetroativa = dataSelecionada.getTime() < hoje.getTime();
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
    this.turmaService.obterAlunosDaTurma(this.idTurmaSelecionada).subscribe({
      next: (res) => {
        this.alunos = res.map((a: any) => ({
          ...a,
          presente: true,
          observacao: 'aluno presente',
          exibirObs: false
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

  setPresenca(aluno: any, status: boolean) {
    aluno.presente = status;
    aluno.observacao = status ? 'aluno presente' : 'aluno não veio aula';
    this.cdRef.detectChanges();
  }

  toggleObservacao(aluno: any) {
    aluno.exibirObs = !aluno.exibirObs;
    this.cdRef.detectChanges();
  }

  /**
   * Lógica Principal de Salvamento
   */
  salvarChamada() {
    if (!this.idTurmaSelecionada) {
      alert("Por favor, selecione uma turma.");
      return;
    }

    if (this.isDataRetroativa) {
      this.salvarJustificativasRetroativas();
    } else {
      this.executarRegistroChamadaNormal();
    }
  }

  private executarRegistroChamadaNormal() {
    this.carregando = true;
    const payload: AdicionarChamadaModel = {
      turmaId: this.idTurmaSelecionada,
      dataAula: this.dataAula,
      alunos: this.alunos.map(a => ({
        alunoId: a.id,
        presente: a.presente,
        observacao: a.observacao
      }))
    };

    this.chamadaService.registrar(payload).subscribe({
      next: (res) => {
        this.carregando = false;
        alert("Chamada de hoje registrada com sucesso!");
      },
      error: (err) => {
        this.carregando = false;
        alert("Erro ao registrar: " + (err.error?.message || "Erro de conexão"));
      }
    });
  }

  private salvarJustificativasRetroativas() {
    this.carregando = true;

    // Mapeia as atualizações individuais para o serviço de itens
    const promises = this.alunos.map(a =>
      this.chamadaItemService.atualizarPresencaIndividual(a.id, {
        presente: a.presente,
        observacao: a.observacao
      }).toPromise()
    );

    Promise.all(promises)
      .then(() => {
        this.carregando = false;
        alert("Justificativas atualizadas com sucesso!");
      })
      .catch((err) => {
        this.carregando = false;
        console.error(err);
        alert("Erro ao atualizar algumas justificativas.");
      });
  }

  irParaRelatorio() {
    if (!this.idTurmaSelecionada) {
      alert("Selecione uma turma para ver o relatório.");
      return;
    }
    // Navega para a rota do relatório passando o ID da turma selecionada
this.router.navigate(['/relatorio-chamada', this.idTurmaSelecionada]);
  }
  voltar() {
    window.history.back();
  }
}