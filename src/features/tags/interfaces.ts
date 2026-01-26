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
