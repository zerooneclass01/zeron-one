import { Component, OnInit } from '@angular/core';
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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais() {
    this.loading = true;
    forkJoin({
      resTurmas: this.turmaService.obterTodas(),
      resAlunos: this.alunoService.obterTodos()
    }).subscribe({
      next: (res) => {
        this.turmas = res.resTurmas;

        // 1. Mapeia os alunos (para garantir que os nomes apareçam)
        res.resAlunos.forEach((a: any) => this.alunosMap.set(a.id, a));

        // 2. SELEÇÃO AUTOMÁTICA
        if (this.turmas && this.turmas.length > 0) {
          // Define a primeira turma como selecionada
          this.turmaSelecionadaId = this.turmas[0].id;

          // 3. CONSULTA AUTOMÁTICA (Isso faz a tabela aparecer sem clique)
          this.aoSelecionarTurma();
        } else {
          this.loading = false;
        }
      }
    });
  }

  aoSelecionarTurma() {

    const idCapturado = this.turmaSelecionadaId;
    
    if (!idCapturado) return;

    if (!this.turmaSelecionadaId) return;

    this.loading = true;
    this.rankingService.getRankingDaTurma(this.turmaSelecionadaId).subscribe({
      next: (res) => {
        this.ranking = res.map((item: any) => {
          // 1. Tenta pegar o ID de qualquer forma (alunoId ou alunoid)
          const idDoAlunoNoRanking = item.alunoId || item.alunoid;

          // 2. Busca no mapa garantindo que a comparação não falhe por causa de letras maiúsculas/minúsculas
          // Convertemos ambos para string e minúsculo para garantir o match
          const dadosAluno = Array.from(this.alunosMap.values()).find(
            a => a.id.toLowerCase() === idDoAlunoNoRanking.toLowerCase()
          );

          const nomeFinal = dadosAluno ? (dadosAluno.nome || dadosAluno.nomeCompleto) : 'Estudante não vinculado';

          return {
            ...item,
            nomeAluno: nomeFinal,
            inicial: nomeFinal.charAt(0).toUpperCase()
          };
        }).sort((a: any, b: any) => b.pontos - a.pontos);

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  removerRanking() {
    const idParaRemover = this.turmaSelecionadaId;

    if (!idParaRemover || idParaRemover === '') {
      console.error("Nenhuma turma selecionada para remover");
      return;
    }

    if (confirm('Deseja apagar todo o ranking?')) {
      this.loading = true;
      // O service deve chamar algo como: return this.http.delete(`${this.apiUrl}/${turmaId}`)
      this.rankingService.remover(idParaRemover).subscribe({
        next: () => {
          this.ranking = [];
          this.loading = false;
        },
        error: (err) => {
          console.error("Erro no servidor:", err);
          this.loading = false;
        }
      });
    }
  }

  // ... (outros métodos: alterarPontos, gerarNovoRanking, voltar)
  alterarPontos(itemRanking: any, valor: number) {
    const backup = itemRanking.pontos;
    itemRanking.pontos += valor;
    if (itemRanking.pontos < 0) { itemRanking.pontos = 0; return; }
    this.ranking.sort((a, b) => b.pontos - a.pontos);

    this.rankingService.atualizarRanking(itemRanking.id, itemRanking).subscribe({
      error: () => {
        itemRanking.pontos = backup;
        this.ranking.sort((a, b) => b.pontos - a.pontos);
      }
    });
  }

  gerarNovoRanking() {
    this.loading = true;
    this.rankingService.criarRankingTurma(this.turmaSelecionadaId).subscribe(() => this.aoSelecionarTurma());
  }

  voltar() { this.router.navigate(['/deshboard']); }
}