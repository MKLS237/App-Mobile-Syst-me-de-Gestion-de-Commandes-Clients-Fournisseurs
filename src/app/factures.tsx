import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
  RefreshCw,
  WalletCards,
} from 'lucide-react-native';

import { getFactures } from '../services/factureService';
import {
  Facture,
  StatutFacture,
} from '../models/facture';

type FilterType =
  | 'TOUTES'
  | 'NON_PAYEE'
  | 'PARTIELLEMENT_PAYEE'
  | 'PAYEE';

export default function FacturesScreen() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] =
    useState<FilterType>('TOUTES');

  const loadFactures = useCallback(async () => {
    try {
      setError(null);

      const data = await getFactures();

const sortedFactures = [...data].sort(
  (a, b) => {
    // Priorité à l'ID de facture :
    // la facture la plus récente / plus grande ID en premier
    if (b.id !== a.id) {
      return b.id - a.id;
    }

    // Sécurité supplémentaire :
    // si les IDs sont identiques, comparer les dates
    return (
      new Date(b.dateFacture).getTime() -
      new Date(a.dateFacture).getTime()
    );
  }
);

setFactures(sortedFactures);
    } catch (err) {
      console.error(
        'Erreur chargement factures :',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les factures.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFactures();
  }, [loadFactures]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFactures();
  };

  /*
   * =====================================================
   * STATISTIQUES LOCALES
   * =====================================================
   */

  const totalFactures = factures.length;

  const montantTotal = useMemo(() => {
    return factures.reduce(
      (total, facture) =>
        total + Number(facture.montantTotal || 0),
      0
    );
  }, [factures]);

  const montantNonPaye = useMemo(() => {
    return factures
      .filter(
        (facture) =>
          facture.statut === 'NON_PAYEE'
      )
      .reduce(
        (total, facture) =>
          total +
          Number(facture.montantTotal || 0),
        0
      );
  }, [factures]);

  const nombreNonPayees = useMemo(() => {
    return factures.filter(
      (facture) =>
        facture.statut === 'NON_PAYEE'
    ).length;
  }, [factures]);

  const nombrePartielles = useMemo(() => {
    return factures.filter(
      (facture) =>
        facture.statut ===
        'PARTIELLEMENT_PAYEE'
    ).length;
  }, [factures]);

  const nombrePayees = useMemo(() => {
    return factures.filter(
      (facture) =>
        facture.statut === 'PAYEE'
    ).length;
  }, [factures]);

  /*
   * =====================================================
   * FILTRE
   * =====================================================
   */

  const filteredFactures = useMemo(() => {
    if (filter === 'TOUTES') {
      return factures;
    }

    return factures.filter(
      (facture) =>
        facture.statut === filter
    );
  }, [factures, filter]);

  /*
   * =====================================================
   * FORMATAGE
   * =====================================================
   */

  const formatMoney = (value: number) => {
    return `${Number(value || 0).toLocaleString(
      'fr-FR'
    )} FCFA`;
  };

  const formatDate = (date: string) => {
    if (!date) {
      return 'Date inconnue';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const getClientName = (
    facture: Facture
  ) => {
    if (!facture.client) {
      return 'Client inconnu';
    }

    const client = facture.client as any;

    const fullName = [
      client.prenom,
      client.nom,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      fullName ||
      client.nom ||
      client.raisonSociale ||
      'Client inconnu'
    );
  };

  const getCommandeId = (
    facture: Facture
  ) => {
    if (!facture.commande) {
      return null;
    }

    return (facture.commande as any).id;
  };

  /*
   * =====================================================
   * STATUT
   * =====================================================
   */

  const getStatusLabel = (
    statut: StatutFacture
  ) => {
    switch (statut) {
      case 'PAYEE':
        return 'PAYÉE';

      case 'PARTIELLEMENT_PAYEE':
        return 'PARTIELLE';

      case 'NON_PAYEE':
        return 'NON PAYÉE';

      default:
        return statut;
    }
  };

  const getStatusColors = (
    statut: StatutFacture
  ) => {
    switch (statut) {
      case 'PAYEE':
        return {
          background: '#F0FDF4',
          border: '#BBF7D0',
          text: '#15803D',
          icon: '#16A34A',
        };

      case 'PARTIELLEMENT_PAYEE':
        return {
          background: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
          icon: '#F59E0B',
        };

      case 'NON_PAYEE':
      default:
        return {
          background: '#FEF2F2',
          border: '#FECACA',
          text: '#B91C1C',
          icon: '#DC2626',
        };
    }
  };

  const getStatusIcon = (
    statut: StatutFacture
  ) => {
    switch (statut) {
      case 'PAYEE':
        return (
          <CheckCircle2
            size={14}
            color="#16A34A"
          />
        );

      case 'PARTIELLEMENT_PAYEE':
        return (
          <WalletCards
            size={14}
            color="#F59E0B"
          />
        );

      case 'NON_PAYEE':
      default:
        return (
          <AlertCircle
            size={14}
            color="#DC2626"
          />
        );
    }
  };

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Chargement des factures
        </Text>

        <Text style={styles.loadingText}>
          Récupération des données de facturation...
        </Text>
      </View>
    );
  }

  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <AlertCircle
            size={26}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Impossible de charger les factures
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadFactures}
        >
          <RefreshCw
            size={17}
            color="#FFFFFF"
          />

          <Text style={styles.retryText}>
            Réessayer
          </Text>
        </Pressable>
      </View>
    );
  }

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
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
        <View style={styles.headerText}>
          <View style={styles.eyebrowRow}>
            <View style={styles.liveDot} />

            <Text style={styles.eyebrow}>
              GESTION FINANCIÈRE
            </Text>
          </View>

          <Text style={styles.title}>
            Factures
          </Text>

          <Text style={styles.subtitle}>
            Gérez vos factures et suivez les
            paiements de vos clients.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.refreshButton,
            pressed &&
              styles.refreshButtonPressed,
          ]}
          onPress={loadFactures}
        >
          <RefreshCw
            size={19}
            color="#2563EB"
          />
        </Pressable>
      </View>

      {/* =================================================
          KPI
      ================================================= */}

      <View style={styles.kpiGrid}>
        {/* TOTAL */}

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <View
              style={[
                styles.kpiIcon,
                styles.blueIcon,
              ]}
            >
              <FileText
                size={19}
                color="#2563EB"
              />
            </View>

            <Text style={styles.kpiCaption}>
              TOTAL
            </Text>
          </View>

          <Text style={styles.kpiValue}>
            {totalFactures}
          </Text>

          <Text style={styles.kpiLabel}>
            factures
          </Text>
        </View>

        {/* MONTANT */}

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <View
              style={[
                styles.kpiIcon,
                styles.purpleIcon,
              ]}
            >
              <WalletCards
                size={19}
                color="#7C3AED"
              />
            </View>

            <Text style={styles.kpiCaption}>
              FACTURÉ
            </Text>
          </View>

          <Text
            style={[
              styles.kpiMoney,
              styles.purpleText,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatMoney(montantTotal)}
          </Text>

          <Text style={styles.kpiLabel}>
            montant total
          </Text>
        </View>

        {/* IMPAYÉ */}

        <View
          style={[
            styles.kpiCard,
            styles.kpiCardDanger,
          ]}
        >
          <View style={styles.kpiTop}>
            <View
              style={[
                styles.kpiIcon,
                styles.redIcon,
              ]}
            >
              <AlertCircle
                size={19}
                color="#DC2626"
              />
            </View>

            <Text
              style={[
                styles.kpiCaption,
                styles.redText,
              ]}
            >
              À ENCAISSER
            </Text>
          </View>

          <Text
            style={[
              styles.kpiMoney,
              styles.redText,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatMoney(montantNonPaye)}
          </Text>

          <Text style={styles.kpiLabel}>
            {nombreNonPayees} facture
            {nombreNonPayees > 1
              ? 's'
              : ''}{' '}
            non payée
            {nombreNonPayees > 1
              ? 's'
              : ''}
          </Text>
        </View>
      </View>

      {/* =================================================
          RÉPARTITION
      ================================================= */}

      <View style={styles.statusSummary}>
        <View style={styles.statusSummaryHeader}>
          <View>
            <Text style={styles.panelEyebrow}>
              PAIEMENTS
            </Text>

            <Text style={styles.panelTitle}>
              Répartition des factures
            </Text>
          </View>

          <FileText
            size={19}
            color="#94A3B8"
          />
        </View>

        <View style={styles.statusSummaryGrid}>
          <View style={styles.statusSummaryItem}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    '#16A34A',
                },
              ]}
            />

            <Text style={styles.statusSummaryNumber}>
              {nombrePayees}
            </Text>

            <Text style={styles.statusSummaryLabel}>
              Payées
            </Text>
          </View>

          <View style={styles.statusSummaryItem}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    '#F59E0B',
                },
              ]}
            />

            <Text style={styles.statusSummaryNumber}>
              {nombrePartielles}
            </Text>

            <Text style={styles.statusSummaryLabel}>
              Partielles
            </Text>
          </View>

          <View style={styles.statusSummaryItem}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    '#DC2626',
                },
              ]}
            />

            <Text style={styles.statusSummaryNumber}>
              {nombreNonPayees}
            </Text>

            <Text style={styles.statusSummaryLabel}>
              Non payées
            </Text>
          </View>
        </View>
      </View>

      {/* =================================================
          FILTRES
      ================================================= */}

      <View style={styles.listHeader}>
        <View>
          <Text style={styles.panelEyebrow}>
            DOCUMENTS
          </Text>

          <Text style={styles.panelTitle}>
            Liste des factures
          </Text>
        </View>

        <Text style={styles.resultCount}>
          {filteredFactures.length}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.filterContainer
        }
      >
        <FilterButton
          label="Toutes"
          active={filter === 'TOUTES'}
          count={factures.length}
          onPress={() =>
            setFilter('TOUTES')
          }
        />

        <FilterButton
          label="Non payées"
          active={
            filter === 'NON_PAYEE'
          }
          count={nombreNonPayees}
          onPress={() =>
            setFilter('NON_PAYEE')
          }
        />

        <FilterButton
          label="Partielles"
          active={
            filter ===
            'PARTIELLEMENT_PAYEE'
          }
          count={nombrePartielles}
          onPress={() =>
            setFilter(
              'PARTIELLEMENT_PAYEE'
            )
          }
        />

        <FilterButton
          label="Payées"
          active={filter === 'PAYEE'}
          count={nombrePayees}
          onPress={() =>
            setFilter('PAYEE')
          }
        />
      </ScrollView>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {filteredFactures.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <FileText
              size={27}
              color="#94A3B8"
            />
          </View>

          <Text style={styles.emptyTitle}>
            Aucune facture
          </Text>

          <Text style={styles.emptyText}>
            Aucune facture ne correspond au
            filtre sélectionné.
          </Text>
        </View>
      ) : (
        /*
         * =================================================
         * LISTE
         * =================================================
         */

        <View style={styles.invoiceList}>
          {filteredFactures.map(
            (facture) => {
              const colors =
                getStatusColors(
                  facture.statut
                );

              const commandeId =
                getCommandeId(
                  facture
                );

              return (
                <Pressable
                  key={facture.id}
                  style={({ pressed }) => [
                    styles.invoiceCard,
                    pressed &&
                      styles.invoicePressed,
                  ]}
                  onPress={() =>
                    router.push(
                      `/facture/${facture.id}`
                    )
                  }
                >
                  {/* TOP */}

                  <View
                    style={
                      styles.invoiceTop
                    }
                  >
                    <View
                      style={
                        styles.invoiceIdentity
                      }
                    >
                      <View
                        style={
                          styles.invoiceIcon
                        }
                      >
                        <FileText
                          size={19}
                          color="#2563EB"
                        />
                      </View>

                      <View>
                        <Text
                          style={
                            styles.invoiceNumber
                          }
                        >
                          FACTURE #
                          {String(
                            facture.id
                          ).padStart(
                            5,
                            '0'
                          )}
                        </Text>

                        <Text
                          style={
                            styles.invoiceDate
                          }
                        >
                          {formatDate(
                            facture.dateFacture
                          )}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            colors.background,
                          borderColor:
                            colors.border,
                        },
                      ]}
                    >
                      {getStatusIcon(
                        facture.statut
                      )}

                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {getStatusLabel(
                          facture.statut
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* SEPARATOR */}

                  <View
                    style={
                      styles.invoiceSeparator
                    }
                  />

                  {/* CLIENT */}

                  <View
                    style={
                      styles.invoiceInfoRow
                    }
                  >
                    <Text
                      style={
                        styles.invoiceInfoLabel
                      }
                    >
                      Client
                    </Text>

                    <Text
                      style={
                        styles.invoiceInfoValue
                      }
                      numberOfLines={1}
                    >
                      {getClientName(
                        facture
                      )}
                    </Text>
                  </View>

                  {/* COMMANDE */}

                  <View
                    style={
                      styles.invoiceInfoRow
                    }
                  >
                    <Text
                      style={
                        styles.invoiceInfoLabel
                      }
                    >
                      Commande
                    </Text>

                    <Text
                      style={
                        styles.invoiceInfoValue
                      }
                    >
                      {commandeId
                        ? `#${commandeId}`
                        : '—'}
                    </Text>
                  </View>

                  {/* TOTAL */}

                  <View
                    style={
                      styles.invoiceBottom
                    }
                  >
                    <View>
                      <Text
                        style={
                          styles.amountLabel
                        }
                      >
                        MONTANT TOTAL
                      </Text>

                      <Text
                        style={
                          styles.amountValue
                        }
                      >
                        {formatMoney(
                          facture.montantTotal
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.viewButton
                      }
                    >
                      <Text
                        style={
                          styles.viewButtonText
                        }
                      >
                        Voir
                      </Text>

                      <ChevronRight
                        size={17}
                        color="#2563EB"
                      />
                    </View>
                  </View>
                </Pressable>
              );
            }
          )}
        </View>
      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <View style={styles.footer}>
        <View style={styles.footerLine} />

        <Text style={styles.footerText}>
          Gestion commerciale • Facturation
        </Text>
      </View>
    </ScrollView>
  );
}

