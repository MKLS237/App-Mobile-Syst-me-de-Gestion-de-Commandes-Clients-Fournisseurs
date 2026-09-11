import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Commande } from '../../models/commande';
import {
  deleteCommande,
  getCommandeById,
} from '../../services/commandeService';

const BLUE = '#2563EB';
const DARK_BLUE = '#0F2747';
const LIGHT_BLUE = '#EFF6FF';
const BACKGROUND = '#F4F7FB';
const TEXT = '#172033';
const GRAY = '#64748B';
const BORDER = '#E2E8F0';
const WHITE = '#FFFFFF';

function formatMoney(value: number): string {
  return Math.round(value).toLocaleString('fr-FR');
}

function formatDate(date?: string | null): string {
  if (!date) return 'Non renseignée';

  const parts = date.split('-');

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'LIVREE':
      return 'Livrée';

    case 'LIVREE_PARTIELLEMENT':
      return 'Livrée partiellement';

    case 'NON_LIVREE':
      return 'Non livrée';

    default:
      return status;
  }
}

function getStatusDescription(status: string): string {
  switch (status) {
    case 'LIVREE':
      return 'Commande terminée';

    case 'LIVREE_PARTIELLEMENT':
      return 'Livraison en cours';

    case 'NON_LIVREE':
      return 'Commande en attente';

    default:
      return 'Statut de la commande';
  }
}

