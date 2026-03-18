import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mensalidade, Balancete } from '../models/finaceiro.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private readonly API = `${environment.apiUrl}/financeiro`;

  constructor(private http: HttpClient) { }

  // #region Gestão de Mensalidades (Receitas)

  listarPorAluno(alunoId: string): Observable<Mensalidade[]> {
    return this.http.get<Mensalidade[]>(`${this.API}/mensalidades/aluno/${alunoId}`);
  }

  // Corresponde ao [HttpPatch("mensalidade/{id:guid}/pagar")]
  pagarMensalidade(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/mensalidade/${id}/pagar`, {});
  }

  // Corresponde ao [HttpPatch("mensalidade/{id:guid}/prorrogar")]
  prorrogarVencimento(id: string, novaData: Date): Observable<void> {
    return this.http.patch<void>(`${this.API}/mensalidade/${id}/prorrogar`, novaData);
  }

  // Corresponde ao [HttpPost("mensalidade/gerar")]
  gerarMensalidade(alunoId: string, valor: number, vencimento: Date): Observable<any> {
    const params = new HttpParams()
      .set('alunoId', alunoId)
      .set('valor', valor.toString())
      .set('vencimento', vencimento.toISOString());
    
    return this.http.post(`${this.API}/mensalidade/gerar`, null, { params });
  }

  excluirMensalidade(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/mensalidade/${id}`);
  }



  obterBalancete(mes: number, ano: number): Observable<Balancete> {
    const params = new HttpParams().set('mes', mes).set('ano', ano);
    return this.http.get<Balancete>(`${this.API}/balancete`, { params });
  }

  registrarDespesa(despesa: any): Observable<void> {
    return this.http.post<void>(`${this.API}/despesa`, despesa);
  }

  
}