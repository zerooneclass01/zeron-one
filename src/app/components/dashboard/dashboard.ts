import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Adicione o Router aqui

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  constructor(private router: Router) { } // Injete o roteador

   userRole = signal<number | null>(null);

  ngOnInit() {
    // Busca o role salvo no login
    const role = localStorage.getItem('user_role');
    this.userRole.set(role !== null ? Number(role) : null);
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

  irParaUsuario(){
    this.router.navigate(['../usuario'])
  }

  irParaFinanceiro(){
    this.router.navigate(['/financeiro'])
  }

  irParaTurma(){
    this.router.navigate(['/turma'])
  }

  irParaChamadas(){
    this.router.navigate(['/chamadas'])
  }
 
  irParaRanking(){
    this.router.navigate(['../ranking'])
  }
}