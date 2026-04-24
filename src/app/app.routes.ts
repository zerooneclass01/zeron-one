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
import { RelatorioChamada } from './components/chamadas/relatorio-chamada/relatorio-chamada'
import { PerfilComponent } from './components/usuario/usuario'
import { RankingComponent } from './components/ranking/ranking';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: Dashboard },

  // Rotas de Aluno
  { path: 'aluno', component: AlunoComponent },
  { path: 'aluno/atualizar/:id', component: AlunoAtualizar },
  { path: 'aluno-detalhes/:id', component: AlunoDetalhes },

  { path: 'turma', component: TurmaComponent },
  { path: 'turma/turma-detalhe/:id', component: TurmaDetalheComponent },

  { path: 'professor', component: ProfessorComponent },
  { path: 'financeiro', component:FinanceiroDespesasComponent },
  { path: 'usuario', component: PerfilComponent },

  { path: 'chamadas', component: ChamadaComponent },
  { path: 'relatorio-chamada/:id', component: RelatorioChamada },
  { path: 'ranking', component: RankingComponent },

  { path: '**', redirectTo: 'dashboard' }
];