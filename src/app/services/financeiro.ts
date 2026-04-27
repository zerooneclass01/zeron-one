import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mensalidade, Balancete, Despesa } from '../models/finaceiro.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private readonly API = `${environment.apiUrl}/financeiro`;

  constructor(private http: HttpClient) { }

  // --- Gestão de Balancete e Despesas ---

  obterBalancete(mes: number, ano: number): Observable<Balancete> {
    const params = new HttpParams().set('mes', mes).set('ano', ano);
    return this.http.get<Balancete>(`${this.API}/balancete`, { params });
  }

  // Novo: Corresponde ao [HttpGet("Obter-Despesa")]
  obterDespesas(mes: number, ano: number): Observable<Despesa[]> {
    const params = new HttpParams().set('mes', mes).set('ano', ano);
    return this.http.get<Despesa[]>(`${this.API}/Obter-Despesa`, { params });
  }

  registrarDespesa(despesa: any): Observable<void> {
    return this.http.post<void>(`${this.API}/despesa`, despesa);
  }

  // --- Gestão de Mensalidades (Receitas) ---

  listarTodasMensalidades(): Observable<Mensalidade[]> {
    return this.http.get<Mensalidade[]>(`${this.API}/mensalidades`);
  }

  listarPorAluno(alunoId: string): Observable<Mensalidade[]> {
    return this.http.get<Mensalidade[]>(`${this.API}/mensalidades/aluno/${alunoId}`);
  }

  listarVencidas(): Observable<Mensalidade[]> {
    return this.http.get<Mensalidade[]>(`${this.API}/mensalidades/vencidas`);
  }

  // Corresponde ao [HttpPatch("mensalidade/{id:guid}/pagar")]
  pagarMensalidade(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/mensalidade/${id}/pagar`, {});
  }

  // Novo: Corresponde ao [HttpPatch("MudarStatus-Mensalida/{id:guid}")]
  // status: 1 = Pendente, 2 = Pago, 3 = Atrasado (ou conforme seu Enum no C#)
  mudarStatusMensalidade(id: string, status: number): Observable<any> {
    return this.http.patch<any>(`${this.API}/MudarStatus-Mensalida/${id}`, null, {
      params: new HttpParams().set('status', status.toString())
    });
  }

  prorrogarVencimento(id: string, novaData: Date): Observable<void> {
    // Garantimos o envio apenas da data em formato ISO
    return this.http.patch<void>(`${this.API}/mensalidade/${id}/prorrogar`, JSON.stringify(novaData), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  gerarMensalidade(alunoId: string, valor: number, vencimento: string): Observable<any> {
    const params = new HttpParams()
      .set('alunoId', alunoId)
      .set('valor', valor.toString())
      .set('vencimento', vencimento); // Recomendo enviar a string do input date (YYYY-MM-DD)
    
    return this.http.post(`${this.API}/mensalidade/gerar`, null, { params });
  }

  excluirMensalidade(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/mensalidade/${id}`);
  }

  excluirDespesa(id: string): Observable<any> {
    // A rota deve bater com o [HttpDelete("{id:Guid}")] do seu Controller
    return this.http.delete(`${this.API}/despesas/${id}`);
  }
}