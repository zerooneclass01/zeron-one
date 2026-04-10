import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface AdicionarAtualizarTurmaModel {
  nome: string;
  professorId?: string | null;
  // ADICIONE ESTAS DUAS LINHAS:
  horario?: string;      
  diasDaSemana?: number; 
}


@Injectable({
  providedIn: 'root'
})
export class TurmaService {
  // A rota base conforme o [Route("api/[controller]")]
  private apiUrl = `${environment.apiUrl}/Turma`;

  constructor(private http: HttpClient) { }

  // GET: api/Turma/ObterTodos
  obterTodas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObterTodos`);
  }

  // GET: api/Turma/{id}
  obterPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  obterAlunosDaTurma(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObterAlunosDaTurma/${id}`);
  }

  // POST: api/Turma (Criação)
  criar(model: AdicionarAtualizarTurmaModel): Observable<string> {
    // Usamos responseType text porque sua controller retorna Ok("string")
    return this.http.post(`${this.apiUrl}`, model, { responseType: 'text' });
  }

  // PUT: api/Turma/{id} (Atualização)
  atualizar(id: string, model: AdicionarAtualizarTurmaModel): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}`, model, { responseType: 'text' });
  }

  // PATCH: api/Turma/{id}/ativar
  ativar(id: string): Observable<string> {
    return this.http.patch(`${this.apiUrl}/${id}/ativar`, {}, { responseType: 'text' });
  }

  // PATCH: api/Turma/{id}/desativar
  desativar(id: string): Observable<string> {
    return this.http.patch(`${this.apiUrl}/${id}/desativar`, {}, { responseType: 'text' });
  }

  // PATCH: api/Turma/{id}/alterar-professor/{profesorId}
  alterarProfessor(turmaId: string, professorId: string): Observable<string> {
    return this.http.patch(`${this.apiUrl}/${turmaId}/alterar-professor/${professorId}`, {}, { responseType: 'text' });
  }

  // DELETE: api/Turma/{id}
  remover(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  //api/Turma/removerAluno/{Alunoid}/{turmaId}
  removerAlunoDaTurma(alunoId: string, turmaId: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/removerAluno/${alunoId}/${turmaId}`, { responseType: 'text' });
  }

}