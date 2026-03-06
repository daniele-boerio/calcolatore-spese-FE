export interface SottoCategoria {
  id: string;
  nome: string;
  solo_entrata: boolean;
  solo_uscita: boolean;
  categoria_id: string;
  creationDate: string;
  lastUpdate: string;
}

export interface Categoria {
  id: string;
  nome: string;
  solo_entrata: boolean;
  solo_uscita: boolean;
  sottocategorie?: SottoCategoria[];
  creationDate: string;
  lastUpdate: string;
}

export interface CategorieState {
  loading: boolean;
  categorie: Categoria[];
  selectedCategoria: Categoria | null;
  selectedSottoCategoria: SottoCategoria | null;
  filters: CategoriesFilters;
}

// --- INTERFACCE PER I PARAMETRI ---

export interface CreateCategoriaParams {
  nome: string;
  solo_entrata: boolean;
  solo_uscita: boolean;
  sottocategorie?: {
    nome: string;
    solo_entrata: boolean;
    solo_uscita: boolean;
    categoria_id: string;
  }[];
}

export interface UpdateCategoriaParams {
  id: string;
  nome?: string;
  solo_entrata?: boolean;
  solo_uscita?: boolean;
}

export interface DeleteCategoriaParams {
  id: string;
}

export interface CreateSottoCategoriaParams {
  id: string; // ID della categoria padre
  subList: {
    nome: string;
    solo_entrata: boolean;
    solo_uscita: boolean;
  }[];
}

export interface UpdateSottoCategoriaParams {
  id: string; // ID della sottocategoria
  nome?: string;
  solo_entrata?: boolean;
  solo_uscita?: boolean;
}

export interface DeleteSottoCategoriaParams {
  catId: string;
  subId: string;
}

export interface DeleteSottoCategoriaResponse {
  catId: string;
  subId: string;
}

export interface CategoriesFilters {
  sort_by?: string[];
  solo_entrata?: boolean;
  solo_uscita?: boolean;
}
