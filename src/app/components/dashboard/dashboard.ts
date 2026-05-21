import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/AuthService';
import { Router, RouterModule } from '@angular/router'; @Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})



export class Dashboard implements OnInit {
  // 1. Injete o PLATFORM_ID para identificar onde o código está rodando
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) { }

  userRole = signal<number | null>(null);

  ngOnInit() {
    // 2. Só execute a lógica de localStorage se estiver no Browser
    if (isPlatformBrowser(this.platformId)) {
      const role = localStorage.getItem('user_role');
      this.userRole.set(role !== null ? Number(role) : null);
    }
  }

  executarLogout() {
    this.authService.logout();
    if (isPlatformBrowser(this.platformId)) {

      localStorage.clear();
      sessionStorage.clear();
      this.userRole.set(null);
    }
    this.router.navigate(['/']);
  }

  podeAcessarAdministrativoERh() {
    return this.userRole() === 0 || this.userRole() === 1;
  }

  podeAcessarFinanceiroRecepicao() {
    return this.userRole() == 2; // Professor (3) não entra
  }

  podeAcessarProfessores() {
    return this.userRole() == 3; // Professor (3) não entra
  }


  irParaAlunos() {
    this.router.navigate(['../aluno']);
  }

  irParaProfessor() {
    this.router.navigate(['/professor']);
  }

  irParaUsuario() {
    this.router.navigate(['../usuario'])
  }

  irParaFinanceiro() {
    this.router.navigate(['/financeiro'])
  }

  irParaTurma() {
    this.router.navigate(['/turma'])
  }

  irParaChamadas() {
    this.router.navigate(['/chamadas'])
  }

  irParaRanking() {
    this.router.navigate(['../ranking'])
  }
}