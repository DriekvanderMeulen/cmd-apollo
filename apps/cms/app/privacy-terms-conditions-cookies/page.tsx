import Link from "next/link";

async function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="wrapper pt-12 pb-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-neutral-900">
                  Privacy beleid, Algemene voorwaarden en Cookie beleid
                </h1>
                <p className="text-neutral-600 mt-1.5 text-[15px]">
                  Ons beleid volgt standaarden en regels gezet door de Nederlandse overheid (Wbp) en Europese Unie (AVG)
                </p>
              </div>
              <Link
                href="/login"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                ← Terug naar inloggen
              </Link>
            </div>
          </div>

          {/* Privacy Policy Section */}
          <section className="space-y-6">
            <div className="border-b border-neutral-200 pb-4">
              <h2 className="text-2xl font-semibold text-neutral-900">Privacy beleid</h2>
            </div>
            
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">1. Inleiding</h3>
                <p>Deze Privacyverklaring beschrijft de manier waarop Apolloview de persoonlijke gegevens van de gebruiker verzamelt, bewaart en gebruikt, alsmede hoe deze persoonlijke gegevens worden gebruikt door derden.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">2. Aanvaarding</h3>
                <p>De gebruiker stemt zich in met het Privacy Beleid door het gebruik te maken van onze diensten.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">3. Gegevensverzameling</h3>
                <p>Apolloview verzamelt persoonlijke gegevens, zoals naam, e-mailadres en IP-adres, voor het verlenen van diensten en het versturen van marketingmateriaal.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">4. Gegevensbehandeling</h3>
                <p>Apolloview behoudt de persoonlijke gegevens van de gebruiker op een veilige manier en zorgt ervoor dat deze niet toegankelijk zijn voor onbevoegde derden.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">5. Gegevensverstrekking</h3>
                <p>Apolloview mag persoonlijke gegevens van de gebruiker verstrekken aan derden, zoals overheid en juridische instanties, zodat de rechten of belangen van Apolloview worden beschermd. Ook is het mogelijk dat Apolloview persoonlijke gegevens verstrekt aan derden die betrokken zijn bij de diensten die door de gebruiker werden gebruikt zoals webhostingbedrijven en andere partijen die hulp bieden bij de levering van de diensten.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">6. Cookies</h3>
                <p>Apolloview gebruikt cookies voor het verzamelen van statistieken over de bezoekersaantallen en de manier waarop de website wordt gebruikt, zodat we deze informatie kunnen gebruiken om de diensten aan te passen aan de wensen van de gebruikers. Deze cookies worden niet gebruikt voor het verzamelen van persoonlijke gegevens.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">7. Rechten van de gebruiker</h3>
                <p>De gebruiker heeft het recht op toegang tot, wijziging en verwijdering van zijn/haar persoonlijke gegevens en kan op elk moment een verzoek indienen voor het opzeggen van onze diensten door middel van een verzoek in de profiel pagina.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">8. Wijzigingen in het Privacy Beleid</h3>
                <p>Wij kunnen deze Privacyverklaring bij elke keer wijzigen zonder hiervoor een voorafgaande melding te verstrekken aan de gebruiker. De nieuwe privacyverklaring gelden vanaf de datum van publicatie op onze website. De gebruiker kan op de profielpagina de huidig geldende voorwaarden inzien.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">9. Contact</h3>
                <p>Voor elke vraag of opmerking over het Privacy Beleid kan de gebruiker contact opnemen via <a href="mailto:support@driek.dev" className="text-blue-600 hover:text-blue-800 underline">support@driek.dev</a>, deze vragen zullen behandeld worden door de PO van Apolloview.</p>
              </div>
            </div>
          </section>

          {/* Terms and Conditions Section */}
          <section className="space-y-6">
            <div className="border-b border-neutral-200 pb-4">
              <h2 className="text-2xl font-semibold text-neutral-900">Algemene voorwaarden</h2>
            </div>
            
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">1. Inleiding</h3>
                <p>Deze Algemene Voorwaarden (AV) gelden voor iedere gebruiker van de website Apolloview en definiëren de rechten, verantwoordelijkheden en beperkingen van beide partijen.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">2. Aanvaarding</h3>
                <p>Door de gebruiker gebruik te maken van onze diensten, stemt hij/zij zich in met deze AV en het Privacy Beleid, zoals hieronder beschreven.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">3. Wijzigingen in de Algemene Voorwaarden</h3>
                <p>Wij kunnen deze AV bij elke keer wijzigen zonder hiervoor een voorafgaande melding te verstrekken aan de gebruiker. De nieuwe AV gelden vanaf de datum van publicatie op onze website.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">4. Verantwoordelijkheid</h3>
                <p>De gebruiker is verantwoordelijk voor het correct gebruik van onze diensten en de inhoud van het door hem/haar ingestuurde content, inclusief alle inhoud die door anderen op zijn/haar naam wordt geplaatst.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">5. Intellectuele eigendom</h3>
                <p>Alle informatie, teksten, afbeeldingen en andere materiaal op onze website behoren aan Apolloview of zijn door ons verstrekt met de toestemming van de rechthouder. De gebruiker mag dit niet gebruiken zonder toestemming.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">6. Verwijzing</h3>
                <p>Alle verwijzingen naar een andere website, dient te worden gezien als een service aan de gebruiker en geen uitdrukking van goedkeuring of verantwoordelijkheid voor de inhoud van die site.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">7. Disputes</h3>
                <p>Voor elk conflict, dat verwijst naar deze AV of het gebruik van onze diensten, wordt een Nederlands rechtsgebied toegepast.</p>
              </div>
            </div>
          </section>

          {/* Cookie Policy Section */}
          <section className="space-y-6">
            <div className="border-b border-neutral-200 pb-4">
              <h2 className="text-2xl font-semibold text-neutral-900">Cookie beleid</h2>
            </div>
            
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">1. Inleiding</h3>
                <p>Het Cookie Policy van Apolloview geeft informatie over de manier waarop we cookies gebruiken op onze website. Een cookie is een kleine tekenreeks die wordt opgeslagen door uw browser op uw computer, wanneer u Apolloview bezoekt.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">2. Aanvaarding</h3>
                <p>Door het aanmelden bij of het gebruik van onze website geeft de gebruiker zijn/haar toestemming voor het gebruik van cookies door Apolloview. De gebruiker kan altijd zijn/haar toestemming intrekken, zie hieronder.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">3. Type cookies</h3>
                <p>We gebruiken verschillende types van cookies op onze website:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Technische cookies</strong>: Dit zijn noodzakelijke cookies voor het functioneren van onze website, zoals de sessie-id en de preferenties voor taal en lokalisatie. Deze cookies worden niet gebruikt voor het verzamelen van persoonlijke gegevens.</li>
                  <li><strong>Functionele cookies</strong>: Dit zijn cookies die helpen om uw bezoek aan onze website gemakkelijker te maken, zoals de opgeslagen wachtwoorden en de herinneringen aan bestaande gebruikersaccounts.</li>
                  <li><strong>Analyse-cookies</strong>: Dit zijn cookies die we gebruiken voor het verzamelen van statistieken over de bezoekersaantallen en de manier waarop de website wordt gebruikt, zodat we deze informatie kunnen gebruiken om de diensten aan te passen aan de wensen van de gebruikers.</li>
                  <li><strong>Marketing-cookies</strong>: Dit zijn cookies die gebruikt worden voor het verstrekken van marketingmateriaal en het traceren van de online activiteiten van de gebruiker, zodat we relevante marketing naar de gebruiker kunnen aanbieden.</li>
                </ul>
                <p className="mt-3">Gegevens mogen verstrekt worden binnen het instituut Zuyd Hogeschool en het bedrijf DRIEK.DEV maar mogen niet verstrekt worden aan derden voor commerciële doeleinden.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">4. Wijzigingen in het Cookie Policy</h3>
                <p>Wij kunnen dit Cookie Policy bij elke keer wijzigen zonder hiervoor een voorafgaande melding te verstrekken aan de gebruiker. De nieuwe Cookie Policy gelden vanaf de datum van publicatie op onze website.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">5. Totstandkoming en opt-out</h3>
                <p>Door aanmelding aan Apolloview geeft de gebruiker zijn/haar toestemming voor het gebruik van alle cookies. U kan altijd de toestemming voor marketing-cookies intrekken door dit in de profielpagina aan te geven.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">6. Contact</h3>
                <p>Voor elke vraag of opmerking over dit Cookie Policy kan de gebruiker contact opnemen via <a href="mailto:support@driek.dev" className="text-blue-600 hover:text-blue-800 underline">support@driek.dev</a>, deze vragen zullen behandeld worden door de PO van Apolloview.</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-neutral-200 pt-6 mt-12">
            <div className="flex items-center justify-between text-sm text-neutral-500">
              <p>© 2024 Apolloview. Alle rechten voorbehouden.</p>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Terug naar inloggen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
