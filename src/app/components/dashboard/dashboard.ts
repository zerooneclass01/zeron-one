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
  constructor(private router: Router) {} // Injete o roteador

  irParaAlunos() {
    this.router.navigate(['../aluno']);
  }
}