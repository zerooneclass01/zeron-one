import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ChamadaService } from '../../../services/chamada';
import { RelatorioTurma } from '../../../models/RelatorioTurma';

@Component({
  selector: 'app-relatorio-chamada',
  standalone: true,
  // O CommonModule é vital aqui para os pipes de data e diretivas estruturais
  imports: [CommonModule, RouterModule],
  templateUrl: './relatorio-chamada.html',
  styleUrl: './relatorio-chamada.css',
})
export class RelatorioChamada implements OnInit {
  relatorio?: RelatorioTurma;
  carregando: boolean = false;

  constructor(
    private chamadaService: ChamadaService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Escuta mudanças na rota para capturar o GUID da turma
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.carregarRelatorio(id);
      }
    });
  }

  carregarRelatorio(turmaId: string) {
    this.carregando = true;
    
    // Chamada para o serviço que agora retorna o objeto complexo com justificativas
    this.chamadaService.obterRelatorioPorTurma(turmaId).subscribe({
      next: (res) => {
        this.relatorio = res;
        this.carregando = false;
        
        // Garante que a UI atualize após o recebimento da lista detalhada
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.carregando = false;
        console.error('Erro ao buscar relatório do PulseOne:', err);
      }
    });
  }

  voltar() {
    // Retorna para a listagem de chamadas ou dashboard
    this.router.navigate(['/chamadas']);
  }
}