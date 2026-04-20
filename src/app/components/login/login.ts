import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
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
  ) { }

  toggleSenha() {
    this.verSenha = !this.verSenha;
  }

  entrar() {
    this.carregando = true;
    this.mensagemErro = '';

    this.usuarioService.login(this.loginData).subscribe({
      next: (res: any) => { 
        this.usuarioService.salvarToken(res.token);
        localStorage.setItem('zero_one_token', res.token);
        localStorage.setItem('user_role', res.role.toString());
        localStorage.setItem('username', res.username);

        this.router.navigate(['/dashboard']);
        this.carregando = false;
      },
      error: (err) => {
        this.carregando = false;
        this.mensagemErro = 'Usuário ou senha inválidos.';
        console.error(err);
      }
    });
  }

  async esqueciSenha() {
    const { value: formValues } = await Swal.fire({
      title: 'Recuperar Senha',
      background: '#161b22',
      color: '#fff',
      html:
        '<div style="text-align: left; margin-bottom: 5px; color: #8b949e;">Usuário:</div>' +
        '<input id="swal-input1" class="swal2-input custom-input" placeholder="Digite seu usuário">' +
        '<div style="text-align: left; margin-bottom: 5px; margin-top: 15px; color: #8b949e;">E-mail:</div>' +
        '<input id="swal-input2" type="email" class="swal2-input custom-input" placeholder="seu@email.com">',
      focusConfirm: false,
      confirmButtonColor: '#ff0000',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const inputs = document.querySelectorAll('.custom-input');
        inputs.forEach((input: any) => {
          input.style.color = '#ffffff';
          input.style.backgroundColor = '#0d1117';
        });
      },
      preConfirm: () => {
        const username = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const email = (document.getElementById('swal-input2') as HTMLInputElement).value;
        
        return { username, email };
      }
    });

    if (formValues) {
      if (!formValues.username || !formValues.email || !formValues.email.includes('@')) {
        this.notificarErro("Por favor, preencha o usuário e um e-mail válido.");
        return;
      }

      this.usuarioService.esqueciSenha(formValues).subscribe({
        next: () => {
          Swal.fire({
            title: 'Solicitação Enviada!',
            text: `Se os dados estiverem corretos, as instruções foram enviadas para ${formValues.email}`,
            icon: 'success',
            background: '#161b22',
            color: '#fff',
            confirmButtonColor: '#ff0000'
          });
        },
        error: (err) => {
          console.error(err);
          this.notificarErro("Não foi possível processar a recuperação por e-mail.");
        }
      });
    }
  }

  private notificarErro(msg: string) {
    Swal.fire({
      icon: 'error',
      title: 'Ops...',
      text: msg,
      background: '#161b22',
      color: '#fff',
      confirmButtonColor: '#ff0000'
    });
  }
}