export interface SottoCategoria {
  id: string;
  nome: string;
  categoria_id: string;
  creationDate: string;
  lastUpdate: string;
}

export interface Categoria {
  id: string;
  nome: string;
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
  sottocategorie?: string[];
}

export interface UpdateCategoriaParams {
  id: string;
  nome: string;
}

export interface DeleteCategoriaParams {
  id: string;
}

export interface CreateSottoCategoriaParams {
  id: string; // ID della categoria padre
  nomeList: { nome: string }[];
}

export interface UpdateSottoCategoriaParams {
  id: string; // ID della sottocategoria
  nome: string;
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
  sort_by?: string;
  sort_order?: "asc" | "desc";
  solo_entrata?: boolean;
  solo_uscita?: boolean;
  solo_rimborso?: boolean;
}
