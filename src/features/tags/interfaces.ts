export interface Tag {
  id: string;
  nome: string;
}

// 2. Definiamo lo stato dello slice
export interface TagState {
  loading: boolean;
  tags: Tag[];
  selectedTag: Tag | null;
}

export interface createTagParams {
  nome: string;
}

export interface UpdateTagParams {
  id: string;
  nome: string;
}

export interface DeleteTagParams {
  id: string;
}
