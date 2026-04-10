import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PresencaIndividualModel {
  presente: boolean;
  observacao: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChamadaItemService {
  private readonly apiUrl = `${environment.apiUrl}/api/ChamadaItem`;

  constructor(private http: HttpClient) { }

  /**
   * PATCH: api/chamadaitem/{itemId}
   * Perfeito para o botão P/F individual e edição da observação
   */
  atualizarPresencaIndividual(itemId: string, model: PresencaIndividualModel): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${itemId}`, model);
  }

  /**
   * GET: api/chamadaitem/aluno/{alunoId}
   * Retorna o histórico de presenças de um aluno específico
   */
  listarPorAluno(alunoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/aluno/${alunoId}`);
  }
}