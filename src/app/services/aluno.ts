import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aluno } from '../models/aluno.model';
import { environment } from '../../environments/environment';
import { AlunoResponser } from '../models/AlunoResponser.model';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  // A rota base conforme o [Route("api/[controller]")]
  private readonly API = `${environment.apiUrl}/Aluno`;

  constructor(private http: HttpClient) { }

  // [HttpGet("ObterTodos")]
  obterTodos(): Observable<AlunoResponser[]> {
    return this.http.get<AlunoResponser[]>(`${this.API}/ObterTodos`);
  }

  // [HttpGet("ObterAluno/{id:guid}")]
  obterPorId(id: string): Observable<AlunoResponser> {
    return this.http.get<AlunoResponser>(`${this.API}/ObterAluno/${id}`);
  }

  // [HttpPost]
  adicionar(aluno: Aluno): Observable<any> {
    return this.http.post(this.API, aluno);
  }

  atualizar(id: string, aluno: any): Observable<any> { // <--- Alterado para any
    return this.http.put(`${this.API}/${id}`, aluno);
  }
  // [HttpDelete("Remover/{id:guid}")]
  remover(id: string): Observable<string> {
    return this.http.delete<string>(`${this.API}/Remover/${id}`);
  }

  // Altera Turma (PUT)
  alterarTurma(alunoId: string, turmaId: string): Observable<any> {
    return this.http.put(`${this.API}/altera-Turma/${alunoId}/${turmaId}`, {});
  }

  // Vincula Turma (POST)
  vincularTurma(alunoId: string, turmaId: string): Observable<any> {
    return this.http.post(`${this.API}/VinculaTurmaAluno/${alunoId}/${turmaId}`, {});
  }
}
