import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RelatorioTurma } from '../models/RelatorioTurma';

export interface AlunoPresencaModel {
    alunoId: string;
    presente: boolean;
    observacao?: string;
}


@Injectable({
    providedIn: 'root'
})

export class chamadaItem {
    private readonly apiUrl = `${environment.apiUrl}/Chamada`;

    constructor(private http: HttpClient) { }
}