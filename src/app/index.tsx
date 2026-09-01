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
  getDashboardStats,
} from '../services/dashboardService';
import {
  DashboardStats,
} from '../models/dashboard';
import {
  getCommandeStats,
} from '../services/commandeService';

import {
  getGlobalFactureStats,
} from '../services/factureService';

export default function HomeScreen() {

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

      console.error(
        'Erreur chargement dashboard :',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger le tableau de bord.'
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = async () => {

    setRefreshing(true);

    await loadDashboard();

  };

  const deliveryPercent = useMemo(() => {

    if (!stats || stats.nombreCommandes === 0) {
      return 0;
    }

    return Math.round(
      (stats.nombreCommandesLivrees /
        stats.nombreCommandes) *
        100
    );

  }, [stats]);

  if (loading) {

    return (
      <View style={styles.center}>

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Chargement du tableau de bord...
        </Text>

      </View>
    );

  }

  if (error || !stats) {

    return (
      <View style={styles.center}>

        <Text style={styles.errorTitle}>
          Impossible de charger le dashboard
        </Text>

        <Text style={styles.errorText}>
          {error ?? 'Erreur inconnue'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadDashboard}
        >
          <Text style={styles.retryText}>
            Réessayer
          </Text>
        </Pressable>

      </View>
    );

  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >

      {/* HEADER */}

      <View style={styles.header}>

        <View>

          <Text style={styles.eyebrow}>
            PILOTAGE COMMERCIAL
          </Text>

          <Text style={styles.title}>
            Vue globale
          </Text>

          <Text style={styles.subtitle}>
            Suivi des ventes, livraisons,
            factures et clients.
          </Text>

        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={loadDashboard}
        >
          <Text style={styles.refreshText}>
            ↻
          </Text>
        </Pressable>

      </View>


      {/* KPI */}

      <View style={styles.kpiGrid}>

        <Pressable
          style={styles.kpiCard}
          onPress={() => router.push('/commandes')}
        >

          <Text style={styles.kpiIcon}>
            📦
          </Text>

          <Text style={styles.kpiLabel}>
            Commandes
          </Text>

          <Text style={styles.kpiValue}>
            {stats.nombreCommandes.toLocaleString()}
          </Text>

        </Pressable>


        <Pressable
          style={styles.kpiCard}
          onPress={() => router.push('/clients')}
        >

          <Text style={styles.kpiIcon}>
            👤
          </Text>

          <Text style={styles.kpiLabel}>
            Clients
          </Text>

          <Text style={styles.kpiValue}>
            {stats.nombreClients.toLocaleString()}
          </Text>

        </Pressable>


        <Pressable
          style={styles.kpiCard}
        >

          <Text style={styles.kpiIcon}>
            🚚
          </Text>

          <Text style={styles.kpiLabel}>
            Livraisons
          </Text>

          <Text style={styles.kpiValue}>
            {stats.nombreCommandesLivrees.toLocaleString()}
          </Text>

        </Pressable>


        <Pressable
          style={styles.kpiCard}
          onPress={() => router.push('/factures')}
        >

          <Text style={styles.kpiIcon}>
            🧾
          </Text>

          <Text style={styles.kpiLabel}>
            Factures
          </Text>

          <Text style={styles.kpiValue}>
            {stats.nombreFactures.toLocaleString()}
          </Text>

        </Pressable>


        <View style={styles.kpiCardWide}>

          <Text style={styles.kpiIcon}>
            💰
          </Text>

          <View>

            <Text style={styles.kpiLabel}>
              Impayés
            </Text>

            <Text style={styles.kpiValue}>
              {stats.montantFacturesNonPayees.toLocaleString()} FCFA
            </Text>

          </View>

        </View>

      </View>


      {/* LIVRAISONS */}

      <View style={styles.panel}>

        <View style={styles.panelHeader}>

          <View>

            <Text style={styles.panelEyebrow}>
              LIVRAISON
            </Text>

            <Text style={styles.panelTitle}>
              Taux de commandes livrées
            </Text>

          </View>

          <Text style={styles.percent}>
            {deliveryPercent}%
          </Text>

        </View>


        <View style={styles.progressContainer}>

          <View style={styles.progressBackground}>

            <View
              style={[
                styles.progressValue,
                {
                  width: `${deliveryPercent}%`,
                },
              ]}
            />

          </View>

        </View>


        <View style={styles.deliveryStats}>

          <View>

            <Text style={styles.deliveryNumber}>
              {stats.nombreCommandesLivrees}
            </Text>

            <Text style={styles.deliveryLabel}>
              Livraisons effectuées
            </Text>

          </View>

          <View>

            <Text style={styles.deliveryNumber}>
              {stats.nombreCommandesNonLivrees}
            </Text>

            <Text style={styles.deliveryLabel}>
              Non livrées
            </Text>

          </View>

        </View>

      </View>


      {/* RACCOURCIS */}

      <View style={styles.panel}>

        <Text style={styles.panelEyebrow}>
          ACCÈS RAPIDE
        </Text>

        <Text style={styles.panelTitle}>
          Gestion
        </Text>


        <View style={styles.quickActions}>

          <Pressable
            style={styles.quickButton}
            onPress={() => router.push('/clients')}
          >

            <Text style={styles.quickIcon}>
              👥
            </Text>

            <Text style={styles.quickText}>
              Clients
            </Text>

          </Pressable>


          <Pressable
            style={styles.quickButton}
            onPress={() => router.push('/commandes')}
          >

            <Text style={styles.quickIcon}>
              📦
            </Text>

            <Text style={styles.quickText}>
              Commandes
            </Text>

          </Pressable>


          <Pressable
            style={styles.quickButton}
            onPress={() => router.push('/factures')}
          >

            <Text style={styles.quickIcon}>
              🧾
            </Text>

            <Text style={styles.quickText}>
              Factures
            </Text>

          </Pressable>


          <Pressable
            style={styles.quickButton}
            onPress={() => router.push('/statistiques')}
          >

            <Text style={styles.quickIcon}>
              📊
            </Text>

            <Text style={styles.quickText}>
              Statistiques
            </Text>

          </Pressable>

        </View>

      </View>


      {/* RESUME */}

      <View style={styles.panel}>

        <Text style={styles.panelEyebrow}>
          RÉSUMÉ
        </Text>

        <Text style={styles.panelTitle}>
          Activité actuelle
        </Text>


        <View style={styles.summaryRow}>

          <Text style={styles.summaryLabel}>
            Commandes
          </Text>

          <Text style={styles.summaryValue}>
            {stats.nombreCommandes}
          </Text>

        </View>


        <View style={styles.summaryRow}>

          <Text style={styles.summaryLabel}>
            Clients
          </Text>

          <Text style={styles.summaryValue}>
            {stats.nombreClients}
          </Text>

        </View>


        <View style={styles.summaryRow}>

          <Text style={styles.summaryLabel}>
            Factures
          </Text>

          <Text style={styles.summaryValue}>
            {stats.nombreFactures}
          </Text>

        </View>


        <View style={styles.summaryRow}>

          <Text style={styles.summaryLabel}>
            Factures impayées
          </Text>

          <Text style={styles.summaryValue}>
            {stats.montantFacturesNonPayees.toLocaleString()} FCFA
          </Text>

        </View>

      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
  },

  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 5,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6b7280',
    maxWidth: 600,
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  refreshText: {
    fontSize: 26,
    color: '#2563eb',
  },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 15,
  },

  kpiCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 150,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  kpiCardWide: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  kpiIcon: {
    fontSize: 25,
    marginBottom: 10,
  },

  kpiLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 5,
  },

  kpiValue: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
  },

  panel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  panelEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 5,
  },

  panelTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },

  percent: {
    fontSize: 28,
    fontWeight: '800',
    color: '#16a34a',
  },

  progressContainer: {
    marginTop: 25,
  },

  progressBackground: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },

  progressValue: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: '#22c55e',
  },

  deliveryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  deliveryNumber: {
    fontSize: 22,
    fontWeight: '800',
  },

  deliveryLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 3,
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },

  quickButton: {
    flexGrow: 1,
    flexBasis: '40%',
    minWidth: 130,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    alignItems: 'center',
  },

  quickIcon: {
    fontSize: 24,
    marginBottom: 6,
  },

  quickText: {
    fontWeight: '600',
    color: '#374151',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  summaryLabel: {
    color: '#6b7280',
  },

  summaryValue: {
    fontWeight: '700',
    color: '#111827',
  },

});