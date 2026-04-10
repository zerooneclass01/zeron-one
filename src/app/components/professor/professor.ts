import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Adicionado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessorService } from '../../services/professor';
import { Professor } from '../../models/Professor-data.model';

@Component({
  selector: 'app-professor',
  standalone: true, // Garante que os imports abaixo funcionem
  imports: [CommonModule, FormsModule],
  templateUrl: './professor.html',
  styleUrls: ['./professor.css']
})
export class ProfessorComponent implements OnInit {
  listaProfessores: Professor[] = [];
  exibirFormulario = false;

  // Modelo para o formulário
  professorSelecionado: Professor = this.limparModelo();

  constructor(
    private professorService: ProfessorService,
    private cdRef: ChangeDetectorRef // Injetado para resolver o erro NG0100
  ) { }

  ngOnInit() {
    this.carregarTodos();
  }

  carregarTodos() {
    this.professorService.obterTodos().subscribe({
      next: (res) => {
        this.listaProfessores = res;
        this.cdRef.detectChanges(); // Força a atualização da tela e evita o erro de expressão alterada
      },
      error: (err) => console.error('Erro ao carregar:', err)
    });
  }

  
  filtro: string = '';

 
  get listaFiltrada() {
    const termo = this.filtro.trim().toLowerCase();
    if (!termo) {
      return this.listaProfessores;
    }
    return this.listaProfessores.filter(p =>
      p.nome.toLowerCase().includes(termo)
    );
  }

  abrirFormulario() {
    this.professorSelecionado = this.limparModelo();
    this.exibirFormulario = true;
  }

  prepararEdicao(prof: Professor) {

    this.professorSelecionado = { ...prof };
    this.exibirFormulario = true;
  }

  salvar() {

    const dadosParaEnvio = { ...this.professorSelecionado };

    if (this.professorSelecionado.id === '00000000-0000-0000-0000-000000000000') {


      delete (dadosParaEnvio as any).id;

      this.professorService.criarProfessor(dadosParaEnvio).subscribe({
        next: () => this.finalizar('Professor cadastrado!'),
        error: (err) => this.tratarErro(err)
      });

    } else {
      this.professorService.atualizarProfessor(this.professorSelecionado).subscribe({
        next: () => this.finalizar('Professor atualizado!'),
        error: (err) => this.tratarErro(err)
      });
    }
  }

  private finalizar(msg: string) {
    alert(msg);
    this.exibirFormulario = false;
    this.carregarTodos();
  }

  private tratarErro(err: any) {
    console.error('Erro detalhado:', err);
    // Se o erro for um objeto, tentamos pegar a mensagem de erro do C#
    const mensagem = err.error?.message || err.error || "Erro ao processar requisição";
    alert("Erro: " + mensagem);
  }

  remover(id: string | undefined) {
    // 1. Verificação de segurança
    if (!id || id === '00000000-0000-0000-0000-000000000000') {
      alert('ID inválido para remoção.');
      return;
    }

    // 2. Confirmação com o usuário
    if (confirm('Deseja realmente remover este professor?')) {
      this.professorService.removerProfessor(id).subscribe({
        next: (res) => {
          this.carregarTodos();
          console.log('Professor removido com sucesso');
        },
        error: (err) => {
          console.error('Erro ao remover:', err);
          const msg = err.error?.message || "Não foi possível excluir o registro.";
          alert("Erro: " + msg);
        }
      });
    }
  }

  voltar() {
    window.history.back();
  }

  private limparModelo(): Professor {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      nome: '',
      salario: 0
    };
  }
}