import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlunoResponser } from '../../models/AlunoResponser.model';

@Component({
  selector: 'app-student-id-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-id-card.html',
  styleUrls: ['./student-id-card.css']
})
export class StudentIdCardComponent implements OnInit {
  private router = inject(Router);

  @Input() aluno?: AlunoResponser;

  ngOnInit(): void {
    // Se o aluno não veio como @Input (quando renderizado diretamente em tag),
    // busca os dados passados pelo estado do Router (this.router.navigate)
    if (!this.aluno) {
      const state = history.state;
      if (state && state.aluno) {
        this.aluno = state.aluno;
      }
    }
  }

  get qrCodeIdOnly(): string {
    if (!this.aluno || !this.aluno.id) return '';
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${this.aluno.id}`;
  }

  imprimir(): void {
    window.print();
  }

  voltar(): void {
    if (this.aluno?.id) {
      this.router.navigate(['aluno-detalhes/', this.aluno.id]);
    } else {
      this.router.navigate(['aluno']);
    }
  }
}