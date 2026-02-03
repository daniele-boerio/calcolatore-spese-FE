// --- INTERFACCE ---

export interface Investimento {
  id: string;
  isin?: string;
  ticker?: string;
  nome_titolo: string;
  prezzo_attuale: number;
  data_ultimo_aggiornamento: string;
  storico: Operazione[];
}

export interface Operazione {
  id: string;
  data: string;
  quantità: number;
  prezzo_unitario: number;
  investimento_id: string;
}

export interface InvestimentoState {
  loading: boolean;
  investimenti: Investimento[];
  selectedInvestimento: Investimento | null;
}

export interface CreateInvestimentoParams {
  isin: string;
  ticker?: string;
  nome_titolo: string;
  quantita_iniziale: number;
  prezzo_carico_iniziale: number;
  data_iniziale: string;
}

export interface UpdateInvestimentoParams {
  id: string;
  isin?: string;
  ticker?: string;
  nome_titolo?: string;
}

export interface DeleteInvestimentoParams {
  id: string;
}

export interface CreateOperazioneParams {
  data: string;
  quantita: number;
  prezzo_unitario: number;
  investimento_id: string;
}

export interface UpdateOperazioneParams {
  id: string;
  investimento_id: string;
  data?: string;
  quantita?: number;
  prezzo_unitario?: number;
}

export interface DeleteOperazioneParams {
  id: string;
  investimento_id: string;
}

export interface DeleteOperazioneOutput {
  op_id: string;
  inv_id: string;
}
