import { Component } from '@angular/core';
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

  irParaAlunos() {
    this.router.navigate(['../aluno']);
  }

  irParaProfessor() {
    this.router.navigate(['/professor']);
  }

  irParaUsuario(){
    this.router.navigate(['/usuario'])
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

}