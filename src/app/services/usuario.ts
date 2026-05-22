import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { UsuarioResponse } from '../models/UsuarioResponse';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  // A URL base configurada no seu environment
  private readonly apiUrl = `${environment.apiUrl}/Usuario`;

  constructor(private http: HttpClient) { }

  // ==========================================
  // 1. CHAMADAS DE API (BACKEND)
  // ==========================================

  /** Realiza o login e retorna o token JWT */
  login(dados: any): Observable<{ token: string, role: number }> {
    return this.http.post<{ token: string, role: number }>(`${this.apiUrl}/Login`, dados);
  }

  /** Cria um novo usuário (Exige Role Admin ou RH no C#) */
  criarUsuario(usuario: any): Observable<string> {
    const headers = this.criarHeadersAutenticados();
    
    // Passamos os headers para validar a permissão no C#
    return this.http.post(`${this.apiUrl}/Criar-Usuario`, usuario, { 
      headers, 
      responseType: 'text' 
    });
  }

  /** Solicita recuperação ACESSO */
  esqueciSenha(dados: { username: string, email: string }) {
    const params = new HttpParams()
      .set('usuario', dados.username)
      .set('email', dados.email);

    return this.http.post(`${this.apiUrl}/esqueci-senha`, {}, { params });
  }

  /** Altera a senha usando o token de reset */
  resetarSenha(dados: { username: string, senha: string }) {
    return this.http.post(`${this.apiUrl}/resetar-senha`, dados);
  }

  /** Consome o endpoint [HttpGet("ObterTodos")] do C# */
  obterTodos(): Observable<UsuarioResponse[]> {
    const headers = this.criarHeadersAutenticados();

    // Passamos o cabeçalho Authorization com o Bearer Token
    return this.http.get<UsuarioResponse[]>(`${this.apiUrl}/ObterTodos`, { headers });
  }

  // ==========================================
  // 2. GESTÃO DE TOKEN E SESSÃO
  // ==========================================

  salvarToken(token: string): void {
    localStorage.setItem('token_acesso', token);
  }

  obterToken(): string | null {
    return localStorage.getItem('token_acesso');
  }

  logout(): void {
    localStorage.removeItem('token_acesso');
  }

  // ==========================================
  // 3. LÓGICA DE PERMISSÕES E AUXILIARES
  // ==========================================

  /** Método privado auxiliar para gerar o cabeçalho com o Bearer Token */
  private criarHeadersAutenticados(): HttpHeaders {
    const token = this.obterToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /** Decodifica o token para verificar se o usuário é Administrador ou RH */
  isAdmin(): boolean {
    const token = this.obterToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);

      const role = decoded['role'] ||
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      return role === 'Admin' || role === 'RH';
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return false;
    }
  }

  /** Extrai o nome do usuário logado do token para exibir no Perfil */
  obterNomeUsuario(): string {
    const token = this.obterToken();
    if (!token) return 'Usuário';

    try {
      const decoded: any = jwtDecode(token);
      return decoded['unique_name'] || decoded['name'] || 'Usuário';
    } catch {
      return 'Usuário';
    }
  }
}