import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RelatorioTurma } from '../models/RelatorioTurma';
// Interfaces baseadas nos seus Models C#
export interface AlunoPresencaModel {
  alunoId: string;
  presente: boolean;
  observacao: string;
}

export interface AdicionarChamadaModel {
  turmaId: string;
  dataAula: string;
  alunos: AlunoPresencaModel[];
}

@Injectable({
  providedIn: 'root'
})
export class ChamadaService {
  private readonly apiUrl = `${environment.apiUrl}/Chamada`;

  constructor(private http: HttpClient) { }

  // POST: api/Chamada
  registrar(model: AdicionarChamadaModel): Observable<any> {
    return this.http.post(this.apiUrl, model);
  }

  // GET: api/Chamada/turma/{turmaId}
  obterPorTurma(turmaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/turma/${turmaId}`);
  }

  // GET: api/Chamada/{id}
  obterPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // PATCH: api/Chamada/{id}/presencas
  alterarPresencasEmLote(id: string, alunos: AlunoPresencaModel[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/presencas`, alunos);
  }

  obterRelatorioPorTurma(turmaId: string): Observable<RelatorioTurma> {
    // ADICIONADO O "/turma/" NA URL
    return this.http.get<RelatorioTurma>(`${this.apiUrl}/relatorio/turma/${turmaId}`);
  }
}