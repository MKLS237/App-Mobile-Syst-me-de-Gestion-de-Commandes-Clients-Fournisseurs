import {
  Facture,
  FactureStats,
  StatutFacture,
  UpdateFactureRequest,
} from '../models/facture';

const API_URL =
  'https://commandes-app-m1uv.onrender.com/api';

/**
 * Récupérer toutes les factures
 */
export async function getFactures(): Promise<Facture[]> {
  const response = await fetch(`${API_URL}/factures`);

  if (!response.ok) {
    throw new Error(
      `Erreur récupération factures : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Récupérer une facture par son ID
 */
export async function getFactureById(
  id: number
): Promise<Facture> {
  const response = await fetch(`${API_URL}/factures/${id}`);

  if (!response.ok) {
    throw new Error(
      `Erreur récupération facture : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Générer une facture à partir d'une commande
 */
export async function generateFacture(
  commandeId: number
): Promise<Facture> {
  const response = await fetch(
    `${API_URL}/factures/generate/${commandeId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur génération facture : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Modifier complètement une facture
 */
export async function updateFacture(
  id: number,
  facture: UpdateFactureRequest
): Promise<Facture> {
  const response = await fetch(
    `${API_URL}/factures/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facture),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur modification facture : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Modifier uniquement le statut
 */
export async function updateStatutFacture(
  id: number,
  statut: StatutFacture
): Promise<Facture> {
  const response = await fetch(
    `${API_URL}/factures/${id}/statut`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statut,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur modification statut facture : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Supprimer une facture
 */
export async function deleteFacture(
  id: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/factures/${id}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur suppression facture : ${response.status} ${response.statusText}`
    );
  }
}

/**
 * Factures d'un client
 */
export async function getFacturesByClient(
  clientId: number
): Promise<Facture[]> {
  const response = await fetch(
    `${API_URL}/factures/client/${clientId}`
  );

  if (!response.ok) {
    throw new Error(
      `Erreur récupération factures client : ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Statistiques globales
 */
export async function getFactureStats(): Promise<FactureStats> {
  const response = await fetch(
    `${API_URL}/factures/stats`
  );

  if (!response.ok) {
    throw new Error(
      `Erreur statistiques factures : ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Statistiques d'un client
 */
export async function getFactureStatsByClient(
  clientId: number
): Promise<FactureStats> {
  const response = await fetch(
    `${API_URL}/factures/stats/client/${clientId}`
  );

  if (!response.ok) {
    throw new Error(
      `Erreur statistiques client : ${response.status}`
    );
  }

  return await response.json();
}