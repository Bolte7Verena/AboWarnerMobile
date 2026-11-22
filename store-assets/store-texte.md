# Store-Texte Abo-Warner Pro, Version 2.0.2

Stand 22.11.2026, vorbereitet für App Store Connect und Google Play Console. Nichts davon ist hochgeladen.

**Intern, gehört nicht in den Store**

- Alle Aussagen sind gegen den Code des Zweigs `update-2.0.2` geprüft.
- Bewusst NICHT versprechen: aktuelle oder Live-Wechselkurse (die App hat kein Internet, die Kurse sind feste Richtwerte), automatisches Kündigen oder Versenden, sichere oder vollständige Texterkennung, Auswertung von Kontoauszügen, Rechtsberatung, Bezahlfunktion.
- Keinen Preis in die Texte schreiben. Keine Markennamen (Netflix, Spotify usw.) in die Texte schreiben.
- Spanisch, Französisch und Portugiesisch sind noch nicht von Muttersprachlern gegengelesen.
- Die Foto-Funktion ist auf echten Geräten noch nicht abschließend getestet. Fällt sie aus 2.0.2 heraus, müssen die Foto-Zeilen in Beschreibung, „Gut zu wissen“ und „Was ist neu“ entfernt werden.
- „Was ist neu“ zeigt der App Store erst ab dem zweiten veröffentlichten Stand an.

## Was sich gegenüber 2.0.1 geändert hat

**Alle Sprachen**

| Stelle | Vorher (2.0.1) | Jetzt (2.0.2) |
|---|---|---|
| Sprachen | Deutsch, Englisch | NEU: Spanisch, Französisch, Portugiesisch |
| Kurzbeschreibung (Google Play) | nicht vorhanden | NEU |
| „Was ist neu“ | Erste Veröffentlichung | GEÄNDERT: neue Funktionen, höchstens 500 Zeichen |
| Aufbau der Datei | Fließtext | GEÄNDERT: jeder Text in einem Kasten zum Kopieren |
| App-Name, Untertitel, Schlüsselwörter (DE, EN) | – | unverändert |

**Beschreibung Deutsch und Englisch, Zeile für Zeile**

| Zeile | Vorher (2.0.1) | Jetzt (2.0.2) |
|---|---|---|
| Einleitung | Angaben nur selbst eintragen | GEÄNDERT: selbst eintragen oder per Foto vorschlagen lassen; sagt, bis wann man kündigen kann |
| Foto | – | NEU |
| Status | „Sicher“, „Bald fällig“, „Kritisch“, „Gekündigt“ | GEÄNDERT: „Kündigung möglich bis …“ in Rot, Gelb, Grün |
| Kündigungsfrist | – | NEU: Tage, Wochen oder Monate |
| Probeabo | – | NEU |
| Erinnerung | drei Tage vor der Abbuchung | GEÄNDERT: 7 Tage vor Ende der Kündigungsfrist |
| Kündigungsschreiben | „Musterschreiben“, Absender wird gemerkt | GEÄNDERT: fertiger Brief zum Kopieren oder Teilen; Absender-Satz entfällt |
| Gekündigte Abos | „als gekündigt markieren“ | GEÄNDERT: bleiben bis zum Vertragsende sichtbar |
| Währung | – | NEU: „Summen in deiner Hauptwährung. Andere Währungen werden mit festen Richtkursen umgerechnet (ca.).“ |
| Export | Liste als Datei (JSON) exportieren | GEÄNDERT: Sicherung erstellen und wiederherstellen, Übersicht als PDF |
| Sprachen | – | NEU |
| Gut zu wissen | – | NEU: Hinweis, dass Foto-Vorschläge zu prüfen sind |
| Datenschutz | – | unverändert |

**Interne Hinweise**

- ENTFERNT: „Umrechnung von Währungen“ und „Wiederherstellen von Sicherungen“ aus der Liste der nicht versprochenen Dinge.
- ENTFERNT: Hinweis, die App sei nur auf Deutsch.
- GEÄNDERT: Prüfnotizen und Datenschutz-URL (ganz unten).

---

# Deutsch (Primärsprache, App Store und Google Play: de-DE)

**App-Name** (max. 30 Zeichen, hier 14)

```text
Abo-Warner Pro
```

**Untertitel, nur App Store** (max. 30, hier 24)

```text
Abos & Kündigungsfristen
```

**Schlüsselwörter, nur App Store** (max. 100 inkl. Kommas, hier 99)

