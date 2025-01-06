# TP02-SPOAuth
## Mattéo Vocanson | Dimitri Brancourt

### Comment ça marche
#### 1. Il faut créer un fichier .env à la racine du projet
#### 2. Ensuite, ajouter les lignes suivantes dans le fichier .env :
```bash
CLIENT_ID=YOUR_CLIENT_ID
CLIENT_SECRET=YOUR_CLIENT_SECRET
```
#### Ces informations sont disponibles sur le site de Spotify, dans le tableau de bord de votre application
#### Ensuite, il faut télécharger les dépendances du projet avec la commande :
```bash
npm install
```
#### Enfin, pour lancer le serveur, il suffit de taper la commande :
```bash
node index.js
```
#### Le serveur est accessible à l'adresse http://localhost:3000, il suffira de se rendre sur cette adresse, de se connecter à Spotify, le serveur redirigera automatiquement sur la page avec les informations sur les musiques écoutées récemment.