import { DashboardStats } from '../models/dashboard';

const API_URL =
  'https://commandes-app-m1uv.onrender.com/api';

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(
    `${API_URL}/clients/stats`
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}