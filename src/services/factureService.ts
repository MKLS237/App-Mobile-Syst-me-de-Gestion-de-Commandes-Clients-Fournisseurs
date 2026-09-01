export interface FactureStats {
  nombreTotal: number;
  [key: string]: any;
}

const API_URL =
  'https://commandes-app-m1uv.onrender.com/api';

export async function getGlobalFactureStats(): Promise<FactureStats> {

  const response = await fetch(
    `${API_URL}/factures/stats`
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API factures : ${response.status}`
    );
  }

  return await response.json();
}