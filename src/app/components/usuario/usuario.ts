import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario';
import { UsuarioResponse } from '../../models/UsuarioResponse';
import { CriarUsuarioRequest } from '../../models/UsuarioRequest';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css']
})
export class PerfilComponent implements OnInit {
  // Signals de estado
  listaUsuarios = signal<UsuarioResponse[]>([]);
  carregando = signal<boolean>(false);
  usuarioLogadoRole = signal<Number | null>(null);
  usuarioToken = signal<string>('');
  senhaVisivel = signal<boolean>(false);

  // Signal para criação de novo usuário
  usuarioRequest = signal<CriarUsuarioRequest>({
    username: '',
    senha: '',
    role: 2
  });

  // Signal para alteração de senha (usa o Token do logado)
  usuarioAlterar = signal({
    token: '',
    senha: ''
  });

  private usuarioService = inject(UsuarioService);

  ngOnInit() {
    this.obterRoleUsuarioLogado();
    this.carregarUsuarios();

    // Inicializa o token da pessoa logada
    const tokenSalvo = localStorage.getItem('token') ?? '';
    this.usuarioToken.set(tokenSalvo);

    this.usuarioAlterar.set({
      token: tokenSalvo,
      senha: ''
    });
  }

  carregarUsuarios() {
    this.carregando.set(true);
    this.usuarioService.obterTodos().subscribe({
      next: (dados) => {
        this.listaUsuarios.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.notificarErro("Não foi possível carregar os usuários.");
      }
    });
  }

  toggleSenha() {
    this.senhaVisivel.update(v => !v);
  }

  salvarUsuario() {
    if (!this.usuarioRequest().username || !this.usuarioRequest().senha) {
      this.notificarErro("Preencha todos os campos obrigatórios.");
      return;
    }

    this.carregando.set(true);
    const payload = {
      ...this.usuarioRequest(),
      role: Number(this.usuarioRequest().role)
    };

    this.usuarioService.criarUsuario(payload).subscribe({
      next: () => {
        this.carregando.set(false);
        Swal.fire({
          title: 'Sucesso!',
          text: 'Usuário criado com sucesso.',
          icon: 'success',
          background: '#161b22',
          color: '#fff'
        });
        this.fecharModal();
        this.carregarUsuarios();
      },
      error: () => {
        this.carregando.set(false);
        this.notificarErro("Erro ao criar usuário.");
      }
    });
  }

  // No seu usuario.ts, substitua o prepararReset por este:
  async prepararResetProprio() {
    const { value: novaSenha } = await Swal.fire({
      title: 'Alterar Minha Senha',
      text: 'Defina uma nova senha para o seu acesso no PulseOne',
      input: 'password',
      inputPlaceholder: 'Digite a nova senha',
      background: '#161b22',
      color: '#fff',
      confirmButtonText: 'Confirmar Alteração',
      confirmButtonColor: '#ff0000',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'A senha não pode ser vazia!';
        if (value.length < 6) return 'A senha deve ter no mínimo 6 caracteres';
        return null;
      }
    });

    if (novaSenha) {
      this.carregando.set(true);

      // Criamos o objeto para o seu Record C# (ResetSenhaRequest)
      // Se o seu C# esperar "Token" e "Senha" com iniciais maiúsculas, ajuste abaixo:
      const request = {
        token: this.usuarioToken(), // Pega o token automático do Signal
        senha: novaSenha
      };

      this.usuarioService.resetarSenha(request).subscribe({
        next: () => {
          this.carregando.set(false);
          Swal.fire({
            title: 'Sucesso!',
            text: 'Sua senha foi alterada com sucesso.',
            icon: 'success',
            background: '#161b22',
            color: '#fff'
          });
        },
        error: () => {
          this.carregando.set(false);
          this.notificarErro("Não foi possível alterar a senha. O token pode estar expirado.");
        }
      });
    }
  }

  async prepararReset(usuario: UsuarioResponse) {
    const { value: novaSenha } = await Swal.fire({
      title: 'Redefinir Senha',
      text: `Defina a nova senha para o usuário: ${usuario.username}`,
      input: 'password',
      inputPlaceholder: 'Digite a nova senha',
      background: '#161b22',
      color: '#fff',
      confirmButtonText: 'Confirmar Alteração',
      confirmButtonColor: '#ff0000',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'A senha não pode ser vazia!';
        if (value.length < 6) return 'A senha deve ter no mínimo 6 caracteres';
        return null;
      }
    });

    if (novaSenha) {
      this.carregando.set(true);

      // Monta o objeto exatamente como seu ResetSenhaRequest (C#)
      const request = {
        token: this.usuarioToken(), // Pega o token do logado via Signal
        senha: novaSenha
      };

      this.usuarioService.resetarSenha(request).subscribe({
        next: () => {
          this.carregando.set(false);
          Swal.fire('Sucesso!', 'A senha foi alterada.', 'success');
        },
        error: () => {
          this.carregando.set(false);
          this.notificarErro("Erro ao resetar: Token expirado ou sem permissão.");
        }
      });
    }
  }

  // Métodos Auxiliares
  abrirModalCadastro() {
    const modal = document.getElementById('modalUsuario') as HTMLDialogElement;
    modal.showModal();
  }

  fecharModal() {
    const modal = document.getElementById('modalUsuario') as HTMLDialogElement;
    modal.close();
    this.usuarioRequest.set({ username: '', senha: '', role: 2 });
  }

  filtrar(event: Event) {
    const termo = (event.target as HTMLInputElement).value.toLowerCase();
    if (!termo) {
      this.carregarUsuarios();
      return;
    }
    const filtrados = this.listaUsuarios().filter(u =>
      u.username.toLowerCase().includes(termo) ||
      u.role.toLowerCase().includes(termo)
    );
    this.listaUsuarios.set(filtrados);
  }

  obterRoleUsuarioLogado() {
    const role = localStorage.getItem('user_role');
    if (role !== null) this.usuarioLogadoRole.set(Number(role));
  }

  podeCadastrar(): boolean {
    const role = this.usuarioLogadoRole();
    return role === 0 || role === 2; // Admin ou RH
  }

  private notificarErro(msg: string) {
    Swal.fire({ icon: 'error', title: 'Erro', text: msg, background: '#161b22', color: '#fff' });
  }

  voltar() { window.history.back(); }
}