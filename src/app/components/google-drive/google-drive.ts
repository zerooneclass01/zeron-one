import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GoogleDriveService } from '../../services/google-drive';
import { Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-google-drive',
  templateUrl: './google-drive.html',
  styleUrls: ['./google-drive.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class GoogleDriveComponent implements OnInit {
  files: any[] = [];
  filteredFiles: any[] = [];

  isLoading = false;
  searchTerm = '';
  isInsideSubfolder = false;
  
  // Define o ID como null para bloquear uploads acidentais na raiz
  currentFolderId: string | null = null; 

  constructor(
    private driveService: GoogleDriveService,
    private location: Location,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.carregarArquivos();
  }

  async carregarArquivos() {
    this.isLoading = true;
    this.isInsideSubfolder = false;
    this.currentFolderId = null; // Reseta a referência de upload
    this.searchTerm = '';
    this.cdRef.detectChanges();
    
    try {
      this.files = await this.driveService.listFiles();
      this.filteredFiles = [...this.files]; 
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
    } finally {
      this.isLoading = false;
      this.cdRef.detectChanges();
    }
  }

  async abrirPasta(folderId: string) {
    this.isLoading = true;
    this.currentFolderId = folderId; // Aloca a pasta correta para uploads futuros
    this.searchTerm = '';
    this.cdRef.detectChanges();

    try {
      const apiKey = environment.Apikey;
      const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size)&key=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao requisitar subpasta');

      const data = await response.json();

      this.files = (data.files || []).map((f: any) => ({
        ...f,
        deparment: 'Conteúdo'
      })).sort((a: any, b: any) => a.name.localeCompare(b.name));

      this.filteredFiles = [...this.files];
      this.isInsideSubfolder = true;

    } catch (error) {
      console.error('Erro ao abrir subpasta:', error);
      alert('Não foi possível abrir esta pasta.');
    } finally {
      this.isLoading = false;
      this.cdRef.detectChanges();
    }
  }

  /**
   * Faz o Upload restrito estritamente à pasta ativa selecionada
   */
  async subirArquivo(event: any) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    
    // Validação estrita de diretório ativo
    if (!file || !this.currentFolderId) {
      alert('Por favor, selecione uma pasta antes de subir arquivos.');
      return;
    }

    this.isLoading = true;
    this.cdRef.detectChanges();

    try {
      const apiKey = environment.Apikey;
      
      const metadata = {
        name: file.name,
        parents: [this.currentFolderId]
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      const url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Falha no upload para o Google Drive');
      }

      alert('Arquivo enviado com sucesso!');
      
      // Reseta o input do HTML para permitir subir o mesmo arquivo de novo se necessário
      fileInput.value = '';

      // Atualiza a listagem interna da pasta imediatamente
      this.abrirPasta(this.currentFolderId);

    } catch (error) {
      console.error('Erro ao subir arquivo:', error);
      alert('Erro ao subir arquivo. Garanta que a sua pasta de destino possui permissões públicas de escrita para a Chave de API.');
      fileInput.value = ''; // Limpa o erro do input
    } finally {
      this.isLoading = false;
      this.cdRef.detectChanges();
    }
  }

  filtrarArquivos() {
    if (!this.searchTerm) {
      this.filteredFiles = [...this.files];
    } else {
      this.filteredFiles = this.files.filter(file =>
        file.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.cdRef.detectChanges();
  }

  baixarArquivo(fileId: string, fileName: string) {
    // Abre direto a URL de download nativo que o Google aceita publicamente
    const url = `https://docs.google.com/uc?export=download&id=${fileId}`;
    window.open(url, '_blank');
  }

  voltar() {
    if (this.isInsideSubfolder) {
      this.carregarArquivos();
    } else {
      this.location.back();
    }
  }
}