```text
Abo,Abos,Kündigung,Kündigungsfrist,Vertrag,Verträge,Kosten,Erinnerung,Übersicht,Abonnement,Ausgaben
```

**Kurzbeschreibung, nur Google Play** (max. 80, hier 77)

```text
Abos, Verträge und Kündigungsfristen im Blick. Alles bleibt auf deinem Gerät.
```

**Beschreibung, beide Stores** (max. 4000, hier 1948)

```text
Abo-Warner Pro hilft dir, wiederkehrende Ausgaben und Kündigungsfristen im Blick zu behalten.

Du trägst deine Abos und Verträge selbst ein oder lässt dir die Angaben aus einem Foto vorschlagen. Die App zeigt alles in einer übersichtlichen Liste, rechnet die Kosten zusammen und sagt dir, bis wann du kündigen kannst.

Das kann die App:

• Abos und Verträge erfassen, bearbeiten und löschen
• Per Foto einlesen: Die App liest eine Rechnung oder Vertragsbestätigung auf deinem Gerät und schlägt die erkannten Angaben vor. Du prüfst und speicherst selbst. Das Bild wird nicht gespeichert.
• Übersicht auf einen Blick: aktive Abos, Kosten pro Monat, Kosten pro Jahr und wie viele Fristen fällig sind
• Auf jeder Karte: „Kündigung möglich bis …“, in Rot, Gelb oder Grün, je nachdem, wie viel Zeit noch bleibt
• Kündigungsfrist in Tagen, Wochen oder Monaten
• Probeabos: mit Enddatum und Erinnerung 3 Tage vorher
• Erinnerung 7 Tage vor Ende einer Kündigungsfrist als lokale Benachrichtigung (nur, wenn du es erlaubst)
• Kündigungsschreiben: Die App erstellt aus deinen Angaben einen fertigen Brief, den du kopieren oder teilen kannst
• Gekündigte Abos bleiben bis zum Vertragsende sichtbar
• Summen in deiner Hauptwährung. Andere Währungen werden mit festen Richtkursen umgerechnet (ca.).
• Suchen und nach Kategorie filtern
• Sicherung erstellen und wiederherstellen, Übersicht als PDF
• Auf Deutsch, Englisch, Spanisch, Französisch und Portugiesisch

Datenschutz:

• Alle Daten bleiben auf deinem Gerät.
• Kein Konto, kein Tracking, keine Werbung.
• Die App funktioniert ohne Internetverbindung.

Gut zu wissen:

• Termine und Fristen beruhen auf deinen Angaben. Bitte prüfe deine Vertragsunterlagen selbst.
• Beim Einlesen per Foto kann etwas falsch oder gar nicht erkannt werden. Bitte prüfe die Vorschläge.
• Das Kündigungsschreiben ist eine Vorlage. Die App kündigt nichts für dich und versendet nichts selbst.
• Die App ist keine Rechtsberatung.
```

**Was ist neu, Version 2.0.2** (App Store max. 4000, Google Play max. 500, hier 437)

```text
• Per Foto einlesen, nur auf deinem Gerät
• Jede Karte zeigt, bis wann du kündigen kannst
• Erinnerung 7 Tage vor Ende der Kündigungsfrist
• Frist in Tagen, Wochen oder Monaten
• Probeabos mit Erinnerung
• Kündigungsschreiben mit Vertrags- und Kundennummer
• Wählbare Hauptwährung, umgerechnet mit festen Richtkursen (ca.)
• Sicherung wiederherstellen, Übersicht als PDF
• Jetzt auch auf Englisch, Spanisch, Französisch und Portugiesisch
```

---

# English (App Store: en-US, Google Play: en-US)

**App-Name** (max. 30 Zeichen, hier 14)

```text
Abo-Warner Pro
```

**Untertitel, nur App Store** (max. 30, hier 28)

```text
Track subscription deadlines
```

**Schlüsselwörter, nur App Store** (max. 100 inkl. Kommas, hier 96)

```text
subscription,subscriptions,cancel,cancellation,deadline,contract,costs,reminder,tracker,expenses
```

**Kurzbeschreibung, nur Google Play** (max. 80, hier 78)

```text
Track subscriptions, contracts and cancellation deadlines. All on your device.
```

**Beschreibung, beide Stores** (max. 4000, hier 1848)

