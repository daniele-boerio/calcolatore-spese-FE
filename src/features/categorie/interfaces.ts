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
  /**
   * Quanto si vorrebbe spendere in un mese su questa categoria.
   *
   * `null` è "nessun budget deciso", che non è come `0`: zero è un budget vero
   * e vuol dire "non spenderci niente". Arriva come stringa dal BE e lo
   * converte `mapCategoria`.
   */
  budget_mensile: number | null;
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
  budget_mensile?: number | null;
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
  /** `null` toglie il budget; assente lo lascia com'è. */
  budget_mensile?: number | null;
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
