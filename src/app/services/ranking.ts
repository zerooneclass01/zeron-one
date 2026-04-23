import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RakingAdicionarAtualizarModel } from './../models/RakingAdicionarAtualizarModel';
import { RakingModel } from '../models/RakingModel';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RankingService {

  // Ajuste a URL conforme o seu ambiente (ex: localhost:5001)
  private readonly apiUrl = `${environment.apiUrl}/ranking`;

  constructor(private http: HttpClient) { }

  // GET: Obter todos
  getTodos(): Observable<RakingModel[]> {
    return this.http.get<RakingModel[]>(this.apiUrl);
  }

  // GET: Obter por ID
  getPorId(id: string): Observable<RakingModel> {
    return this.http.get<RakingModel>(`${this.apiUrl}/${id}`);
  }

  // GET: Obter por Aluno
  getPorAluno(alunoId: string): Observable<RakingModel> {
    return this.http.get<RakingModel>(`${this.apiUrl}/aluno/${alunoId}`);
  }

  // GET: Obter Ranking da Turma
  getRankingDaTurma(turmaId: string): Observable<RakingModel[]> {
    return this.http.get<RakingModel[]>(`${this.apiUrl}/turma/${turmaId}`);
  }

  // POST: Gerar ranking para uma turma
  criarRankingTurma(turmaId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/gerar-ranking-turma/${turmaId}`, {});
  }

  // PUT: Atualizar ranking
  atualizarRanking(id: string, model: RakingAdicionarAtualizarModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, model);
  }

  // DELETE: Remover ranking
  remover(turmaId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${turmaId}`);
  }
}