```text
Abo-Warner Pro helps you keep track of recurring expenses and cancellation deadlines.

You enter your subscriptions and contracts yourself or let the app suggest the details from a photo. The app shows everything in a clear list, adds up your costs and tells you the date you can cancel by.

What the app does:

• Add, edit and delete subscriptions and contracts
• Scan from photo: the app reads an invoice or contract confirmation on your device and suggests the details it finds. You check and save them yourself. The image is not saved.
• Overview at a glance: active subscriptions, cost per month, cost per year and how many deadlines are due
• On each card: “Cancel by …” in red, yellow or green, depending on how much time is left
• Notice period in days, weeks or months
• Free trials: with an end date and a reminder 3 days before
• A reminder 7 days before a cancellation deadline as a local notification (only if you allow it)
• Cancellation letter: the app creates a ready-made letter from your details that you can copy or share
• Canceled subscriptions stay visible until the contract ends
• Totals in your main currency. Other currencies are converted at fixed reference rates (approx.).
• Search and filter by category
• Create and restore backups, overview as PDF
• In English, German, Spanish, French and Portuguese

Privacy:

• All data stays on your device.
• No account, no tracking, no ads.
• The app works without an internet connection.

Good to know:

• Dates and deadlines are based on the details you enter. Please check your contract documents yourself.
• When scanning from a photo, details may be read incorrectly or not at all. Please check the suggestions.
• The cancellation letter is a template. The app does not cancel anything for you and does not send anything by itself.
• The app does not provide legal advice.
```

**Was ist neu, Version 2.0.2** (App Store max. 4000, Google Play max. 500, hier 423)

```text
• Scan from photo, read only on your device
• Each card shows the date you can cancel by
• Reminder 7 days before a cancellation deadline
• Notice period in days, weeks or months
• Free trials with a reminder
• Cancellation letters with contract and customer number
• Choose your main currency, converted at fixed reference rates (approx.)
• Restore backups, overview as PDF
• Now in English, Spanish, French and Portuguese
```

---

# Español (App Store: es-ES und es-MX, Google Play: es-ES und es-419)

**App-Name** (max. 30 Zeichen, hier 14)

```text
Abo-Warner Pro
```

**Untertitel, nur App Store** (max. 30, hier 22)

```text
Suscripciones y plazos
```

**Schlüsselwörter, nur App Store** (max. 100 inkl. Kommas, hier 98)

```text
suscripción,cancelar,contrato,gastos,recordatorio,preaviso,prueba,costes,baja,cuota,facturas,pagos
```

**Kurzbeschreibung, nur Google Play** (max. 80, hier 76)

```text
Controla suscripciones, contratos y plazos de cancelación. Todo en tu móvil.
```

**Beschreibung, beide Stores** (max. 4000, hier 1909)

```text
Abo-Warner Pro te ayuda a controlar los gastos periódicos y los plazos de cancelación.

Introduces tus suscripciones y contratos o dejas que la app proponga los datos a partir de una foto. La app lo muestra todo en una lista clara, suma los costes y te dice hasta cuándo puedes cancelar.

Qué hace la app:

• Añadir, editar y eliminar suscripciones y contratos
• Leer desde una foto: la app lee una factura o confirmación de contrato en tu dispositivo y propone los datos que reconoce. Tú los revisas y los guardas. La imagen no se guarda.
• Resumen de un vistazo: suscripciones activas, coste al mes, coste al año y cuántos plazos son urgentes
• En cada tarjeta: «Cancelar hasta el …» en rojo, amarillo o verde, según el tiempo que quede
• Plazo de preaviso en días, semanas o meses
• Periodos de prueba: con fecha de fin y recordatorio 3 días antes
• Recordatorio 7 días antes de que termine un plazo de cancelación, como notificación local (solo si lo permites)
• Carta de cancelación: la app crea con tus datos una carta lista para copiar o compartir
• Las suscripciones canceladas siguen visibles hasta el fin del contrato
• Totales en tu moneda principal. Las demás monedas se convierten con tipos de cambio fijos de referencia (aprox.).
• Buscar y filtrar por categoría
• Crear y restaurar copias de seguridad, resumen en PDF
• En español, alemán, inglés, francés y portugués

Privacidad:

• Todos los datos permanecen en tu dispositivo.
• Sin cuenta, sin seguimiento, sin publicidad.
• La app funciona sin conexión a internet.

Conviene saber:

• Las fechas y los plazos se basan en los datos que introduces. Revisa tú mismo los documentos de tus contratos.
• Al leer desde una foto, algún dato puede reconocerse mal o no reconocerse. Revisa las propuestas.
• La carta de cancelación es una plantilla. La app no cancela nada por ti ni envía nada por sí sola.
• La app no ofrece asesoramiento jurídico.
```

