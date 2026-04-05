import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlunoService } from '../../services/aluno';
import { TurmaService } from '../../services/turma';

@Component({
  selector: 'app-aluno-atualizar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aluno-atualizar.html',
  styleUrls: ['./aluno-atualizar.css']
})
export class AlunoAtualizar implements OnInit {
  
  private _alunoEdicao: any;

  @Input() set alunoEdicao(value: any) {
    if (value) {
      this._alunoEdicao = { ...value };
      // Chamamos o inicializar, mas com uma proteção interna
      this.inicializarDados();
    }
  }

  get alunoEdicao() {
    return this._alunoEdicao;
  }

  @Output() aoSalvar = new EventEmitter<void>();
  @Output() aoFechar = new EventEmitter<void>();

  turmas: any[] = [];
  idTurmaOriginal: string | null = null;
  mensagem: string = '';
  tipoMensagem: string = 'success';
  readonly GUID_EMPTY = "00000000-0000-0000-0000-000000000000";

  constructor(
    private alunoService: AlunoService,
    private turmaService: TurmaService,
    private cdr: ChangeDetectorRef // Injeção obrigatória
  ) { }

  ngOnInit(): void {
    this.carregarTurmas();
  }

  private inicializarDados() {
    if (!this._alunoEdicao) return;

    // 1. Formata a Data (YYYY-MM-DD) para o input HTML
    if (this._alunoEdicao.dataNascimento && typeof this._alunoEdicao.dataNascimento === 'string') {
      this._alunoEdicao.dataNascimento = this._alunoEdicao.dataNascimento.split('T')[0];
    }

    // 2. Normaliza a Turma
    if (this._alunoEdicao.turmaId === this.GUID_EMPTY || !this._alunoEdicao.turmaId) {
      this._alunoEdicao.turmaId = null;
    }
    this.idTurmaOriginal = this._alunoEdicao.turmaId;

    // 3. PROTEÇÃO: Só chama detectChanges se o cdr já estiver injetado
    if (this.cdr) {
      this.cdr.detectChanges();
      
      // Garante a atualização após o modal abrir totalmente
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 150);
    }
  }

  carregarTurmas() {
    this.turmaService.obterTodas().subscribe({
      next: (res) => {
        this.turmas = res;
        this.inicializarDados();
      },
      error: (err) => console.error("Erro turmas:", err)
    });
  }

  compararTurmas = (t1: any, t2: any): boolean => {
    return t1 === t2;
  }

  processarMudancaTurmaAutomatica(): void {
    const novaTurmaId = this.alunoEdicao.turmaId;
    const turmaAntigaId = this.idTurmaOriginal;

    if (novaTurmaId === turmaAntigaId) return;

    const ehVazio = (id: any) => !id || id === this.GUID_EMPTY;

    // Lógica de vinculação automática
    if (!ehVazio(novaTurmaId) && ehVazio(turmaAntigaId)) {
      this.notificar('Vinculando...', 'info');
      this.alunoService.vincularTurma(this.alunoEdicao.id, novaTurmaId).subscribe({
        next: () => this.sucessoAutomatico('Vinculado!', novaTurmaId),
        error: () => this.notificar('Erro ao vincular.', 'danger')
      });
    } else if (!ehVazio(novaTurmaId) && !ehVazio(turmaAntigaId)) {
      this.notificar('Alterando...', 'info');
      this.alunoService.alterarTurma(this.alunoEdicao.id, novaTurmaId).subscribe({
        next: () => this.sucessoAutomatico('Alterado!', novaTurmaId),
        error: () => this.notificar('Erro ao alterar.', 'danger')
      });
    }
  }

  private sucessoAutomatico(msg: string, novoId: any) {
    this.notificar(msg, 'success');
    this.idTurmaOriginal = novoId;
    this.aoSalvar.emit();
  }

  salvar(): void {
    if (!this.alunoEdicao?.id) return;
    this.alunoService.atualizar(this.alunoEdicao.id, this.alunoEdicao).subscribe({
      next: () => this.finalizar('Dados salvos!'),
      error: () => this.notificar('Erro ao salvar.', 'danger')
    });
  }

  private finalizar(msg: string) {
    this.notificar(msg, 'success');
    setTimeout(() => this.aoSalvar.emit(), 1000);
  }

  notificar(msg: string, tipo: string) {
    this.mensagem = msg;
    this.tipoMensagem = tipo;
    if (this.cdr) {
      this.cdr.detectChanges();
    }
  }

  cancelar() {
    this.aoFechar.emit();
  }
}