import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlunoService } from '../../services/aluno';
import { TurmaService } from '../../services/turma';
import { Aluno } from '../../models/aluno.model';

@Component({
  selector: 'app-aluno-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aluno-cadastro.html',
  styleUrls: ['./aluno-cadastro.css']
})
export class AlunoCadastroComponent implements OnInit {
  @Output() aoSalvar = new EventEmitter<void>();
  @Output() aoFechar = new EventEmitter<void>();

  turmas: any[] = [];

  novoAluno: Aluno = {
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    valorMensalidade: 0,
    diaVencimento: 10,
    turmaId: null
  };


  mensagem: string | null = null;
  tipoMensagem: 'success' | 'danger' = 'success';


  constructor(
    private alunoService: AlunoService,
    private turmaService: TurmaService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarTurmas();
  }



  carregarTurmas() {
    this.turmaService.obterTodas().subscribe(data => {
      this.turmas = data;
      this.cdRef.detectChanges();
    });
  }

  salvar() {
  this.alunoService.adicionar(this.novoAluno).subscribe({
    next: () => {
      this.mensagem = "Aluno cadastrado com sucesso!";
      this.tipoMensagem = 'success';
      
      // Espera 2 segundos para o usuário ler e depois fecha/limpa
      setTimeout(() => {
        this.aoSalvar.emit();
        this.fechar();
      }, 2000);
    },
    error: (err) => {
      this.mensagem = "Erro ao cadastrar aluno. Tente novamente.";
      this.tipoMensagem = 'danger';
      console.error(err);
    }
  });
}

  fechar() {
    this.aoFechar.emit();
  }
}2