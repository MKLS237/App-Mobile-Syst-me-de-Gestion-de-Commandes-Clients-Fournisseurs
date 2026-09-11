import {
  Commande,
  CreateCommandeRequest,
  CommandeStats,
} from '../models/commande';

const API_URL =
  'https://commandes-app-m1uv.onrender.com/api';

/**
 * Récupérer toutes les commandes
 */
export async function getCommandes(): Promise<Commande[]> {
  const response = await fetch(`${API_URL}/commandes`);

  if (!response.ok) {
    throw new Error(
      `Erreur API commandes : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Récupérer une commande par son ID
 */
export async function getCommandeById(
  id: number
): Promise<Commande> {
  const response = await fetch(
    `${API_URL}/commandes/${id}`
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API commande : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Créer une commande
 */
export async function createCommande(
  commande: CreateCommandeRequest
): Promise<Commande> {
  const response = await fetch(
    `${API_URL}/commandes`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commande),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur création commande : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Modifier une commande
 */
export async function updateCommande(
  id: number,
  commande: CreateCommandeRequest
): Promise<Commande> {
  const response = await fetch(
    `${API_URL}/commandes/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commande),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur modification commande : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Supprimer une commande
 */
export async function deleteCommande(
  id: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/commandes/${id}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur suppression commande : ${response.status} ${response.statusText}`
    );
  }
}

/**
 * Statistiques des commandes
 */
export async function getCommandeStats(
  startDate?: string,
  endDate?: string
): Promise<CommandeStats> {
  const params = new URLSearchParams();

  if (startDate) {
    params.append('startDate', startDate);
  }

  if (endDate) {
    params.append('endDate', endDate);
  }

  const query = params.toString();

  const response = await fetch(
    `${API_URL}/commandes/stats${query ? `?${query}` : ''}`
  );

  if (!response.ok) {
    throw new Error(
      `Erreur statistiques commandes : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}