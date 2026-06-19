import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  
  private apiKey = `${environment.Apikey}`; 
  
  // Mapeamento dos IDs das duas pastas públicas
  private folders = {
    administrativo: '1WNru-FBH3exn44IuNFBWlj-Bw-uIl-g9',
    professor: '1g41PEJIlxYs1KZA8d-auzigbcjY_eTkQ'
  };

  constructor() {}

  /**
   * Busca os arquivos de ambas as pastas e unifica a lista
   */
  async listFiles(): Promise<any[]> {
    // CORREÇÃO ESSENCIAL: Codificar a query (q) de forma segura para a API do Google aceitar em produção
    const qAdmin = encodeURIComponent(`'${this.folders.administrativo}' in parents and trashed = false`);
    const qProf = encodeURIComponent(`'${this.folders.professor}' in parents and trashed = false`);

    const urlAdmin = `https://www.googleapis.com/drive/v3/files?q=${qAdmin}&fields=files(id,name,mimeType,size)&key=${this.apiKey}`;
    const urlProf = `https://www.googleapis.com/drive/v3/files?q=${qProf}&fields=files(id,name,mimeType,size)&key=${this.apiKey}`;
    
    try {
      // Faz os dois pedidos HTTP ao mesmo tempo (ganho de performance)
      const [resAdmin, resProf] = await Promise.all([
        fetch(urlAdmin),
        fetch(urlProf)
      ]);

      const dataAdmin = resAdmin.ok ? await resAdmin.json() : { files: [] };
      const dataProf = resProf.ok ? await resProf.json() : { files: [] };

      // Adiciona uma propriedade para identificarmos a origem no Card
      const adminFiles = (dataAdmin.files || []).map((f: any) => ({ ...f, deparment: 'Administrativo' }));
      const profFiles = (dataProf.files || []).map((f: any) => ({ ...f, deparment: 'Pedagógico' }));

      // Junta as duas listas e ordena por nome
      return [...adminFiles, ...profFiles].sort((a, b) => a.name.localeCompare(b.name));

    } catch (error) {
      console.error('Erro ao unificar arquivos do Drive:', error);
      return []; // Retorna lista vazia em vez de quebrar a aplicação se a rede falhar
    }
  }

  /**
   * Baixa o arquivo público direto pelo ID
   */
  async downloadFile(fileId: string, fileName: string): Promise<void> {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro ao descarregar o ficheiro público');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(blobUrl);
    a.remove();
  }
}