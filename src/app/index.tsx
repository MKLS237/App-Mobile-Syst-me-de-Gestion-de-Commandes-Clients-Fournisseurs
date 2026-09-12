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
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react-native';

import { getDashboardStats } from '../services/dashboardService';
import { DashboardStats } from '../models/dashboard';

/* ============================================================
   HELPERS
============================================================ */

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value || 0);
};

const formatMoney = (value: number) => {
  return `${new Intl.NumberFormat('fr-FR').format(value || 0)} FCFA`;
};

/* ============================================================
   DASHBOARD
============================================================ */

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);

      const data = await getDashboardStats();

      setStats(data);
    } catch (err) {
      console.error('Erreur dashboard :', err);

      setError(
        "Impossible de récupérer les données du tableau de bord."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  /* ============================================================
     CALCULS
  ============================================================ */

  const deliveryPercent = useMemo(() => {
    if (!stats || stats.nombreCommandes === 0) {
      return 0;
    }

    return Math.round(
      (stats.nombreCommandesLivrees / stats.nombreCommandes) * 100
    );
  }, [stats]);

  const pendingPercent = useMemo(() => {
    if (!stats || stats.nombreCommandes === 0) {
      return 0;
    }

    return Math.round(
      (stats.nombreCommandesNonLivrees / stats.nombreCommandes) * 100
    );
  }, [stats]);

  const hasUnpaidInvoices =
    !!stats && stats.montantFacturesNonPayees > 0;

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogo}>
          <BarChart3 size={30} color="#2563EB" />
        </View>

        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={styles.loadingSpinner}
        />

        <Text style={styles.loadingTitle}>
          Chargement du dashboard
        </Text>

        <Text style={styles.loadingText}>
          Récupération des données...
        </Text>
      </View>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !stats) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <AlertCircle size={32} color="#DC2626" />
        </View>

        <Text style={styles.errorTitle}>
          Dashboard indisponible
        </Text>

        <Text style={styles.errorText}>
          {error ||
            "Les données du tableau de bord ne sont pas disponibles."}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
          onPress={loadDashboard}
        >
          <RefreshCw size={18} color="#FFFFFF" />

          <Text style={styles.retryButtonText}>
            Réessayer
          </Text>
        </Pressable>
      </View>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2563EB']}
          tintColor="#2563EB"
        />
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.eyebrow}>
            PILOTAGE COMMERCIAL
          </Text>

          <Text style={styles.title}>
            Vue globale
          </Text>

          <Text style={styles.subtitle}>
            Suivez les performances de votre activité en un coup d'œil.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.pressed,
          ]}
          onPress={handleRefresh}
        >
          <RefreshCw
            size={19}
            color="#2563EB"
          />
        </Pressable>
      </View>

      {/* ======================================================
          HERO PERFORMANCE
      ====================================================== */}

      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroHeaderText}>
            <View style={styles.heroLabelRow}>
              <TrendingUp
                size={15}
                color="#93C5FD"
              />

              <Text style={styles.heroLabel}>
                PERFORMANCE GLOBALE
              </Text>
            </View>

            <Text style={styles.heroTitle}>
              Activité commerciale
            </Text>

            <Text style={styles.heroSubtitle}>
              Une vision claire de vos opérations.
            </Text>
          </View>

          <View style={styles.heroIcon}>
            <BarChart3
              size={25}
              color="#BFDBFE"
            />
          </View>
        </View>

        <View style={styles.heroSeparator} />

        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>
              {formatNumber(stats.nombreCommandes)}
            </Text>

            <Text style={styles.heroMetricLabel}>
              Commandes
            </Text>
          </View>

          <View style={styles.heroVerticalSeparator} />

          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>
              {deliveryPercent}%
            </Text>

            <Text style={styles.heroMetricLabel}>
              Taux de livraison
            </Text>
          </View>

          <View style={styles.heroVerticalSeparator} />

          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>
              {formatNumber(stats.nombreClients)}
            </Text>

            <Text style={styles.heroMetricLabel}>
              Clients
            </Text>
          </View>
        </View>
      </View>

      {/* ======================================================
          KPI
      ====================================================== */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Indicateurs clés
          </Text>

          <Text style={styles.sectionSubtitle}>
            Les chiffres essentiels de votre activité
          </Text>
        </View>
      </View>

      <View style={styles.kpiGrid}>
        <KpiCard
          icon={
            <ShoppingCart
              size={21}
              color="#2563EB"
            />
          }
          iconBackground="#EFF6FF"
          label="Commandes"
          value={formatNumber(stats.nombreCommandes)}
          description="Total enregistré"
          onPress={() => router.push('/commandes')}
        />

        <KpiCard
          icon={
            <Users
              size={21}
              color="#7C3AED"
            />
          }
          iconBackground="#F5F3FF"
          label="Clients"
          value={formatNumber(stats.nombreClients)}
          description="Clients enregistrés"
          onPress={() => router.push('/clients')}
        />

        <KpiCard
          icon={
            <Package
              size={21}
              color="#059669"
            />
          }
          iconBackground="#ECFDF5"
          label="Livraisons"
          value={formatNumber(stats.nombreCommandesLivrees)}
          description={`${deliveryPercent}% des commandes`}
          onPress={() => router.push('/commandes')}
        />

        <KpiCard
          icon={
            <FileText
              size={21}
              color="#EA580C"
            />
          }
          iconBackground="#FFF7ED"
          label="Factures"
          value={formatNumber(stats.nombreFactures)}
          description="Factures générées"
          onPress={() => router.push('/factures')}
        />
      </View>

      {/* ======================================================
          FINANCE
      ====================================================== */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Situation financière
          </Text>

          <Text style={styles.sectionSubtitle}>
            Suivez les montants restant à encaisser
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.financeCard,
          pressed && styles.pressed,
        ]}
        onPress={() =>
          router.push('/statistiques/factures')
        }
      >
        <View style={styles.financeHeader}>
          <View style={styles.financeIcon}>
            <WalletCards
              size={23}
              color="#2563EB"
            />
          </View>

          <View
            style={[
              styles.financeStatus,
              hasUnpaidInvoices
                ? styles.financeStatusWarning
                : styles.financeStatusSuccess,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                hasUnpaidInvoices
                  ? styles.warningDot
                  : styles.successDot,
              ]}
            />

            <Text
              style={[
                styles.financeStatusText,
                hasUnpaidInvoices
                  ? styles.warningText
                  : styles.successText,
              ]}
            >
              {hasUnpaidInvoices
                ? 'À surveiller'
                : 'Aucun impayé'}
            </Text>
          </View>
        </View>

        <Text style={styles.financeLabel}>
          FACTURES IMPAYÉES
        </Text>

        <Text style={styles.financeAmount}>
          {formatMoney(
            stats.montantFacturesNonPayees
          )}
        </Text>

        <View style={styles.financeFooter}>
          <Text style={styles.financeDescription}>
            Montant restant à encaisser
          </Text>

          <View style={styles.financeLink}>
            <Text style={styles.financeLinkText}>
              Détails
            </Text>

            <ArrowRight
              size={16}
              color="#2563EB"
            />
          </View>
        </View>
      </Pressable>

      {/* ======================================================
          LIVRAISONS
      ====================================================== */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Suivi des livraisons
          </Text>

          <Text style={styles.sectionSubtitle}>
            État actuel des commandes
          </Text>
        </View>

        <Pressable
          style={styles.viewLink}
          onPress={() => router.push('/commandes')}
        >
          <Text style={styles.viewLinkText}>
            Voir
          </Text>

          <ChevronRight
            size={16}
            color="#2563EB"
          />
        </Pressable>
      </View>

      <View style={styles.deliveryCard}>
        <View style={styles.deliveryHeader}>
          <View>
            <Text style={styles.deliveryTitle}>
              Taux de livraison
            </Text>

            <Text style={styles.deliverySubtitle}>
              {formatNumber(
                stats.nombreCommandesLivrees
              )}{' '}
              livrées sur{' '}
              {formatNumber(
                stats.nombreCommandes
              )}
            </Text>
          </View>

          <Text style={styles.deliveryPercent}>
            {deliveryPercent}%
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${deliveryPercent}%`,
              },
            ]}
          />
        </View>

        <View style={styles.deliveryStats}>
          <View style={styles.deliveryStat}>
            <View
              style={[
                styles.deliveryStatIcon,
                styles.successBackground,
              ]}
            >
              <CheckCircle2
                size={17}
                color="#059669"
              />
            </View>

            <View>
              <Text style={styles.deliveryStatValue}>
                {formatNumber(
                  stats.nombreCommandesLivrees
                )}
              </Text>

              <Text style={styles.deliveryStatLabel}>
                Livrées
              </Text>
            </View>
          </View>

          <View style={styles.deliveryStat}>
            <View
              style={[
                styles.deliveryStatIcon,
                styles.pendingBackground,
              ]}
            >
              <Clock3
                size={17}
                color="#D97706"
              />
            </View>

            <View>
              <Text style={styles.deliveryStatValue}>
                {formatNumber(
                  stats.nombreCommandesNonLivrees
                )}
              </Text>

              <Text style={styles.deliveryStatLabel}>
                Non livrées
              </Text>
            </View>
          </View>

          <View style={styles.deliveryRemaining}>
            <Text style={styles.deliveryRemainingValue}>
              {pendingPercent}%
            </Text>

            <Text style={styles.deliveryStatLabel}>
              Restant
            </Text>
          </View>
        </View>
      </View>

      {/* ======================================================
          ACCÈS RAPIDES
      ====================================================== */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Accès rapides
          </Text>

          <Text style={styles.sectionSubtitle}>
            Les fonctionnalités principales
          </Text>
        </View>
      </View>

      <View style={styles.quickActionsCard}>
        <QuickAction
          icon={
            <UserRound
              size={20}
              color="#2563EB"
            />
          }
          background="#EFF6FF"
          title="Clients"
          description="Gérer les clients"
          onPress={() => router.push('/clients')}
        />

        <QuickAction
          icon={
            <ShoppingCart
              size={20}
              color="#7C3AED"
            />
          }
          background="#F5F3FF"
          title="Commandes"
          description="Créer et suivre les commandes"
          onPress={() => router.push('/commandes')}
        />

        <QuickAction
          icon={
            <FileText
              size={20}
              color="#EA580C"
            />
          }
          background="#FFF7ED"
          title="Factures"
          description="Consulter les factures"
          onPress={() => router.push('/factures')}
        />

        <QuickAction
          icon={
            <BarChart3
              size={20}
              color="#059669"
            />
          }
          background="#ECFDF5"
          title="Statistiques"
          description="Analyser les performances"
          onPress={() =>
            router.push('/statistiques/factures')
          }
        />
      </View>

      {/* ======================================================
          POINTS D'ATTENTION
      ====================================================== */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Points d'attention
          </Text>

          <Text style={styles.sectionSubtitle}>
            Les éléments à surveiller
          </Text>
        </View>
      </View>

      <View style={styles.attentionCard}>
        {/* IMPAYÉS */}

        <View style={styles.attentionItem}>
          <View
            style={[
              styles.attentionIcon,
              hasUnpaidInvoices
                ? styles.warningBackground
                : styles.successBackground,
            ]}
          >
            {hasUnpaidInvoices ? (
              <WalletCards
                size={19}
                color="#D97706"
              />
            ) : (
              <CheckCircle2
                size={19}
                color="#059669"
              />
            )}
          </View>

          <View style={styles.attentionContent}>
            <Text style={styles.attentionTitle}>
              {hasUnpaidInvoices
                ? 'Factures impayées'
                : 'Situation financière à jour'}
            </Text>

            <Text style={styles.attentionText}>
              {hasUnpaidInvoices
                ? `${formatMoney(
                    stats.montantFacturesNonPayees
                  )} restent à encaisser.`
                : 'Aucun montant impayé détecté.'}
            </Text>
          </View>

          {hasUnpaidInvoices && (
            <Pressable
              onPress={() =>
                router.push('/statistiques/factures')
              }
            >
              <ChevronRight
                size={20}
                color="#94A3B8"
              />
            </Pressable>
          )}
        </View>

        <View style={styles.attentionSeparator} />

        {/* COMMANDES */}

        <View style={styles.attentionItem}>
          <View
            style={[
              styles.attentionIcon,
              styles.warningBackground,
            ]}
          >
            <Clock3
              size={19}
              color="#D97706"
            />
          </View>

          <View style={styles.attentionContent}>
            <Text style={styles.attentionTitle}>
              Commandes non livrées
            </Text>

            <Text style={styles.attentionText}>
              {formatNumber(
                stats.nombreCommandesNonLivrees
              )}{' '}
              commande(s) restent à traiter.
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/commandes')}
          >
            <ChevronRight
              size={20}
              color="#94A3B8"
            />
          </Pressable>
        </View>
      </View>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>
          Gestion Clients & Commandes
        </Text>

        <Text style={styles.footerText}>
          Actualisez le dashboard pour synchroniser les dernières données.
        </Text>
      </View>
    </ScrollView>
  );
}

/* ============================================================
   KPI CARD
============================================================ */

function KpiCard({
  icon,
  iconBackground,
  label,
  value,
  description,
  onPress,
}: {
  icon: React.ReactNode;
  iconBackground: string;
  label: string;
  value: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.kpiCard,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.kpiTop}>
        <View
          style={[
            styles.kpiIcon,
            {
              backgroundColor: iconBackground,
            },
          ]}
        >
          {icon}
        </View>

        <ChevronRight
          size={17}
          color="#CBD5E1"
        />
      </View>

      <Text style={styles.kpiLabel}>
        {label}
      </Text>

      <Text style={styles.kpiValue}>
        {value}
      </Text>

      <Text style={styles.kpiDescription}>
        {description}
      </Text>
    </Pressable>
  );
}

/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  icon,
  background,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode;
  background: string;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.quickActionIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>
          {title}
        </Text>

        <Text style={styles.quickActionDescription}>
          {description}
        </Text>
      </View>

      <ChevronRight
        size={18}
        color="#94A3B8"
      />
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 50,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },

  /* ==========================================================
     LOADING
  ========================================================== */

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  loadingLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingSpinner: {
    marginTop: 20,
  },

  loadingTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  loadingText: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
  },

  /* ==========================================================
     ERROR
  ========================================================== */

  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorTitle: {
    marginTop: 18,
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },

  errorText: {
    marginTop: 8,
    maxWidth: 420,
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 22,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 15,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#2563EB',
    marginBottom: 5,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },

  refreshButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  /* ==========================================================
     HERO
  ========================================================== */

  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
    marginBottom: 28,
    overflow: 'hidden',
  },

  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  heroHeaderText: {
    flex: 1,
    paddingRight: 15,
  },

  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: '#93C5FD',
  },

  heroTitle: {
    marginTop: 7,
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  heroSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: '#94A3B8',
  },

  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroSeparator: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 21,
  },

  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroMetric: {
    flex: 1,
  },

  heroMetricValue: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  heroMetricLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#94A3B8',
  },

  heroVerticalSeparator: {
    width: 1,
    height: 34,
    backgroundColor: '#334155',
    marginHorizontal: 15,
  },

  /* ==========================================================
     SECTIONS
  ========================================================== */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  /* ==========================================================
     KPI
  ========================================================== */

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },

  kpiCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  kpiLabel: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  kpiValue: {
    marginTop: 3,
    fontSize: 25,
    fontWeight: '900',
    color: '#0F172A',
  },

  kpiDescription: {
    marginTop: 4,
    fontSize: 11,
    color: '#94A3B8',
  },

  /* ==========================================================
     FINANCE
  ========================================================== */

  financeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 28,
  },

  financeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  financeIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  financeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  financeStatusWarning: {
    backgroundColor: '#FFFBEB',
  },

  financeStatusSuccess: {
    backgroundColor: '#ECFDF5',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  warningDot: {
    backgroundColor: '#F59E0B',
  },

  successDot: {
    backgroundColor: '#10B981',
  },

  financeStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  warningText: {
    color: '#B45309',
  },

  successText: {
    color: '#047857',
  },

  financeLabel: {
    marginTop: 22,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#64748B',
  },

  financeAmount: {
    marginTop: 5,
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
  },

  financeFooter: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  financeDescription: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
  },

  financeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  financeLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  /* ==========================================================
     DELIVERY
  ========================================================== */

  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 5,
  },

  viewLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 28,
  },

  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  deliveryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  deliverySubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
  },

  deliveryPercent: {
    fontSize: 25,
    fontWeight: '900',
    color: '#059669',
  },

  progressTrack: {
    height: 10,
    marginTop: 18,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#10B981',
  },

  deliveryStats: {
    marginTop: 19,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  deliveryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  deliveryStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successBackground: {
    backgroundColor: '#D1FAE5',
  },

  warningBackground: {
    backgroundColor: '#FEF3C7',
  },

  pendingBackground: {
    backgroundColor: '#FEF3C7',
  },

  deliveryStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  deliveryStatLabel: {
    marginTop: 2,
    fontSize: 10,
    color: '#64748B',
  },

  deliveryRemaining: {
    alignItems: 'flex-end',
  },

  deliveryRemainingValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D97706',
  },

  /* ==========================================================
     QUICK ACTIONS
  ========================================================== */

  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 28,
  },

  quickAction: {
    minHeight: 72,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickActionContent: {
    flex: 1,
    marginLeft: 13,
  },

  quickActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  quickActionDescription: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
  },

  /* ==========================================================
     ATTENTION
  ========================================================== */

  attentionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 17,
    marginBottom: 30,
  },

  attentionItem: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  attentionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  attentionContent: {
    flex: 1,
  },

  attentionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  attentionText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
  },

  attentionSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  /* ==========================================================
     FOOTER
  ========================================================== */

  footer: {
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 15,
  },

  footerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },

  footerText: {
    marginTop: 4,
    fontSize: 10,
    color: '#CBD5E1',
    textAlign: 'center',
  },
});