export default function CommandeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [commande, setCommande] = useState<Commande | null>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chargerCommande();
  }, [id]);

  async function chargerCommande() {
    try {
      setLoading(true);
      setError(null);

      if (!id || Number.isNaN(Number(id))) {
        setError('Identifiant de commande invalide.');
        return;
      }

      const data = await getCommandeById(Number(id));

      setCommande(data);
    } catch (error) {
      console.error(
        'Erreur chargement commande :',
        error
      );

      setError(
        'Impossible de charger la commande.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!commande) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      await deleteCommande(commande.id);

      setConfirmDelete(false);

      Alert.alert(
        'Commande supprimée',
        'La commande a été supprimée avec succès.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/commandes'),
          },
        ]
      );
    } catch (error) {
      console.error(
        'Erreur suppression commande :',
        error
      );

      setError(
        'Impossible de supprimer la commande.'
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={BLUE}
        />

        <Text style={styles.message}>
          Chargement de la commande...
        </Text>
      </View>
    );
  }

  if (error || !commande) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error ?? 'Commande introuvable'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={chargerCommande}
        >
          <Text style={styles.retryText}>
            Réessayer
          </Text>
        </Pressable>
      </View>
    );
  }

  const clientName = commande.client
    ? `${commande.client.nom} ${commande.client.prenom}`
    : 'Client inconnu';

  const initiale = commande.client?.nom
    ?.charAt(0)
    .toUpperCase() ?? '?';

  return (
    <View style={styles.screen}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Commande #{commande.id}
          </Text>

          <Text style={styles.headerSubtitle}>
            Détails de la commande
          </Text>
        </View>

        <View style={styles.headerLogo}>
          <Text style={styles.headerLogoText}>
            SKD
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOTAL */}

        <View style={styles.totalCard}>
          <View>
            <Text style={styles.totalLabel}>
              TOTAL COMMANDE
            </Text>

            <Text style={styles.totalDescription}>
              {commande.designation}
            </Text>
          </View>

          <View style={styles.totalRight}>
            <Text style={styles.totalAmount}>
              {formatMoney(commande.prixTotal)}
            </Text>

            <Text style={styles.totalCurrency}>
              FCFA
            </Text>
          </View>
        </View>

        {/* STATUT */}

        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIndicator,
              commande.statut === 'LIVREE'
                ? styles.statusDelivered
                : commande.statut ===
                    'LIVREE_PARTIELLEMENT'
                  ? styles.statusPartial
                  : styles.statusPending,
            ]}
          />

          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>
              {getStatusLabel(commande.statut)}
            </Text>

            <Text style={styles.statusDescription}>
              {getStatusDescription(commande.statut)}
            </Text>
          </View>
        </View>

        {/* CLIENT */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            CLIENT
          </Text>

          <View style={styles.clientRow}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientAvatarText}>
                {initiale}
              </Text>
            </View>

            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>
                {clientName}
              </Text>

              {commande.client?.telephone && (
                <Text style={styles.clientContact}>
                  {commande.client.telephone}
                </Text>
              )}

              {commande.client?.email && (
                <Text style={styles.clientContact}>
                  {commande.client.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* INFORMATIONS */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            INFORMATIONS
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Désignation
            </Text>

            <Text style={styles.infoValue}>
              {commande.designation}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Quantité
            </Text>

            <Text style={styles.infoValue}>
              {commande.quantite}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Prix unitaire
            </Text>

            <Text style={styles.infoValue}>
              {formatMoney(commande.prixUnitaire)} FCFA
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Total
            </Text>

            <Text style={styles.totalInfoValue}>
              {formatMoney(commande.prixTotal)} FCFA
            </Text>
          </View>
        </View>

        {/* DATES */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            DATES
          </Text>

          <View style={styles.dateRow}>
            <View style={styles.dateIcon}>
              <Text style={styles.dateIconText}>
                D
              </Text>
            </View>

            <View style={styles.dateContent}>
              <Text style={styles.dateLabel}>
                Date de commande
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(commande.dateCommande)}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.dateRow}>
            <View style={styles.dateIcon}>
              <Text style={styles.dateIconText}>
                L
              </Text>
            </View>

            <View style={styles.dateContent}>
              <Text style={styles.dateLabel}>
                Date de livraison
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(commande.dateLivraison)}
              </Text>
            </View>
          </View>
        </View>

        {/* ERREUR */}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>
              {error}
            </Text>
          </View>
        )}

        {/* MODIFIER */}

        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: '/commande/edit',
              params: {
                id: commande.id.toString(),
              },
            })
          }
        >
          <Text style={styles.editIcon}>
            ✎
          </Text>

          <Text style={styles.editButtonText}>
            MODIFIER LA COMMANDE
          </Text>
        </Pressable>

        {/* SUPPRIMER */}

        <Pressable
          style={styles.deleteButton}
          onPress={() => setConfirmDelete(true)}
          disabled={deleting}
        >
          <Text style={styles.deleteButtonText}>
            Supprimer la commande
          </Text>
        </Pressable>

        {/* CONFIRMATION */}

        {confirmDelete && (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>
              Supprimer cette commande ?
            </Text>

            <Text style={styles.confirmText}>
              Cette action est irréversible. La commande
              sera définitivement supprimée.
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                style={styles.cancelDeleteButton}
                onPress={() =>
                  setConfirmDelete(false)
                }
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  header: {
    backgroundColor: BLUE,
    paddingTop: 38,
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
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    color: WHITE,
    fontSize: 21,
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

  totalCard: {
    backgroundColor: DARK_BLUE,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  totalLabel: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  totalDescription: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 7,
    maxWidth: 170,
  },

  totalRight: {
    alignItems: 'flex-end',
  },

  totalAmount: {
    color: WHITE,
    fontSize: 25,
    fontWeight: '900',
  },

  totalCurrency: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '700',
  },

  statusCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  statusIndicator: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginRight: 12,
  },

  statusDelivered: {
    backgroundColor: '#16A34A',
  },

  statusPartial: {
    backgroundColor: '#F59E0B',
  },

  statusPending: {
    backgroundColor: '#64748B',
  },

  statusContent: {
    flex: 1,
  },

  statusLabel: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
  },

  statusDescription: {
    color: GRAY,
    fontSize: 12,
    marginTop: 3,
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },

  sectionTitle: {
    color: GRAY,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 14,
  },

  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  clientAvatar: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  clientAvatarText: {
    color: WHITE,
    fontSize: 21,
    fontWeight: '900',
  },

  clientInfo: {
    flex: 1,
    marginLeft: 13,
  },

  clientName: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '800',
  },

  clientContact: {
    color: GRAY,
    fontSize: 12,
    marginTop: 4,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },

  infoLabel: {
    color: GRAY,
    fontSize: 13,
  },

  infoValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },

  totalInfoValue: {
    color: BLUE,
    fontSize: 15,
    fontWeight: '900',
  },

  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LIGHT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateIconText: {
    color: BLUE,
    fontWeight: '900',
  },

  dateContent: {
    marginLeft: 12,
  },

  dateLabel: {
    color: GRAY,
    fontSize: 12,
  },

  dateValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },

  editButton: {
    minHeight: 57,
    borderRadius: 15,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  editIcon: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '900',
  },

  editButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '900',
  },

  deleteButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  deleteButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },

  confirmBox: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 18,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  confirmTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 7,
  },

  confirmText: {
    color: GRAY,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },

  confirmActions: {
    flexDirection: 'row',
    gap: 10,
  },

  cancelDeleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelDeleteText: {
    color: GRAY,
    fontWeight: '700',
  },

  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  confirmDeleteText: {
    color: WHITE,
    fontWeight: '800',
  },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  errorBoxText: {
    color: '#B91C1C',
    fontSize: 13,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  message: {
    color: GRAY,
    marginTop: 10,
  },

  error: {
    color: '#DC2626',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: BLUE,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },

  retryText: {
    color: WHITE,
    fontWeight: '700',
  },
});