/*
 * =========================================================
 * FILTER BUTTON
 * =========================================================
 */

interface FilterButtonProps {
  label: string;
  active: boolean;
  count: number;
  onPress: () => void;
}

function FilterButton({
  label,
  active,
  count,
  onPress,
}: FilterButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.filterButton,
        active &&
          styles.filterButtonActive,
        pressed &&
          styles.filterButtonPressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterText,
          active &&
            styles.filterTextActive,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.filterCount,
          active &&
            styles.filterCountActive,
        ]}
      >
        <Text
          style={[
            styles.filterCountText,
            active &&
              styles.filterCountTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

/*
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 45,
  },

  center: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  loadingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  loadingText: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  errorIcon: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },

  errorText: {
    marginTop: 7,
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
  },

  retryButton: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
    paddingRight: 15,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 7,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 1.1,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    maxWidth: 340,
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  refreshButtonPressed: {
    backgroundColor: '#EFF6FF',
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  /* KPI */

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 13,
  },

  kpiCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 145,
    minHeight: 126,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  kpiCardDanger: {
    borderColor: '#FECACA',
  },

  kpiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  kpiIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  blueIcon: {
    backgroundColor: '#EFF6FF',
  },

  purpleIcon: {
    backgroundColor: '#F5F3FF',
  },

  redIcon: {
    backgroundColor: '#FEF2F2',
  },

  kpiCaption: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },

  redText: {
    color: '#DC2626',
  },

  purpleText: {
    color: '#7C3AED',
  },

  kpiValue: {
    marginTop: 13,
    fontSize: 25,
    fontWeight: '900',
    color: '#0F172A',
  },

  kpiMoney: {
    marginTop: 13,
    fontSize: 18,
    fontWeight: '900',
  },

  kpiLabel: {
    marginTop: 2,
    fontSize: 9,
    color: '#94A3B8',
  },

  /* SUMMARY */

  statusSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },

  statusSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  panelEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.9,
    marginBottom: 3,
  },

  panelTitle: {
    fontSize: 16,
    fontWeight: '850',
    color: '#0F172A',
  },

  statusSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  statusSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },

  statusSummaryNumber: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },

  statusSummaryLabel: {
    marginTop: 2,
    fontSize: 9,
    color: '#94A3B8',
  },

  /* LIST HEADER */

  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  resultCount: {
    minWidth: 29,
    height: 29,
    paddingHorizontal: 7,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
  },

  /* FILTER */

  filterContainer: {
    gap: 8,
    paddingBottom: 13,
  },

  filterButton: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  filterButtonPressed: {
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  filterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  filterCount: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  filterCountText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#64748B',
  },

  filterCountTextActive: {
    color: '#FFFFFF',
  },

  /* EMPTY */

  emptyCard: {
    minHeight: 230,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 2,
  },

  emptyIcon: {
    width: 61,
    height: 61,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '850',
    color: '#0F172A',
  },

  emptyText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    color: '#94A3B8',
    textAlign: 'center',
  },

  /* INVOICE */

  invoiceList: {
    gap: 11,
  },

  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  invoicePressed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#BFDBFE',
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  invoiceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  invoiceIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  invoiceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  invoiceNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E293B',
  },

  invoiceDate: {
    marginTop: 3,
    fontSize: 9,
    color: '#94A3B8',
  },

  statusBadge: {
    minHeight: 28,
    paddingHorizontal: 8,
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statusText: {
    fontSize: 8,
    fontWeight: '900',
  },

  invoiceSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 13,
  },

  invoiceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 25,
  },

  invoiceInfoLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },

  invoiceInfoValue: {
    maxWidth: '65%',
    fontSize: 10,
    color: '#334155',
    fontWeight: '750',
    textAlign: 'right',
  },

  invoiceBottom: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  amountLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.7,
  },

  amountValue: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },

  viewButton: {
    minHeight: 35,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  viewButtonText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2563EB',
  },

  /* FOOTER */

  footer: {
    alignItems: 'center',
    marginTop: 28,
  },

  footerLine: {
    width: 35,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 9,
  },

  footerText: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});