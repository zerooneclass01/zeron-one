import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necessário para o [(ngModel)]
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Objeto para armazenar os dados do formulário
  loginData = {
    username: '',
    senha: ''
  };

  carregando = false;
  mensagemErro = '';
  verSenha = false;
  
  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  

  toggleSenha() {
    this.verSenha = !this.verSenha;
  }

  entrar() {
    this.carregando = true;
    this.mensagemErro = '';

    this.usuarioService.login(this.loginData).subscribe({
      next: (res) => {
        // 1. Salva o token recebido do seu C#
        this.usuarioService.salvarToken(res.token);
        
        // 2. Navega para o dashboard
        this.router.navigate(['/dashboard']);
        this.carregando = false;
      },
      error: (err) => {
        this.carregando = false;
        this.mensagemErro = 'E-mail ou senha inválidos.';
        console.error(err);
      }
    });
  }
}