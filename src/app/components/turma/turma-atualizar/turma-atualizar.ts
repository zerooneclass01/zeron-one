import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // IMPORTANTE
import { FormsModule } from '@angular/forms'; // IMPORTANTE PARA NGMODEL
import { TurmaService, AdicionarAtualizarTurmaModel } from '../../../services/turma';

@Component({
  selector: 'app-turma-edicao',
  templateUrl: './turma-atualizar.html',
  styleUrls: ['./turma-atualizar.css'],
  standalone: true, 
  imports: [CommonModule, FormsModule] // Agora o Angular reconhece *ngFor e ngModel
})
export class TurmaEdicaoComponent implements OnInit {
  @Input() turmaOriginal: any; 
  @Input() professores: any[] = [];
  
  @Output() aoFechar = new EventEmitter<void>();
  @Output() aoSalvar = new EventEmitter<any>();

  turma: any = {};
  diasSelecionados: { [key: number]: boolean } = {};

  diasOpcoes = [
    { nome: 'Seg', valor: 2 },
    { nome: 'Ter', valor: 4 },
    { nome: 'Qua', valor: 8 },
    { nome: 'Qui', valor: 16 },
    { nome: 'Sex', valor: 32 },
    { nome: 'Sáb', valor: 64 },
    { nome: 'Dom', valor: 1 }
  ];

  constructor(private turmaService: TurmaService) {}

  ngOnInit(): void {
    if (this.turmaOriginal) {
      // Cópia profunda para isolar a edição
      this.turma = JSON.parse(JSON.stringify(this.turmaOriginal));
      
      // Mapeamento de segurança do ID do professor
      if (this.turma.professor && !this.turma.professorId) {
        this.turma.professorId = this.turma.professor.id;
      }

      this.inicializarChipsDias();
    }
  }

  private inicializarChipsDias(): void {
    const valorBitwise = this.turma.diasDaSemana || 0;
    this.diasOpcoes.forEach(dia => {
      this.diasSelecionados[dia.valor] = (valorBitwise & dia.valor) === dia.valor;
    });
  }

  selecionarDia(valor: number): void {
    this.diasSelecionados[valor] = !this.diasSelecionados[valor];
    this.calcularValorDias();
  }

  private calcularValorDias(): void {
    let total = 0;
    Object.keys(this.diasSelecionados).forEach(key => {
      const valor = Number(key);
      if (this.diasSelecionados[valor]) {
        total += valor;
      }
    });
    this.turma.diasDaSemana = total;
  }

  salvar(): void {
    if (!this.validarFormulario()) return;

    // MONTAGEM DO MODELO PARA A API
    // Certifique-se que no arquivo ../../../services/turma.ts 
    // a interface AdicionarAtualizarTurmaModel possua 'horario' e 'diasDaSemana'
    const model: AdicionarAtualizarTurmaModel = {
      nome: this.turma.nome,
      professorId: this.turma.professorId,
      horario: this.turma.horario, 
      diasDaSemana: this.turma.diasDaSemana 
    };

    this.turmaService.atualizar(this.turma.id, model).subscribe({
      next: (response) => {
        console.log('Sucesso ao atualizar:', response);
        this.aoSalvar.emit(this.turma);
        this.fechar();
      },
      error: (err) => {
        console.error('Erro ao salvar edição:', err);
        alert('Erro ao atualizar a turma.');
      }
    });
  }

  validarFormulario(): boolean {
    return !!(
      this.turma &&
      this.turma.nome && 
      this.turma.professorId && 
      this.turma.diasDaSemana > 0
    );
  }

  fechar(): void {
    this.aoFechar.emit();
  }
}