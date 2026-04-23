export type AnimalEspecie = 'BOVINO' | 'SUINO' | 'AVICOLA' | 'OVINO' | 'CAPRINO' | 'EQUINO' | 'OUTRO';
export type AnimalSexo = 'MACHO' | 'FEMEA';
export type AnimalStatus = 'ATIVO' | 'VENDIDO' | 'MORTO' | 'TRANSFERIDO';

export interface Animal {
  id: string;
  propriedadeId: string;
  nome?: string;
  numeroIdentificacao?: string;
  especie: AnimalEspecie;
  raca?: string;
  sexo: AnimalSexo;
  dataNascimento?: Date;
  pesoKg?: number;
  status: AnimalStatus;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CulturaStatus = 'PLANEJADA' | 'PLANTADA' | 'EM_CRESCIMENTO' | 'COLHIDA' | 'PERDIDA';

export interface Cultura {
  id: string;
  propriedadeId: string;
  nome: string;
  tipo: string;
  areaHectares: number;
  dataPlantio?: Date;
  dataColheitaEstimada?: Date;
  status: CulturaStatus;
  producaoKg?: number;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}
