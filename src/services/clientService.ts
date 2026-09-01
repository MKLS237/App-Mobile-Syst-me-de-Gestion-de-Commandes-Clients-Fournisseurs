import { Client, CreateClientRequest } from '../models/clients';

const API_URL =
  'https://commandes-app-m1uv.onrender.com/api';

export async function getClients(): Promise<Client[]> {
  const response = await fetch(`${API_URL}/clients`);

  if (!response.ok) {
    throw new Error(
      `Erreur API : ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getClientById(id: number): Promise<Client> {
  const url = `${API_URL}/clients/${id}`;

  console.log('URL appelée :', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Erreur API : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export async function createClient(
  client: CreateClientRequest
): Promise<Client> {
  const response = await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  });

  if (!response.ok) {
    throw new Error(
      `Erreur API : ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}
export async function updateClient(
  id: number,
  client: CreateClientRequest
): Promise<Client> {

  const response = await fetch(
    `${API_URL}/clients/${id}`,
    {
      method: 'PUT',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(client),
    }
  );

  if (!response.ok) {

    throw new Error(
      `Erreur API : ${response.status} ${response.statusText}`
    );

  }

  return await response.json();
}
export async function deleteClient(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(
      `Erreur API : ${response.status} ${response.statusText}`
    );
  }
}