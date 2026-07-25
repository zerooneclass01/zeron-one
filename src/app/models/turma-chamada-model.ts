export interface AlunoMatriculado {
  matricula: string;
  nome: string;
}

export interface TurmaDetalhes {
  nome: string;             // ex: 'RAVENS' (usado como nome e mascote)
  professorResponsavel: string; // ex: 'Pedro Rangel'
  horario: string;          // ex: '18:00'
  diaSemana: string;        // ex: 'Quarta'
  anoLectivo?: number;      // ex: 2026
  alunos: AlunoMatriculado[];
}