/**
 * pt.js | Português (variante do Brasil, tratamento "você").
 * Chaves em falta aparecem automaticamente em alemão (ver t() em i18n.js).
 */

export default {
    // --- Cabeçalho, introdução, barra de ferramentas ---
    'kopf.hilfe': 'Ajuda',
    'kopf.sprache': 'Idioma',
    'start.titel': 'Visão geral das assinaturas',
    'start.subline': 'Seu monitoramento',
    'start.untertitel': 'Mantenha todos os seus contratos, custos e prazos de cancelamento em um só lugar.',
    'suche.platzhalter': 'Pesquisar ou filtrar assinaturas …',
    'knopf.neuesAbo': 'Nova assinatura',

    // --- Blocos de resumo ---
    'stat.aktiv': 'Assinaturas ativas',
    'stat.monat': 'Custo / mês',
    'stat.jahr': 'Custo / ano',
    'stat.fristen': 'Prazos urgentes',

    // --- Lista, filtros, cartões ---
    'filter.alle': 'Todas',
    'liste.leer': 'Nenhuma assinatura encontrada.',
    'status.kritisch': 'Crítico',
    'status.warnung': 'Em breve',
    'status.sicher': 'Seguro',
    'status.gekuendigt': 'Cancelada',
    'karte.gekuendigtZum': 'Cancelada, termina em {datum}',
    'karte.moeglichBis': 'Cancelar até {datum}',
    'karte.probeEndet': 'Teste termina em {datum}',
    'karte.probeBadge': 'Teste',
    'karte.keineZahlung': 'Sem mais pagamentos',
    'karte.naechsteZahlung': 'Próximo pagamento: {datum}',
    'karte.tageBisZahlung': '{tage} dias até o pagamento · prazo {frist}',
    'karte.laeuftHeuteAus': 'Termina hoje',
    'karte.laeuftNoch': 'Termina em {anzahl} dias',
    'karte.laeuftNoch.eins': 'Termina em {anzahl} dia',
    'knopf.bearbeiten': 'Editar',
    'knopf.kuendigen': 'Cancelar contrato',
    'knopf.loeschen': 'Excluir',
    'knopf.speichern': 'Salvar',
    'knopf.abbrechen': 'Cancelar',
    'knopf.schliessen': 'Fechar',
    'knopf.ok': 'OK',

    // --- Frequência e categorias (os valores salvos continuam em alemão) ---
    'turnus.Monatlich': 'Mensal',
    'turnus.Vierteljährlich': 'Trimestral',
    'turnus.Halbjährlich': 'Semestral',
    'turnus.Jährlich': 'Anual',
    'kategorie.Streaming': 'Streaming',
    'kategorie.Musik': 'Música',
    'kategorie.Software': 'Software',
    'kategorie.Sport': 'Esporte',
    'kategorie.Versicherung': 'Seguro',
    'kategorie.Energie': 'Energia',
    'kategorie.Telekommunikation': 'Telecomunicações',
    'kategorie.Wohnen': 'Moradia',
    'kategorie.Sonstiges': 'Outros',

    // --- Campos do formulário (nova assinatura + editar) ---
    'feld.name': 'Nome da assinatura',
    'feld.namePlatzhalter': 'ex.: Netflix',
    'feld.kosten': 'Custo',
    'feld.kostenPlatzhalter': 'ex.: 29,99',
    'feld.waehrung': 'Moeda',
    'feld.waehrungPlatzhalter': 'ex.: EUR',
    'feld.turnus': 'Frequência de pagamento',
    'feld.kategorie': 'Categoria',
    'feld.naechsteZahlung': 'Próximo pagamento',
    'feld.datumPlatzhalter': 'Escolher data',
    'feld.frist': 'Prazo de aviso prévio',
    'feld.probe': 'Período de teste',
    'feld.probeEnde': 'O teste termina em',
    'feld.fristEinheit': 'Unidade do prazo de aviso prévio',
    'einheit.tage': 'Dias',
    'einheit.wochen': 'Semanas',
    'einheit.monate': 'Meses',
    'frist.tage': '{anzahl} dias',
    'frist.tage.eins': '{anzahl} dia',
    'frist.wochen': '{anzahl} semanas',
    'frist.wochen.eins': '{anzahl} semana',
    'frist.monate': '{anzahl} meses',
    'frist.monate.eins': '{anzahl} mês',
    'feld.vertragsnummer': 'Número do contrato',
    'feld.kundennummer': 'Número de cliente',
    'feld.vertragspartner': 'Fornecedor (nome da empresa e endereço)',
    'feld.vertragspartnerPlatzhalter': 'ex.: Empresa Exemplo Ltda.\nAtendimento ao cliente\nRua Exemplo, 1\n12345-000 Cidade Exemplo',
    'feld.gekuendigtZum': 'Cancelada, o contrato termina em',
    'feld.fehler': 'Preencha todos os campos corretamente (incluindo a data).',
    'neu.titel': 'Adicionar nova assinatura',
    'neu.weitere': 'Mais informações (opcional)',
    'neu.weitereHinweis': 'Elas entram automaticamente na sua carta de cancelamento.',
    'neu.speichern': 'Salvar assinatura',
    'edit.vertragsdaten': 'Dados do contrato',
    'edit.vertragsdatenHinweis': '(opcional, para a carta de cancelamento)',

    // --- Per Foto einlesen ---
    'foto.knopf': 'Ler de uma foto',
    'foto.hinweis': 'Tire uma foto de uma fatura ou confirmação de contrato, ou escolha uma imagem, por exemplo, uma captura de tela. O texto é lido apenas no seu aparelho, sem internet. A imagem não é salva.',
    'foto.aufnehmen': 'Tirar foto',
    'foto.auswaehlen': 'Escolher imagem',
    'foto.laeuft': 'Lendo o texto …',
    'foto.erkannt': '{anzahl} informações preenchidas. Confira e corrija se necessário. O que não foi reconhecido com segurança fica vazio.',
    'foto.erkannt.eins': '1 informação preenchida. Confira e corrija se necessário. O que não foi reconhecido com segurança fica vazio.',
    'foto.nichts': 'Nada foi reconhecido com segurança na imagem. Informe os dados você mesmo.',
    'foto.fehler': 'Não foi possível ler a imagem. Tente uma foto mais nítida ou informe os dados você mesmo.',
    'foto.nurApp': 'O reconhecimento de texto só está disponível no app do celular.',

    // --- Excluir, marcar como cancelada ---
    'loeschen.titel': 'Excluir esta assinatura?',
    'loeschen.text': '“{name}” será removida definitivamente da sua lista.',
    'gekuendigt.titel': 'Fim do contrato',
    'gekuendigt.text': 'Até que data “{name}” continua ativa? Até lá, a assinatura continua na sua lista e nos seus custos. Você pode alterar a data sugerida, por exemplo, conforme a confirmação do fornecedor.',
    'gekuendigt.label': 'Fim do contrato',
    'gekuendigt.speichern': 'Salvar como cancelada',
    'datum.fehlt': 'Escolha uma data.',

    // --- Calendário ---
    'kalender.wochentage': 'Seg,Ter,Qua,Qui,Sex,Sáb,Dom',
    'kalender.monate': 'Janeiro,Fevereiro,Março,Abril,Maio,Junho,Julho,Agosto,Setembro,Outubro,Novembro,Dezembro',

    // --- Backup, restaurar, PDF ---
    'daten.titel': 'Proteger seus dados',
    'daten.text': 'Suas assinaturas ficam salvas apenas neste aparelho. Crie um backup de vez em quando e guarde-o em um lugar seguro, por exemplo, na sua nuvem ou enviando-o para o seu próprio e-mail.',
    'daten.erstellen': 'Criar backup',
    'daten.wiederherstellen': 'Restaurar backup',
    'daten.pdf': 'Visão geral em PDF',
    'daten.pdfText': 'Uma lista de todas as suas assinaturas para imprimir ou compartilhar. Isto não é um backup: para restaurar seus dados mais tarde, use “Criar backup”.',
    'daten.erstellt': 'Backup criado: {pfad}',
    'daten.erstellenFehler': 'Não foi possível criar o backup. Tente novamente.',
    'daten.zuGross': 'Este arquivo é grande demais para ser um backup do Abo-Warner. Suas assinaturas atuais não foram alteradas.',
    'daten.nichtLesbar': 'Não foi possível ler o arquivo. Suas assinaturas atuais não foram alteradas.',
    'daten.ersetzenTitel': 'Substituir as assinaturas atuais?',
    'daten.enthaelt': 'O backup contém {anzahl}. ',
    'daten.werdenErsetzt': 'Suas {anzahl} atuais serão substituídas.',
    'daten.keineVorhanden': 'No momento não há assinaturas salvas.',
    'daten.ersetzen': 'Substituir',
    'daten.abgebrochen': 'Restauração cancelada. Nada foi alterado.',
    'daten.wiederherstellenFehler': 'Não foi possível restaurar. Tente novamente.',
    'daten.wiederhergestellt': 'Backup restaurado: {anzahl}.',
    'daten.pdfErstellt': 'PDF criado: {pfad}',
    'daten.pdfFehler': 'Não foi possível criar o PDF. Tente novamente.',
    'anzahl.abos': '{anzahl} assinaturas',
    'anzahl.abos.eins': '1 assinatura',

    // --- Verificação do arquivo de backup (sicherung.js) ---
    'sicherung.nichtsGeaendert': 'Suas assinaturas atuais não foram alteradas.',
    'sicherung.leer': 'O arquivo está vazio.',
    'sicherung.zuGross': 'Este arquivo é grande demais para ser um backup do Abo-Warner.',
    'sicherung.unlesbar': 'Este arquivo não é um backup do Abo-Warner (o conteúdo não pode ser lido).',
    'sicherung.fremd': 'Este arquivo não é um backup do Abo-Warner.',
    'sicherung.keineAbos': 'O backup não contém nenhuma assinatura.',
    'sicherung.beschaedigt': 'O backup está danificado: {ungueltig} de {gesamt} registros estão incompletos.',
    'sicherung.doppelt': 'O backup está danificado (registros duplicados).',

    // --- Títulos do menu Compartilhar e nomes de arquivo ---
    'teilen.export': 'Backup do Abo-Warner',
    'teilen.schreiben': 'Carta de cancelamento',
    'teilen.pdf': 'Visão geral das assinaturas',
    'datei.schreiben': 'Cancelamento',
    'datei.pdf': 'Visao-geral-assinaturas',

    // --- Carta de cancelamento: janela ---
    'brief.titel': 'Carta de cancelamento — {name}',
    'brief.probeHinweis': 'Seu período de teste termina em <strong>{datum}</strong>. Cancele antes, senão a assinatura passa a ser cobrada.',
    'brief.fristHinweis': 'Para que o cancelamento chegue a tempo, o fornecedor deve recebê-lo até <strong>{datum}</strong>.',
    'brief.absender': 'Seus dados de remetente:',
    'brief.absenderKurz': '{name}, {ort} (alterar)',
    'brief.bitteAusfuellen': 'preencha, por favor',
    'brief.feldName': 'Nome',
    'brief.feldNamePlatzhalter': 'Maria Silva',
    'brief.feldStrasse': 'Rua e número',
    'brief.feldStrassePlatzhalter': 'Rua Exemplo, 1',
    'brief.feldPlzOrt': 'CEP e cidade',
    'brief.feldPlzOrtPlatzhalter': '12345-000 Cidade Exemplo',
    'brief.feldEmail': 'E-mail',
    'brief.feldEmailHinweis': '(opcional, para a confirmação)',
    'brief.optional': 'opcional',
    'brief.merkHinweis': 'Fica salvo neste aparelho e é preenchido automaticamente da próxima vez.',
    'brief.tipp': 'Dica: em “Editar” você pode adicionar à assinatura {liste}. Assim eles aparecem automaticamente na carta.',
    'brief.tippAnschrift': 'o endereço do fornecedor',
    'brief.tippVertragsnummer': 'o número do contrato',
    'brief.tippKundennummer': 'o número de cliente',
    'brief.schreiben': 'Sua carta',
    'brief.schreibenHinweis': '(você ainda pode ajustá-la aqui)',
    'brief.kopieren': 'Copiar para a área de transferência',
    'brief.teilen': 'Compartilhar como arquivo',
    'brief.markieren': 'Marcar assinatura como cancelada',
    'brief.kopiert': 'Copiado para a área de transferência.',
    'brief.kopierenFehler': 'Não foi possível copiar. Selecione o texto e copie-o manualmente.',
    'brief.gespeichert': 'Salvo como: {pfad}',
    'brief.speichernFehler': 'Não foi possível salvar. Tente novamente.',

    // --- Carta de cancelamento: texto (neutro, sem referência à lei alemã) ---
    'brief.platzhalterName': '[Seu nome]',
    'brief.platzhalterStrasse': '[Rua e número]',
    'brief.platzhalterPlzOrt': '[CEP e cidade]',
    'brief.betreff': 'Cancelamento: {name}',
    'brief.vertragsnummer': 'Número do contrato: {nummer}',
    'brief.kundennummer': 'Número de cliente: {nummer}',
    'brief.anrede': 'Prezados senhores,',
    'brief.kern': 'Venho por meio desta cancelar o contrato acima indicado na data mais próxima possível.',
    'brief.bestaetigungMail': 'Solicito que confirmem o cancelamento por escrito para o e-mail {email}.',
    'brief.bestaetigung': 'Solicito que confirmem o cancelamento por escrito.',
    'brief.gruss': 'Atenciosamente,',
    'brief.unterschriftslinie': '_______________________',

    // --- Aviso ao iniciar e notificações ---
    'hinweis.titel': 'O prazo de cancelamento termina em breve',
    'hinweis.zeile': 'cancelar até {datum}',
    'hinweis.zeileProbe': 'teste termina em {datum}',
    'mitteilung.fristTitel': 'Prazo de cancelamento',
    'mitteilung.fristText': '{name}: o cancelamento só é possível até {datum}.',
    'mitteilung.endeTitel': 'Fim do contrato',
    'mitteilung.endeText': '{name} termina hoje.',
    'mitteilung.probeTitel': 'O teste termina em breve',
    'mitteilung.probeText': '{name}: o teste termina em {datum} – cancele agora, senão a assinatura passa a ser cobrada.',

    // --- Visão geral em PDF ---
    'pdf.titel': 'Visão geral das assinaturas',
    'pdf.untertitel': 'Abo-Warner Pro · criado em {datum} · {anzahl}',
    'pdf.spalteAbo': 'Assinatura',
    'pdf.spalteKosten': 'Custo',
    'pdf.spalteTurnus': 'Frequência',
    'pdf.spalteZahlung': 'Próximo pagamento',
    'pdf.spalteKuendigung': 'Cancelar até',
    'pdf.spalteStatus': 'Status',
    'pdf.laeuft': 'ativa',
    'pdf.probe': 'Teste até {datum}',
    'pdf.gekuendigtZum': 'cancelada, termina em {datum}',
    'pdf.beendet': 'encerrada ({datum})',
    'pdf.gekuendigt': 'cancelada',
    'pdf.leer': 'Nenhuma assinatura salva.',
    'pdf.summe': 'Total das assinaturas ativas ({anzahl}):',
    'pdf.proMonat': 'por mês: {betrag} €',
    'pdf.proJahr': 'por ano: {betrag} €',
    'pdf.hinweis': 'Assinaturas canceladas são incluídas até o fim do contrato.',
    'pdf.fremdwaehrung': ' Outras moedas são convertidas em euros a uma taxa aproximada.',
    'pdf.seite': 'Página {seite} de {anzahl}',
    'pdf.fusszeile': 'Criado com Abo-Warner Pro – todas as informações sem garantia, com base nos seus próprios dados.',

    // --- Idioma ---
    'sprache.titel': 'Idioma',
    'sprache.auto': 'Automático (idioma do aparelho)',
    'sprache.uebernehmen': 'Aplicar',

    // --- Rodapé, textos legais, contato ---
    'fuss.datenschutz': 'Privacidade',
    'fuss.impressum': 'Informações legais',
    'fuss.kontakt': 'Contato',
    'fuss.von': 'Um produto da AppVektor',
    'rechtlich.datenschutz': 'Política de privacidade',
    'rechtlich.impressum': 'Informações legais',
    'rechtlich.kontakt': 'Contato',
    'kontakt.ueberschrift': 'Dúvidas, sugestões ou solicitações sobre privacidade',
    'kontakt.schreib': 'Escreva para nós por e-mail:',
    'kontakt.kopieren': 'Copiar endereço',
    'kontakt.kopiert': 'Endereço copiado.',
    'kontakt.kopierenFehler': 'Não é possível copiar. Selecione o endereço e copie-o manualmente.',
    'kontakt.keinMailProgramm': 'Se nenhum app de e-mail abrir, copie o endereço e escreva para nós pelo seu serviço de e-mail habitual.',
    'kontakt.telefon': 'Telefone: +49 421 9899 1701',

    'datenschutz.inhalt': `
                <p class="rechtlich-sprachhinweis">Em caso de dúvida, prevalece a versão alemã.</p>

                <h3>1. Responsável</h3>
                <p>
                    AppVektor, proprietário: Jens Hübeler<br>
                    c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern, Alemanha<br>
                    E-mail: kontakt@appvektor.com<br>
                    Telefone: +49 421 9899 1701
                </p>

                <h3>2. Finalidade do tratamento e dados tratados</h3>
                <p>O Abo-Warner Pro trata apenas os dados que você mesmo informa (nome da assinatura, custo, categoria, datas de pagamento e prazos de aviso prévio e, se você os informar, número do contrato, número de cliente, endereço do fornecedor e seus dados de remetente para a carta de cancelamento). Esses dados ficam salvos apenas localmente em um arquivo no seu aparelho (no diretório de dados de aplicativos do seu usuário no sistema operacional). Eles não são transmitidos ao fornecedor do app nem a terceiros.</p>
                <p><strong>Ler de uma foto (opcional):</strong> Somente quando você toca em “Ler de uma foto” e depois em “Tirar foto” ou “Escolher imagem” o app abre a câmera ou o seletor de imagens do seu aparelho; só então o seu aparelho pode pedir permissão. A imagem é analisada exclusivamente no seu aparelho (iPhone: reconhecimento de texto “Vision” da Apple, que faz parte do sistema operacional; Android: o reconhecimento de texto Tesseract incluído no app). Ela não é salva nem transmitida; arquivos temporários são excluídos após a leitura. Os dados reconhecidos são apenas sugeridos no formulário e só são salvos quando você mesmo toca em “Salvar assinatura”. Nada é transmitido ao fornecedor do app nem a terceiros.</p>

                <h3>3. Registros de servidor, hospedagem e serviços externos</h3>
                <p>A AppVektor não opera nenhum servidor que receba dados do app; por isso, a AppVektor não possui registros de servidor sobre o seu uso do app. As fontes usadas pelo app ficam salvas localmente no app; o app não carrega conteúdo de servidores externos. Não há serviços de análise, rastreamento ou publicidade integrados. Se você obtiver o app em uma loja de aplicativos (por exemplo, Apple App Store ou Google Play), o operador da loja trata os dados resultantes sob sua própria responsabilidade.</p>
                <p>No final do app há um link para appvektor.com. Se você tocar nele, o site abre no navegador do seu aparelho; lá vale a política de privacidade do site. O próprio app não transmite nenhum dado nesse processo.</p>

                <h3>4. Sem análise e sem rastreamento</h3>
                <p>O Abo-Warner Pro não usa cookies, software de análise nem rastreamento de usuários.</p>

                <h3>5. Prazo de armazenamento</h3>
                <p>Seus dados ficam salvos localmente até que você os exclua, altere ou exporte pelo app, ou até que você desinstale o app.</p>

                <h3>6. Seus direitos</h3>
                <p>Como todos os dados ficam salvos exclusivamente no seu aparelho, você pode exercer a qualquer momento seus direitos de acesso, retificação e exclusão (art. 15, 16 e 17 do RGPD) diretamente pelas funções “Editar”, “Excluir” e “Criar backup” (em “Proteger seus dados”) do app. Para outras solicitações, use o endereço de contato indicado nas informações legais. Você também tem o direito de apresentar uma reclamação a uma autoridade de proteção de dados (art. 77 do RGPD).</p>

                <h3>7. Contato para questões de privacidade</h3>
                <p>Para solicitações sobre privacidade ou para exercer seus direitos, você pode nos contatar em kontakt@appvektor.com ou pelo telefone +49 421 9899 1701.</p>
            `,

    'impressum.inhalt': `
                <p class="rechtlich-sprachhinweis">Em caso de dúvida, prevalece a versão alemã.</p>

                <h3>Informações conforme o § 5 DDG (Lei alemã de serviços digitais)</h3>
                <p>
                    AppVektor<br>
                    Proprietário: Jens Hübeler<br>
                    c/o Flexdienst – #21882<br>
                    Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern<br>
                    Alemanha
                </p>

                <h3>Contato</h3>
                <p>
                    E-mail: kontakt@appvektor.com<br>
                    Telefone: +49 421 9899 1701
                </p>

                <h3>Responsável pelo conteúdo conforme o § 18, n.º 2 MStV (Tratado estadual alemão sobre mídia)</h3>
                <p>Jens Hübeler, c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74, 67663 Kaiserslautern, Alemanha</p>
            `,

    'hilfe.titel': 'Ajuda',
    'hilfe.inhalt': `
                <h3>O que o app faz?</h3>
                <p>O Abo-Warner Pro acompanha suas assinaturas e contratos: quanto custam, quando você paga e até quando pode cancelar. 7 dias antes de um prazo de cancelamento terminar, o app avisa você com uma notificação, se você permitir notificações. Todos os seus dados ficam apenas no seu celular.</p>

                <h3>Como adiciono uma assinatura?</h3>
                <ol>
                    <li>Toque em “Nova assinatura”.</li>
                    <li>Se quiser: toque em “Ler de uma foto” e tire uma foto de uma fatura ou confirmação de contrato (ou escolha uma captura de tela). O app sugere os dados que reconhece e você os confere. A imagem é lida apenas no seu celular e não é salva.</li>
                    <li>Informe o nome, o custo e a frequência de pagamento (com que frequência você paga, por exemplo, mensal).</li>
                    <li>Escolha a data do próximo pagamento.</li>
                    <li>Informe o prazo de aviso prévio em dias, semanas ou meses (veja abaixo).</li>
                    <li>Está em um período de teste gratuito? Ative “Período de teste” e escolha quando o teste termina. O cartão mostrará “Teste termina em …” e o app avisará você 3 dias antes.</li>
                    <li>Se quiser: em “Mais informações”, informe o número do contrato, o número de cliente e o endereço do fornecedor. Eles aparecerão automaticamente na sua carta de cancelamento.</li>
                    <li>Toque em “Salvar assinatura”.</li>
                </ol>
                <p>Você pode alterar tudo depois com “Editar” no cartão.</p>

                <h3>O que significa o prazo de aviso prévio?</h3>
                <p>O prazo de aviso prévio indica com quanta antecedência ao próximo pagamento o seu cancelamento precisa chegar ao fornecedor. Você o encontra no seu contrato. Informe-o como está escrito lá: digite o número e escolha ao lado dias, semanas ou meses. Se estiver escrito, por exemplo, “3 meses”, escolha 3 e “Meses”. O app então calcula com meses reais do calendário.</p>
                <p>O app calcula a data e a mostra em cada cartão: “Cancelar até …”. Quando essa data passa, ele mostra a próxima possibilidade.</p>

                <h3>O que significam vermelho, amarelo e verde?</h3>
                <ul class="hilfe-farben">
                    <li><span class="hilfe-punkt rot" aria-hidden="true"></span><strong>Vermelho:</strong> faltam 7 dias ou menos para a data-limite de cancelamento. Aja agora se não quiser mais a assinatura. No início desses 7 dias você recebe uma notificação.</li>
                    <li><span class="hilfe-punkt gelb" aria-hidden="true"></span><strong>Amarelo:</strong> faltam 30 dias ou menos.</li>
                    <li><span class="hilfe-punkt gruen" aria-hidden="true"></span><strong>Verde:</strong> faltam mais de 30 dias.</li>
                    <li><span class="hilfe-punkt grau" aria-hidden="true"></span><strong>Etiqueta cinza “Cancelada, termina em …”:</strong> a assinatura foi cancelada. Até essa data, o cartão fica no lugar de sempre, porque até lá você ainda paga. Depois, ele fica mais claro e vai para o final da lista.</li>
                </ul>

                <h3>Como cancelo?</h3>
                <ol>
                    <li>Toque em “Cancelar contrato” no cartão.</li>
                    <li>O app escreve para você uma carta de cancelamento pronta. Seu nome e seu endereço você só precisa informar uma vez.</li>
                    <li>Copie a carta ou compartilhe-a como arquivo e envie-a ao fornecedor. O app não envia nada sozinho. O ideal é enviar de forma que você tenha um comprovante (por exemplo, um e-mail com confirmação de recebimento ou uma carta registrada).</li>
                    <li>Toque em “Marcar assinatura como cancelada” e escolha o fim do contrato. Até lá, a assinatura fica na lista, porque você ainda paga. No último dia você recebe uma notificação: “… termina hoje.”</li>
                </ol>

                <h3>Como protejo meus dados?</h3>
                <p>Suas assinaturas ficam salvas apenas neste celular. Se você apagar o app ou perder o celular, elas se perdem. Por isso, bem no final, em “Proteger seus dados”, você encontra:</p>
                <ul>
                    <li><strong>Criar backup:</strong> salva todas as assinaturas em um arquivo. Guarde-o em um lugar seguro, por exemplo, na sua nuvem ou enviando-o para o seu próprio e-mail.</li>
                    <li><strong>Restaurar backup:</strong> carrega esse arquivo de novo, por exemplo, em um celular novo. Atenção: as assinaturas do celular serão substituídas.</li>
                    <li><strong>Visão geral em PDF:</strong> uma lista para imprimir ou compartilhar. Não é um backup.</li>
                </ul>

                <h3>Ainda tem dúvidas?</h3>
                <p>Toque em “Contato” no final e escreva para nós.</p>
            `
};
