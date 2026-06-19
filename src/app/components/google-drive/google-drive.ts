import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GoogleDriveService } from '../../services/google-drive';
import { Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-google-drive',
  templateUrl: './google-drive.html',
  styleUrls: ['./google-drive.css'],
  standalone: true, // Garante que o componente aceita imports diretos
  imports: [CommonModule, FormsModule],
})
export class GoogleDriveComponent implements OnInit {
  // Listas para armazenar e filtrar os ficheiros
  files: any[] = [];
  filteredFiles: any[] = [];

  // Estados de controlo da interface (Mobile/Desktop UI)
  isLoading = false;
  searchTerm = '';

  constructor(
    private driveService: GoogleDriveService,
    private location: Location,
    private cdRef: ChangeDetectorRef, // Força a atualização da UI no mobile
  ) { }

  ngOnInit(): void {
    // Agora carrega os arquivos públicos diretamente ao iniciar a tela!
    this.carregarArquivos();
  }

  /**
   * Procura a lista de ficheiros atualizada na API do Google Drive (Admin + Professor)
   */
  async carregarArquivos() {
    this.isLoading = true;
    this.cdRef.detectChanges(); // Atualiza o spinner na tela
    
    try {
      this.files = await this.driveService.listFiles();
      this.filteredFiles = [...this.files]; 
    } catch (error) {
      console.error('Erro ao listar arquivos das pastas públicas:', error);
    } finally {
      this.isLoading = false;
      this.cdRef.detectChanges(); // Força o Angular a desenhar os novos cards na tela
    }
  }

  /**
   * Filtro em tempo real acionado a cada letra digitada no input de busca.
   * Excelente para usabilidade mobile (evita recarregar a página).
   */
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

  /**
   * Executa o download binário do ficheiro de forma segura ao clicar no Card.
   */
  async baixarArquivo(fileId: string, fileName: string) {
    this.isLoading = true;
    this.cdRef.detectChanges();
    try {
      await this.driveService.downloadFile(fileId, fileName);
    } catch (error) {
      console.error('Erro ao baixar:', error);
      alert('Não foi possível descarregar o ficheiro.');
    } finally {
      this.isLoading = false;
      this.cdRef.detectChanges();
    }
  }

  /**
   * Aciona a navegação nativa para voltar à tela anterior do sistema.
   */
  voltar() {
    this.location.back();
  }
}