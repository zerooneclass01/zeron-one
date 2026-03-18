import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aluno } from '../models/aluno.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  // A rota base conforme o [Route("api/[controller]")]
  private readonly API = `${environment.apiUrl}/Aluno`;

  constructor(private http: HttpClient) { }

  // [HttpGet("ObterTodos")]
  obterTodos(): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(`${this.API}/ObterTodos`);
  }

  // [HttpGet("ObterAluno/{id:guid}")]
  obterPorId(id: string): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.API}/ObterAluno/${id}`);
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

  // [HttpPatch("VinculaTurmaAluno/{alunoid:guid}/{turmaid:guid}")]
  vincularTurma(alunoId: string, turmaId: string): Observable<string> {
    return this.http.patch<string>(`${this.API}/VinculaTurmaAluno/${alunoId}/${turmaId}`, {});
  }
}