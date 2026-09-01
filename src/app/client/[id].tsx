import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Client } from '../../models/clients';
import { getClientById , deleteClient,} from '../../services/clientService';

export default function ClientDetailScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chargerClient();
  }, [id]);

  async function chargerClient() {
    try {
      setLoading(true);
      setError(null);

      const data = await getClientById(Number(id));

      setClient(data);

    } catch (error) {
      console.error('Erreur chargement client :', error);

      setError('Impossible de charger le client.');

    } finally {
      setLoading(false);
    }
  }
  async function handleDelete() {
  if (!client) {
    return;
  }

  try {
    setDeleting(true);
    setError(null);

    await deleteClient(client.id);

    console.log('Client supprimé avec succès');

    router.replace('/clients');

  } catch (error) {
    console.error(
      'Erreur suppression client :',
      error
    );

    setError(
      'Impossible de supprimer le client. Veuillez réessayer.'
    );

  } finally {
    setDeleting(false);
  }
}

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.message}>
          Chargement du client...
        </Text>
      </View>
    );
  }

  if (error || !client) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error ?? 'Client introuvable'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {client.nom.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text style={styles.name}>
        {client.nom} {client.prenom}
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>
          Email
        </Text>

        <Text style={styles.value}>
          {client.email}
        </Text>

        <Text style={styles.label}>
          Téléphone
        </Text>

        <Text style={styles.value}>
          {client.telephone}
        </Text>

        <Text style={styles.label}>
          Prix d'achat total
        </Text>

        <Text style={styles.value}>
          {client.prixAchatTotal.toLocaleString()} FCFA
        </Text>

      </View>

      {/* Bouton Modifier */}

      <Pressable
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: '/client/edit',
            params: {
              id: id.toString(),
            },
          })
        }
      >
        <Text style={styles.editButtonText}>
          Modifier
        </Text>
      </Pressable>
      <Pressable
  style={styles.deleteButton}
  onPress={() => setConfirmDelete(true)}
  disabled={deleting}
>
  <Text style={styles.deleteButtonText}>
    Supprimer
  </Text>
</Pressable>

{confirmDelete && (
  <View style={styles.confirmBox}>

    <Text style={styles.confirmTitle}>
      Supprimer ce client ?
    </Text>

    <Text style={styles.confirmText}>
      Cette action est irréversible.
    </Text>

    <View style={styles.confirmActions}>

      <Pressable
        style={styles.cancelDeleteButton}
        onPress={() => setConfirmDelete(false)}
        disabled={deleting}
      >
        <Text style={styles.cancelDeleteText}>
          Annuler
        </Text>
      </Pressable>

      <Pressable
        style={styles.confirmDeleteButton}
        onPress={handleDelete}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmDeleteText}>
            Confirmer
          </Text>
        )}
      </Pressable>

    </View>

  </View>
)}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },

  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },

  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },

  label: {
    fontSize: 13,
    color: '#777',
    marginTop: 10,
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
  },

  editButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },

  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    marginTop: 10,
  },

  error: {
    color: 'red',
  },
  deleteButton: {
  width: '100%',
  backgroundColor: '#dc2626',
  borderRadius: 10,
  paddingVertical: 15,
  alignItems: 'center',
  marginTop: 12,
},

deleteButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

confirmBox: {
  width: '100%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  marginTop: 15,
  borderWidth: 1,
  borderColor: '#ddd',
},

confirmTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 8,
},

confirmText: {
  fontSize: 14,
  color: '#666',
  marginBottom: 20,
},

confirmActions: {
  flexDirection: 'row',
  gap: 10,
},

cancelDeleteButton: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingVertical: 12,
  alignItems: 'center',
},

cancelDeleteText: {
  color: '#555',
  fontWeight: '600',
},

confirmDeleteButton: {
  flex: 1,
  backgroundColor: '#dc2626',
  borderRadius: 8,
  paddingVertical: 12,
  alignItems: 'center',
},

confirmDeleteText: {
  color: '#fff',
  fontWeight: 'bold',
},

});