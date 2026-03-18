import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlunoService } from '../../services/aluno';

@Component({
  selector: 'app-aluno-atualizar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aluno-atualizar.html',
  styleUrl: './aluno-atualizar.css',
})
export class AlunoAtualizar implements OnInit {
  // Objeto que vai receber o JSON completo da API
  alunoEdicao: any = {};

  id: string | null = null;
  mensagem: string = '';
  tipoMensagem: string = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alunoService: AlunoService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.carregarDados();
    }
  }

  carregarDados(): void {
    if (this.id) {
      this.alunoService.obterPorId(this.id).subscribe({
        next: (res) => {
          // Aqui entra o seu JSON completo
          this.alunoEdicao = { ...res };
          
          // Tratamento para o input de data (HTML exige yyyy-MM-dd)
          if (this.alunoEdicao.dataNascimento) {
            this.alunoEdicao.dataNascimento = formatDate(
              this.alunoEdicao.dataNascimento, 
              'yyyy-MM-dd', 
              'en-US'
            );
          }
        },
        error: () => this.exibirNotificacao('Erro ao carregar dados.', 'danger')
      });
    }
  }

  atualizar(): void {
    if (this.id) {
      // FILTRAGEM: Enviamos apenas o que o AlunoAtualizarModel do C# permite
      // Ignoramos valorMensalidade, diaVencimento e turmaId
      const modelParaEnviar = {
        nome: this.alunoEdicao.nome,
        email: this.alunoEdicao.email,
        dataNascimento: this.alunoEdicao.dataNascimento,
        telefone: this.alunoEdicao.telefone
      };

      this.alunoService.atualizar(this.id, modelParaEnviar).subscribe({
        next: () => {
          this.exibirNotificacao('Cadastro atualizado com sucesso!', 'success');
          setTimeout(() => this.router.navigate(['/alunos']), 1500);
        },
        error: () => this.exibirNotificacao('Erro ao salvar no servidor.', 'danger')
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/alunos']);
  }

  private exibirNotificacao(msg: string, tipo: string): void {
    this.mensagem = msg;
    this.tipoMensagem = tipo;
    setTimeout(() => (this.mensagem = ''), 3000);
  }
}