import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelatorioService } from '../../../services/relatorio';
import { AnaliseIA, RelatorioFinanceiro } from '../../../models/RelatorioFinanceiro';
import { Chart } from 'chart.js/auto'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-relatorio-financeiro',
  templateUrl: './relatorio.html',
  styleUrls: ['./relatorio.css'],
  standalone: true,
  imports: [
    CommonModule,  
    FormsModule,  
    CurrencyPipe   
  ]
})
export class RelatorioFinanceiroComponent implements OnInit, OnDestroy {
  dataInicio: string = '';
  dataFim: string = '';
  loading: boolean = false;

  analiseIa: AnaliseIA | null = null;
  dadosFinanceiros: RelatorioFinanceiro | null = null;
  
  chart: any;

  constructor(
    private relatorioService: RelatorioService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarDatasDefault();
    this.carregarRelatorio();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  // Seta 1º dia do mês até o último dia do mês corrente
  inicializarDatasDefault(): void {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    this.dataInicio = this.formatarData(primeiroDia);
    this.dataFim = this.formatarData(ultimoDia);
  }

  private formatarData(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  // Função chamada automaticamente na alteração das datas ou no init
  carregarRelatorio(): void {
    if (!this.dataInicio || !this.dataFim) return;

    this.loading = true;

    this.relatorioService.getRelatorioCompleto(this.dataInicio, this.dataFim).subscribe({
      next: ([resIa, resFin]) => {
        this.analiseIa = resIa;
        this.dadosFinanceiros = resFin;
        this.loading = false;
        
        // Força a atualização do DOM para que o <canvas> exista antes do Chart.js desenhar
        this.cdRef.detectChanges();

        this.renderizarGrafico();
      },
      error: (err) => {
        console.error('Erro ao buscar dados:', err);
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  renderizarGrafico(): void {
    if (!this.dadosFinanceiros) return;

    // Destrói gráfico antigo se existir para evitar sobreposição
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('chartPagamentos') as HTMLCanvasElement;
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cartão de Crédito', 'Pix', 'Débito', 'Dinheiro'],
        datasets: [{
          data: [
            this.dadosFinanceiros.totalCartaoCredito,
            this.dadosFinanceiros.totalPix,
            this.dadosFinanceiros.totalCartaoDebito,
            this.dadosFinanceiros.totalDinheiro
          ],
          backgroundColor: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { size: 11 } }
          }
        }
      }
    });
  }

   voltar() { this.router.navigate(['/financeiro']); }
}