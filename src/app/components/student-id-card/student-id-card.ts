import { Component, Input } from '@angular/core';
import { AlunoResponser } from '../../models/AlunoResponser.model';
import { CommonModule } from '@angular/common'; // IMPORT ÚNICO

@Component({
  selector: 'app-student-id-card',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './student-id-card.html',
  styleUrls: ['./student-id-card.css']
})
export class StudentIdCardComponent {
  // Use o modelo oficial importado. O '| undefined' resolve o aviso do template.
  @Input() aluno?: AlunoResponser ;

  get qrCodeIdOnly(): string {
    // Verificação de segurança para o ID
    if (!this.aluno || this.aluno.id === undefined) return '';
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${this.aluno.id}`;
  }
}