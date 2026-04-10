import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Professor } from '../models/Professor-data.model';
// Interface baseada no seu Controller C#

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  // A rota definida no seu Controller C# [Route("api/[controller]")]
  private apiUrl = `${environment.apiUrl}/Professor`;

  constructor(private http: HttpClient) {}

  // Mapeado para o [HttpGet("ObterTodos")] do seu Controller
  obterTodos(): Observable<Professor[]> {
    return this.http.get<Professor[]>(`${this.apiUrl}/ObterTodos`);
  }

  // Mapeado para o [HttpGet("{id:guid}")]
  obterPorId(id: string): Observable<Professor> {
    return this.http.get<Professor>(`${this.apiUrl}/${id}`);
  }

  // Mapeado para o [HttpPost]
  criarProfessor(professor: any): Observable<any> {
    return this.http.post(this.apiUrl, professor);
  }

  atualizarProfessor(professor:any):Observable<any>{
   return this.http.put(`${this.apiUrl}`, professor);
  }

  // Mapeado para o [HttpDelete("{id:guid}")]
  removerProfessor(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}