import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { AlunoComponent } from './components/aluno/aluno';
import { AlunoAtualizar } from './components/aluno-atualizar/aluno-atualizar';
import { AlunoDetalhes } from './components/aluno-detalhes/aluno-detalhes';
import { TurmaComponent } from './components/turma/turma';
import { ProfessorComponent } from './components/professor/professor';
import { FinanceiroDespesasComponent } from './components/financeiro-despesa/financeiro-despesa';
import { TurmaDetalheComponent } from './components/turma/turma-detalhe/turma-detalhe';
import { ChamadaComponent } from './components/chamadas/chamadas';
import { RelatorioChamada } from './components/chamadas/relatorio-chamada/relatorio-chamada';
import { PerfilComponent } from './components/usuario/usuario';
import { RankingComponent } from './components/ranking/ranking';
import { HistoricoAlunoComponent } from './components/historico-aluno/historico-aluno';
import { HistoricoComponent } from './components/historico/historico';
import { GoogleDriveComponent } from './components/google-drive/google-drive';
import { ChamadaPrintComponent } from './components/turma/chamada-print/chamada-print';
import { StudentIdCardComponent } from './components/student-id-card/student-id-card';

// Importe o seu guard aqui (ajuste o caminho se necessário)
import { authGuard } from '../app/services/auth.guard';
import path from 'path';
import { Component } from '@angular/core';

export const routes: Routes = [
  // 🔓 ROTA PÚBLICA: Qualquer um pode acessar a tela de login
  { path: '', component: LoginComponent },

  // 🔒 ROTAS PROTEGIDAS: O agrupamento abaixo exige autenticação
  {
    path: '',
    canActivate: [authGuard], // Aplica o bloqueio para todas as rotas filhas
    children: [
      { path: 'dashboard', component: Dashboard },

      // Rotas de Aluno
      { path: 'aluno', component: AlunoComponent },
      { path: 'aluno/atualizar/:id', component: AlunoAtualizar },
      { path: 'aluno-detalhes/:id', component: AlunoDetalhes },

      {
        path: 'aluno/:id/student-id-card',
        component: StudentIdCardComponent
      },

      // Rotas de Turma
      { path: 'turma', component: TurmaComponent },
      { path: 'turma/turma-detalhe/:id', component: TurmaDetalheComponent },
      { path: 'turma/:id/chamada', component: ChamadaPrintComponent },

      // Outros Módulos
      { path: 'professor', component: ProfessorComponent },
      { path: 'financeiro', component: FinanceiroDespesasComponent },
      { path: 'usuario', component: PerfilComponent },

      // Chamadas e Ranking
      { path: 'chamadas', component: ChamadaComponent },
      { path: 'relatorio-chamada/:id', component: RelatorioChamada },
      { path: 'ranking', component: RankingComponent },
      { path: 'historico-aluno', component: HistoricoAlunoComponent },
      { path: 'historico/:alunoId', component: HistoricoComponent },
      { path: 'google-drive', component: GoogleDriveComponent }
    ]
  },

  // 🔄 Redirecionamento padrão para rotas inexistentes
  // Se o cara digitar algo errado e NÃO estiver logado, o guard interceptará e mandará pro Login.
  // Se ele estiver logado, vai para o Dashboard.
  { path: '**', redirectTo: 'dashboard' }
];