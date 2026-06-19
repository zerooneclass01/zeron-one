import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
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
  usuarioLogadoRole = signal<number | null>(null);
  usuarioLogadoName = signal<string>('');
  senhaVisivel = signal<boolean>(false);

  // Signal para criação de novo usuário
  usuarioRequest = signal<CriarUsuarioRequest>({
    username: '',
    senha: '',
    role: 2
  });

  private usuarioService = inject(UsuarioService);
  constructor(
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.obterDadosSessao();
    this.carregarUsuarios();
  }

  obterDadosSessao() {
    const role = localStorage.getItem('user_role');
    const user = localStorage.getItem('username');

    if (role !== null) this.usuarioLogadoRole.set(Number(role));
    if (user !== null) this.usuarioLogadoName.set(user);

    this.cdRef.detectChanges();
  }

  carregarUsuarios() {
    this.carregando.set(true);
    this.usuarioService.obterTodos().subscribe({
      next: (dados) => {
        this.listaUsuarios.set(dados);
        this.carregando.set(false);
        this.cdRef.detectChanges();
      },
      error: () => {
        this.carregando.set(false);
        this.notificarErro("Erro ao carregar lista de usuários.");
      }
    });
  }

  // --- MÉTODOS QUE ESTAVAM FALTANDO (CORREÇÃO DO ERRO) ---

  podeCadastrar(): boolean {
    const role = this.usuarioLogadoRole();
    // 0 = Admin, 2 = RH (ajuste conforme suas permissões do PulseOne)
    return role === 0 || role === 2;
  }

  abrirModalCadastro() {
    const modal = document.getElementById('modalUsuario') as HTMLDialogElement;
    if (modal) modal.showModal();
  }

  fecharModal() {
    const modal = document.getElementById('modalUsuario') as HTMLDialogElement;
    if (modal) modal.close();
    this.usuarioRequest.set({ username: '', senha: '', role: 2 });
  }

  filtrar(event: Event) {
    const termo = (event.target as HTMLInputElement).value.toLowerCase();

    if (!termo) {
      this.carregarUsuarios(); // Recarrega se estiver vazio
      return;
    }

    const filtrados = this.listaUsuarios().filter(u =>
      u.username.toLowerCase().includes(termo) ||
      u.role.toString().toLowerCase().includes(termo)
    );
    this.listaUsuarios.set(filtrados);
  }

  // --- LÓGICA DE RESET DE SENHA ---

  async prepararResetProprio() {
    const { value: novaSenha } = await this.modalSenha(`Alterar Minha Senha (${this.usuarioLogadoName()})`);
    if (novaSenha) this.executarReset(this.usuarioLogadoName(), novaSenha);
  }

  async prepararReset(usuario: UsuarioResponse) {
    const { value: novaSenha } = await this.modalSenha(`Redefinir Senha de: ${usuario.username}`);
    if (novaSenha) this.executarReset(usuario.username, novaSenha);
  }

  private async modalSenha(titulo: string) {
    return await Swal.fire({
      title: titulo,
      input: 'password',
      inputPlaceholder: 'Digite a nova senha',
      background: '#161b22',
      color: '#fff',
      confirmButtonText: 'Confirmar',
      confirmButtonColor: '#ff0000',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'A senha é obrigatória!';
        if (value.length < 6) return 'Mínimo de 6 caracteres';
        return null;
      }
    });
  }

  private executarReset(username: string, senhaNova: string) {
    this.carregando.set(true);
    const request = { username: username, senha: senhaNova };

    this.usuarioService.resetarSenha(request).subscribe({
      next: () => {
        this.carregando.set(false);
        Swal.fire({
          title: 'Sucesso!',
          text: 'Senha atualizada.',
          icon: 'success',
          background: '#161b22',
          color: '#fff'
        });
      },
      error: () => {
        this.carregando.set(false);
        this.notificarErro("Erro ao comunicar com o servidor.");
      }
    });
  }

  // --- MÉTODOS DE CRIAÇÃO E AUXILIARES ---

  salvarUsuario() {
    if (!this.usuarioRequest().username || !this.usuarioRequest().senha) {
      this.notificarErro("Preencha todos os campos.");
      return;
    }

    this.carregando.set(true);
    this.usuarioService.criarUsuario(this.usuarioRequest()).subscribe({
      next: () => {
        this.carregando.set(false);
        this.fecharModal();
        this.carregarUsuarios();
        Swal.fire({ title: 'Sucesso!', text: 'Usuário criado!', icon: 'success' });
      },
      error: () => {
        this.carregando.set(false);
        this.notificarErro("Erro ao criar usuário.");
      }
    });
  }

  toggleSenha() {
    this.senhaVisivel.update(v => !v);
  }

  voltar() {
    window.history.back();
  }

  private notificarErro(msg: string) {
    Swal.fire({ icon: 'error', title: 'Erro', text: msg, background: '#161b22', color: '#fff' });
  }
}