import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { AnaliseIA, RelatorioFinanceiro } from '../models/RelatorioFinanceiro';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
   private readonly apiUrl = `${environment.apiUrl}/Relatorio`;

  constructor(private http: HttpClient) {}

  // Buscar Análise da IA Gemini
  getAnaliseIa(dataInicio: string, dataFim: string): Observable<AnaliseIA> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);

    return this.http.get<AnaliseIA>(`${this.apiUrl}/analise-ia`, { params });
  }

  // Buscar Dados Financeiros do Banco
  getAnaliseFinanceira(dataInicio: string, dataFim: string): Observable<RelatorioFinanceiro> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);

    return this.http.get<RelatorioFinanceiro>(`${this.apiUrl}/analise-financeira`, { params });
  }

  // Método auxiliar para buscar ambos simultaneamente com forkJoin
  getRelatorioCompleto(dataInicio: string, dataFim: string): Observable<[AnaliseIA, RelatorioFinanceiro]> {
    return forkJoin([
      this.getAnaliseIa(dataInicio, dataFim),
      this.getAnaliseFinanceira(dataInicio, dataFim)
    ]);
  }
}