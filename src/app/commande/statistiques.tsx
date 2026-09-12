import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Wallet,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react-native';

import { getCommandeStats } from '../../services/commandeService';
import { CommandeStats } from '../../models/commande';

type Period = '7' | '30' | 'all';

export default function StatistiquesCommandesScreen() {
  const router = useRouter();

  const [stats, setStats] = useState<CommandeStats | null>(null);
  const [period, setPeriod] = useState<Period>('7');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatMoney = (value: number = 0) => {
    return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`;
  };

  const formatNumber = (value: number = 0) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const getDateRange = (selectedPeriod: Period) => {
    if (selectedPeriod === 'all') {
      return {
        startDate: undefined,
        endDate: undefined,
      };
    }

    const end = new Date();
    const start = new Date();

    start.setDate(
      end.getDate() - (selectedPeriod === '7' ? 6 : 29)
    );

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  };

  const loadStats = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError(null);

      const { startDate, endDate } = getDateRange(period);

      const result = await getCommandeStats(startDate, endDate);

      setStats(result);
    } catch (err) {
      console.error(err);
      setError(
        'Impossible de récupérer les statistiques des commandes.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [period])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats(false);
  };

  const totalVentes = Number(stats?.totalVentes ?? 0);
  const totalCout = Number(stats?.totalCout ?? 0);
  const beneficeTotal = Number(stats?.beneficeTotal ?? 0);

  const montantLivrees = Number(stats?.montantLivrees ?? 0);
  const montantNonLivrees = Number(stats?.montantNonLivrees ?? 0);

  const anciennesCommandes = Array.isArray(
    stats?.nonLivreesAnciennes
  )
    ? stats.nonLivreesAnciennes.length
    : 0;

  const statsParJour = Array.isArray(stats?.statsParJour)
    ? stats.statsParJour
    : [];

  const commandesLivrees = statsParJour.length
    ? statsParJour.reduce(
        (total, item) => total + Number(item.totalVentes ?? 0),
        0
      )
    : montantLivrees;

  const marge =
    totalVentes > 0
      ? ((beneficeTotal / totalVentes) * 100).toFixed(1)
      : '0';

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>
          Chargement des statistiques...
        </Text>
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <AlertTriangle size={28} color="#DC2626" />
        </View>

        <Text style={styles.errorTitle}>
          Impossible de charger les statistiques
        </Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadStats()}
        >
          <Text style={styles.retryButtonText}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
       <TouchableOpacity
  style={styles.backButton}
  onPress={() => router.replace('/commandes')}
  activeOpacity={0.8}
>
  <ArrowLeft size={22} color="#111827" />
</TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Statistiques</Text>
          <Text style={styles.subtitle}>
            Analyse de vos commandes
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#208AEF"
          />
        }
        contentContainerStyle={styles.content}
      >
        {/* PÉRIODE */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Vue d'ensemble
            </Text>
            <Text style={styles.sectionSubtitle}>
              Sélectionnez une période
            </Text>
          </View>

          <CalendarDays size={20} color="#6B7280" />
        </View>

        <View style={styles.periodContainer}>
          <PeriodButton
            label="7 jours"
            active={period === '7'}
            onPress={() => setPeriod('7')}
          />

          <PeriodButton
            label="30 jours"
            active={period === '30'}
            onPress={() => setPeriod('30')}
          />

          <PeriodButton
            label="Tout"
            active={period === 'all'}
            onPress={() => setPeriod('all')}
          />
        </View>

        {/* CA */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardTop}>
            <View style={styles.mainIcon}>
              <Wallet size={23} color="#208AEF" />
            </View>

            <View style={styles.trendBadge}>
              <TrendingUp size={15} color="#16A34A" />
              <Text style={styles.trendText}>
                Performance
              </Text>
            </View>
          </View>

          <Text style={styles.cardLabel}>
            Chiffre d'affaires
          </Text>

          <Text style={styles.mainAmount}>
            {formatMoney(totalVentes)}
          </Text>

          <View style={styles.divider} />

          <View style={styles.mainBottom}>
            <View>
              <Text style={styles.smallLabel}>
                Bénéfice estimé
              </Text>

              <Text style={styles.profitAmount}>
                {formatMoney(beneficeTotal)}
              </Text>
            </View>

            <View style={styles.marginContainer}>
              <Text style={styles.smallLabel}>
                Marge
              </Text>

              <Text style={styles.marginValue}>
                {marge}%
              </Text>
            </View>
          </View>
        </View>

        {/* KPI */}
        <View style={styles.kpiRow}>
          <StatCard
            icon={<CheckCircle2 size={21} color="#16A34A" />}
            title="Livrées"
            value={formatMoney(montantLivrees)}
            subtitle="Montant"
            background="#ECFDF3"
          />

          <StatCard
            icon={<Clock3 size={21} color="#D97706" />}
            title="En attente"
            value={formatMoney(montantNonLivrees)}
            subtitle="À suivre"
            background="#FFF7ED"
          />
        </View>

        {/* COÛTS */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Wallet size={20} color="#6B7280" />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Coût total estimé
            </Text>

            <Text style={styles.infoValue}>
              {formatMoney(totalCout)}
            </Text>

            <Text style={styles.infoDescription}>
              Coût estimé des produits vendus sur la période.
            </Text>
          </View>
        </View>

        {/* COMMANDES À SURVEILLER */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.warningCard,
            anciennesCommandes === 0 &&
              styles.warningCardSuccess,
          ]}
          onPress={() => router.push('/commandes')}
        >
          <View
            style={[
              styles.warningIcon,
              anciennesCommandes === 0 &&
                styles.warningIconSuccess,
            ]}
          >
            {anciennesCommandes === 0 ? (
              <CheckCircle2 size={22} color="#16A34A" />
            ) : (
              <AlertTriangle size={22} color="#D97706" />
            )}
          </View>

          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>
              {anciennesCommandes === 0
                ? 'Tout est sous contrôle'
                : 'Commandes à surveiller'}
            </Text>

            <Text style={styles.warningDescription}>
              {anciennesCommandes === 0
                ? 'Aucune ancienne commande non livrée.'
                : `${formatNumber(
                    anciennesCommandes
                  )} commande(s) non livrée(s) depuis plus de 3 jours.`}
            </Text>
          </View>

          <ShoppingBag size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* ACTIVITÉ */}
        <View style={styles.sectionHeaderActivity}>
          <View>
            <Text style={styles.sectionTitle}>
              Activité commerciale
            </Text>

            <Text style={styles.sectionSubtitle}>
              Données disponibles par jour
            </Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          {statsParJour.length === 0 ? (
            <View style={styles.emptyActivity}>
              <ShoppingBag size={28} color="#9CA3AF" />

              <Text style={styles.emptyTitle}>
                Aucune activité
              </Text>

              <Text style={styles.emptyText}>
                Aucune donnée disponible pour cette période.
              </Text>
            </View>
          ) : (
            statsParJour
              .slice()
              .reverse()
              .slice(0, 7)
              .map((item, index) => (
                <View
                  key={`${item.dateCommande}-${index}`}
                  style={[
                    styles.activityRow,
                    index ===
                      Math.min(statsParJour.length, 7) - 1 &&
                      styles.lastActivityRow,
                  ]}
                >
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateDay}>
                      {new Date(
                        `${item.dateCommande}T00:00:00`
                      ).getDate()}
                    </Text>

                    <Text style={styles.dateMonth}>
                      {new Date(
                        `${item.dateCommande}T00:00:00`
                      )
                        .toLocaleDateString('fr-FR', {
                          month: 'short',
                        })
                        .replace('.', '')}
                    </Text>
                  </View>

                  <View style={styles.activityInfo}>
                    <Text style={styles.activityDate}>
                      {new Date(
                        `${item.dateCommande}T00:00:00`
                      ).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </Text>

                    <Text style={styles.activityLabel}>
                      Ventes enregistrées
                    </Text>
                  </View>

                  <Text style={styles.activityAmount}>
                    {formatMoney(
                      Number(item.totalVentes ?? 0)
                    )}
                  </Text>
                </View>
              ))
          )}
        </View>

        {/* NOTE */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Les statistiques sont calculées à partir des
            commandes enregistrées dans votre système.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function PeriodButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.periodButton,
        active && styles.periodButtonActive,
      ]}
    >
      <Text
        style={[
          styles.periodButtonText,
          active && styles.periodButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  background,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  background: string;
}) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statIcon,
          { backgroundColor: background },
        ]}
      >
        {icon}
      </View>

      <Text style={styles.statTitle}>{title}</Text>

      <Text style={styles.statValue}>{value}</Text>

      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F3',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionHeaderActivity: {
    marginTop: 26,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#8A9099',
    marginTop: 3,
  },

  periodContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDEFF2',
    padding: 4,
    borderRadius: 14,
    marginBottom: 18,
  },

  periodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 11,
  },

  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  periodButtonTextActive: {
    color: '#208AEF',
    fontWeight: '800',
  },

  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF0F3',
  },

  mainCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mainIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#EAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ECFDF3',
    borderRadius: 20,
  },

  trendText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },

  cardLabel: {
    marginTop: 20,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },

  mainAmount: {
    fontSize: 29,
    fontWeight: '900',
    color: '#111827',
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF0F3',
    marginVertical: 18,
  },

  mainBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  smallLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },

  profitAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
  },

  marginContainer: {
    alignItems: 'flex-end',
  },

  marginValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#208AEF',
  },

  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF0F3',
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  statValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '800',
    marginTop: 5,
  },

  statSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 3,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 17,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    marginBottom: 14,
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  infoValue: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '800',
    marginTop: 2,
  },

  infoDescription: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },

  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8ED',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE7C2',
  },

  warningCardSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },

  warningIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  warningIconSuccess: {
    backgroundColor: '#DCFCE7',
  },

  warningContent: {
    flex: 1,
  },

  warningTitle: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '800',
  },

  warningDescription: {
    fontSize: 11,
    color: '#A16207',
    marginTop: 4,
    lineHeight: 16,
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    overflow: 'hidden',
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },

  lastActivityRow: {
    borderBottomWidth: 0,
  },

  dateBadge: {
    width: 44,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#EAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  dateDay: {
    fontSize: 17,
    fontWeight: '900',
    color: '#208AEF',
  },

  dateMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5B9DDD',
    textTransform: 'uppercase',
  },

  activityInfo: {
    flex: 1,
    paddingRight: 8,
  },

  activityDate: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  activityLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },

  activityAmount: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '800',
  },

  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 35,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    marginTop: 10,
  },

  emptyText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 5,
  },

  footerNote: {
    paddingTop: 18,
    paddingHorizontal: 10,
  },

  footerNoteText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    lineHeight: 15,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6F8',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F5F6F8',
  },

  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  errorText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 13,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});