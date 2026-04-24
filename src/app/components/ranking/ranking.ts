import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { TurmaService } from '../../services/turma';
import { AlunoService } from 'src/app/services/aluno';
import { RankingService } from '../../services/ranking';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css']
})
export class RankingComponent implements OnInit {
  turmas: any[] = [];
  ranking: any[] = [];
  turmaSelecionadaId: string = '';
  loading: boolean = false;
  alunosMap: Map<string, any> = new Map();

  constructor(
    private turmaService: TurmaService,
    private alunoService: AlunoService,
    private rankingService: RankingService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  // DISPARO AUTOMÁTICO: Chamado pelo (ngModelChange) no HTML
  onTurmaChange(novoId: string) {
    this.turmaSelecionadaId = novoId;
    if (this.turmaSelecionadaId) {
      this.aoSelecionarTurma();
    } else {
      this.ranking = [];
      this.cdRef.detectChanges();
    }
  }

  carregarDadosIniciais() {
    this.loading = true;
    forkJoin({
      resTurmas: this.turmaService.obterTodas(),
      resAlunos: this.alunoService.obterTodos()
    }).subscribe({
      next: (res) => {
        this.turmas = res.resTurmas;

        // Mapeia alunos para busca instantânea
        res.resAlunos.forEach((a: any) => {
          if (a.id) this.alunosMap.set(a.id.toString().toLowerCase(), a);
        });

        // Mantemos loading false para mostrar a mensagem "Selecione uma turma"
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  aoSelecionarTurma() {
    if (!this.turmaSelecionadaId) return;

    this.loading = true;
    this.ranking = []; // Limpa a tela para feedback visual imediato

    this.rankingService.getRankingDaTurma(this.turmaSelecionadaId).subscribe({
      next: (res) => {
        this.ranking = res.map((item: any) => {
          const idBusca = (item.alunoId || item.alunoid || '').toString().toLowerCase();
          const dadosAluno = this.alunosMap.get(idBusca);

          const nomeFinal = dadosAluno 
            ? (dadosAluno.nome || dadosAluno.nomeCompleto) 
            : 'Estudante não vinculado';

          return {
            ...item,
            nomeAluno: nomeFinal,
            inicial: nomeFinal.charAt(0).toUpperCase()
          };
        }).sort((a: any, b: any) => b.pontos - a.pontos);

        this.loading = false;
        this.cdRef.detectChanges(); // Força a renderização dos dados na tela
      },
      error: () => {
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  alterarPontos(itemRanking: any, valor: number) {
    const backup = itemRanking.pontos;
    const novosPontos = itemRanking.pontos + valor;

    if (novosPontos < 0) return;

    itemRanking.pontos = novosPontos;
    this.ranking.sort((a, b) => b.pontos - a.pontos);

    this.rankingService.atualizarRanking(itemRanking.id, itemRanking).subscribe({
      next: () => this.cdRef.detectChanges(),
      error: () => {
        itemRanking.pontos = backup;
        this.ranking.sort((a, b) => b.pontos - a.pontos);
        this.cdRef.detectChanges();
      }
    });
  }

  removerRanking() {
    if (!this.turmaSelecionadaId) return;

    if (confirm('Deseja apagar todo o ranking desta turma?')) {
      this.loading = true;
      this.rankingService.remover(this.turmaSelecionadaId).subscribe({
        next: () => {
          this.ranking = [];
          this.loading = false;
          this.cdRef.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdRef.detectChanges();
        }
      });
    }
  }

  gerarNovoRanking() {
    if (!this.turmaSelecionadaId) return;
    this.loading = true;
    this.rankingService.criarRankingTurma(this.turmaSelecionadaId).subscribe({
      next: () => this.aoSelecionarTurma(),
      error: () => {
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  voltar() {
    this.router.navigate(['/deshboard']);
  }
}