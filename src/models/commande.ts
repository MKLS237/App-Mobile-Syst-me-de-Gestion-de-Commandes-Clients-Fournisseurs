import { Client } from '../models/clients';

export interface Commande {
  id: number;
  client: Client;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  statut: string;
  dateCommande: string;
  dateLivraison: string | null;
}

export interface CreateCommandeRequest {
  client: Client;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  statut: string;
  dateCommande: string;
  dateLivraison?: string | null;
}

export interface CommandeStatsParJour {
  dateCommande: string;
  totalVentes: number;
}

export interface CommandeStats {
  statsParJour: CommandeStatsParJour[];
  [key: string]: any;
}