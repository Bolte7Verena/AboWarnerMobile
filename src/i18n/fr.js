/**
 * fr.js | Français (vouvoiement, usuel dans les applications).
 * Les clés manquantes s'affichent automatiquement en allemand (voir t() dans i18n.js).
 * Espaces insécables avant « ; : ? ! » et à l'intérieur des guillemets.
 */

export default {
    // --- En-tête, introduction, barre d'outils ---
    'kopf.hilfe': 'Aide',
    'kopf.sprache': 'Langue et devise',
    'start.titel': 'Vue d’ensemble des abonnements',
    'start.subline': 'Tout sous contrôle',
    'start.untertitel': 'Gardez tous vos contrats, coûts et délais de résiliation au même endroit.',
    'suche.platzhalter': 'Rechercher un abonnement…',
    'knopf.neuesAbo': 'Nouvel abonnement',

    // --- Tuiles de synthèse ---
    'stat.aktiv': 'Abonnements actifs',
    'stat.monat': 'Coût / mois',
    'stat.jahr': 'Coût / an',
    'stat.fristen': 'Délais urgents',
    'summe.ca': 'env.',
    'summe.nichtEnthalten': 'Non inclus : {liste} (aucun taux disponible)',

    // --- Liste, filtres, cartes ---
    'filter.alle': 'Tous',
    'liste.leer': 'Aucun abonnement trouvé.',
    'status.kritisch': 'Critique',
    'status.warnung': 'Bientôt',
    'status.sicher': 'Sûr',
    'status.gekuendigt': 'Résilié',
    'karte.gekuendigtZum': 'Résilié, prend fin le {datum}',
    'karte.moeglichBis': 'Résilier jusqu’au {datum}',
    'karte.probeEndet': 'Essai jusqu’au {datum}',
    'karte.probeBadge': 'Essai',
    'karte.keineZahlung': 'Plus aucun paiement',
    'karte.naechsteZahlung': 'Prochain paiement : {datum}',
    'karte.tageBisZahlung': '{tage} jours avant le paiement · préavis {frist}',
    'karte.tageBisZahlung.eins': '{tage} jour avant le paiement · préavis {frist}',
    'karte.laeuftHeuteAus': 'Prend fin aujourd’hui',
    'karte.fristPruefen': 'Vérifier le préavis',
    'karte.laeuftNoch': 'Prend fin dans {anzahl} jours',
    'karte.laeuftNoch.eins': 'Prend fin dans {anzahl} jour',
    'knopf.bearbeiten': 'Modifier',
    'knopf.kuendigen': 'Résilier',
    'knopf.loeschen': 'Supprimer',
    'knopf.speichern': 'Enregistrer',
    'knopf.abbrechen': 'Annuler',
    'knopf.schliessen': 'Fermer',
    'knopf.ok': 'OK',

    // --- Fréquence et catégories (les valeurs enregistrées restent en allemand) ---
    'turnus.Monatlich': 'Mensuel',
    'turnus.Vierteljährlich': 'Trimestriel',
    'turnus.Halbjährlich': 'Semestriel',
    'turnus.Jährlich': 'Annuel',
    'kategorie.Streaming': 'Streaming',
    'kategorie.Musik': 'Musique',
    'kategorie.Software': 'Logiciels',
    'kategorie.Sport': 'Sport',
    'kategorie.Versicherung': 'Assurance',
    'kategorie.Energie': 'Énergie',
    'kategorie.Telekommunikation': 'Télécoms',
    'kategorie.Wohnen': 'Logement',
    'kategorie.Sonstiges': 'Autres',

    // --- Champs du formulaire (nouvel abonnement + modifier) ---
    'feld.name': 'Nom de l’abonnement',
    'feld.namePlatzhalter': 'p. ex. Netflix',
    'feld.kosten': 'Coût',
    'feld.kostenPlatzhalter': 'p. ex. 29,99',
    'feld.waehrung': 'Devise',
    'feld.turnus': 'Fréquence',
    'feld.kategorie': 'Catégorie',
    'feld.naechsteZahlung': 'Prochain paiement',
    'feld.datumPlatzhalter': 'Choisir une date',
    'feld.frist': 'Délai de préavis',
    'feld.probe': 'Période d’essai',
    'feld.probeEnde': 'L’essai se termine le',
    'feld.fristEinheit': 'Unité du délai de préavis',
    'einheit.tage': 'Jours',
    'einheit.wochen': 'Semaines',
    'einheit.monate': 'Mois',
    'frist.tage': '{anzahl} jours',
    'frist.tage.eins': '{anzahl} jour',
    'frist.wochen': '{anzahl} semaines',
    'frist.wochen.eins': '{anzahl} semaine',
    'frist.monate': '{anzahl} mois',
    'frist.monate.eins': '{anzahl} mois',
    'feld.vertragsnummer': 'Numéro de contrat',
    'feld.kundennummer': 'Numéro de client',
    'feld.vertragspartner': 'Prestataire (nom et adresse)',
    'feld.vertragspartnerPlatzhalter': 'p. ex. Société Exemple SARL\nService client\n1 rue Exemple\n12345 Ville Exemple',
    'feld.gekuendigtZum': 'Résilié, le contrat prend fin le',
    'feld.fehler': 'Veuillez remplir correctement tous les champs (date comprise).',
    'feld.fehlerFrist': 'Le délai de préavis est trop long : {max} (10 ans) au maximum.',
    'neu.titel': 'Ajouter un abonnement',
    'neu.weitere': 'Plus d’informations (facultatif)',
    'neu.weitereHinweis': 'Elles sont reprises automatiquement dans votre lettre de résiliation.',
    'neu.speichern': 'Enregistrer l’abonnement',
    'edit.vertragsdaten': 'Données du contrat',
    'edit.vertragsdatenHinweis': '(facultatif, pour la lettre de résiliation)',

    // --- Per Foto einlesen ---
    'foto.knopf': 'Lire depuis une photo',
    'foto.hinweis': 'Photographiez une facture ou une confirmation de contrat, ou choisissez une image, p. ex. une capture d’écran. Le texte est lu uniquement sur votre appareil, sans Internet. L’image n’est pas enregistrée.',
    'foto.aufnehmen': 'Prendre une photo',
    'foto.auswaehlen': 'Choisir une image',
    'foto.laeuft': 'Lecture du texte …',
    'foto.erkannt': '{anzahl} informations reprises. Veuillez les vérifier et les corriger si nécessaire. Ce qui n’a pas été reconnu avec certitude reste vide.',
    'foto.erkannt.eins': '1 information reprise. Veuillez la vérifier et la corriger si nécessaire. Ce qui n’a pas été reconnu avec certitude reste vide.',
    'foto.datumVorgerueckt': 'La date de l’image ({original}) est passée : le {datum} a donc été indiqué comme prochain paiement, selon la fréquence. Veuillez vérifier.',
    'foto.nichts': 'Rien n’a pu être reconnu avec certitude sur l’image. Veuillez saisir les informations vous-même.',
    'foto.fehler': 'L’image n’a pas pu être lue. Essayez avec une photo plus nette ou saisissez les informations vous-même.',
    'foto.nurApp': 'La reconnaissance de texte n’est disponible que dans l’application sur votre téléphone.',

    // --- Supprimer, marquer comme résilié ---
    'loeschen.titel': 'Supprimer cet abonnement ?',
    'loeschen.text': '« {name} » sera définitivement supprimé de votre liste.',
    'gekuendigt.titel': 'Fin du contrat',
    'gekuendigt.text': 'Jusqu’à quelle date « {name} » reste-t-il actif ? Jusque-là, l’abonnement reste dans votre liste et dans vos coûts. Vous pouvez modifier la date proposée, p. ex. selon la confirmation du prestataire.',
    'gekuendigt.label': 'Fin du contrat',
    'gekuendigt.speichern': 'Enregistrer comme résilié',
    'datum.fehlt': 'Veuillez choisir une date.',

    // --- Calendrier ---
    'kalender.wochentage': 'Lu,Ma,Me,Je,Ve,Sa,Di',
    'kalender.monate': 'Janvier,Février,Mars,Avril,Mai,Juin,Juillet,Août,Septembre,Octobre,Novembre,Décembre',

    // --- Sauvegarde, restauration, PDF ---
    // --- Speichern fehlgeschlagen, beschädigte Abo-Datei ---
    'speichern.titel': 'Non enregistré',
    'speichern.fehler': 'La modification n’a pas pu être enregistrée. Vos données existantes sont inchangées. Vérifiez qu’il reste de l’espace libre sur votre appareil, puis réessayez.',
    'speichern.fehlerFormular': 'Non enregistré. Vos saisies sont toujours là : veuillez réessayer.',
    'speicher.wiederhergestelltTitel': 'Abonnements restaurés',
    'speicher.wiederhergestelltText': 'Le fichier des abonnements était endommagé. Restauré à partir de la copie automatique : {anzahl}. Veuillez vérifier que tout est correct.',
    'speicher.teilweiseTitel': 'Fichier des abonnements endommagé',
    'speicher.teilweiseText': 'Une partie du fichier des abonnements était endommagée. Encore lisible : {anzahl}. Veuillez vérifier votre liste. Le fichier endommagé a été conservé. Si vous avez une sauvegarde, utilisez « Restaurer une sauvegarde ». Aide : kontakt@appvektor.com',
    'speicher.verlorenTitel': 'Fichier des abonnements endommagé',
    'speicher.verlorenText': 'Le fichier des abonnements est endommagé et aucune copie automatique n’est utilisable. Le fichier endommagé a été conservé. Si vous avez une sauvegarde, utilisez « Restaurer une sauvegarde ». Aide : kontakt@appvektor.com',
    'speicher.gesperrtTitel': 'Abonnements illisibles pour le moment',
    'speicher.gesperrtText': 'Votre fichier des abonnements ne peut pas être lu ou réparé de façon sûre pour le moment. Rien n’a été supprimé. Pour ne rien perdre, l’enregistrement est bloqué. Vérifiez qu’il reste de l’espace libre, fermez complètement l’application et rouvrez-la. Aide : kontakt@appvektor.com',

    'daten.titel': 'Sauvegarder vos données',
    'daten.text': 'Vos abonnements sont enregistrés uniquement sur cet appareil. Créez de temps en temps une sauvegarde et conservez-la en lieu sûr, p. ex. dans votre cloud ou en vous l’envoyant par e-mail.',
    'daten.erstellen': 'Créer une sauvegarde',
    'daten.wiederherstellen': 'Restaurer une sauvegarde',
    'daten.pdf': 'Vue d’ensemble en PDF',
    'daten.pdfText': 'Une liste de tous vos abonnements à imprimer ou à partager. Ce n’est pas une sauvegarde : pour restaurer vos données plus tard, utilisez « Créer une sauvegarde ».',
    'daten.erstellt': 'Sauvegarde créée : {pfad}',
    'daten.erstellenFehler': 'La sauvegarde a échoué. Veuillez réessayer.',
    'daten.zuGross': 'Ce fichier est trop volumineux pour être une sauvegarde Abo-Warner. Vos abonnements actuels restent inchangés.',
    'daten.nichtLesbar': 'Le fichier n’a pas pu être lu. Vos abonnements actuels restent inchangés.',
    'daten.ersetzenTitel': 'Remplacer les abonnements actuels ?',
    'daten.enthaelt': 'La sauvegarde contient {anzahl}. ',
    'daten.werdenErsetzt': 'Vos {anzahl} actuels seront remplacés.',
    'daten.keineVorhanden': 'Aucun abonnement n’est enregistré pour le moment.',
    'daten.ersetzen': 'Remplacer',
    'daten.abgebrochen': 'Restauration annulée. Rien n’a été modifié.',
    'daten.wiederherstellenFehler': 'La restauration a échoué. Veuillez réessayer.',
    'daten.wiederhergestellt': 'Sauvegarde restaurée : {anzahl}.',
    'daten.pdfErstellt': 'PDF créé : {pfad}',
    'daten.pdfFehler': 'Le PDF n’a pas pu être créé. Veuillez réessayer.',
    'anzahl.abos': '{anzahl} abonnements',
    'anzahl.abos.eins': '1 abonnement',

    // --- Vérification du fichier de sauvegarde (sicherung.js) ---
    'sicherung.nichtsGeaendert': 'Vos abonnements actuels restent inchangés.',
    'sicherung.leer': 'Le fichier est vide.',
    'sicherung.zuGross': 'Ce fichier est trop volumineux pour être une sauvegarde Abo-Warner.',
    'sicherung.unlesbar': 'Ce fichier n’est pas une sauvegarde Abo-Warner (contenu illisible).',
    'sicherung.fremd': 'Ce fichier n’est pas une sauvegarde Abo-Warner.',
    'sicherung.keineAbos': 'La sauvegarde ne contient aucun abonnement.',
    'sicherung.beschaedigt': 'La sauvegarde est endommagée : {ungueltig} entrées sur {gesamt} sont incomplètes.',
    'sicherung.doppelt': 'La sauvegarde est endommagée (entrées en double).',

    // --- Titres du menu Partager et noms de fichier ---
    'teilen.export': 'Sauvegarde Abo-Warner',
    'teilen.schreiben': 'Lettre de résiliation',
    'teilen.pdf': 'Vue d’ensemble des abonnements',
    'datei.schreiben': 'Resiliation',
    'datei.pdf': 'Abonnements-vue-ensemble',

    // --- Lettre de résiliation : fenêtre ---
    'brief.titel': 'Lettre de résiliation — {name}',
    'brief.probeHinweis': 'Votre période d’essai se termine le <strong>{datum}</strong>. Résiliez avant, sinon l’abonnement devient payant.',
    'brief.fristHinweis': 'Pour que la résiliation prenne effet à temps, le prestataire doit la recevoir au plus tard le <strong>{datum}</strong>.',
    'brief.absender': 'Vos coordonnées d’expéditeur :',
    'brief.absenderKurz': '{name}, {ort} (modifier)',
    'brief.bitteAusfuellen': 'à compléter',
    'brief.feldName': 'Nom',
    'brief.feldNamePlatzhalter': 'Marie Dupont',
    'brief.feldStrasse': 'Rue et numéro',
    'brief.feldStrassePlatzhalter': '1 rue Exemple',
    'brief.feldPlzOrt': 'Code postal et ville',
    'brief.feldPlzOrtPlatzhalter': '12345 Ville Exemple',
    'brief.feldEmail': 'E-mail',
    'brief.feldEmailHinweis': '(facultatif, pour la confirmation)',
    'brief.optional': 'facultatif',
    'brief.merkHinweis': 'Enregistré sur cet appareil et rempli automatiquement la prochaine fois.',
    'brief.merkFehler': 'N’a pas pu être enregistré sur cet appareil. Il faudra le saisir à nouveau la prochaine fois.',
    'brief.tipp': 'Astuce : sous « Modifier », vous pouvez ajouter à l’abonnement {liste}. Ils apparaîtront alors automatiquement dans la lettre.',
    'brief.tippAnschrift': 'l’adresse du prestataire',
    'brief.tippVertragsnummer': 'le numéro de contrat',
    'brief.tippKundennummer': 'le numéro de client',
    'brief.schreiben': 'Votre lettre',
    'brief.schreibenHinweis': '(vous pouvez encore l’adapter ici)',
    'brief.kopieren': 'Copier dans le presse-papiers',
    'brief.teilen': 'Partager comme fichier',
    'brief.markieren': 'Marquer l’abonnement comme résilié',
    'brief.kopiert': 'Copié dans le presse-papiers.',
    'brief.kopierenFehler': 'La copie a échoué. Sélectionnez le texte et copiez-le manuellement.',
    'brief.gespeichert': 'Enregistré sous : {pfad}',
    'brief.speichernFehler': 'L’enregistrement a échoué. Veuillez réessayer.',

    // --- Lettre de résiliation : texte (neutre, sans référence au droit allemand) ---
    'brief.platzhalterName': '[Votre nom]',
    'brief.platzhalterStrasse': '[Rue et numéro]',
    'brief.platzhalterPlzOrt': '[Code postal et ville]',

    // --- Avis au démarrage et notifications ---
    'hinweis.titel': 'Délai de résiliation bientôt écoulé',
    'hinweis.zeile': 'résilier jusqu’au {datum}',
    'hinweis.zeileProbe': 'essai jusqu’au {datum}',
    'mitteilung.fristTitel': 'Délai de résiliation',
    'mitteilung.fristText': '{name} : résiliation possible seulement jusqu’au {datum}.',
    'mitteilung.endeTitel': 'Fin du contrat',
    'mitteilung.endeText': '{name} prend fin aujourd’hui.',
    'mitteilung.probeTitel': 'Fin de l’essai bientôt',
    'mitteilung.probeText': '{name} : l’essai se termine le {datum} – résiliez maintenant, sinon l’abonnement devient payant.',

    // --- Vue d'ensemble PDF ---
    'pdf.titel': 'Vue d’ensemble des abonnements',
    'pdf.untertitel': 'Abo-Warner Pro · créé le {datum} · {anzahl}',
    'pdf.spalteAbo': 'Abonnement',
    'pdf.spalteKosten': 'Coût',
    'pdf.spalteTurnus': 'Fréquence',
    'pdf.spalteZahlung': 'Prochain paiement',
    'pdf.spalteKuendigung': 'Résilier jusqu’au',
    'pdf.spalteStatus': 'Statut',
    'pdf.laeuft': 'actif',
    'pdf.probe': 'Essai jusqu’au {datum}',
    'pdf.gekuendigtZum': 'résilié, fin le {datum}',
    'pdf.beendet': 'terminé ({datum})',
    'pdf.gekuendigt': 'résilié',
    'pdf.leer': 'Aucun abonnement enregistré.',
    'pdf.summe': 'Total des abonnements actifs ({anzahl}) :',
    'pdf.proMonat': 'par mois : {betrag}',
    'pdf.proJahr': 'par an : {betrag}',
    'pdf.hinweis': 'Les abonnements résiliés sont comptés jusqu’à la fin du contrat.',
    'pdf.fremdwaehrung': ' Les autres devises sont converties en {waehrung} à un taux de référence (env.).',
    'pdf.seite': 'Page {seite} sur {anzahl}',
    'pdf.fusszeile': 'Créé avec Abo-Warner Pro – toutes les informations sans garantie, d’après vos propres saisies.',

    // --- Langue ---
    'sprache.titel': 'Langue et devise',
    'sprache.auto': 'Automatique (langue de l’appareil)',
    'sprache.uebernehmen': 'Appliquer',
    'waehrung.titel': 'Devise principale',
    'waehrung.hinweis': 'Pour les totaux. Les abonnements dans d’autres devises sont convertis à un taux de référence fixe (novembre 2026, « env. »). Vos abonnements eux-mêmes ne changent pas.',
    'waehrung.auto': 'Automatique ({code})',

    // --- Pied de page, mentions légales, contact ---
    'fuss.datenschutz': 'Confidentialité',
    'fuss.impressum': 'Mentions légales',
    'fuss.kontakt': 'Contact',
    'fuss.von': 'Un produit d’AppVektor',
    'rechtlich.datenschutz': 'Politique de confidentialité',
    'rechtlich.impressum': 'Mentions légales',
    'rechtlich.kontakt': 'Contact',
    'kontakt.ueberschrift': 'Questions, remarques ou demandes relatives à la confidentialité',
    'kontakt.schreib': 'Écrivez-nous par e-mail :',
    'kontakt.kopieren': 'Copier l’adresse',
    'kontakt.kopiert': 'Adresse copiée.',
    'kontakt.kopierenFehler': 'Copie impossible. Sélectionnez l’adresse et copiez-la manuellement.',
    'kontakt.keinMailProgramm': 'Si aucune application de messagerie ne s’ouvre, copiez l’adresse et écrivez-nous depuis votre service de messagerie habituel.',
    'kontakt.telefon': 'Téléphone : +49 421 9899 1701',

    'datenschutz.inhalt': `
                <p class="rechtlich-sprachhinweis">En cas de doute, la version allemande fait foi.</p>

                <h3>1. Responsable du traitement</h3>
                <p>
                    AppVektor, propriétaire : Jens Hübeler<br>
                    c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern, Allemagne<br>
                    E-mail : kontakt@appvektor.com<br>
                    Téléphone : +49 421 9899 1701
                </p>

                <h3>2. Finalité du traitement et données traitées</h3>
                <p>Abo-Warner Pro traite uniquement les données que vous saisissez vous-même (nom de l’abonnement, coût, catégorie, dates de paiement et délais de préavis et, si vous les indiquez, numéro de contrat, numéro de client, adresse du prestataire et vos coordonnées d’expéditeur pour la lettre de résiliation). Ces données sont enregistrées uniquement en local dans un fichier sur votre appareil (dans le répertoire de données d’application propre à votre utilisateur dans le système d’exploitation). Elles ne sont transmises ni à l’éditeur ni à des tiers.</p>
                <p><strong>Lire depuis une photo (facultatif) :</strong> Ce n’est que lorsque vous touchez « Lire depuis une photo » puis « Prendre une photo » ou « Choisir une image » que l’application ouvre l’appareil photo ou le sélecteur d’images de votre appareil ; ce n’est qu’à ce moment que votre appareil peut vous demander l’autorisation. L’image est analysée exclusivement sur votre appareil (iPhone : reconnaissance de texte « Vision » d’Apple, intégrée au système d’exploitation ; Android : reconnaissance de texte Tesseract incluse dans l’application). Elle n’est ni enregistrée ni transmise ; les fichiers temporaires sont supprimés après la lecture. Les informations reconnues sont seulement proposées dans le formulaire et ne sont enregistrées que lorsque vous touchez vous-même « Enregistrer l’abonnement ». Rien n’est transmis à l’éditeur ni à des tiers.</p>

                <h3>3. Journaux de serveur, hébergement et services externes</h3>
                <p>AppVektor n’exploite aucun serveur recevant des données de l’application ; AppVektor ne dispose donc d’aucun journal de serveur concernant votre utilisation de l’application. Les polices utilisées par l’application sont enregistrées localement dans l’application ; l’application ne charge aucun contenu depuis des serveurs externes. Aucun service d’analyse, de suivi ou de publicité n’est intégré. Si vous obtenez l’application via une boutique d’applications (p. ex. Apple App Store ou Google Play), son exploitant traite les données qui en résultent sous sa propre responsabilité.</p>
                <p>Tout en bas de l’application, vous trouverez un lien vers appvektor.com. Si vous le touchez, le site s’ouvre dans le navigateur de votre appareil ; la politique de confidentialité du site s’y applique. L’application elle-même ne transmet aucune donnée à cette occasion.</p>

                <h3>4. Aucune analyse et aucun suivi</h3>
                <p>Abo-Warner Pro n’utilise ni cookies, ni logiciel d’analyse, ni suivi des utilisateurs.</p>

                <h3>5. Durée de conservation</h3>
                <p>Vos données restent enregistrées localement jusqu’à ce que vous les supprimiez, les modifiiez ou les exportiez via l’application, ou jusqu’à la désinstallation de l’application.</p>

                <h3>6. Vos droits</h3>
                <p>Toutes les données étant enregistrées exclusivement sur votre appareil, vous pouvez exercer à tout moment vos droits d’accès, de rectification et d’effacement (art. 15, 16 et 17 RGPD) directement via les fonctions « Modifier », « Supprimer » et « Créer une sauvegarde » (sous « Sauvegarder vos données ») de l’application. Pour toute autre demande, veuillez utiliser l’adresse de contact indiquée dans les mentions légales. Vous avez également le droit d’introduire une réclamation auprès d’une autorité de contrôle de la protection des données (art. 77 RGPD).</p>

                <h3>7. Contact pour les questions de confidentialité</h3>
                <p>Pour toute demande relative à la confidentialité ou pour exercer vos droits, vous pouvez nous joindre à kontakt@appvektor.com ou par téléphone au +49 421 9899 1701.</p>
            `,

    'impressum.inhalt': `
                <p class="rechtlich-sprachhinweis">En cas de doute, la version allemande fait foi.</p>

                <h3>Informations conformément au § 5 DDG (loi allemande sur les services numériques)</h3>
                <p>
                    AppVektor<br>
                    Propriétaire : Jens Hübeler<br>
                    c/o Flexdienst – #21882<br>
                    Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern<br>
                    Allemagne
                </p>

                <h3>Contact</h3>
                <p>
                    E-mail : kontakt@appvektor.com<br>
                    Téléphone : +49 421 9899 1701
                </p>

                <h3>Responsable du contenu conformément au § 18, al. 2 MStV (traité d’État allemand sur les médias)</h3>
                <p>Jens Hübeler, c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74, 67663 Kaiserslautern, Allemagne</p>
            `,

    'hilfe.titel': 'Aide',
    'hilfe.inhalt': `
                <h3>Que fait l’application ?</h3>
                <p>Abo-Warner Pro garde un œil sur vos abonnements et contrats : ce qu’ils coûtent, quand vous payez et jusqu’à quand vous pouvez résilier. 7 jours avant la fin d’un délai de résiliation, l’application vous le rappelle par une notification, si vous autorisez les notifications. Toutes vos données restent uniquement sur votre téléphone.</p>

                <h3>Comment ajouter un abonnement ?</h3>
                <ol>
                    <li>Touchez « Nouvel abonnement ».</li>
                    <li>Si vous le souhaitez : touchez « Lire depuis une photo » et photographiez une facture ou une confirmation de contrat (ou choisissez une capture d’écran). L’application propose les informations reconnues, vous les vérifiez. L’image est lue uniquement sur votre téléphone et n’est pas enregistrée.</li>
                    <li>Saisissez le nom, le coût et la fréquence de paiement (à quelle fréquence vous payez, p. ex. mensuel).</li>
                    <li>Choisissez la date du prochain paiement.</li>
                    <li>Saisissez le délai de préavis en jours, semaines ou mois (voir ci-dessous).</li>
                    <li>Vous profitez d’un essai gratuit ? Activez « Période d’essai » et choisissez la date de fin de l’essai. La carte affiche alors « Essai jusqu’au … » et l’application vous le rappelle 3 jours avant.</li>
                    <li>Si vous le souhaitez : sous « Plus d’informations », saisissez le numéro de contrat, le numéro de client et l’adresse du prestataire. Ils figureront alors automatiquement dans votre lettre de résiliation.</li>
                    <li>Touchez « Enregistrer l’abonnement ».</li>
                </ol>
                <p>Vous pouvez tout modifier plus tard avec « Modifier » sur la carte.</p>

                <h3>Que signifie le délai de préavis ?</h3>
                <p>Le délai de préavis indique combien de temps avant le prochain paiement votre résiliation doit parvenir au prestataire. Vous le trouverez dans votre contrat. Saisissez-le tel qu’il y figure : tapez le nombre et choisissez à côté jours, semaines ou mois. S’il est indiqué p. ex. « 3 mois », choisissez 3 et « Mois ». L’application calcule alors avec de vrais mois calendaires.</p>
                <p>L’application calcule la date et l’affiche sur chaque carte : « Résilier jusqu’au … ». Une fois cette date passée, elle vous indique la possibilité suivante.</p>

                <h3>Que signifient le rouge, le jaune et le vert ?</h3>
                <ul class="hilfe-farben">
                    <li><span class="hilfe-punkt rot" aria-hidden="true"></span><strong>Rouge :</strong> 7 jours ou moins avant la date limite de résiliation. Agissez maintenant si vous ne voulez plus de l’abonnement. Au début de ces 7 jours, vous recevez une notification.</li>
                    <li><span class="hilfe-punkt gelb" aria-hidden="true"></span><strong>Jaune :</strong> 30 jours ou moins restants.</li>
                    <li><span class="hilfe-punkt gruen" aria-hidden="true"></span><strong>Vert :</strong> Plus de 30 jours restants.</li>
                    <li><span class="hilfe-punkt grau" aria-hidden="true"></span><strong>Étiquette grise « Résilié, prend fin le … » :</strong> L’abonnement est résilié. Jusqu’à cette date, la carte reste à sa place habituelle, car vous payez encore jusque-là. Ensuite, elle s’estompe et passe en fin de liste.</li>
                </ul>

                <h3>Dans quelle devise sont affichés les totaux ?</h3>
                <p>Dans votre devise principale. L’application la propose selon vos abonnements et votre pays. Vous pouvez la modifier via le globe en haut à droite. Si vous avez des abonnements dans d’autres devises, l’application les convertit à un taux de référence fixe et ajoute « env. », car elle ne récupère aucun taux sur Internet.</p>

                <h3>Comment résilier ?</h3>
                <ol>
                    <li>Touchez « Résilier » sur la carte.</li>
                    <li>L’application vous rédige une lettre de résiliation prête à l’emploi. Vous ne saisissez votre nom et votre adresse qu’une seule fois.</li>
                    <li>Copiez la lettre ou partagez-la comme fichier et envoyez-la au prestataire. L’application n’envoie rien elle-même. Idéalement, envoyez-la de façon à avoir une preuve (p. ex. un e-mail avec accusé de réception ou une lettre recommandée).</li>
                    <li>Touchez « Marquer l’abonnement comme résilié » et choisissez la fin du contrat. Jusque-là, l’abonnement reste dans la liste, car vous payez encore. Le dernier jour, vous recevez une notification : « … prend fin aujourd’hui. »</li>
                </ol>

                <h3>Comment sauvegarder mes données ?</h3>
                <p>Vos abonnements sont enregistrés uniquement sur ce téléphone. Si vous supprimez l’application ou perdez votre téléphone, ils sont perdus. C’est pourquoi vous trouverez tout en bas, sous « Sauvegarder vos données » :</p>
                <ul>
                    <li><strong>Créer une sauvegarde :</strong> enregistre tous les abonnements dans un fichier. Conservez-le en lieu sûr, p. ex. dans votre cloud ou en vous l’envoyant par e-mail.</li>
                    <li><strong>Restaurer une sauvegarde :</strong> recharge un tel fichier, p. ex. sur un nouveau téléphone. Attention : les abonnements du téléphone seront remplacés.</li>
                    <li><strong>Vue d’ensemble en PDF :</strong> une liste à imprimer ou à partager. Ce n’est pas une sauvegarde.</li>
                </ul>

                <h3>D’autres questions ?</h3>
                <p>Touchez « Contact » tout en bas et écrivez-nous.</p>
            `
};