**Was ist neu, Version 2.0.2** (App Store max. 4000, Google Play max. 500, hier 449)

```text
• Leer desde una foto, solo en tu dispositivo
• Cada tarjeta muestra hasta cuándo puedes cancelar
• Recordatorio 7 días antes de que termine el plazo
• Preaviso en días, semanas o meses
• Periodos de prueba con recordatorio
• Carta con número de contrato y de cliente
• Moneda principal a elegir, con tipos de cambio fijos de referencia (aprox.)
• Restaurar copias de seguridad, resumen en PDF
• Ahora también en español, inglés, francés y portugués
```

---

# Français (App Store: fr-FR, optional fr-CA; Google Play: fr-FR)

**App-Name** (max. 30 Zeichen, hier 14)

```text
Abo-Warner Pro
```

**Untertitel, nur App Store** (max. 30, hier 27)

```text
Abonnements et résiliations
```

**Schlüsselwörter, nur App Store** (max. 100 inkl. Kommas, hier 97)

```text
abonnement,résilier,contrat,dépenses,rappel,préavis,essai,coûts,échéance,factures,budget,paiement
```

**Kurzbeschreibung, nur Google Play** (max. 80, hier 78)

```text
Abonnements, contrats et délais de résiliation. Tout reste sur votre appareil.
```

**Beschreibung, beide Stores** (max. 4000, hier 2114)

```text
Abo-Warner Pro vous aide à garder un œil sur vos dépenses récurrentes et vos délais de résiliation.

Vous saisissez vos abonnements et contrats, ou vous laissez l’application proposer les informations à partir d’une photo. Elle affiche le tout dans une liste claire, additionne les coûts et vous indique jusqu’à quand vous pouvez résilier.

Ce que fait l’application :

• Ajouter, modifier et supprimer des abonnements et des contrats
• Lire depuis une photo : l’application lit une facture ou une confirmation de contrat sur votre appareil et propose les informations reconnues. Vous les vérifiez et les enregistrez vous-même. L’image n’est pas enregistrée.
• Vue d’ensemble : abonnements actifs, coût par mois, coût par an et nombre de délais urgents
• Sur chaque carte : « Résilier jusqu’au … » en rouge, jaune ou vert, selon le temps restant
• Préavis en jours, semaines ou mois
• Périodes d’essai : avec date de fin et rappel 3 jours avant
• Rappel 7 jours avant la fin d’un délai de résiliation, sous forme de notification locale (uniquement si vous l’autorisez)
• Lettre de résiliation : l’application rédige à partir de vos données une lettre prête à copier ou à partager
• Les abonnements résiliés restent visibles jusqu’à la fin du contrat
• Totaux dans votre devise principale. Les autres devises sont converties à des taux de référence fixes (env.).
• Rechercher et filtrer par catégorie
• Créer et restaurer des sauvegardes, vue d’ensemble en PDF
• En français, allemand, anglais, espagnol et portugais

Confidentialité :

• Toutes les données restent sur votre appareil.
• Sans compte, sans suivi, sans publicité.
• L’application fonctionne sans connexion Internet.

Bon à savoir :

• Les dates et les délais reposent sur vos informations. Veuillez vérifier vous-même vos documents contractuels.
• Lors de la lecture d’une photo, certaines informations peuvent être mal reconnues ou ne pas l’être. Veuillez vérifier les propositions.
• La lettre de résiliation est un modèle. L’application ne résilie rien à votre place et n’envoie rien elle-même.
• L’application ne fournit pas de conseil juridique.
```

**Was ist neu, Version 2.0.2** (App Store max. 4000, Google Play max. 500, hier 427)

```text
• Lire depuis une photo, uniquement sur votre appareil
• Chaque carte indique jusqu’à quand résilier
• Rappel 7 jours avant la fin du délai
• Préavis en jours, semaines ou mois
• Périodes d’essai avec rappel
• Lettre avec numéros de contrat et de client
• Devise principale au choix, taux de référence fixes (env.)
• Restaurer des sauvegardes, vue d’ensemble en PDF
• Désormais aussi en français, anglais, espagnol et portugais
```

---

# Português (App Store: pt-BR, Google Play: pt-BR)

**App-Name** (max. 30 Zeichen, hier 14)

```text
Abo-Warner Pro
```

**Untertitel, nur App Store** (max. 30, hier 20)

```text
Assinaturas e prazos
```

**Schlüsselwörter, nur App Store** (max. 100 inkl. Kommas, hier 98)

```text
assinatura,cancelar,contrato,gastos,lembrete,aviso,teste,custos,mensalidade,fatura,pagamento,prazo
```

