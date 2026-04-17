import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';
import { CriarUsuarioRequest } from '../../models/UsuarioRequest';
import { UsuarioResponse } from '../../models/UsuarioResponse';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css']
})
export class PerfilComponent implements OnInit {
  listaUsuarios: UsuarioResponse[] = [];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    // Esse método deve ser criado no seu UsuarioService
    this.usuarioService.obterTodos().subscribe({
      next: (dados) => this.listaUsuarios = dados,
      error: (err) => console.error("Erro ao carregar lista", err)
    });
  }

  resetarSenha(usuario: CriarUsuarioRequest) {
    // Aqui você chamaria o seu endpoint de resetar-senha do C#
    console.log("Resetando senha para:", usuario.username);
  }

  abrirModalCadastro() {
    // Navega para a tela de cadastro ou abre modal
  }

  voltar() {
    window.history.back();
  }
}