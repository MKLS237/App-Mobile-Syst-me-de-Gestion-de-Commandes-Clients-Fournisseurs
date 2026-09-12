import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Edit3,
  FileText,
  Trash2,
  User,
  WalletCards,
  XCircle,
} from 'lucide-react-native';

import {
  deleteFacture,
  getFactureById,
  updateStatutFacture,
} from '../../services/factureService';

import {
  Facture,
  StatutFacture,
} from '../../models/facture';

export default function FactureDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [facture, setFacture] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // =========================================================
  // CHARGEMENT FACTURE
  // =========================================================

  const loadFacture = async () => {
    try {
      if (!id) {
        Alert.alert(
          'Erreur',
          'Identifiant de facture introuvable.'
        );
        return;
      }

      const data = await getFactureById(Number(id));

      setFacture(data);
    } catch (error) {
      console.error(
        'Erreur chargement facture:',
        error
      );

      Alert.alert(
        'Erreur',
        'Impossible de charger les informations de la facture.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFacture();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFacture();
  };

  // =========================================================
  // CLIENT
  // =========================================================

  const getClientName = () => {
    if (!facture?.client) {
      return 'Client non renseigné';
    }

    const client = facture.client as any;

    if (client.prenom || client.nom) {
      return `${client.prenom ?? ''} ${client.nom ?? ''}`.trim();
    }

    if (client.raisonSociale) {
      return client.raisonSociale;
    }

    return 'Client non renseigné';
  };

  const getClientTelephone = () => {
    if (!facture?.client) {
      return null;
    }

    const client = facture.client as any;

    return client.telephone || client.phone || null;
  };

  // =========================================================
  // COMMANDE
  // =========================================================

  const getCommandeId = () => {
    if (!facture?.commande) {
      return null;
    }

    return facture.commande.id;
  };

  // =========================================================
  // FORMATAGE
  // =========================================================

  const formatDate = (date: string) => {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `${Number(amount || 0).toLocaleString(
      'fr-FR'
    )} FCFA`;
  };

  // =========================================================
  // STATUT
  // =========================================================

  const getStatusLabel = (status: StatutFacture) => {
    switch (status) {
      case 'PAYEE':
        return 'Payée';

      case 'PARTIELLEMENT_PAYEE':
        return 'Partiellement payée';

      case 'NON_PAYEE':
      default:
        return 'Non payée';
    }
  };

  const getStatusDescription = (
    status: StatutFacture
  ) => {
    switch (status) {
      case 'PAYEE':
        return 'Cette facture a été entièrement réglée.';

      case 'PARTIELLEMENT_PAYEE':
        return 'Une partie du montant a été réglée.';

      case 'NON_PAYEE':
      default:
        return 'Aucun paiement complet n’a encore été enregistré.';
    }
  };

  const getStatusIcon = (
    status: StatutFacture
  ) => {
    switch (status) {
      case 'PAYEE':
        return CheckCircle2;

      case 'PARTIELLEMENT_PAYEE':
        return CircleDollarSign;

      case 'NON_PAYEE':
      default:
        return XCircle;
    }
  };

  const getStatusColors = (
    status: StatutFacture
  ) => {
    switch (status) {
      case 'PAYEE':
        return {
          background: '#DCFCE7',
          text: '#166534',
          border: '#BBF7D0',
        };

      case 'PARTIELLEMENT_PAYEE':
        return {
          background: '#FEF3C7',
          text: '#92400E',
          border: '#FDE68A',
        };

      case 'NON_PAYEE':
      default:
        return {
          background: '#FEE2E2',
          text: '#991B1B',
          border: '#FECACA',
        };
    }
  };

  // =========================================================
  // MODIFIER STATUT
  // =========================================================

  const handleChangeStatus = () => {
    if (!facture || updatingStatus) {
      return;
    }

    setStatusModalVisible(true);
  };

  const changeStatus = async (
    status: StatutFacture
  ) => {
    if (!facture || updatingStatus) {
      return;
    }

    if (facture.statut === status) {
      setStatusModalVisible(false);
      return;
    }

    try {
      setUpdatingStatus(true);

      console.log(
        'Modification statut facture:',
        facture.id,
        status
      );

      const updatedFacture =
        await updateStatutFacture(
          facture.id,
          status
        );

      console.log(
        'Facture mise à jour:',
        updatedFacture
      );

      setFacture(updatedFacture);

      setStatusModalVisible(false);

      Alert.alert(
        'Statut mis à jour',
        `La facture est maintenant "${getStatusLabel(
          status
        )}".`
      );
    } catch (error) {
      console.error(
        'Erreur modification statut:',
        error
      );

      Alert.alert(
        'Erreur',
        'Impossible de modifier le statut de la facture.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================================================
  // MODIFIER FACTURE
  // =========================================================

  const handleEdit = () => {
    if (!facture) {
      return;
    }

    router.push({
      pathname: '/facture/edit',
      params: {
        id: facture.id.toString(),
      },
    });
  };

  // =========================================================
  // SUPPRESSION
  // =========================================================

  const handleDelete = () => {
    if (!facture || deleting) {
      return;
    }

    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!facture || deleting) {
      return;
    }

    try {
      setDeleting(true);

      console.log(
        'Suppression facture:',
        facture.id
      );

      await deleteFacture(facture.id);

      console.log(
        'Facture supprimée avec succès'
      );

      setDeleteModalVisible(false);

      Alert.alert(
        'Facture supprimée',
        'La facture a été supprimée avec succès.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/factures');
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        'Erreur suppression facture:',
        error
      );

      setDeleteModalVisible(false);

      Alert.alert(
        'Erreur',
        'Impossible de supprimer la facture.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // CHARGEMENT
  // =========================================================

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Chargement de la facture...
        </Text>
      </View>
    );
  }

  // =========================================================
  // FACTURE INTROUVABLE
  // =========================================================

  if (!facture) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIcon}>
          <FileText
            size={30}
            color="#64748B"
          />
        </View>

        <Text style={styles.errorTitle}>
          Facture introuvable
        </Text>

        <Text style={styles.errorText}>
          Cette facture n'existe pas ou n'est plus
          disponible.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.replace('/factures')
          }
        >
          <ArrowLeft
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.backButtonText}>
            Retour aux factures
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColors = getStatusColors(
    facture.statut
  );

  const StatusIcon = getStatusIcon(
    facture.statut
  );

  const clientTelephone =
    getClientTelephone();

  const commandeId = getCommandeId();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <ArrowLeft
              size={21}
              color="#0F172A"
            />
          </TouchableOpacity>

          <View
            style={styles.headerTitleContainer}
          >
            <Text style={styles.headerEyebrow}>
              FACTURATION
            </Text>

            <Text style={styles.headerTitle}>
              Détail de la facture
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <FileText
              size={21}
              color="#2563EB"
            />
          </View>
        </View>

        {/* =================================================
            HERO FACTURE
        ================================================= */}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>
                FACTURE
              </Text>

              <Text style={styles.invoiceNumber}>
                #
                {String(facture.id).padStart(
                  5,
                  '0'
                )}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    statusColors.background,
                  borderColor:
                    statusColors.border,
                },
              ]}
            >
              <StatusIcon
                size={15}
                color={statusColors.text}
              />

              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color:
                      statusColors.text,
                  },
                ]}
              >
                {getStatusLabel(
                  facture.statut
                )}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>
              Montant total
            </Text>

            <Text style={styles.amountValue}>
              {formatAmount(
                facture.montantTotal
              )}
            </Text>
          </View>

          <View style={styles.heroFooter}>
            <CalendarDays
              size={16}
              color="#64748B"
            />

            <Text style={styles.heroDate}>
              Émise le{' '}
              {formatDate(
                facture.dateFacture
              )}
            </Text>
          </View>
        </View>

        {/* =================================================
            STATUT
        ================================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={styles.sectionTitleRow}
            >
              <View style={styles.sectionIcon}>
                <WalletCards
                  size={18}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.sectionTitle}>
                Statut du paiement
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.statusCard}
            onPress={handleChangeStatus}
            disabled={updatingStatus}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.largeStatusIcon,
                {
                  backgroundColor:
                    statusColors.background,
                },
              ]}
            >
              <StatusIcon
                size={23}
                color={statusColors.text}
              />
            </View>

            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                {getStatusLabel(
                  facture.statut
                )}
              </Text>

              <Text
                style={
                  styles.statusDescription
                }
              >
                {getStatusDescription(
                  facture.statut
                )}
              </Text>
            </View>

            {updatingStatus ? (
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />
            ) : (
              <ChevronRight
                size={20}
                color="#94A3B8"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* =================================================
            CLIENT
        ================================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={styles.sectionTitleRow}
            >
              <View style={styles.sectionIcon}>
                <User
                  size={18}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.sectionTitle}>
                Client
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.avatar}>
              <User
                size={22}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoMain}>
                {getClientName()}
              </Text>

              {clientTelephone ? (
                <Text
                  style={styles.infoSecondary}
                >
                  {clientTelephone}
                </Text>
              ) : (
                <Text
                  style={styles.infoSecondary}
                >
                  Coordonnées non renseignées
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* =================================================
            COMMANDE
        ================================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={styles.sectionTitleRow}
            >
              <View style={styles.sectionIcon}>
                <ClipboardList
                  size={18}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.sectionTitle}>
                Commande associée
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.orderIcon}>
              <ClipboardList
                size={21}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoMain}>
                {commandeId
                  ? `Commande #${String(
                      commandeId
                    ).padStart(5, '0')}`
                  : 'Commande non renseignée'}
              </Text>

              <Text
                style={styles.infoSecondary}
              >
                Commande à l'origine de cette
                facture
              </Text>
            </View>
          </View>
        </View>

        {/* =================================================
            INFORMATIONS
        ================================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={styles.sectionTitleRow}
            >
              <View style={styles.sectionIcon}>
                <FileText
                  size={18}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.sectionTitle}>
                Informations
              </Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Numéro
              </Text>

              <Text style={styles.detailValue}>
                #
                {String(facture.id).padStart(
                  5,
                  '0'
                )}
              </Text>
            </View>

            <View
              style={styles.detailSeparator}
            />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Date
              </Text>

              <Text style={styles.detailValue}>
                {formatDate(
                  facture.dateFacture
                )}
              </Text>
            </View>

            <View
              style={styles.detailSeparator}
            />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Montant
              </Text>

              <Text style={styles.detailValue}>
                {formatAmount(
                  facture.montantTotal
                )}
              </Text>
            </View>

            <View
              style={styles.detailSeparator}
            />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Statut
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      statusColors.text,
                  },
                ]}
              >
                {getStatusLabel(
                  facture.statut
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>
            Actions
          </Text>

          {/* MODIFIER STATUT */}

          <TouchableOpacity
            style={styles.primaryAction}
            onPress={handleChangeStatus}
            disabled={updatingStatus}
            activeOpacity={0.85}
          >
            <View
              style={styles.primaryActionIcon}
            >
              <WalletCards
                size={20}
                color="#FFFFFF"
              />
            </View>

            <View
              style={styles.actionTextContainer}
            >
              <Text
                style={
                  styles.primaryActionTitle
                }
              >
                Modifier le statut
              </Text>

              <Text
                style={
                  styles.primaryActionSubtitle
                }
              >
                Mettre à jour l'état du paiement
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#BFDBFE"
            />
          </TouchableOpacity>

          {/* MODIFIER */}

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={handleEdit}
            activeOpacity={0.8}
          >
            <View
              style={
                styles.secondaryActionIcon
              }
            >
              <Edit3
                size={19}
                color="#2563EB"
              />
            </View>

            <View
              style={styles.actionTextContainer}
            >
              <Text
                style={
                  styles.secondaryActionTitle
                }
              >
                Modifier la facture
              </Text>

              <Text
                style={
                  styles.secondaryActionSubtitle
                }
              >
                Modifier les informations de la
                facture
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>

          {/* SUPPRIMER */}

          <TouchableOpacity
            style={styles.deleteAction}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.8}
          >
            <View
              style={styles.deleteActionIcon}
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color="#DC2626"
                />
              ) : (
                <Trash2
                  size={19}
                  color="#DC2626"
                />
              )}
            </View>

            <View
              style={styles.actionTextContainer}
            >
              <Text
                style={styles.deleteActionTitle}
              >
                Supprimer la facture
              </Text>

              <Text
                style={
                  styles.deleteActionSubtitle
                }
              >
                Cette action est irréversible
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#FCA5A5"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* =====================================================
          MODAL MODIFICATION STATUT
      ===================================================== */}

      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setStatusModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* HEADER MODAL */}

            <View style={styles.modalHeader}>
              <View>
                <Text
                  style={styles.modalEyebrow}
                >
                  FACTURATION
                </Text>

                <Text
                  style={styles.modalTitle}
                >
                  Modifier le statut
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalClose}
                onPress={() =>
                  setStatusModalVisible(false)
                }
              >
                <Text
                  style={styles.modalCloseText}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={styles.modalDescription}
            >
              Sélectionnez le nouvel état de
              paiement de cette facture.
            </Text>

            {/* NON PAYEE */}

            <TouchableOpacity
              style={[
                styles.statusOption,
                facture.statut ===
                  'NON_PAYEE' &&
                  styles.statusOptionActive,
              ]}
              onPress={() =>
                changeStatus('NON_PAYEE')
              }
              disabled={updatingStatus}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor:
                      '#FEE2E2',
                  },
                ]}
              >
                <XCircle
                  size={21}
                  color="#DC2626"
                />
              </View>

              <View
                style={styles.optionContent}
              >
                <Text
                  style={styles.optionTitle}
                >
                  Non payée
                </Text>

                <Text
                  style={
                    styles.optionDescription
                  }
                >
                  Aucun paiement complet
                  enregistré
                </Text>
              </View>

              {facture.statut ===
                'NON_PAYEE' && (
                <CheckCircle2
                  size={21}
                  color="#2563EB"
                />
              )}
            </TouchableOpacity>

            {/* PARTIELLEMENT PAYEE */}

            <TouchableOpacity
              style={[
                styles.statusOption,
                facture.statut ===
                  'PARTIELLEMENT_PAYEE' &&
                  styles.statusOptionActive,
              ]}
              onPress={() =>
                changeStatus(
                  'PARTIELLEMENT_PAYEE'
                )
              }
              disabled={updatingStatus}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor:
                      '#FEF3C7',
                  },
                ]}
              >
                <CircleDollarSign
                  size={21}
                  color="#D97706"
                />
              </View>

              <View
                style={styles.optionContent}
              >
                <Text
                  style={styles.optionTitle}
                >
                  Partiellement payée
                </Text>

                <Text
                  style={
                    styles.optionDescription
                  }
                >
                  Une partie du montant a été
                  réglée
                </Text>
              </View>

              {facture.statut ===
                'PARTIELLEMENT_PAYEE' && (
                <CheckCircle2
                  size={21}
                  color="#2563EB"
                />
              )}
            </TouchableOpacity>

            {/* PAYEE */}

            <TouchableOpacity
              style={[
                styles.statusOption,
                facture.statut ===
                  'PAYEE' &&
                  styles.statusOptionActive,
              ]}
              onPress={() =>
                changeStatus('PAYEE')
              }
              disabled={updatingStatus}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor:
                      '#DCFCE7',
                  },
                ]}
              >
                <CheckCircle2
                  size={21}
                  color="#16A34A"
                />
              </View>

              <View
                style={styles.optionContent}
              >
                <Text
                  style={styles.optionTitle}
                >
                  Payée
                </Text>

                <Text
                  style={
                    styles.optionDescription
                  }
                >
                  Facture entièrement réglée
                </Text>
              </View>

              {facture.statut ===
                'PAYEE' && (
                <CheckCircle2
                  size={21}
                  color="#2563EB"
                />
              )}
            </TouchableOpacity>

            {/* LOADING */}

            {updatingStatus && (
              <View style={styles.modalLoading}>
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.modalLoadingText
                  }
                >
                  Mise à jour en cours...
                </Text>
              </View>
            )}

            {/* ANNULER */}

            <TouchableOpacity
              style={
                styles.modalCancelButton
              }
              onPress={() =>
                setStatusModalVisible(false)
              }
              disabled={updatingStatus}
            >
              <Text
                style={styles.modalCancelText}
              >
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          MODAL SUPPRESSION
      ===================================================== */}

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDeleteModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.deleteModalContainer}
          >
            <View
              style={styles.deleteModalIcon}
            >
              <Trash2
                size={25}
                color="#DC2626"
              />
            </View>

            <Text
              style={styles.deleteModalTitle}
            >
              Supprimer la facture ?
            </Text>

            <Text
              style={
                styles.deleteModalDescription
              }
            >
              Vous êtes sur le point de
              supprimer la facture{' '}
              <Text
                style={styles.deleteModalBold}
              >
                #
                {String(facture.id).padStart(
                  5,
                  '0'
                )}
              </Text>
              .
              {'\n\n'}
              Cette action est irréversible.
            </Text>

            <View
              style={styles.deleteModalActions}
            >
              <TouchableOpacity
                style={
                  styles.deleteCancelButton
                }
                onPress={() =>
                  setDeleteModalVisible(false)
                }
                disabled={deleting}
              >
                <Text
                  style={styles.deleteCancelText}
                >
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.deleteConfirmButton
                }
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Trash2
                    size={17}
                    color="#FFFFFF"
                  />
                )}

                <Text
                  style={
                    styles.deleteConfirmText
                  }
                >
                  {deleting
                    ? 'Suppression...'
                    : 'Supprimer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 13,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 13,
  },

  headerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1.2,
    marginBottom: 2,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCard: {
    margin: 18,
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
    marginBottom: 4,
  },

  invoiceNumber: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0F172A',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  heroDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },

  amountSection: {
    alignItems: 'center',
  },

  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 5,
  },

  amountValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#2563EB',
  },

  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
  },

  heroDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  section: {
    marginHorizontal: 18,
    marginBottom: 20,
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  largeStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },

  statusDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoMain: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  infoSecondary: {
    fontSize: 12,
    color: '#64748B',
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  detailRow: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  detailValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '800',
    maxWidth: '62%',
    textAlign: 'right',
  },

  detailSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  actionsSection: {
    marginHorizontal: 18,
    marginTop: 2,
  },

  actionsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },

  primaryAction: {
    minHeight: 72,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  primaryActionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  primaryActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },

  primaryActionSubtitle: {
    fontSize: 11,
    color: '#DBEAFE',
  },

  secondaryAction: {
    minHeight: 72,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  secondaryActionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },

  secondaryActionSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },

  deleteAction: {
    minHeight: 72,
    borderRadius: 17,
    backgroundColor: '#FFF7F7',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  deleteActionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 3,
  },

  deleteActionSubtitle: {
    fontSize: 11,
    color: '#DC2626',
  },

  bottomSpace: {
    height: 40,
  },

  // =========================================================
  // MODAL STATUT
  // =========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  modalEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
  },

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCloseText: {
    fontSize: 25,
    lineHeight: 27,
    color: '#64748B',
    fontWeight: '400',
  },

  modalDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    marginBottom: 18,
  },

  statusOption: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  statusOptionActive: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },

  optionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },

  optionDescription: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  modalLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },

  modalLoadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  modalCancelButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  modalCancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },

  // =========================================================
  // MODAL SUPPRESSION
  // =========================================================

  deleteModalContainer: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },

  deleteModalIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  deleteModalTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },

  deleteModalDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 22,
  },

  deleteModalBold: {
    fontWeight: '900',
    color: '#0F172A',
  },

  deleteModalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },

  deleteCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteCancelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },

  deleteConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  deleteConfirmText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});