**Kurzbeschreibung, nur Google Play** (max. 80, hier 78)

```text
Controle assinaturas, contratos e prazos de cancelamento. Tudo no seu celular.
```

**Beschreibung, beide Stores** (max. 4000, hier 1839)

```text
O Abo-Warner Pro ajuda você a acompanhar gastos recorrentes e prazos de cancelamento.

Você informa suas assinaturas e contratos ou deixa o app sugerir os dados a partir de uma foto. O app mostra tudo em uma lista clara, soma os custos e diz até quando você pode cancelar.

O que o app faz:

• Adicionar, editar e excluir assinaturas e contratos
• Ler de uma foto: o app lê uma fatura ou confirmação de contrato no seu aparelho e sugere os dados reconhecidos. Você confere e salva. A imagem não é salva.
• Visão geral: assinaturas ativas, custo por mês, custo por ano e quantos prazos são urgentes
• Em cada cartão: “Cancelar até …” em vermelho, amarelo ou verde, conforme o tempo que resta
• Prazo de aviso prévio em dias, semanas ou meses
• Períodos de teste: com data de término e lembrete 3 dias antes
• Lembrete 7 dias antes do fim de um prazo de cancelamento, como notificação local (somente se você permitir)
• Carta de cancelamento: o app cria com os seus dados uma carta pronta para copiar ou compartilhar
• Assinaturas canceladas continuam visíveis até o fim do contrato
• Totais na sua moeda principal. Outras moedas são convertidas por taxas fixas de referência (aprox.).
• Pesquisar e filtrar por categoria
• Criar e restaurar backup, visão geral em PDF
• Em português, alemão, inglês, espanhol e francês

Privacidade:

• Todos os dados ficam no seu aparelho.
• Sem conta, sem rastreamento, sem anúncios.
• O app funciona sem conexão com a internet.

Bom saber:

• Datas e prazos se baseiam nos dados que você informa. Confira você mesmo os documentos dos seus contratos.
• Ao ler de uma foto, algum dado pode ser reconhecido de forma errada ou não ser reconhecido. Confira as sugestões.
• A carta de cancelamento é um modelo. O app não cancela nada por você e não envia nada sozinho.
• O app não oferece consultoria jurídica.
```

**Was ist neu, Version 2.0.2** (App Store max. 4000, Google Play max. 500, hier 413)

```text
• Ler de uma foto, apenas no seu aparelho
• Cada cartão mostra até quando você pode cancelar
• Lembrete 7 dias antes do fim do prazo
• Aviso prévio em dias, semanas ou meses
• Períodos de teste com lembrete
• Carta com número do contrato e de cliente
• Moeda principal à escolha, com taxas fixas de referência (aprox.)
• Restaurar backup, visão geral em PDF
• Agora também em português, inglês, espanhol e francês
```

---

# Weitere Felder (Vorschläge, bitte selbst prüfen)

- **Support-URL:** https://appvektor.com/#kontakt
- **Datenschutz-URL:** https://abo-warner-pro.com/datenschutz. GEÄNDERT: Die Seite ist veröffentlicht, muss vor der Einreichung aber noch um die neuen Felder, die Foto-Funktion und den Link zu appvektor.com ergänzt werden (siehe FUNKTIONSLISTE.md, Abschnitt 3).
- **Marketing-URL (optional):** https://abo-warner-pro.com
- **Kategorie:** „Finanzen“ (Vorschlag).
- **Datenschutz-Angaben in App Store Connect:** „Daten werden nicht erhoben“ bleibt richtig: Texterkennung, Kurse und Einstellungen liegen nur auf dem Gerät.
- **Exportvorschriften:** `ITSAppUsesNonExemptEncryption = false` steht in der Info.plist.
- **Screenshots:** DE, ES, FR mit Euro, EN mit Dollar, PT mit Real (Ordner store-screenshots).

**Hinweise für die App-Prüfung (Review Notes)**, GEÄNDERT

```text
The app stores all data locally on the device. There is no account, no server and no tracking; the app itself makes no network connections. All features can be tested without signing in.

Scan from photo: camera and photo access are requested only after the user taps "Scan from photo" and then "Take photo" or "Choose image". The image is read on the device, only suggests form values and is not saved.

Currency totals use fixed reference rates included in the app and are marked "approx.".

At the bottom of the app there is a link to appvektor.com (publisher website). It opens in the browser. Nothing is sold in the app.

Cancellation letters are templates the user can copy or share. The app does not send anything.
```
