import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  
  // Consome a chave direto do environment
  private apiKey = `${environment.Apikey}`; 
  
  private folders = {
    administrativo: '1WNru-FBH3exn44IuNFBWlj-Bw-uIl-g9',
    professor: '1g41PEJIlxYs1KZA8d-auzigbcjY_eTkQ'
  };

  constructor() {}

  /**
   * Busca os arquivos da raiz unificada (Admin + Professores)
   */
  async listFiles(): Promise<any[]> {
    const qAdmin = encodeURIComponent(`'${this.folders.administrativo}' in parents and trashed = false`);
    const qProf = encodeURIComponent(`'${this.folders.professor}' in parents and trashed = false`);

    const urlAdmin = `https://www.googleapis.com/drive/v3/files?q=${qAdmin}&fields=files(id,name,mimeType,size)&key=${this.apiKey}`;
    const urlProf = `https://www.googleapis.com/drive/v3/files?q=${qProf}&fields=files(id,name,mimeType,size)&key=${this.apiKey}`;
    
    try {
      const [resAdmin, resProf] = await Promise.all([
        fetch(urlAdmin),
        fetch(urlProf)
      ]);

      const dataAdmin = resAdmin.ok ? await resAdmin.json() : { files: [] };
      const dataProf = resProf.ok ? await resProf.json() : { files: [] };

      const adminFiles = (dataAdmin.files || []).map((f: any) => ({ ...f, deparment: 'Administrativo' }));
      const profFiles = (dataProf.files || []).map((f: any) => ({ ...f, deparment: 'Pedagógico' }));

      return [...adminFiles, ...profFiles].sort((a, b) => a.name.localeCompare(b.name));

    } catch (error) {
      console.error('Erro ao unificar arquivos do Drive:', error);
      return [];
    }
  }

  /**
   * Baixa o arquivo público usando a URL nativa de exportação web do Google Drive
   */
  async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      // Esta URL contorna o bloqueio 403 da API Key porque o próprio navegador gerencia o download público
      const publicDownloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
      
      const a = document.createElement('a');
      a.href = publicDownloadUrl;
      a.download = fileName;
      a.target = '_blank'; // Abre em segundo plano e dispara o download nativo
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Erro no redirecionamento do download:', error);
      throw new Error('Erro ao descarregar o ficheiro público');
    }
  }
}