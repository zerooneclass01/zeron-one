import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlunoService } from '../../services/aluno';
import { Aluno } from '../../models/aluno.model';
import { AlunoResponser } from '../../models/AlunoResponser.model';
import { AlunoCadastroComponent } from '../aluno-cadastro/aluno-cadastro';
import { AlunoDetalhes } from '../aluno-detalhes/aluno-detalhes';


@Component({
  selector: 'app-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule,AlunoCadastroComponent],
  templateUrl: './aluno.html',
  styleUrls: ['./aluno.css']
})
export class AlunoComponent implements OnInit {
  alunos: Aluno[] = [];
  responser: AlunoResponser []=[];
  alunosFiltrados: AlunoResponser[] = [];
  turmas: any[] = []; // Lista de turmas para o select
  filtro: string = '';

  // Controle do Modal
  exibirModal: boolean = false;

  // Objeto para o cadastro (conforme o JSON que você passou)
  novoAluno = {
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    valorMensalidade: 0,
    diaVencimento: 10,
    turmaId: null as string | null
  };

  constructor(
    private alunoService: AlunoService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarAlunos();
    this.carregarTurmas(); // Busca as turmas ao iniciar
  }

  carregarAlunos() {
    this.alunoService.obterTodos().subscribe({
      next: (data) => {
        this.responser = data;
        this.alunosFiltrados = [...data];
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erro API .NET 10:', err)
    });
  }

  carregarTurmas() {
    // Certifique-se de ter esse método no seu AlunoService
    this.alunoService.obterTodos().subscribe({
      next: (data) => {
        this.turmas = data;
        this.cdRef.detectChanges();
      }
    });
  }

  filtrarAlunos() {
    const termo = this.filtro.toLowerCase();
    this.alunosFiltrados = this.responser.filter(a =>
      a.nome.toLowerCase().includes(termo) ||
      a.matricula?.toString().includes(termo)
    );
  }

  // Lógica de Cadastro
  abrirModal() {
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
    this.resetarForm();
  }

  salvarAluno() {
    // Envia o objeto para o service criar o aluno
    this.alunoService.adicionar(this.novoAluno).subscribe({
      next: () => {
        this.carregarAlunos(); // Atualiza a lista principal
        this.fecharModal();
      },
      error: (err) => console.error('Erro ao cadastrar:', err)
    });
  }

  private resetarForm() {
    this.novoAluno = {
      nome: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      valorMensalidade: 0,
      diaVencimento: 10,
      turmaId: null
    };
  }

  verDetalhes(id: string | undefined) {
    if (id) {
      this.router.navigate(['/aluno-detalhes', id]);
    } else {
      console.warn("Aluno sem ID detectado no Zero One.");
    }
  }
}