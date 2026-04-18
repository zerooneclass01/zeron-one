import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  // No seu UsuarioService
  login(dados: any): Observable<{ token: string, role: number }> {
    return this.http.post<{ token: string, role: number }>(`${this.apiUrl}/Login`, dados);
  }

  /** Cria um novo usuário (Exige Role Admin ou RH no C#) */
  criarUsuario(usuario: any): Observable<string> {
    // Usamos responseType: 'text' pois seu C# retorna return Ok("Texto")
    return this.http.post(`${this.apiUrl}/Criar-Usuario`, usuario, { responseType: 'text' });
  }

  /** Solicita recuperação de senha via e-mail */
  esqueciSenha(email: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/esqueci-senha`, `"${email}"`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      responseType: 'text'
    });
  }

  /** Altera a senha usando o token de reset */
  resetarSenha(dados: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/resetar-senha`, dados, { responseType: 'text' });
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
  // 3. LÓGICA DE PERMISSÕES (PARA A TELA)
  // ==========================================

  /**
   * Decodifica o token para verificar se o usuário é Administrador.
   * Isso controla se os cards "Cadastrar" e "Lista" aparecem na tela.
   */
  isAdmin(): boolean {
    const token = this.obterToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);

      // Busca a claim de Role (pode ser 'role' ou o link completo da Microsoft)
      const role = decoded['role'] ||
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      return role === 'Admin' || role === 'RH';
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return false;
    }
  }

  /**
   * Consome o endpoint [HttpGet("ObterTodos")] do C#
   * Retorna uma lista de usuários para a tabela
   */
  obterTodos(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(`${this.apiUrl}/ObterTodos`);
  }

  /** Extrai o nome do usuário logado do token para exibir no Perfil */
  obterNomeUsuario(): string {
    const token = this.obterToken();
    if (!token) return 'Usuário';

    const decoded: any = jwtDecode(token);
    return decoded['unique_name'] || decoded['name'] || 'Usuário';
  }
}