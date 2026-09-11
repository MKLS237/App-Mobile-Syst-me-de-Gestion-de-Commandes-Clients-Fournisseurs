import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { Client } from '../../models/clients';
import { CreateCommandeRequest } from '../../models/commande';
import { createCommande } from '../../services/commandeService';
import { getClients } from '../../services/clientService';

const BLUE = '#2563EB';
const DARK_BLUE = '#1D4ED8';
const LIGHT_BLUE = '#EFF6FF';
const BACKGROUND = '#F4F7FB';
const TEXT = '#172033';
const GRAY = '#64748B';
const BORDER = '#E2E8F0';
const WHITE = '#FFFFFF';

type Statut = 'LIVREE' | 'NON_LIVREE' | 'LIVREE_PARTIELLEMENT';

const STATUTS: {
  value: Statut;
  label: string;
  description: string;
}[] = [
  {
    value: 'NON_LIVREE',
    label: 'Non livrée',
    description: 'Commande en attente',
  },
  {
    value: 'LIVREE_PARTIELLEMENT',
    label: 'Partielle',
    description: 'Livraison partielle',
  },
  {
    value: 'LIVREE',
    label: 'Livrée',
    description: 'Commande terminée',
  },
];

function getToday(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatMoney(value: number): string {
  return Math.round(value).toLocaleString('fr-FR');
}

function formatDate(dateString: string): string {
  if (!dateString) return '';

  const parts = dateString.split('-');

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function CreateCommandeScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);

  const [designation, setDesignation] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [prixUnitaire, setPrixUnitaire] = useState('');

  const [statut, setStatut] = useState<Statut>('NON_LIVREE');

  const [dateCommande, setDateCommande] = useState(getToday());
  const [dateLivraison, setDateLivraison] = useState('');

  const [rechercheClient, setRechercheClient] = useState('');
  const [clientModalVisible, setClientModalVisible] = useState(false);

  const [loadingClients, setLoadingClients] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => {
    const qte = Number(quantite.replace(',', '.')) || 0;
    const prix = Number(prixUnitaire.replace(/\s/g, '').replace(',', '.')) || 0;

    return qte * prix;
  }, [quantite, prixUnitaire]);

  useFocusEffect(
    useCallback(() => {
      chargerClients();
    }, [])
  );

  async function chargerClients() {
    try {
      setLoadingClients(true);

      const data = await getClients();

      setClients(data);
    } catch (error) {
      console.error('Erreur chargement clients :', error);

      Alert.alert(
        'Erreur',
        'Impossible de charger la liste des clients.'
      );
    } finally {
      setLoadingClients(false);
    }
  }

  const clientsFiltres = clients.filter((item) => {
    const texte = rechercheClient.toLowerCase().trim();

    if (!texte) return true;

    const nom = `${item.nom} ${item.prenom}`.toLowerCase();
    const telephone = item.telephone?.toLowerCase() || '';
    const email = item.email?.toLowerCase() || '';

    return (
      nom.includes(texte) ||
      telephone.includes(texte) ||
      email.includes(texte)
    );
  });

  function incrementerQuantite() {
    const actuelle = Number(quantite) || 0;
    setQuantite(String(actuelle + 1));
  }

  function decrementerQuantite() {
    const actuelle = Number(quantite) || 1;

    if (actuelle > 1) {
      setQuantite(String(actuelle - 1));
    }
  }

  function nettoyerPrix(value: string) {
    const chiffres = value.replace(/[^\d]/g, '');
    setPrixUnitaire(chiffres);
  }

  function nettoyerQuantite(value: string) {
    const chiffres = value.replace(/[^\d]/g, '');

    if (!chiffres) {
      setQuantite('');
      return;
    }

    setQuantite(chiffres);
  }

  function validerDate(date: string): boolean {
    if (!date) return false;

    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(date)) {
      return false;
    }

    const parsed = new Date(`${date}T00:00:00`);

    return !Number.isNaN(parsed.getTime());
  }

  async function handleSubmit() {
    setError(null);

    if (!client) {
      setError('Veuillez sélectionner un client.');
      return;
    }

    if (!designation.trim()) {
      setError('Veuillez renseigner la désignation de la commande.');
      return;
    }

    const qte = Number(quantite);
    const prix = Number(prixUnitaire);

    if (!qte || qte <= 0) {
      setError('La quantité doit être supérieure à zéro.');
      return;
    }

    if (!prix || prix <= 0) {
      setError('Le prix unitaire doit être supérieur à zéro.');
      return;
    }

    if (!validerDate(dateCommande)) {
      setError('La date de commande est invalide.');
      return;
    }

    if (dateLivraison && !validerDate(dateLivraison)) {
      setError(
        'La date de livraison doit respecter le format AAAA-MM-JJ.'
      );
      return;
    }

    try {
      setLoading(true);

      const nouvelleCommande: CreateCommandeRequest = {
        client: {
          id: client.id,
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          telephone: client.telephone,
          prixAchatTotal: client.prixAchatTotal,
        },
        designation: designation.trim(),
        quantite: qte,
        prixUnitaire: prix,
        prixTotal: total,
        statut,
        dateCommande,
        dateLivraison: dateLivraison || null,
      };

      console.log(
        'Création commande :',
        JSON.stringify(nouvelleCommande, null, 2)
      );

      await createCommande(nouvelleCommande);

      Alert.alert(
        'Commande créée',
        'La commande a été enregistrée avec succès.',
        [
          {
            text: 'Voir les commandes',
            onPress: () => router.replace('/commandes'),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur création commande :', error);

      setError(
        'Impossible de créer la commande. Vérifiez les informations puis réessayez.'
      );
    } finally {
      setLoading(false);
    }
  }

  function renderClient({ item }: { item: Client }) {
    const selected = client?.id === item.id;

    return (
      <Pressable
        style={[
          styles.clientItem,
          selected && styles.clientItemSelected,
        ]}
        onPress={() => {
          setClient(item);
          setClientModalVisible(false);
          setRechercheClient('');
        }}
      >
        <View style={styles.clientAvatar}>
          <Text style={styles.clientAvatarText}>
            {item.nom?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.clientItemContent}>
          <Text style={styles.clientItemName}>
            {item.nom} {item.prenom}
          </Text>

          <Text style={styles.clientItemPhone}>
            {item.telephone}
          </Text>
        </View>

        {selected && (
          <Text style={styles.check}>✓</Text>
        )}
      </Pressable>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Nouvelle commande
            </Text>

            <Text style={styles.headerSubtitle}>
              Créer une commande client
            </Text>
          </View>

          <View style={styles.headerLogo}>
            <Text style={styles.headerLogoText}>SKD</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* CLIENT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CLIENT</Text>

            <Pressable
              style={[
                styles.clientSelector,
                client && styles.clientSelectorActive,
              ]}
              onPress={() => setClientModalVisible(true)}
            >
              {client ? (
                <>
                  <View style={styles.selectedAvatar}>
                    <Text style={styles.selectedAvatarText}>
                      {client.nom.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.selectedClientInfo}>
                    <Text style={styles.selectedClientName}>
                      {client.nom} {client.prenom}
                    </Text>

                    <Text style={styles.selectedClientPhone}>
                      {client.telephone}
                    </Text>
                  </View>

                  <Text style={styles.selectorArrow}>›</Text>
                </>
              ) : (
                <>
                  <View style={styles.emptyClientIcon}>
                    <Text style={styles.emptyClientIconText}>+</Text>
                  </View>

                  <View style={styles.selectedClientInfo}>
                    <Text style={styles.chooseClientTitle}>
                      Sélectionner un client
                    </Text>

                    <Text style={styles.chooseClientSubtitle}>
                      Choisissez le client concerné
                    </Text>
                  </View>

                  <Text style={styles.selectorArrow}>›</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* DETAILS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              DÉTAILS DE LA COMMANDE
            </Text>

            <Text style={styles.label}>Désignation</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex : Ordinateur portable"
              placeholderTextColor="#94A3B8"
              value={designation}
              onChangeText={setDesignation}
              returnKeyType="next"
            />

            <View style={styles.row}>
              <View style={styles.quantityContainer}>
                <Text style={styles.label}>Quantité</Text>

                <View style={styles.quantityBox}>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={decrementerQuantite}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </Pressable>

                  <TextInput
                    style={styles.quantityInput}
                    value={quantite}
                    onChangeText={nettoyerQuantite}
                    keyboardType="number-pad"
                    textAlign="center"
                  />

                  <Pressable
                    style={styles.quantityButton}
                    onPress={incrementerQuantite}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.label}>Prix unitaire</Text>

                <View style={styles.priceInputWrapper}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    value={
                      prixUnitaire
                        ? formatMoney(Number(prixUnitaire))
                        : ''
                    }
                    onChangeText={nettoyerPrix}
                    keyboardType="number-pad"
                  />

                  <Text style={styles.currency}>FCFA</Text>
                </View>
              </View>
            </View>
          </View>

          {/* TOTAL */}
          <View style={styles.totalCard}>
            <View>
              <Text style={styles.totalLabel}>
                TOTAL COMMANDE
              </Text>

              <Text style={styles.totalDescription}>
                Quantité × prix unitaire
              </Text>
            </View>

            <View style={styles.totalRight}>
              <Text style={styles.totalAmount}>
                {formatMoney(total)}
              </Text>

              <Text style={styles.totalCurrency}>FCFA</Text>
            </View>
          </View>

          {/* STATUT */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>STATUT</Text>

            <View style={styles.statusContainer}>
              {STATUTS.map((item) => {
                const active = statut === item.value;

                return (
                  <Pressable
                    key={item.value}
                    style={[
                      styles.statusButton,
                      active && styles.statusButtonActive,
                    ]}
                    onPress={() => setStatut(item.value)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        active && styles.statusDotActive,
                      ]}
                    />

                    <View style={styles.statusTextContainer}>
                      <Text
                        style={[
                          styles.statusLabel,
                          active && styles.statusLabelActive,
                        ]}
                      >
                        {item.label}
                      </Text>

                      <Text
                        style={[
                          styles.statusDescription,
                          active &&
                            styles.statusDescriptionActive,
                        ]}
                      >
                        {item.description}
                      </Text>
                    </View>

                    {active && (
                      <Text style={styles.statusCheck}>✓</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* DATES */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              DATES
            </Text>

            <Text style={styles.label}>
              Date de commande
            </Text>

            <View style={styles.dateInputWrapper}>
              <Text style={styles.calendarIcon}>□</Text>

              <TextInput
                style={styles.dateInput}
                value={dateCommande}
                onChangeText={setDateCommande}
                placeholder="AAAA-MM-JJ"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.helper}>
              Format : AAAA-MM-JJ
            </Text>

            <Text style={styles.label}>
              Date de livraison
            </Text>

            <View style={styles.dateInputWrapper}>
              <Text style={styles.calendarIcon}>□</Text>

              <TextInput
                style={styles.dateInput}
                value={dateLivraison}
                onChangeText={setDateLivraison}
                placeholder="Facultative"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.helper}>
              Laissez vide si aucune date n'est prévue.
            </Text>
          </View>

          {/* ERROR */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>!</Text>

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {/* SUBMIT */}
          <Pressable
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" />

                <Text style={styles.submitText}>
                  Création en cours...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.submitCheck}>✓</Text>

                <Text style={styles.submitText}>
                  CRÉER LA COMMANDE
                </Text>
              </>
            )}
          </Pressable>

          <Text style={styles.footerText}>
            Les informations seront enregistrées dans votre système
            de gestion.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL CLIENT */}
      <Modal
        visible={clientModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setClientModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Sélectionner un client
                </Text>

                <Text style={styles.modalSubtitle}>
                  {clients.length} client(s) disponible(s)
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setClientModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.clientSearch}
              placeholder="Rechercher un client..."
              placeholderTextColor="#94A3B8"
              value={rechercheClient}
              onChangeText={setRechercheClient}
              autoFocus
            />

            {loadingClients ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={BLUE} />

                <Text style={styles.modalLoadingText}>
                  Chargement des clients...
                </Text>
              </View>
            ) : (
              <FlatList
                data={clientsFiltres}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderClient}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.clientsList}
                ListEmptyComponent={
                  <View style={styles.emptyList}>
                    <Text style={styles.emptyListTitle}>
                      Aucun client trouvé
                    </Text>

                    <Text style={styles.emptyListText}>
                      Essayez avec un autre nom ou numéro.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  header: {
    backgroundColor: BLUE,
    paddingTop: Platform.OS === 'ios' ? 55 : 38,
    paddingBottom: 22,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    color: WHITE,
    fontSize: 35,
    lineHeight: 35,
    fontWeight: '300',
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#DBEAFE',
    fontSize: 13,
    marginTop: 3,
  },

  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerLogoText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: '900',
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    color: GRAY,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },

  clientSelector: {
    backgroundColor: WHITE,
    minHeight: 82,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },

  clientSelectorActive: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FAFCFF',
  },

  selectedAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedAvatarText: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '800',
  },

  emptyClientIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: LIGHT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyClientIconText: {
    color: BLUE,
    fontSize: 26,
    fontWeight: '300',
  },

  selectedClientInfo: {
    flex: 1,
    marginLeft: 13,
  },

  selectedClientName: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
  },

  selectedClientPhone: {
    color: GRAY,
    fontSize: 13,
    marginTop: 4,
  },

  chooseClientTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },

  chooseClientSubtitle: {
    color: GRAY,
    fontSize: 13,
    marginTop: 4,
  },

  selectorArrow: {
    color: BLUE,
    fontSize: 30,
    fontWeight: '300',
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDF1F6',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  label: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 5,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: TEXT,
    fontSize: 15,
    backgroundColor: '#FCFDFE',
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  quantityContainer: {
    flex: 0.9,
  },

  priceContainer: {
    flex: 1.4,
  },

  quantityBox: {
    height: 50,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFDFE',
    overflow: 'hidden',
  },

  quantityButton: {
    width: 38,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LIGHT_BLUE,
  },

  quantityButtonText: {
    color: BLUE,
    fontSize: 23,
    fontWeight: '600',
  },

  quantityInput: {
    flex: 1,
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
    padding: 0,
  },

  priceInputWrapper: {
    height: 50,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#FCFDFE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },

  priceInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 13,
    color: TEXT,
    fontSize: 15,
    fontWeight: '600',
  },

  currency: {
    color: GRAY,
    fontSize: 11,
    fontWeight: '800',
  },

  totalCard: {
    backgroundColor: '#0F2747',
    borderRadius: 18,
    padding: 19,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  totalDescription: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
  },

  totalRight: {
    alignItems: 'flex-end',
  },

  totalAmount: {
    color: WHITE,
    fontSize: 24,
    fontWeight: '900',
  },

  totalCurrency: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '700',
  },

  statusContainer: {
    gap: 8,
  },

  statusButton: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFDFE',
  },

  statusButtonActive: {
    borderColor: BLUE,
    backgroundColor: LIGHT_BLUE,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
    marginRight: 11,
  },

  statusDotActive: {
    backgroundColor: BLUE,
  },

  statusTextContainer: {
    flex: 1,
  },

  statusLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },

  statusLabelActive: {
    color: BLUE,
  },

  statusDescription: {
    color: GRAY,
    fontSize: 11,
    marginTop: 3,
  },

  statusDescriptionActive: {
    color: '#3B82F6',
  },

  statusCheck: {
    color: BLUE,
    fontSize: 18,
    fontWeight: '800',
  },

  dateInputWrapper: {
    height: 50,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#FCFDFE',
    flexDirection: 'row',
    alignItems: 'center',
  },

  calendarIcon: {
    color: BLUE,
    fontSize: 18,
    marginLeft: 14,
    marginRight: 8,
  },

  dateInput: {
    flex: 1,
    height: '100%',
    color: TEXT,
    fontSize: 15,
    paddingHorizontal: 5,
  },

  helper: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
    marginBottom: 8,
  },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 13,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  errorIcon: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    color: WHITE,
    textAlign: 'center',
    lineHeight: 23,
    fontWeight: '900',
    marginRight: 9,
  },

  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 19,
  },

  submitButton: {
    minHeight: 58,
    borderRadius: 15,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    shadowColor: BLUE,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitCheck: {
    color: WHITE,
    fontSize: 19,
    fontWeight: '900',
  },

  submitText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
    paddingHorizontal: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '88%',
    paddingTop: 20,
  },

  modalHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  modalTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '800',
  },

  modalSubtitle: {
    color: GRAY,
    fontSize: 12,
    marginTop: 4,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    color: GRAY,
    fontSize: 27,
    fontWeight: '300',
    marginTop: -3,
  },

  clientSearch: {
    marginHorizontal: 20,
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: TEXT,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },

  clientsList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  clientItem: {
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },

  clientItemSelected: {
    backgroundColor: LIGHT_BLUE,
    borderRadius: 12,
    paddingHorizontal: 8,
    marginVertical: 3,
  },

  clientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  clientAvatarText: {
    color: BLUE,
    fontSize: 16,
    fontWeight: '800',
  },

  clientItemContent: {
    flex: 1,
    marginLeft: 12,
  },

  clientItemName: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },

  clientItemPhone: {
    color: GRAY,
    fontSize: 12,
    marginTop: 3,
  },

  check: {
    color: BLUE,
    fontSize: 20,
    fontWeight: '900',
  },

  modalLoading: {
    paddingVertical: 50,
    alignItems: 'center',
  },

  modalLoadingText: {
    color: GRAY,
    marginTop: 12,
    fontSize: 14,
  },

  emptyList: {
    alignItems: 'center',
    paddingVertical: 45,
  },

  emptyListTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },

  emptyListText: {
    color: GRAY,
    fontSize: 13,
    marginTop: 6,
  },
});