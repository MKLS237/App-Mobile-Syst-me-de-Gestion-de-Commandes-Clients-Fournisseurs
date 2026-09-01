import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { CreateClientRequest } from '../../models/clients';
import { createClient } from '../../services/clientService';    
export default function CreateClientScreen() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    async function handleSubmit() {
    setError(null);

    if (!nom.trim() || !prenom.trim() || !email.trim() || !telephone.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);

      const nouveauClient: CreateClientRequest = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
      };

      await createClient(nouveauClient);

      Alert.alert(
        'Succès',
        'Le client a été créé avec succès.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
      router.replace('/clients');

    } catch (error) {
      console.error('Erreur création client :', error);

      setError(
        'Impossible de créer le client. Veuillez réessayer.'
      );

    } finally {
      setLoading(false);
    }
  }
   return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Ajouter un client
      </Text>

      <Text style={styles.label}>
        Nom
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex : Dupont"
        value={nom}
        onChangeText={setNom}
      />

      <Text style={styles.label}>
        Prénom
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex : Jean"
        value={prenom}
        onChangeText={setPrenom}
      />

      <Text style={styles.label}>
        Email
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex : jean@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        Téléphone
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex : 077000000"
        value={telephone}
        onChangeText={setTelephone}
        keyboardType="phone-pad"
      />

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <Pressable
        style={[
          styles.button,
          loading && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Enregistrer
          </Text>
        )}
      </Pressable>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 25,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  error: {
    color: 'red',
    marginTop: 15,
  },
});
