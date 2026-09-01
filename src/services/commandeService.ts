export interface CommandeStatsParJour {
  dateCommande: string;
  totalVentes: number;
}

export interface CommandeStats {
  statsParJour: CommandeStatsParJour[];
  [key: string]: any;
}

const API_URL =
  'https://commandes-app-m1uv.onrender.com/api';

export async function getCommandeStats(
  startDate: string,
  endDate: string
): Promise<CommandeStats> {

  const response = await fetch(
    `${API_URL}/commandes/stats?startDate=${startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API commandes : ${response.status}`
    );
  }

  return await response.json();
}