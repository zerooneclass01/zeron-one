import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurmaService } from '../../../services/turma';
import { ProfessorService } from '../../../services/professor';

@Component({
  selector: 'app-turma-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turma-cadastro.html',
  styleUrls: ['./turma-cadastro.css']
})
export class TurmaCadastroComponent implements OnInit {
  @Output() aoSalvar = new EventEmitter<void>();
  @Output() aoFechar = new EventEmitter<void>();

  // Objeto inicializado conforme o seu JSON esperado
  turma: any = {
    nome: '',
    horario: '',
    professorId: null, // Começa nulo para o select vir vazio
    diasDaSemana: 0    // Começa em 0 (None no Enum Flags do C#)
  };

  professores: any[] = [];

  // Mapeamento binário para o Enum [Flags] do C#
  diasOpcoes = [
    { nome: 'Seg', valor: 1 },
    { nome: 'Ter', valor: 2 },
    { nome: 'Qua', valor: 4 },
    { nome: 'Qui', valor: 8 },
    { nome: 'Sex', valor: 16 },
    { nome: 'Sáb', valor: 32 },
    { nome: 'Dom', valor: 64 }
  ];

  // Objeto auxiliar para controlar quais chips estão verdes na tela
  diasSelecionados: { [key: number]: boolean } = {};

  constructor(
    private turmaService: TurmaService,
    private professorService: ProfessorService
  ) {}

  ngOnInit() {
    this.carregarProfessores();
  }

  carregarProfessores() {
    this.professorService.obterTodos().subscribe({
      next: (res) => this.professores = res,
      error: (err) => console.error("Erro ao buscar professores", err)
    });
  }

  /**
   * Inverte o estado do dia selecionado e recalcula o valor Bitwise
   */
  selecionarDia(valor: number) {
    this.diasSelecionados[valor] = !this.diasSelecionados[valor];
    this.atualizarDiasBitwise();
  }

  /**
   * Soma os valores binários dos dias ativos para enviar ao C#
   */
  atualizarDiasBitwise() {
    this.turma.diasDaSemana = Object.keys(this.diasSelecionados)
      .filter(key => this.diasSelecionados[+key])
      .reduce((total, key) => total + (+key), 0);
  }

  salvar() {
    // Validação de segurança
    if (!this.turma.nome || !this.turma.professorId || this.turma.diasDaSemana === 0) {
      alert("Preencha todos os campos obrigatórios antes de salvar.");
      return;
    }

    this.turmaService.criar(this.turma).subscribe({
      next: () => {
        this.aoSalvar.emit(); // Avisa o componente pai para atualizar a lista
        this.aoFechar.emit();  // Fecha o modal
      },
      error: (err) => {
        console.error("Erro na API:", err);
        alert("Erro ao tentar salvar a turma.");
      }
    });
  }
}