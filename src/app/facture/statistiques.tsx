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
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  PieChart,
  RefreshCw,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-react-native';

import { getFactureStats } from '../../services/factureService';
import { FactureStats } from '../../models/facture';

export default function StatistiquesFacturesScreen() {
  const router = useRouter();

  const [stats, setStats] = useState<FactureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setError(null);

      const data = await getFactureStats();

      setStats(data);
    } catch (err) {
      console.error('Erreur chargement statistiques factures:', err);
      setError(
        'Impossible de récupérer les statistiques des factures.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
  };

  const formatMoney = (value: number | undefined | null) => {
    if (value === undefined || value === null) {
      return '0 FCFA';
    }

    return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`;
  };

  const getPercentage = (value: number, total: number) => {
    if (!total || total === 0) {
      return 0;
    }

    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <BarChart3 size={32} color="#2563EB" />
        </View>

        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={{ marginTop: 20 }}
        />

        <Text style={styles.loadingTitle}>
          Chargement des statistiques
        </Text>

        <Text style={styles.loadingText}>
          Récupération des données des factures...
        </Text>
      </View>
    );
  }

  const nombreTotal = stats?.nombreTotal ?? 0;
  const montantTotalFactures = stats?.montantTotalFactures ?? 0;
  const montantTotalPayees = stats?.montantTotalPayees ?? 0;
  const montantTotalNonPayees = stats?.montantTotalNonPayees ?? 0;
  const montantTotalPartiellementPayees =
    stats?.montantTotalPartiellementPayees ?? 0;

  const tauxPaiement = getPercentage(
    montantTotalPayees,
    montantTotalFactures
  );

  const tauxNonPaiement = getPercentage(
    montantTotalNonPayees,
    montantTotalFactures
  );

  const tauxPartiel = getPercentage(
    montantTotalPartiellementPayees,
    montantTotalFactures
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Statistiques
          </Text>

          <Text style={styles.headerSubtitle}>
            Analyse des factures
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.8}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <RefreshCw size={20} color="#2563EB" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563EB']}
          />
        }
      >
        {/* ERREUR */}
        {error && (
          <View style={styles.errorCard}>
            <XCircle size={22} color="#DC2626" />

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                Erreur
              </Text>

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadStats}
            >
              <Text style={styles.retryText}>
                Réessayer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* INTRO */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <BarChart3 size={28} color="#2563EB" />
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              Vue d'ensemble
            </Text>

            <Text style={styles.introText}>
              Suivez rapidement la situation financière
              de vos factures.
            </Text>
          </View>
        </View>

        {/* TOTAL FACTURES */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardTop}>
            <View style={styles.mainIcon}>
              <FileText size={28} color="#2563EB" />
            </View>

            <View style={styles.mainLabelContainer}>
              <Text style={styles.mainLabel}>
                TOTAL DES FACTURES
              </Text>

              <Text style={styles.mainNumber}>
                {nombreTotal}
              </Text>
            </View>
          </View>

          <View style={styles.mainDivider} />

          <View style={styles.mainAmountRow}>
            <Text style={styles.mainAmountLabel}>
              Montant total facturé
            </Text>

            <Text style={styles.mainAmount}>
              {formatMoney(montantTotalFactures)}
            </Text>
          </View>
        </View>

        {/* CARDS FINANCIÈRES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Situation financière
          </Text>

          <CircleDollarSign
            size={20}
            color="#6B7280"
          />
        </View>

        <View style={styles.cardsGrid}>
          {/* PAYÉES */}
          <View
            style={[
              styles.statCard,
              styles.paidCard,
            ]}
          >
            <View style={styles.statIconContainer}>
              <CheckCircle2
                size={24}
                color="#16A34A"
              />
            </View>

            <Text style={styles.statTitle}>
              PAYÉES
            </Text>

            <Text style={styles.statAmount}>
              {formatMoney(montantTotalPayees)}
            </Text>

            <View style={styles.percentageRow}>
              <TrendingUp
                size={15}
                color="#16A34A"
              />

              <Text style={styles.paidPercentage}>
                {tauxPaiement}%
              </Text>
            </View>
          </View>

          {/* NON PAYÉES */}
          <View
            style={[
              styles.statCard,
              styles.unpaidCard,
            ]}
          >
            <View style={styles.statIconContainer}>
              <XCircle
                size={24}
                color="#DC2626"
              />
            </View>

            <Text style={styles.statTitle}>
              NON PAYÉES
            </Text>

            <Text style={styles.statAmount}>
              {formatMoney(montantTotalNonPayees)}
            </Text>

            <View style={styles.percentageRow}>
              <Wallet
                size={15}
                color="#DC2626"
              />

              <Text style={styles.unpaidPercentage}>
                {tauxNonPaiement}%
              </Text>
            </View>
          </View>
        </View>

        {/* PARTIELLEMENT PAYÉES */}
        <View
          style={[
            styles.partialCard,
          ]}
        >
          <View style={styles.partialLeft}>
            <View style={styles.partialIcon}>
              <CircleDollarSign
                size={25}
                color="#D97706"
              />
            </View>

            <View>
              <Text style={styles.partialTitle}>
                PARTIELLEMENT PAYÉES
              </Text>

              <Text style={styles.partialSubtitle}>
                Paiements en cours
              </Text>
            </View>
          </View>

          <View style={styles.partialRight}>
            <Text style={styles.partialAmount}>
              {formatMoney(
                montantTotalPartiellementPayees
              )}
            </Text>

            <Text style={styles.partialPercentage}>
              {tauxPartiel}%
            </Text>
          </View>
        </View>

        {/* RÉPARTITION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Répartition
          </Text>

          <PieChart
            size={20}
            color="#6B7280"
          />
        </View>

        <View style={styles.distributionCard}>
          {/* PAYÉES */}
          <View style={styles.distributionRow}>
            <View style={styles.distributionLabel}>
              <View
                style={[
                  styles.dot,
                  styles.dotPaid,
                ]}
              />

              <Text style={styles.distributionText}>
                Payées
              </Text>
            </View>

            <Text style={styles.distributionValue}>
              {tauxPaiement}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressPaid,
                {
                  width: `${Math.min(
                    tauxPaiement,
                    100
                  )}%`,
                },
              ]}
            />
          </View>

          {/* PARTIELLES */}
          <View style={styles.distributionRow}>
            <View style={styles.distributionLabel}>
              <View
                style={[
                  styles.dot,
                  styles.dotPartial,
                ]}
              />

              <Text style={styles.distributionText}>
                Partiellement payées
              </Text>
            </View>

            <Text style={styles.distributionValue}>
              {tauxPartiel}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressPartial,
                {
                  width: `${Math.min(
                    tauxPartiel,
                    100
                  )}%`,
                },
              ]}
            />
          </View>

          {/* NON PAYÉES */}
          <View style={styles.distributionRow}>
            <View style={styles.distributionLabel}>
              <View
                style={[
                  styles.dot,
                  styles.dotUnpaid,
                ]}
              />

              <Text style={styles.distributionText}>
                Non payées
              </Text>
            </View>

            <Text style={styles.distributionValue}>
              {tauxNonPaiement}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressUnpaid,
                {
                  width: `${Math.min(
                    tauxNonPaiement,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* RÉSUMÉ */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <TrendingUp
              size={21}
              color="#2563EB"
            />

            <Text style={styles.summaryTitle}>
              Résumé financier
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Total facturé
            </Text>

            <Text style={styles.summaryValue}>
              {formatMoney(montantTotalFactures)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Total encaissé
            </Text>

            <Text
              style={[
                styles.summaryValue,
                styles.summaryPaid,
              ]}
            >
              {formatMoney(montantTotalPayees)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Reste non encaissé
            </Text>

            <Text
              style={[
                styles.summaryValue,
                styles.summaryUnpaid,
              ]}
            >
              {formatMoney(
                montantTotalFactures -
                  montantTotalPayees
              )}
            </Text>
          </View>
        </View>

        {/* BOUTON FACTURES */}
        <TouchableOpacity
          style={styles.facturesButton}
          activeOpacity={0.85}
          onPress={() => router.push('/factures')}
        >
          <FileText
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.facturesButtonText}>
            Voir toutes les factures
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  loadingText: {
    marginTop: 7,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: 16,
  },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 13,
    marginBottom: 14,
  },

  errorContent: {
    flex: 1,
    marginLeft: 10,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },

  errorText: {
    marginTop: 2,
    fontSize: 12,
    color: '#B91C1C',
  },

  retryButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: '#DC2626',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  introContent: {
    flex: 1,
    marginLeft: 13,
  },

  introTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  introText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 19,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  mainCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mainIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainLabelContainer: {
    marginLeft: 14,
  },

  mainLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },

  mainNumber: {
    marginTop: 3,
    fontSize: 29,
    fontWeight: '900',
    color: '#111827',
  },

  mainDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 17,
  },

  mainAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  mainAmountLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  mainAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  cardsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
  },

  paidCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },

  unpaidCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  statIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  statTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
  },

  statAmount: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  paidPercentage: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },

  unpaidPercentage: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#B91C1C',
  },

  partialCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  partialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  partialIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  partialTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },

  partialSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#A16207',
  },

  partialRight: {
    alignItems: 'flex-end',
  },

  partialAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#78350F',
  },

  partialPercentage: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },

  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 22,
  },

  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },

  dotPaid: {
    backgroundColor: '#16A34A',
  },

  dotPartial: {
    backgroundColor: '#D97706',
  },

  dotUnpaid: {
    backgroundColor: '#DC2626',
  },

  distributionText: {
    fontSize: 13,
    color: '#374151',
  },

  distributionValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },

  progressPaid: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 10,
  },

  progressPartial: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 10,
  },

  progressUnpaid: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 10,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  summaryTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  summaryPaid: {
    color: '#16A34A',
  },

  summaryUnpaid: {
    color: '#DC2626',
  },

  facturesButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  facturesButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 30,
  },
});