import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  // Signal para expor o usuário logado para toda a aplicação
  usuarioLogado = signal<any>(null);

  constructor() {
    this.restaurarSessao();
  }

  private restaurarSessao() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('zero_one_token');
      if (token) {
        this.decodificarEGuardarToken(token);
      }
    }
  }

  salvarToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('zero_one_token', token);
      this.decodificarEGuardarToken(token);
    }
  }

  private decodificarEGuardarToken(token: string) {
    try {
      const payload: any = jwtDecode(token);
      // Aqui o payload terá campos como 'role', 'unique_name', etc, vindo do seu C#
      this.usuarioLogado.set(payload);
    } catch (e) {
      this.logout();
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('zero_one_token');
    }
    this.usuarioLogado.set(null);
  }
}