import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Importe o roteador

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Injeta o roteador no construtor
  constructor(private router: Router) {}

  entrar() {
    // Por enquanto, apenas pula para o dashboard
    // No futuro, aqui você chamará seu UsuarioController
    this.router.navigate(['/dashboard']);
  }
}