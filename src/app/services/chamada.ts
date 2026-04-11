import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RelatorioTurma } from '../models/RelatorioTurma';

export interface AlunoPresencaModel {
  alunoId: string;
  presente: boolean;
  observacao?: string;
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

  /**
   * Registra uma nova chamada. 
   * IMPORTANTE: A rota deve ser /registrar para bater com o [HttpPost("registrar")] do C#
   */
  registrar(model: AdicionarChamadaModel): Observable<any> {
    return this.http.post(`${this.apiUrl}`, model);
  }

  /**
   * Obtém a lista de chamadas já realizadas de uma turma específica
   */
  obterPorTurma(turmaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/turma/${turmaId}`);
  }

  /**
   * Obtém os detalhes de uma chamada específica pelo ID
   */
  obterPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Atualiza as presenças de uma chamada existente (em lote)
   */
  alterarPresencasEmLote(id: string, alunos: AlunoPresencaModel[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/presencas`, alunos);
  }

  /**
   * Busca o relatório formatado para a tela de relatórios
   */
  obterRelatorioPorTurma(turmaId: string): Observable<RelatorioTurma> {
    return this.http.get<RelatorioTurma>(`${this.apiUrl}/relatorio/turma/${turmaId}`);
  }

  obterPorTurmaEData(turmaId: string, data: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/turma/${turmaId}/data/${data}`);
  }
}