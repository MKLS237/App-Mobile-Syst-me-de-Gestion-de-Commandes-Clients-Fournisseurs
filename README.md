# 📱 Gestion Commandes Mobile

Application mobile de **gestion des clients, commandes et factures**, développée avec **React Native + Expo + TypeScript**.

L'application constitue le frontend mobile du système de gestion de commandes et communique avec une API REST développée avec **Spring Boot**, déployée en ligne.

---

## 📌 Présentation

**Gestion Commandes Mobile** permet de suivre et gérer depuis un smartphone :

* 👥 Les clients
* 📦 Les commandes
* 🧾 Les factures
* 📊 Les statistiques
* 🚚 Les livraisons
* 💰 Les montants d'achat et facturation

L'objectif est de proposer une interface mobile moderne, simple et responsive permettant d'accéder aux données du système depuis n'importe où.

---

# 🛠️ Technologies utilisées

## Frontend mobile

* **React Native**
* **Expo**
* **Expo Router**
* **TypeScript**
* **React Native Web**
* **React Hooks**
* **Fetch API**

## Backend

L'application communique avec une API REST développée avec :

* **Java**
* **Spring Boot**
* **Spring Data JPA**
* **PostgreSQL**
* **REST API**

## Déploiement

* **GitHub** — gestion du code source
* **EAS Build** — génération des applications Android/iOS
* **EAS Update** — publication des mises à jour OTA
* **Render** — hébergement de l'API backend

---

# 🏗️ Architecture

L'application suit une architecture séparant l'interface utilisateur, les modèles et les services API.

```text
React Native / Expo
        │
        ▼
   Expo Router
        │
        ▼
      Screens
        │
        ▼
     Services
        │
        ▼
     REST API
        │
        ▼
   Spring Boot
        │
        ▼
    PostgreSQL
```

---

# 📂 Structure du projet

```text
GestionCommandesMobile/
│
├── assets/
│
├── scripts/
│
├── src/
│   │
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── clients.tsx
│   │   ├── commandes.tsx
│   │   ├── factures.tsx
│   │   ├── statistiques.tsx
│   │   │
│   │   └── client/
│   │       ├── [id].tsx
│   │       ├── create.tsx
│   │       └── edit.tsx
│   │
│   ├── components/
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   └── MenuDrawer.tsx
│   │
│   ├── constants/
│   │   └── api.ts
│   │
│   ├── models/
│   │   ├── clients.ts
│   │   └── dashboard.ts
│   │
│   ├── services/
│   │   ├── clientService.ts
│   │   ├── commandeService.ts
│   │   ├── dashboardService.ts
│   │   └── factureService.ts
│   │
│   └── global.css
│
├── app.json
├── eas.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

# 🧭 Navigation

L'application utilise **Expo Router**.

Le fichier :

```text
src/app/_layout.tsx
```

gère la navigation principale.

Les routes principales sont :

```text
/
├── clients
├── commandes
├── factures
└── statistiques
```

La route :

```text
/
```

correspond au **tableau de bord principal** de l'application.

---

# 📊 Tableau de bord

Le dashboard constitue le point d'entrée principal du système.

Il permet notamment d'afficher :

* Nombre total de clients
* Nombre total de commandes
* Nombre de factures
* Montant des factures impayées
* Nombre de commandes livrées
* Nombre de commandes non livrées
* Taux de livraison
* Évolution des ventes
* Évolution des commandes
* Évolution des factures

Les données sont récupérées dynamiquement depuis l'API backend.

---

# 👥 Gestion des clients

Le module clients permet actuellement de :

### Consulter les clients

```text
GET /api/clients
```

### Consulter un client

```text
GET /api/clients/{id}
```

### Créer un client

```text
POST /api/clients
```

### Modifier un client

```text
PUT /api/clients/{id}
```

### Supprimer un client

```text
DELETE /api/clients/{id}
```

### Consulter les commandes d'un client

```text
GET /api/clients/{id}/commandes
```

### Consulter les factures d'un client

```text
GET /api/clients/{id}/factures
```

### Consulter le montant total des achats

```text
GET /api/clients/{id}/prix-achat-total
```

---

# 📦 Gestion des commandes

Le module commandes communique avec l'API backend pour permettre notamment :

* Création d'une commande
* Consultation des commandes
* Consultation d'une commande
* Modification d'une commande
* Suppression d'une commande
* Consultation des statistiques de commandes

Endpoints principaux :

```text
GET    /api/commandes
GET    /api/commandes/{id}
POST   /api/commandes
PUT    /api/commandes/{id}
DELETE /api/commandes/{id}
GET    /api/commandes/stats
```

---

# 🧾 Gestion des factures

Le module factures permet notamment :

* Consulter les factures
* Consulter une facture
* Générer une facture à partir d'une commande
* Modifier une facture
* Modifier le statut d'une facture
* Supprimer une facture
* Consulter les factures d'un client
* Consulter les statistiques globales

Endpoints principaux :

```text
GET    /api/factures
GET    /api/factures/{id}
POST   /api/factures/generate/{commandeId}
PUT    /api/factures/{id}
PATCH  /api/factures/{id}/statut
DELETE /api/factures/{id}
GET    /api/factures/client/{clientId}
GET    /api/factures/stats
GET    /api/factures/stats/client/{clientId}
```

---

# 🌐 API Backend

L'application mobile utilise une API backend déployée en ligne.

URL de base :

```text
https://commandes-app-m1uv.onrender.com/api
```

Exemple :

```text
GET https://commandes-app-m1uv.onrender.com/api/clients
```

Le frontend ne communique donc pas directement avec PostgreSQL.

```text
Application mobile
        │
        │ HTTP / HTTPS
        ▼
