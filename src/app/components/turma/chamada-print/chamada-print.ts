import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export interface AlunoMatriculado {
  matricula: string;
  nome: string;
}

export interface TurmaChamadaData {
  id?: string;
  nome: string;
  professorResponsavel: string;
  horario: string;
  diaSemana: string;
  anoLectivo?: number;
  alunos: AlunoMatriculado[];
}

@Component({
  selector: 'app-chamada-print',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chamada-print.html',
  styleUrls: ['./chamada-print.css']
})
export class ChamadaPrintComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // 1. Adicionado o @Input() para o Angular reconhecer a propriedade [turma]
  @Input() turma: TurmaChamadaData | null = null;
  @Input() minLinhas: number = 12;

  // Modal inicia ABERTO assim que entra na tela
  exibirModal: boolean = true;

  listaMeses = [
    { valor: 1, nome: 'JANEIRO' },
    { valor: 2, nome: 'FEVEREIRO' },
    { valor: 3, nome: 'MARÇO' },
    { valor: 4, nome: 'ABRIL' },
    { valor: 5, nome: 'MAIO' },
    { valor: 6, nome: 'JUNHO' },
    { valor: 7, nome: 'JULHO' },
    { valor: 8, nome: 'AGOSTO' },
    { valor: 9, nome: 'SETEMBRO' },
    { valor: 10, nome: 'OUTUBRO' },
    { valor: 11, nome: 'NOVEMBRO' },
    { valor: 12, nome: 'DEZEMBRO' }
  ];

  mesTemp: number = new Date().getMonth() + 1;
  anoTemp: number = 2026;

  mesSelecionadoNum: number = new Date().getMonth() + 1;
  anoAtual: number = 2026;

  ngOnInit(): void {
    // 2. Se a turma NÃO veio pelo @Input() do pai, tenta pegar pela Rota/History State
    if (!this.turma) {
      const state = history.state;
      
      if (state && state.turma) {
        this.turma = state.turma;
      } else {
        const turmaId = this.route.snapshot.paramMap.get('id');
        if (turmaId) {
          this.carregarTurmaMockOuServico(turmaId);
        }
      }
    }

    if (this.turma?.anoLectivo) {
      this.anoTemp = this.turma.anoLectivo;
      this.anoAtual = this.turma.anoLectivo;
    }
  }

  private carregarTurmaMockOuServico(id: string | null): void {
    this.turma = {
      id: id || '1',
      nome: 'RAVENS',
      professorResponsavel: 'Pedro Rangel',
      horario: '18:00',
      diaSemana: 'Quarta',
      anoLectivo: 2026,
      alunos: [
        { matricula: '01', nome: 'Larissa Cristina Castro da Silva' },
        { matricula: '02', nome: 'Thais Sanchez Barreto' },
        { matricula: '03', nome: 'Ryan Rodrigues da Silva' },
        { matricula: '04', nome: 'Ana Clara Biosa Sant\'Anna' },
        { matricula: '05', nome: 'Harly Aragao Oliveira' },
        { matricula: '06', nome: 'Beatriz Affonso Braga' },
        { matricula: '07', nome: 'Gustavo Vargas Alves Silva' },
        { matricula: '08', nome: 'Vitor Rodrigues Silva de Souza' }
      ]
    };
  }

  get nomeMesSelecionado(): string {
    const mes = this.listaMeses.find(m => m.valor === Number(this.mesSelecionadoNum));
    return mes ? mes.nome : '';
  }

  get diasDoMes(): number[] {
    const totalDias = new Date(this.anoAtual, this.mesSelecionadoNum, 0).getDate();
    return Array.from({ length: totalDias }, (_, i) => i + 1);
  }

  private mapaMascotes: { [key: string]: string } = {
    'RAVENS': '🦅',
    'DOLPHINS': '🐬',
    'WOLF': '🐺',
    'EAGLES': '🦅',
    'JAGUAR': '🐆',
    'BEARS': '🐻'
  };

  get mascoteIcone(): string {
    if (!this.turma?.nome) return '🎓';
    const chave = this.turma.nome.trim().toUpperCase();
    return this.mapaMascotes[chave] || this.turma.nome.charAt(0).toUpperCase();
  }

  get linhasVazias(): number[] {
    const totalAlunos = this.turma?.alunos?.length || 0;
    const faltantes = this.minLinhas - totalAlunos;
    return faltantes > 0 ? Array.from({ length: faltantes }, (_, i) => i) : [];
  }

  abrirModal(): void {
    this.mesTemp = this.mesSelecionadoNum;
    this.anoTemp = this.anoAtual;
    this.exibirModal = true;
  }

  fecharModal(): void {
    this.exibirModal = false;
  }

  voltar(): void {
    this.router.navigate(['/turma']);
  }

  confirmarEImprimir(): void {
    this.mesSelecionadoNum = Number(this.mesTemp);
    this.anoAtual = Number(this.anoTemp);
    this.exibirModal = false;

    setTimeout(() => {
      window.print();
    }, 150);
  }
}