import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { CreateClientRequest } from '../../models/clients';

import {
  getClientById,
  updateClient,
} from '../../services/clientService';


export default function EditClientScreen() {

  /*
   * Récupération de l'ID envoyé
   *
   * Exemple :
   *
   * /client/edit?id=15
   *
   * id = "15"
   */

  const { id } = useLocalSearchParams<{ id: string }>();

  const clientId = Number(id);


  /*
   * Champs du formulaire
   */

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');


  /*
   * Etats de l'écran
   */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);


  /*
   * Chargement du client
   */

  useEffect(() => {

    chargerClient();

  }, [id]);


  async function chargerClient() {

    try {

      setLoading(true);
      setError(null);


      /*
       * Sécurité :
       * vérifier que l'ID est bien numérique
       */

      if (!id || Number.isNaN(clientId)) {

        setError('Identifiant du client invalide.');

        return;
      }


      /*
       * Appel API :
       *
       * GET /api/clients/{id}
       */

      const client = await getClientById(clientId);


      /*
       * Pré-remplissage du formulaire
       */

      setNom(client.nom);
      setPrenom(client.prenom);
      setEmail(client.email);
      setTelephone(client.telephone);


    } catch (error) {

      console.error(
        'Erreur chargement client :',
        error
      );

      setError(
        'Impossible de charger le client.'
      );


    } finally {

      setLoading(false);

    }
  }


  /*
   * Enregistrement des modifications
   */

  async function handleSubmit() {

    setError(null);


    /*
     * Validation
     */

    if (
      !nom.trim() ||
      !prenom.trim() ||
      !email.trim() ||
      !telephone.trim()
    ) {

      setError(
        'Veuillez remplir tous les champs.'
      );

      return;
    }


    try {

      setSaving(true);


      /*
       * Préparation des données
       */

      const modifications: CreateClientRequest = {

        nom: nom.trim(),

        prenom: prenom.trim(),

        email: email.trim(),

        telephone: telephone.trim(),

      };


      console.log(
        'Modification du client :',
        clientId
      );


      /*
       * Appel API :
       *
       * PUT /api/clients/{id}
       */

      await updateClient(
        clientId,
        modifications
      );


      console.log(
        'Client modifié avec succès'
      );


      /*
       * Retour vers la page détail
       */

      router.replace(
        `/client/${clientId}`
      );


    } catch (error) {

      console.error(
        'Erreur modification client :',
        error
      );

      setError(
        'Impossible de modifier le client. Veuillez réessayer.'
      );


    } finally {

      setSaving(false);

    }
  }


  /*
   * Chargement
   */

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


  /*
   * Erreur
   */

  if (error && !nom && !prenom) {

    return (

      <View style={styles.center}>

        <Text style={styles.error}>
          {error}
        </Text>

      </View>
    );
  }


  /*
   * Interface
   */

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Modifier le client
      </Text>


      {/* NOM */}

      <Text style={styles.label}>
        Nom
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex : Dupont"
        value={nom}
        onChangeText={setNom}
      />


      {/* PRENOM */}

      <Text style={styles.label}>
        Prénom
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex : Jean"
        value={prenom}
        onChangeText={setPrenom}
      />


      {/* EMAIL */}

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


      {/* TELEPHONE */}

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


      {/* ERREUR */}

      {error && (

        <Text style={styles.error}>
          {error}
        </Text>

      )}


      {/* BOUTON */}

      <Pressable
        style={[
          styles.button,
          saving && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={saving}
      >

        {saving ? (

          <ActivityIndicator color="#fff" />

        ) : (

          <Text style={styles.buttonText}>
            Enregistrer les modifications
          </Text>

        )}

      </Pressable>


      {/* ANNULER */}

      <Pressable
        style={styles.cancelButton}
        onPress={() =>
          router.replace(`/client/${clientId}`)
        }
        disabled={saving}
      >

        <Text style={styles.cancelButtonText}>
          Annuler
        </Text>

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

    marginTop: 12,

    marginBottom: 6,

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


  cancelButton: {

    borderWidth: 1,

    borderColor: '#ccc',

    borderRadius: 10,

    paddingVertical: 14,

    alignItems: 'center',

    marginTop: 12,

    backgroundColor: '#fff',

  },


  cancelButtonText: {

    color: '#555',

    fontSize: 16,

    fontWeight: '600',

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

    marginTop: 15,

  },

});