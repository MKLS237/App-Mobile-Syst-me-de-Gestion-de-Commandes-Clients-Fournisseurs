import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Commande } from '../models/commande';
import { getCommandes } from '../services/commandeService';

type FiltreStatut = 'TOUTES' | 'LIVREE' | 'NON_LIVREE' | 'LIVREE_PARTIELLEMENT';

export default function CommandesScreen() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] =
    useState<FiltreStatut>('TOUTES');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      chargerCommandes();
    }, [])
  );

  async function chargerCommandes() {
    try {
      setLoading(true);
      setError(null);

      const data = await getCommandes();

      setCommandes(data);
    } catch (error) {
      console.error(
        'Erreur chargement commandes :',
        error
      );

      setError(
        'Impossible de charger les commandes.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Statistiques rapides
   */
  const statistiques = useMemo(() => {
    const livrees = commandes.filter(
      (commande) => commande.statut === 'LIVREE'
    ).length;

    const nonLivrees = commandes.filter(
      (commande) => commande.statut === 'NON_LIVREE'
    ).length;

    const partielles = commandes.filter(
      (commande) =>
        commande.statut === 'LIVREE_PARTIELLEMENT'
    ).length;

    const montantTotal = commandes.reduce(
      (total, commande) =>
        total + Number(commande.prixTotal || 0),
      0
    );

    return {
      total: commandes.length,
      livrees,
      nonLivrees,
      partielles,
      montantTotal,
    };
  }, [commandes]);

  /*
   * Recherche + filtre statut
   */
  const commandesFiltrees = useMemo(() => {
    const texte = recherche
      .trim()
      .toLowerCase();

    return commandes.filter((commande) => {
      const nomClient =
        commande.client?.nom?.toLowerCase() || '';

      const prenomClient =
        commande.client?.prenom?.toLowerCase() || '';

      const designation =
        commande.designation?.toLowerCase() || '';

      const statut =
        commande.statut?.toLowerCase() || '';

      const correspondRecherche =
        !texte ||
        commande.id.toString().includes(texte) ||
        nomClient.includes(texte) ||
        prenomClient.includes(texte) ||
        designation.includes(texte) ||
        statut.includes(texte);

      const correspondStatut =
        filtreStatut === 'TOUTES' ||
        commande.statut === filtreStatut;

      return (
        correspondRecherche &&
        correspondStatut
      );
    });
  }, [
    commandes,
    recherche,
    filtreStatut,
  ]);

  /*
   * Statut visuel
   */
  function getStatutConfig(statut: string) {
    switch (statut) {
      case 'LIVREE':
        return {
          label: 'Livrée',
          background: '#DCFCE7',
          text: '#15803D',
          dot: '#16A34A',
        };

      case 'LIVREE_PARTIELLEMENT':
        return {
          label: 'Partiellement livrée',
          background: '#FEF3C7',
          text: '#B45309',
          dot: '#F59E0B',
        };

      case 'NON_LIVREE':
      default:
        return {
          label: 'Non livrée',
          background: '#FEE2E2',
          text: '#B91C1C',
          dot: '#EF4444',
        };
    }
  }

  /*
   * Format montant
   */
  function formatMontant(montant: number) {
    return Number(montant || 0).toLocaleString(
      'fr-FR'
    );
  }

  /*
   * Format date
   */
  function formatDate(date?: string | null) {
    if (!date) {
      return '--';
    }

    const morceaux = date.split('-');

    if (morceaux.length !== 3) {
      return date;
    }

    return `${morceaux[2]}/${morceaux[1]}/${morceaux[0]}`;
  }

  /*
   * Carte commande
   */
  function afficherCommande({
    item,
  }: {
    item: Commande;
  }) {
    const statut = getStatutConfig(
      item.statut
    );

    const nomClient = [
      item.client?.prenom,
      item.client?.nom,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() =>
          router.push({
            pathname: '/commande/[id]',
            params: {
              id: item.id.toString(),
            },
          })
        }
      >
        {/* HEADER CARTE */}
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.commandeLabel}>
              COMMANDE
            </Text>

            <Text style={styles.commandeNumber}>
              #{item.id}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statut.background,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    statut.dot,
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: statut.text,
                },
              ]}
            >
              {statut.label}
            </Text>
          </View>
        </View>

        {/* CLIENT */}
        <View style={styles.clientSection}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarText}>
              {(
                item.client?.prenom ||
                item.client?.nom ||
                '?'
              )
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.clientLabel}>
              CLIENT
            </Text>

            <Text
              style={styles.clientName}
              numberOfLines={1}
            >
              {nomClient || 'Client inconnu'}
            </Text>

            {item.client?.telephone ? (
              <Text style={styles.clientPhone}>
                {item.client.telephone}
              </Text>
            ) : null}
          </View>
        </View>

        {/* PRODUIT */}
        <View style={styles.productBox}>
          <View style={styles.productHeader}>
            <Text style={styles.productLabel}>
              DÉSIGNATION
            </Text>

            <Text style={styles.quantity}>
              × {item.quantite}
            </Text>
          </View>

          <Text
            style={styles.productName}
            numberOfLines={2}
          >
            {item.designation}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.unitPriceLabel}>
              Prix unitaire
            </Text>

            <Text style={styles.unitPrice}>
              {formatMontant(
                item.prixUnitaire
              )}{' '}
              FCFA
            </Text>
          </View>
        </View>

        {/* TOTAL */}
        <View style={styles.totalSection}>
          <View>
            <Text style={styles.totalLabel}>
              TOTAL COMMANDE
            </Text>

            <Text style={styles.totalValue}>
              {formatMontant(
                item.prixTotal
              )}{' '}
              <Text style={styles.totalCurrency}>
                FCFA
              </Text>
            </Text>
          </View>

          <View style={styles.arrowButton}>
            <Text style={styles.arrow}>
              →
            </Text>
          </View>
        </View>

        {/* DATES */}
        <View style={styles.datesSection}>
          <View style={styles.dateItem}>
            <Text style={styles.dateIcon}>
              ◷
            </Text>

            <View>
              <Text style={styles.dateLabel}>
                Commandée le
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(
                  item.dateCommande
                )}
              </Text>
            </View>
          </View>

          <View style={styles.dateSeparator} />

          <View style={styles.dateItem}>
            <Text style={styles.dateIcon}>
              ✓
            </Text>

            <View>
              <Text style={styles.dateLabel}>
                Livraison
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(
                  item.dateLivraison
                )}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  /*
   * Écran chargement
   */
  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCircle}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Chargement des commandes
        </Text>

        <Text style={styles.loadingText}>
          Récupération des données...
        </Text>
      </View>
    );
  }

  /*
   * Écran erreur
   */
  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>
            !
          </Text>
        </View>

        <Text style={styles.errorTitle}>
          Une erreur est survenue
        </Text>

        <Text style={styles.error}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={chargerCommandes}
        >
          <Text style={styles.retryText}>
            Réessayer
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Commandes
          </Text>

          <Text style={styles.subtitle}>
            Gérez et suivez vos commandes
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push('/commande/create')
          }
        >
          <Text style={styles.addButtonText}>
            +
          </Text>
        </Pressable>
      </View>

      {/* MINI STATS */}
      <View style={styles.statsCard}>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatLabel}>
            TOTAL
          </Text>

          <Text style={styles.mainStatValue}>
            {statistiques.total}
          </Text>

          <Text style={styles.mainStatDescription}>
            commande(s)
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.smallStat}>
          <View
            style={[
              styles.smallDot,
              {
                backgroundColor:
                  '#16A34A',
              },
            ]}
          />

          <Text style={styles.smallStatValue}>
            {statistiques.livrees}
          </Text>

          <Text style={styles.smallStatLabel}>
            Livrées
          </Text>
        </View>

        <View style={styles.smallStat}>
          <View
            style={[
              styles.smallDot,
              {
                backgroundColor:
                  '#EF4444',
              },
            ]}
          />

          <Text style={styles.smallStatValue}>
            {statistiques.nonLivrees}
          </Text>

          <Text style={styles.smallStatLabel}>
            En attente
          </Text>
        </View>
      </View>

      {/* RECHERCHE */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>
          ⌕
        </Text>

        <TextInput
          style={styles.search}
          placeholder="Rechercher une commande..."
          placeholderTextColor="#9CA3AF"
          value={recherche}
          onChangeText={setRecherche}
          returnKeyType="search"
        />

        {recherche.length > 0 && (
          <Pressable
            onPress={() => setRecherche('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>
              ×
            </Text>
          </Pressable>
        )}
      </View>

      {/* FILTRES */}
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>
          Filtrer par statut
        </Text>

        <Text style={styles.resultCount}>
          {commandesFiltrees.length}{' '}
          résultat(s)
        </Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          'TOUTES',
          'LIVREE',
          'NON_LIVREE',
          'LIVREE_PARTIELLEMENT',
        ] as FiltreStatut[]}
        keyExtractor={(item) => item}
        contentContainerStyle={
          styles.filters
        }
        renderItem={({ item }) => {
          const actif =
            filtreStatut === item;

          const labels = {
            TOUTES: 'Toutes',
            LIVREE: 'Livrées',
            NON_LIVREE: 'Non livrées',
            LIVREE_PARTIELLEMENT:
              'Partielles',
          };

          return (
            <Pressable
              style={[
                styles.filterButton,
                actif &&
                  styles.filterButtonActive,
              ]}
              onPress={() =>
                setFiltreStatut(item)
              }
            >
              {item !== 'TOUTES' && (
                <View
                  style={[
                    styles.filterDot,
                    {
                      backgroundColor:
                        item === 'LIVREE'
                          ? '#16A34A'
                          : item ===
                            'NON_LIVREE'
                          ? '#EF4444'
                          : '#F59E0B',
                    },
                  ]}
                />
              )}

              <Text
                style={[
                  styles.filterText,
                  actif &&
                    styles.filterTextActive,
                ]}
              >
                {labels[item]}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* LISTE */}
      {commandesFiltrees.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>
              {recherche
                ? '⌕'
                : '▱'}
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            Aucune commande
          </Text>

          <Text style={styles.emptyText}>
            {recherche
              ? 'Aucune commande ne correspond à votre recherche.'
              : 'Aucune commande ne correspond au filtre sélectionné.'}
          </Text>

          {(recherche ||
            filtreStatut !== 'TOUTES') && (
            <Pressable
              style={styles.resetButton}
              onPress={() => {
                setRecherche('');
                setFiltreStatut('TOUTES');
              }}
            >
              <Text
                style={styles.resetButtonText}
              >
                Réinitialiser les filtres
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={commandesFiltrees}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={afficherCommande}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.list
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '500',
    lineHeight: 32,
  },

  /* STATS */

  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  mainStat: {
    flex: 1.2,
  },

  mainStatLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
  },

  mainStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginTop: 1,
  },

  mainStatDescription: {
    fontSize: 12,
    color: '#6B7280',
  },

  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },

  smallStat: {
    flex: 1,
    alignItems: 'center',
  },

  smallDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 5,
  },

  smallStatValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  smallStatLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },

  /* SEARCH */

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 17,
  },

  searchIcon: {
    fontSize: 25,
    color: '#6B7280',
    marginRight: 8,
    transform: [
      {
        rotate: '-15deg',
      },
    ],
  },

  search: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111827',
  },

  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearText: {
    fontSize: 20,
    color: '#6B7280',
    lineHeight: 22,
  },

  /* FILTRES */

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  resultCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  filters: {
    paddingBottom: 15,
    gap: 8,
  },

  filterButton: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  filterDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  /* CARD */

  list: {
    paddingTop: 2,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.92,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  commandeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
  },

  commandeNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* CLIENT */

  clientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },

  clientAvatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  clientAvatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2563EB',
  },

  clientInfo: {
    flex: 1,
  },

  clientLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  clientName: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },

  clientPhone: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  /* PRODUIT */

  productBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 13,
    padding: 12,
    marginTop: 14,
  },

  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  productLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  quantity: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 5,
    marginBottom: 10,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  unitPriceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  unitPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },

  /* TOTAL */

  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },

  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },

  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },

  totalCurrency: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrow: {
    color: '#2563EB',
    fontSize: 20,
    fontWeight: '700',
  },

  /* DATES */

  datesSection: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#F3F4F6',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 28,
    color: '#6B7280',
    fontSize: 14,
    marginRight: 7,
  },

  dateLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    marginBottom: 2,
  },

  dateValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },

  dateSeparator: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },

  /* EMPTY */

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 70,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 28,
    color: '#9CA3AF',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },

  resetButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 10,
  },

  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* LOADING */

  center: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  loadingCircle: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
  },

  /* ERROR */

  errorIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  errorIconText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DC2626',
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  error: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 18,
  },

  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 11,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
