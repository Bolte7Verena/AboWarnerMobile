/**
 * es.js | Español (neutral, tuteo como en la versión alemana).
 * Las claves que falten se muestran automáticamente en alemán (ver t() en i18n.js).
 */

export default {
    // --- Cabecera, introducción, barra de herramientas ---
    'kopf.hilfe': 'Ayuda',
    'kopf.sprache': 'Idioma y moneda',
    'start.titel': 'Resumen de suscripciones',
    'start.subline': 'Todo bajo control',
    'start.untertitel': 'Ten todos tus contratos, costes y plazos de cancelación en un solo lugar.',
    'suche.platzhalter': 'Buscar o filtrar suscripciones…',
    'knopf.neuesAbo': 'Nueva suscripción',

    // --- Casillas de resumen ---
    'stat.aktiv': 'Suscripciones activas',
    'stat.monat': 'Coste / mes',
    'stat.jahr': 'Coste / año',
    'stat.fristen': 'Plazos urgentes',
    'summe.ca': 'aprox.',
    'summe.nichtEnthalten': 'No incluido: {liste} (sin tipo de cambio)',

    // --- Lista, filtros, tarjetas ---
    'filter.alle': 'Todas',
    'liste.leer': 'No se han encontrado suscripciones.',
    'status.kritisch': 'Crítico',
    'status.warnung': 'Pronto',
    'status.sicher': 'Seguro',
    'status.gekuendigt': 'Cancelada',
    'karte.gekuendigtZum': 'Cancelada, termina el {datum}',
    'karte.moeglichBis': 'Cancelar hasta el {datum}',
    'karte.probeEndet': 'La prueba termina el {datum}',
    'karte.probeBadge': 'Prueba',
    'karte.keineZahlung': 'Sin más pagos',
    'karte.naechsteZahlung': 'Próximo pago: {datum}',
    'karte.tageBisZahlung': '{tage} días hasta el pago · plazo {frist}',
    'karte.laeuftHeuteAus': 'Termina hoy',
    'karte.laeuftNoch': 'Termina en {anzahl} días',
    'karte.laeuftNoch.eins': 'Termina en {anzahl} día',
    'knopf.bearbeiten': 'Editar',
    'knopf.kuendigen': 'Cancelar contrato',
    'knopf.loeschen': 'Eliminar',
    'knopf.speichern': 'Guardar',
    'knopf.abbrechen': 'Cancelar',
    'knopf.schliessen': 'Cerrar',
    'knopf.ok': 'OK',

    // --- Frecuencia y categorías (los valores guardados siguen en alemán) ---
    'turnus.Monatlich': 'Mensual',
    'turnus.Vierteljährlich': 'Trimestral',
    'turnus.Halbjährlich': 'Semestral',
    'turnus.Jährlich': 'Anual',
    'kategorie.Streaming': 'Streaming',
    'kategorie.Musik': 'Música',
    'kategorie.Software': 'Software',
    'kategorie.Sport': 'Deporte',
    'kategorie.Versicherung': 'Seguro',
    'kategorie.Energie': 'Energía',
    'kategorie.Telekommunikation': 'Telecomunicaciones',
    'kategorie.Wohnen': 'Vivienda',
    'kategorie.Sonstiges': 'Otros',

    // --- Campos del formulario (nueva suscripción + editar) ---
    'feld.name': 'Nombre de la suscripción',
    'feld.namePlatzhalter': 'p. ej. Netflix',
    'feld.kosten': 'Coste',
    'feld.kostenPlatzhalter': 'p. ej. 29,99',
    'feld.waehrung': 'Moneda',
    'feld.turnus': 'Frecuencia de pago',
    'feld.kategorie': 'Categoría',
    'feld.naechsteZahlung': 'Próximo pago',
    'feld.datumPlatzhalter': 'Elegir fecha',
    'feld.frist': 'Plazo de preaviso',
    'feld.probe': 'Periodo de prueba',
    'feld.probeEnde': 'La prueba termina el',
    'feld.fristEinheit': 'Unidad del plazo de preaviso',
    'einheit.tage': 'Días',
    'einheit.wochen': 'Semanas',
    'einheit.monate': 'Meses',
    'frist.tage': '{anzahl} días',
    'frist.tage.eins': '{anzahl} día',
    'frist.wochen': '{anzahl} semanas',
    'frist.wochen.eins': '{anzahl} semana',
    'frist.monate': '{anzahl} meses',
    'frist.monate.eins': '{anzahl} mes',
    'feld.vertragsnummer': 'N.º de contrato',
    'feld.kundennummer': 'N.º de cliente',
    'feld.vertragspartner': 'Proveedor (nombre y dirección)',
    'feld.vertragspartnerPlatzhalter': 'p. ej. Empresa Ejemplo S.L.\nAtención al cliente\nCalle Ejemplo 1\n12345 Ciudad Ejemplo',
    'feld.gekuendigtZum': 'Cancelada, el contrato termina el',
    'feld.fehler': 'Rellena todos los campos correctamente (incluida la fecha).',
    'neu.titel': 'Añadir nueva suscripción',
    'neu.weitere': 'Más datos (opcional)',
    'neu.weitereHinweis': 'Se añaden automáticamente a tu carta de cancelación.',
    'neu.speichern': 'Guardar suscripción',
    'edit.vertragsdaten': 'Datos del contrato',
    'edit.vertragsdatenHinweis': '(opcional, para la carta de cancelación)',

    // --- Per Foto einlesen ---
    'foto.knopf': 'Leer desde una foto',
    'foto.hinweis': 'Haz una foto de una factura o de una confirmación del contrato, o elige una imagen, p. ej. una captura de pantalla. El texto se lee solo en tu dispositivo, sin internet. La imagen no se guarda.',
    'foto.aufnehmen': 'Hacer foto',
    'foto.auswaehlen': 'Elegir imagen',
    'foto.laeuft': 'Leyendo el texto …',
    'foto.erkannt': 'Se han rellenado {anzahl} datos. Revísalos y corrígelos si hace falta. Lo que no se ha reconocido con seguridad queda vacío.',
    'foto.erkannt.eins': 'Se ha rellenado 1 dato. Revísalo y corrígelo si hace falta. Lo que no se ha reconocido con seguridad queda vacío.',
    'foto.datumVorgerueckt': 'La fecha de la imagen ({original}) ya pasó, así que se ha puesto el {datum} como próximo pago, según la frecuencia de pago. Revísalo, por favor.',
    'foto.nichts': 'No se ha reconocido nada con seguridad en la imagen. Introduce los datos tú mismo.',
    'foto.fehler': 'No se pudo leer la imagen. Prueba con una foto más nítida o introduce los datos tú mismo.',
    'foto.nurApp': 'El reconocimiento de texto solo está disponible en la app del móvil.',

    // --- Eliminar, marcar como cancelada ---
    'loeschen.titel': '¿Eliminar esta suscripción?',
    'loeschen.text': '«{name}» se eliminará definitivamente de tu lista.',
    'gekuendigt.titel': 'Fin del contrato',
    'gekuendigt.text': '¿Hasta qué fecha sigue activo «{name}»? Hasta entonces, la suscripción se mantiene en tu lista y en tus costes. Puedes cambiar la fecha propuesta, p. ej. según la confirmación del proveedor.',
    'gekuendigt.label': 'Fin del contrato',
    'gekuendigt.speichern': 'Guardar como cancelada',
    'datum.fehlt': 'Elige una fecha.',

    // --- Calendario ---
    'kalender.wochentage': 'Lu,Ma,Mi,Ju,Vi,Sá,Do',
    'kalender.monate': 'Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre',

    // --- Copia de seguridad, restaurar, PDF ---
    'daten.titel': 'Proteger tus datos',
    'daten.text': 'Tus suscripciones solo están guardadas en este dispositivo. Crea de vez en cuando una copia de seguridad y guárdala en un lugar seguro, p. ej. en tu nube o enviándola a tu propio correo.',
    'daten.erstellen': 'Crear copia de seguridad',
    'daten.wiederherstellen': 'Restaurar copia de seguridad',
    'daten.pdf': 'Resumen en PDF',
    'daten.pdfText': 'Una lista de todas tus suscripciones para imprimir o compartir. No es una copia de seguridad: para restaurar tus datos más adelante, usa «Crear copia de seguridad».',
    'daten.erstellt': 'Copia de seguridad creada: {pfad}',
    'daten.erstellenFehler': 'No se pudo crear la copia de seguridad. Inténtalo de nuevo.',
    'daten.zuGross': 'Este archivo es demasiado grande para ser una copia de seguridad de Abo-Warner. Tus suscripciones actuales no se han modificado.',
    'daten.nichtLesbar': 'No se pudo leer el archivo. Tus suscripciones actuales no se han modificado.',
    'daten.ersetzenTitel': '¿Reemplazar las suscripciones actuales?',
    'daten.enthaelt': 'La copia de seguridad contiene {anzahl}. ',
    'daten.werdenErsetzt': 'Tus {anzahl} actuales se reemplazarán.',
    'daten.keineVorhanden': 'En este momento no hay suscripciones guardadas.',
    'daten.ersetzen': 'Reemplazar',
    'daten.abgebrochen': 'Restauración cancelada. No se ha modificado nada.',
    'daten.wiederherstellenFehler': 'No se pudo restaurar. Inténtalo de nuevo.',
    'daten.wiederhergestellt': 'Copia de seguridad restaurada: {anzahl}.',
    'daten.pdfErstellt': 'PDF creado: {pfad}',
    'daten.pdfFehler': 'No se pudo crear el PDF. Inténtalo de nuevo.',
    'anzahl.abos': '{anzahl} suscripciones',
    'anzahl.abos.eins': '1 suscripción',

    // --- Comprobación del archivo de copia (sicherung.js) ---
    'sicherung.nichtsGeaendert': 'Tus suscripciones actuales no se han modificado.',
    'sicherung.leer': 'El archivo está vacío.',
    'sicherung.zuGross': 'Este archivo es demasiado grande para ser una copia de seguridad de Abo-Warner.',
    'sicherung.unlesbar': 'Este archivo no es una copia de seguridad de Abo-Warner (no se puede leer el contenido).',
    'sicherung.fremd': 'Este archivo no es una copia de seguridad de Abo-Warner.',
    'sicherung.keineAbos': 'La copia de seguridad no contiene suscripciones.',
    'sicherung.beschaedigt': 'La copia de seguridad está dañada: {ungueltig} de {gesamt} entradas están incompletas.',
    'sicherung.doppelt': 'La copia de seguridad está dañada (entradas duplicadas).',

    // --- Títulos del menú Compartir y nombres de archivo ---
    'teilen.export': 'Copia de seguridad de Abo-Warner',
    'teilen.schreiben': 'Carta de cancelación',
    'teilen.pdf': 'Resumen de suscripciones',
    'datei.schreiben': 'Cancelacion',
    'datei.pdf': 'Resumen-suscripciones',

    // --- Carta de cancelación: ventana ---
    'brief.titel': 'Carta de cancelación — {name}',
    'brief.probeHinweis': 'Tu periodo de prueba termina el <strong>{datum}</strong>. Cancela antes; si no, empezarás a pagar.',
    'brief.fristHinweis': 'Para que la cancelación llegue a tiempo, el proveedor debe recibirla a más tardar el <strong>{datum}</strong>.',
    'brief.absender': 'Tus datos de remitente:',
    'brief.absenderKurz': '{name}, {ort} (cambiar)',
    'brief.bitteAusfuellen': 'por favor, rellena',
    'brief.feldName': 'Nombre',
    'brief.feldNamePlatzhalter': 'Ana García',
    'brief.feldStrasse': 'Calle y número',
    'brief.feldStrassePlatzhalter': 'Calle Ejemplo 1',
    'brief.feldPlzOrt': 'Código postal y ciudad',
    'brief.feldPlzOrtPlatzhalter': '12345 Ciudad Ejemplo',
    'brief.feldEmail': 'Correo electrónico',
    'brief.feldEmailHinweis': '(opcional, para la confirmación)',
    'brief.optional': 'opcional',
    'brief.merkHinweis': 'Se guarda en este dispositivo y se rellena automáticamente la próxima vez.',
    'brief.tipp': 'Consejo: en «Editar» puedes añadir a la suscripción {liste}. Así aparecerán automáticamente en la carta.',
    'brief.tippAnschrift': 'la dirección del proveedor',
    'brief.tippVertragsnummer': 'el número de contrato',
    'brief.tippKundennummer': 'el número de cliente',
    'brief.schreiben': 'Tu carta',
    'brief.schreibenHinweis': '(aquí todavía puedes modificarla)',
    'brief.kopieren': 'Copiar al portapapeles',
    'brief.teilen': 'Compartir como archivo',
    'brief.markieren': 'Marcar suscripción como cancelada',
    'brief.kopiert': 'Copiado al portapapeles.',
    'brief.kopierenFehler': 'No se pudo copiar. Selecciona el texto y cópialo a mano.',
    'brief.gespeichert': 'Guardado como: {pfad}',
    'brief.speichernFehler': 'No se pudo guardar. Inténtalo de nuevo.',

    // --- Carta de cancelación: texto (neutral, sin referencia a la ley alemana) ---
    'brief.platzhalterName': '[Tu nombre]',
    'brief.platzhalterStrasse': '[Calle y número]',
    'brief.platzhalterPlzOrt': '[Código postal y ciudad]',
    'brief.betreff': 'Cancelación: {name}',
    'brief.vertragsnummer': 'Número de contrato: {nummer}',
    'brief.kundennummer': 'Número de cliente: {nummer}',
    'brief.anrede': 'Estimados señores:',
    'brief.kern': 'Por la presente cancelo el contrato arriba indicado en la fecha más próxima posible.',
    'brief.bestaetigungMail': 'Les ruego que me confirmen la cancelación por escrito a la dirección de correo {email}.',
    'brief.bestaetigung': 'Les ruego que me confirmen la cancelación por escrito.',
    'brief.gruss': 'Atentamente,',
    'brief.unterschriftslinie': '_______________________',

    // --- Aviso al iniciar y notificaciones ---
    'hinweis.titel': 'El plazo de cancelación termina pronto',
    'hinweis.zeile': 'cancelar hasta el {datum}',
    'hinweis.zeileProbe': 'la prueba termina el {datum}',
    'mitteilung.fristTitel': 'Plazo de cancelación',
    'mitteilung.fristText': '{name}: solo puedes cancelar hasta el {datum}.',
    'mitteilung.endeTitel': 'Fin del contrato',
    'mitteilung.endeText': '{name} termina hoy.',
    'mitteilung.probeTitel': 'La prueba termina pronto',
    'mitteilung.probeText': '{name}: la prueba termina el {datum} – cancela ahora; si no, empezarás a pagar.',

    // --- Resumen en PDF ---
    'pdf.titel': 'Resumen de suscripciones',
    'pdf.untertitel': 'Abo-Warner Pro · creado el {datum} · {anzahl}',
    'pdf.spalteAbo': 'Suscripción',
    'pdf.spalteKosten': 'Coste',
    'pdf.spalteTurnus': 'Frecuencia',
    'pdf.spalteZahlung': 'Próximo pago',
    'pdf.spalteKuendigung': 'Cancelar hasta',
    'pdf.spalteStatus': 'Estado',
    'pdf.laeuft': 'activa',
    'pdf.probe': 'Prueba hasta el {datum}',
    'pdf.gekuendigtZum': 'cancelada, termina el {datum}',
    'pdf.beendet': 'terminada ({datum})',
    'pdf.gekuendigt': 'cancelada',
    'pdf.leer': 'No hay suscripciones guardadas.',
    'pdf.summe': 'Total de suscripciones activas ({anzahl}):',
    'pdf.proMonat': 'al mes: {betrag}',
    'pdf.proJahr': 'al año: {betrag}',
    'pdf.hinweis': 'Las suscripciones canceladas se incluyen hasta el fin del contrato.',
    'pdf.fremdwaehrung': ' Las demás monedas se convierten a {waehrung} con un tipo de cambio de referencia (aprox.).',
    'pdf.seite': 'Página {seite} de {anzahl}',
    'pdf.fusszeile': 'Creado con Abo-Warner Pro – todos los datos sin garantía, basados en tus propias entradas.',

    // --- Idioma ---
    'sprache.titel': 'Idioma y moneda',
    'sprache.auto': 'Automático (idioma del dispositivo)',
    'sprache.uebernehmen': 'Aplicar',
    'waehrung.titel': 'Moneda principal',
    'waehrung.hinweis': 'Para los totales. Las suscripciones en otras monedas se convierten con un tipo de cambio fijo de referencia (noviembre de 2026, «aprox.»). Tus suscripciones no cambian.',
    'waehrung.auto': 'Automática ({code})',

    // --- Pie de página, textos legales, contacto ---
    'fuss.datenschutz': 'Privacidad',
    'fuss.impressum': 'Aviso legal',
    'fuss.kontakt': 'Contacto',
    'fuss.von': 'Un producto de AppVektor',
    'rechtlich.datenschutz': 'Política de privacidad',
    'rechtlich.impressum': 'Aviso legal',
    'rechtlich.kontakt': 'Contacto',
    'kontakt.ueberschrift': 'Preguntas, comentarios o solicitudes sobre privacidad',
    'kontakt.schreib': 'Escríbenos por correo electrónico:',
    'kontakt.kopieren': 'Copiar dirección',
    'kontakt.kopiert': 'Dirección copiada.',
    'kontakt.kopierenFehler': 'No se puede copiar. Selecciona la dirección y cópiala a mano.',
    'kontakt.keinMailProgramm': 'Si no se abre ninguna app de correo, copia la dirección y escríbenos desde tu servicio de correo habitual.',
    'kontakt.telefon': 'Teléfono: +49 421 9899 1701',

    'datenschutz.inhalt': `
                <p class="rechtlich-sprachhinweis">En caso de duda, prevalece la versión alemana.</p>

                <h3>1. Responsable</h3>
                <p>
                    AppVektor, titular: Jens Hübeler<br>
                    c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern, Alemania<br>
                    Correo electrónico: kontakt@appvektor.com<br>
                    Teléfono: +49 421 9899 1701
                </p>

                <h3>2. Finalidad del tratamiento y datos tratados</h3>
                <p>Abo-Warner Pro solo trata los datos que introduces tú mismo (nombre de la suscripción, coste, categoría, fechas de pago y plazos de preaviso y, si los indicas, número de contrato, número de cliente, dirección del proveedor y tus datos de remitente para la carta de cancelación). Estos datos se guardan únicamente de forma local en un archivo de tu dispositivo (en el directorio de datos de aplicaciones de tu usuario en el sistema operativo). No se transmiten al proveedor ni a terceros.</p>
                <p><strong>Leer desde una foto (opcional):</strong> Solo cuando tocas «Leer desde una foto» y después «Hacer foto» o «Elegir imagen», la app abre la cámara o el selector de imágenes de tu dispositivo; solo entonces tu dispositivo puede pedirte permiso. La imagen se analiza exclusivamente en tu dispositivo (iPhone: el reconocimiento de texto «Vision» de Apple, incluido en el sistema operativo; Android: el reconocimiento de texto Tesseract incluido en la app). No se guarda ni se transmite; los archivos temporales se eliminan después de la lectura. Los datos reconocidos solo se introducen en el formulario como propuesta y se guardan únicamente cuando tú mismo tocas «Guardar suscripción». No se transmite nada al proveedor ni a terceros.</p>

                <h3>3. Registros del servidor, alojamiento y servicios externos</h3>
                <p>AppVektor no opera ningún servidor que reciba datos de la app; por lo tanto, AppVektor no tiene registros del servidor sobre tu uso de la app. Las fuentes que usa la app están guardadas localmente en la app; la app no carga contenidos de servidores externos. No hay servicios de análisis, seguimiento ni publicidad integrados. Si obtienes la app en una tienda de aplicaciones (p. ej. Apple App Store o Google Play), su operador trata los datos generados bajo su propia responsabilidad.</p>
                <p>Al final de la app encontrarás un enlace a appvektor.com. Si lo tocas, el sitio web se abre en el navegador de tu dispositivo; allí se aplica la política de privacidad del sitio web. La app en sí no transmite ningún dato en este proceso.</p>

                <h3>4. Sin análisis ni seguimiento</h3>
                <p>Abo-Warner Pro no utiliza cookies, software de análisis ni seguimiento de usuarios.</p>

                <h3>5. Plazo de conservación</h3>
                <p>Tus datos permanecen guardados localmente hasta que los elimines, los modifiques o los exportes desde la app, o hasta que desinstales la app.</p>

                <h3>6. Tus derechos</h3>
                <p>Como todos los datos se guardan exclusivamente en tu dispositivo, puedes ejercer en cualquier momento tus derechos de acceso, rectificación y supresión (art. 15, 16 y 17 RGPD) directamente con las funciones «Editar», «Eliminar» y «Crear copia de seguridad» (en «Proteger tus datos») de la app. Para otras solicitudes, utiliza la dirección de contacto indicada en el aviso legal. También tienes derecho a presentar una reclamación ante una autoridad de control de protección de datos (art. 77 RGPD).</p>

                <h3>7. Contacto para cuestiones de privacidad</h3>
                <p>Para solicitudes sobre privacidad o para ejercer tus derechos, puedes contactarnos en kontakt@appvektor.com o por teléfono en el +49 421 9899 1701.</p>
            `,

    'impressum.inhalt': `
                <p class="rechtlich-sprachhinweis">En caso de duda, prevalece la versión alemana.</p>

                <h3>Información según el § 5 DDG (Ley alemana de servicios digitales)</h3>
                <p>
                    AppVektor<br>
                    Titular: Jens Hübeler<br>
                    c/o Flexdienst – #21882<br>
                    Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern<br>
                    Alemania
                </p>

                <h3>Contacto</h3>
                <p>
                    Correo electrónico: kontakt@appvektor.com<br>
                    Teléfono: +49 421 9899 1701
                </p>

                <h3>Responsable del contenido según el § 18, apdo. 2 MStV (Tratado estatal alemán sobre medios)</h3>
                <p>Jens Hübeler, c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74, 67663 Kaiserslautern, Alemania</p>
            `,

    'hilfe.titel': 'Ayuda',
    'hilfe.inhalt': `
                <h3>¿Qué hace la app?</h3>
                <p>Abo-Warner Pro tiene bajo control tus suscripciones y contratos: cuánto cuestan, cuándo pagas y hasta cuándo puedes cancelar. 7 días antes de que termine un plazo de cancelación, la app te avisa con una notificación, si permites las notificaciones. Todos tus datos se quedan solo en tu móvil.</p>

                <h3>¿Cómo añado una suscripción?</h3>
                <ol>
                    <li>Toca «Nueva suscripción».</li>
                    <li>Si quieres: toca «Leer desde una foto» y haz una foto de una factura o de una confirmación del contrato (o elige una captura de pantalla). La app te propone los datos que reconoce y tú los revisas. La imagen solo se lee en tu móvil y no se guarda.</li>
                    <li>Introduce el nombre, el coste y la frecuencia de pago (cada cuánto pagas, p. ej. mensual).</li>
                    <li>Elige la fecha del próximo pago.</li>
                    <li>Introduce el plazo de preaviso en días, semanas o meses (ver más abajo).</li>
                    <li>¿Estás en un periodo de prueba gratuito? Activa «Periodo de prueba» y elige cuándo termina. La tarjeta mostrará «La prueba termina el …» y la app te avisará 3 días antes.</li>
                    <li>Si quieres: en «Más datos», introduce el número de contrato, el número de cliente y la dirección del proveedor. Aparecerán automáticamente en tu carta de cancelación.</li>
                    <li>Toca «Guardar suscripción».</li>
                </ol>
                <p>Puedes cambiarlo todo más tarde con «Editar» en la tarjeta.</p>

                <h3>¿Qué significa el plazo de preaviso?</h3>
                <p>El plazo de preaviso indica con cuánta antelación al próximo pago debe llegar tu cancelación al proveedor. Lo encontrarás en tu contrato. Introdúcelo tal como aparece allí: escribe el número y elige al lado días, semanas o meses. Si pone p. ej. «3 meses», elige 3 y «Meses». La app calcula entonces con meses de calendario reales.</p>
                <p>La app calcula la fecha y la muestra en cada tarjeta: «Cancelar hasta el …». Cuando esa fecha ha pasado, te muestra la siguiente posibilidad.</p>

                <h3>¿Qué significan el rojo, el amarillo y el verde?</h3>
                <ul class="hilfe-farben">
                    <li><span class="hilfe-punkt rot" aria-hidden="true"></span><strong>Rojo:</strong> Quedan 7 días o menos hasta la fecha límite de cancelación. Actúa ahora si ya no quieres la suscripción. Al inicio de estos 7 días recibirás una notificación.</li>
                    <li><span class="hilfe-punkt gelb" aria-hidden="true"></span><strong>Amarillo:</strong> Quedan 30 días o menos.</li>
                    <li><span class="hilfe-punkt gruen" aria-hidden="true"></span><strong>Verde:</strong> Quedan más de 30 días.</li>
                    <li><span class="hilfe-punkt grau" aria-hidden="true"></span><strong>Etiqueta gris «Cancelada, termina el …»:</strong> La suscripción está cancelada. Hasta esa fecha, la tarjeta se queda en su sitio habitual, porque hasta entonces sigues pagando. Después se vuelve más pálida y pasa al final de la lista.</li>
                </ul>

                <h3>¿En qué moneda aparecen los totales?</h3>
                <p>En tu moneda principal. La app la propone según tu país. Puedes cambiarla con el globo terráqueo de arriba a la derecha. Si tienes suscripciones en otras monedas, la app las convierte con un tipo de cambio fijo de referencia y añade «aprox.», porque no consulta tipos de cambio en internet.</p>

                <h3>¿Cómo cancelo?</h3>
                <ol>
                    <li>Toca «Cancelar contrato» en la tarjeta.</li>
                    <li>La app te prepara una carta de cancelación lista para enviar. Tu nombre y tu dirección solo tienes que introducirlos una vez.</li>
                    <li>Copia la carta o compártela como archivo y envíasela al proveedor. La app no envía nada por sí misma. Lo mejor es enviarla de forma que tengas un justificante (p. ej. un correo con acuse de recibo o una carta certificada).</li>
                    <li>Toca «Marcar suscripción como cancelada» y elige el fin del contrato. Hasta entonces, la suscripción se queda en la lista, porque sigues pagando. El último día recibirás una notificación: «… termina hoy.»</li>
                </ol>

                <h3>¿Cómo protejo mis datos?</h3>
                <p>Tus suscripciones solo están guardadas en este móvil. Si borras la app o pierdes el móvil, desaparecen. Por eso, al final, en «Proteger tus datos», encontrarás:</p>
                <ul>
                    <li><strong>Crear copia de seguridad:</strong> guarda todas las suscripciones en un archivo. Guárdalo en un lugar seguro, p. ej. en tu nube o enviándolo a tu propio correo.</li>
                    <li><strong>Restaurar copia de seguridad:</strong> vuelve a cargar ese archivo, p. ej. en un móvil nuevo. Atención: las suscripciones del móvil se reemplazarán.</li>
                    <li><strong>Resumen en PDF:</strong> una lista para imprimir o compartir. No es una copia de seguridad.</li>
                </ul>

                <h3>¿Tienes preguntas?</h3>
                <p>Toca «Contacto» al final de la app y escríbenos.</p>
            `
};
