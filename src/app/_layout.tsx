import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>

      <Stack.Screen
        name="index"
        options={{
          title: 'Tableau de bord',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="clients"
        options={{
          title: 'Clients',
        }}
      />

      <Stack.Screen
        name="client/[id]"
        options={{
          title: 'Détail du client',
        }}
      />

      <Stack.Screen
        name="client/create"
        options={{
          title: 'Ajouter un client',
        }}
      />

      <Stack.Screen
        name="client/edit"
        options={{
          title: 'Modifier le client',
        }}
      />

      <Stack.Screen
        name="commandes"
        options={{
          title: 'Commandes',
        }}
      />

      <Stack.Screen
        name="factures"
        options={{
          title: 'Factures',
        }}
      />

      <Stack.Screen
        name="statistiques"
        options={{
          title: 'Statistiques',
        }}
      />

    </Stack>
  );
}