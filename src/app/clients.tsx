import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Client } from '../models/clients';
import { getClients } from '../services/clientService';

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useFocusEffect(
  useCallback(() => {
    chargerClients();
  }, [])
);

  async function chargerClients() {
    try {
      setLoading(true);
      setError(null);

      const data = await getClients();

      setClients(data);
    } catch (error) {
      console.error('Erreur chargement clients :', error);

      setError('Impossible de charger les clients.');
    } finally {
      setLoading(false);
    }
  }

  const clientsFiltres = clients.filter((client) => {
    const texte = recherche.toLowerCase();

    return (
      client.nom.toLowerCase().includes(texte) ||
      client.prenom.toLowerCase().includes(texte) ||
      client.email.toLowerCase().includes(texte) ||
      client.telephone.includes(texte)
    );
  });

  function afficherClient({ item }: { item: Client }) {
    return (
     <Pressable
  style={styles.card}
  onPress={() =>
    router.push({
      pathname: '/client/[id]',
      params: {
        id: item.id.toString(),
      },
    })
  }
>
  <Text style={styles.nom}>
    {item.nom} {item.prenom}
  </Text>

  <Text style={styles.info}>
    ✉ {item.email}
  </Text>

  <Text style={styles.info}>
    ☎ {item.telephone}
  </Text>

  <Text style={styles.achat}>
    Achats : {item.prixAchatTotal.toLocaleString()} FCFA
  </Text>
</Pressable>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.message}>
          Chargement des clients...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

<View style={styles.header}>
  <View>
    <Text style={styles.title}>
      Clients
    </Text>

    <Text style={styles.count}>
      {clients.length} client(s)
    </Text>
  </View>

  <Pressable
    style={styles.addButton}
    onPress={() => router.push('/client/create')}
  >
    <Text style={styles.addButtonText}>
      +
    </Text>
  </Pressable>
</View>

      <Text style={styles.count}>
        {clients.length} client(s)
      </Text>

      <TextInput
        style={styles.search}
        placeholder="Rechercher un client..."
        value={recherche}
        onChangeText={setRecherche}
      />

      <FlatList
        data={clientsFiltres}
        keyExtractor={(item) => item.id.toString()}
        renderItem={afficherClient}
        contentContainerStyle={styles.list}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  count: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
  },

  search: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },

  list: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  nom: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },

  achat: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    marginTop: 10,
    fontSize: 16,
  },

  error: {
    color: 'red',
    fontSize: 16,
  },
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},

addButton: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#2563eb',
  justifyContent: 'center',
  alignItems: 'center',
},

addButtonText: {
  color: '#fff',
  fontSize: 30,
  fontWeight: 'bold',
},
});