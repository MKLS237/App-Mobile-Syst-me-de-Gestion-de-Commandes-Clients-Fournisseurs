import { Client } from './clients';
import { Commande } from './commande';

export type StatutFacture =
  | 'NON_PAYEE'
  | 'PARTIELLEMENT_PAYEE'
  | 'PAYEE';

export interface Facture {
  id: number;
  commande: Commande;
  client: Client;
  dateFacture: string;
  montantTotal: number;
  statut: StatutFacture;
}

export interface UpdateFactureRequest {
  montantTotal: number;
  statut: StatutFacture;
}

export interface FactureStats {
  nombreTotal: number;
  montantTotalPayees: number;
  montantTotalNonPayees: number;
  montantTotalPartiellementPayees: number;
  montantTotalFactures: number;
}