API Spring Boot
        │
        ▼
PostgreSQL
```

---

# ⚙️ Installation du projet

## 1. Cloner le projet

```bash
git clone https://github.com/MKLS237/App-Mobile-Syst-me-de-Gestion-de-Commandes-Clients-Fournisseurs.git
```

Puis :

```bash
cd App-Mobile-Syst-me-de-Gestion-de-Commandes-Clients-Fournisseurs
```

---

## 2. Installer les dépendances

```bash
npm install
```

---

# 🚀 Lancer l'application en développement

Pour démarrer Expo :

```bash
npx expo start
```

Pour lancer la version Web :

```bash
npx expo start --web
```

Pour Android :

```bash
npx expo start --android
```

Pour iOS :

```bash
npx expo start --ios
```

---

# 📱 Génération de l'application Android

Le projet utilise **EAS Build**.

La configuration se trouve dans :

```text
eas.json
```

Pour générer une version de développement :

```bash
eas build --profile development --platform android
```

Pour générer une version de test :

```bash
eas build --profile preview --platform android
```

Pour générer une version de production :

```bash
eas build --profile production --platform android
```

---

# 🔄 Mise à jour de l'application avec EAS Update

Le projet est prévu pour utiliser **EAS Update** afin de permettre la publication de certaines mises à jour de l'application sans devoir générer et réinstaller un nouvel APK à chaque modification.

Après configuration d'EAS Update, le workflow sera :

```text
Développement
      │
      ▼
Modification du code
      │
      ▼
Git commit
      │
      ▼
Git push
      │
      ▼
EAS Update
      │
      ▼
Nouvelle version JavaScript
      │
      ▼
Application mobile
```

Exemple :

```bash
eas update --branch production --message "Mise à jour du dashboard"
```

> Les mises à jour OTA concernent principalement le code JavaScript/TypeScript, les écrans, les composants et certaines ressources. Une modification nécessitant une nouvelle version native de l'application peut nécessiter un nouveau build EAS.

---

# 🔀 Workflow Git

Le projet utilise Git pour le suivi du code source.

Après une modification :

```bash
git status
```

Puis :

```bash
git add .
```

Créer un commit :

```bash
git commit -m "Description de la modification"
```

Envoyer vers GitHub :

```bash
git push origin main
```

---

# 🔐 Configuration

Les informations sensibles ne doivent jamais être stockées directement dans le dépôt Git.

Ne jamais publier :

```text
.env
.env.local
.env.production
```

ou :

```text
*.key
*.jks
*.p12
*.pem
```

Le fichier `.gitignore` est configuré pour éviter l'envoi de ces fichiers.

---

# 🧪 Vérification du projet

Avant de publier une nouvelle version :

```bash
npx expo-doctor
```

Pour vérifier les problèmes TypeScript :

```bash
npx tsc --noEmit
```

Pour vérifier le lint :

```bash
npm run lint
```

---

# 📈 Évolution prévue

Le développement de l'application suivra progressivement cette roadmap.

## Phase 1 — Fondations

* [x] Configuration Expo
* [x] Expo Router
* [x] Connexion à l'API distante
* [x] Gestion des clients
* [x] Liste des clients
* [x] Détail client
* [x] Création client
* [x] Modification client
* [x] Suppression client
* [x] Configuration EAS
* [x] Premier build Android

## Phase 2 — Dashboard

* [x] Dashboard principal
* [x] KPIs
* [x] Statistiques de livraison
* [ ] Graphique des ventes
* [ ] Graphique commandes/factures
* [ ] Graphique des livraisons
* [ ] Actualisation des statistiques

## Phase 3 — Commandes

* [ ] Liste des commandes
* [ ] Détail commande
* [ ] Création commande
* [ ] Modification commande
* [ ] Suppression commande
* [ ] Gestion des statuts
* [ ] Statistiques commandes

## Phase 4 — Factures

* [ ] Liste des factures
* [ ] Détail facture
* [ ] Génération facture
* [ ] Modification facture
* [ ] Gestion du statut
* [ ] Suppression facture
* [ ] Statistiques factures

## Phase 5 — Professionnalisation

* [ ] Authentification
* [ ] Gestion JWT
* [ ] Gestion des rôles
* [ ] Notifications
* [ ] Gestion des erreurs réseau
* [ ] Loading states avancés
* [ ] Cache des données
* [ ] Mode hors ligne
* [ ] Optimisation UX/UI
* [ ] EAS Update
* [ ] Publication Google Play

---

# 🎯 Objectif final

L'objectif est de transformer cette application en une solution mobile complète permettant à une entreprise de gérer son activité commerciale depuis son smartphone.

```text
                    📱 APPLICATION MOBILE
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          CLIENTS       COMMANDES     FACTURES
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                     📊 DASHBOARD
                           │
                           ▼
                    REST API SPRING
                           │
                           ▼
                       POSTGRESQL
```

---

# 👨‍💻 Développement

Projet développé avec :

**React Native · Expo · TypeScript · Spring Boot · PostgreSQL**

Repository :

```text
https://github.com/MKLS237/App-Mobile-Syst-me-de-Gestion-de-Commandes-Clients-Fournisseurs
```

---

# 📄 Licence

Ce projet est distribué sous licence MIT.

Voir le fichier :

```text
LICENSE
```
