import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  HistoricoAlunoModel, 
  HistoricoAlunoAdicionarModel, 
  HistoricoAtualizarModel 
} from '../models/historicoalunos.model';

@Injectable({
  providedIn: 'root'
})
export class HistoricoAlunoService {
  
  // Rota base com base no [Route("api/[controller]")] da sua Controller .NET
  private readonly API = `${environment.apiUrl}/HistoricoAluno`;

  constructor(private http: HttpClient) { }

  // [HttpGet] - Obter todos os históricos gerais do sistema
  obterHistoricos(): Observable<HistoricoAlunoModel[]> {
    return this.http.get<HistoricoAlunoModel[]>(this.API);
  }

  // [HttpGet("HistoricosDoAluno/{alunoId:guid}")] - O principal para a sua tela de Timeline
  obterHistoricosDoAluno(alunoId: string): Observable<HistoricoAlunoModel[]> {
    return this.http.get<HistoricoAlunoModel[]>(`${this.API}/HistoricosDoAluno/${alunoId}`);
  }

  // [HttpGet("{id:guid}")] - Obter um registro específico por ID
  obterPorId(id: string): Observable<HistoricoAlunoModel> {
    return this.http.get<HistoricoAlunoModel>(`${this.API}/${id}`);
  }

  // [HttpPost("AdicionarHistorico")] - Criar novo registro de evolução
  adicionarHistorico(model: HistoricoAlunoAdicionarModel): Observable<any> {
    return this.http.post<any>(`${this.API}/AdicionarHistorico`, model);
  }

  // [HttpPut("{id:guid}")] - Atualizar registro existente
  atualizarHistorico(idHistorico: string, model: HistoricoAtualizarModel): Observable<any> {
    return this.http.put<any>(`${this.API}/${idHistorico}`, model);
  }

  // [HttpDelete("{id:guid}")] - Remover o registro da linha do tempo
  removerHistorico(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API}/${id}`);
  }
}