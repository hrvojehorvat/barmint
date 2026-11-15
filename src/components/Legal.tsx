import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Lang } from '../i18n'
import { isPlaceholder, LEGAL } from '../legal'
import { Card } from './ui'

export type LegalPage = 'impressum' | 'datenschutz'

export const legalPageFromHash = (hash: string): LegalPage | null =>
  hash === '#impressum' || hash === '#datenschutz' ? (hash.slice(1) as LegalPage) : null

/** Renders a value from legal.ts, highlighted while it is still a placeholder. */
function V({ v }: { v: string }) {
  return isPlaceholder(v) ? <mark className="rounded bg-amber-200 px-1 text-amber-900">{v}</mark> : <>{v}</>
}

function Address() {
  const { name, street, city, country, email, phone, vatId } = LEGAL
  return (
    <p>
      <V v={name} />
      <br />
      <V v={street} />
      <br />
      <V v={city} />
      <br />
      <V v={country} />
      <br />
      <br />
      E-Mail: {isPlaceholder(email) ? <V v={email} /> : <a href={`mailto:${email}`}>{email}</a>}
      {phone && (
        <>
          <br />
          Tel.: {phone}
        </>
      )}
      {vatId && (
        <>
          <br />
          USt-IdNr. / UID: {vatId}
        </>
      )}
    </p>
  )
}

type Section = [title: string, body: ReactNode]

const impressum: Record<Lang, { title: string; sections: Section[] }> = {
  de: {
    title: 'Impressum',
    sections: [
      ['Anbieter', <Address />],
      [
        'Rechtsgrundlagen',
        <p>
          Angaben gemäß § 5 DDG (Deutschland), § 5 ECG und § 25 MedienG (Österreich) sowie Art. 3 Abs. 1 lit. s UWG
          (Schweiz). Verantwortlich für den Inhalt: <V v={LEGAL.name} />, Anschrift wie oben.
        </p>,
      ],
      [
        'Haftung',
        <p>
          BarMint erstellt Codes ausschließlich anhand deiner Eingaben. Prüfe Empfänger, IBAN und Betrag vor jeder
          Zahlung in deiner Banking-App. Für Schäden durch fehlerhafte Eingaben oder fehlerhaft gescannte Codes wird
          keine Haftung übernommen, soweit gesetzlich zulässig.
        </p>,
      ],
      [
        'Marken',
        <p>
          GiroCode, EPC QR und Swiss QR-bill sind Bezeichnungen von Zahlungsstandards; alle Rechte liegen bei den
          jeweiligen Inhabern. BarMint steht in keiner Verbindung zu Banken, dem European Payments Council oder SIX und
          wird von diesen nicht unterstützt.
        </p>,
      ],
    ],
  },
  en: {
    title: 'Legal notice',
    sections: [
      ['Provider', <Address />],
      [
        'Legal basis',
        <p>
          Information pursuant to § 5 DDG (Germany), § 5 ECG and § 25 MedienG (Austria) and Art. 3(1)(s) UWG
          (Switzerland). Responsible for content: <V v={LEGAL.name} />, address as above.
        </p>,
      ],
      [
        'Liability',
        <p>
          BarMint creates codes solely from what you enter. Always check the recipient, IBAN and amount in your banking
          app before paying. To the extent permitted by law, no liability is accepted for damage caused by incorrect
          input or misread codes.
        </p>,
      ],
      [
        'Trademarks',
        <p>
          GiroCode, EPC QR and Swiss QR-bill are names of payment standards; all rights belong to their respective
          owners. BarMint is not affiliated with or endorsed by any bank, the European Payments Council or SIX.
        </p>,
      ],
    ],
  },
}

const privacy: Record<Lang, { title: string; sections: Section[] }> = {
  de: {
    title: 'Datenschutzerklärung',
    sections: [
      [
        'Kurzfassung',
        <p>
          BarMint läuft vollständig in deinem Browser. Was du eingibst (Namen, IBAN, Beträge, Barcode-Inhalte), wird
          nicht an uns oder Dritte übertragen. Es gibt keine Cookies, kein Tracking, keine Analyse-Tools und keine
          externen Schriftarten.
        </p>,
      ],
      ['Verantwortlicher', <Address />],
      [
        'Hosting und Server-Logs',
        <p>
          Die Website wird bei Microsoft Azure (Static Web Apps, Rechenzentrum in Westeuropa) gehostet. Beim Aufruf
          verarbeitet Microsoft technisch notwendige Daten wie IP-Adresse, Zeitpunkt, aufgerufene Datei und
          Browser-Kennung, um die Seite auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist Art. 6 Abs. 1
          lit. f DSGVO (berechtigtes Interesse an einem sicheren Betrieb). Microsoft handelt als Auftragsverarbeiter auf
          Grundlage der Microsoft-Datenschutzbestimmungen (DPA). Eine Übermittlung in die USA ist nicht auszuschließen;
          Microsoft ist nach dem EU-US Data Privacy Framework zertifiziert. Wir werten diese Logs nicht aus.
        </p>,
      ],
      [
        'Deine Eingaben',
        <p>
          Formulardaten bleiben im Browser. Beim Teilen eines Links stehen sie im Teil der Adresse nach „#“. Dieser Teil
          wird vom Browser nie an den Server gesendet. Wer einen geteilten Link erhält, kann die Daten jedoch sehen.
          Teile Links daher nur mit Personen, die sie sehen dürfen.
        </p>,
      ],
      [
        'Lokaler Speicher',
        <p>
          Deine Sprachwahl und die Liste „Zuletzt“ (bis zu 8 exportierte Codes) werden im localStorage deines Browsers
          gespeichert, nur auf deinem Gerät. Das ist für diese von dir genutzten Funktionen erforderlich (§ 25 Abs. 2
          Nr. 2 TDDDG). Du kannst die Liste jederzeit mit „Löschen“ entfernen oder die Website-Daten in deinem Browser
          löschen.
        </p>,
      ],
      [
        'Deine Rechte',
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit
          und Widerspruch (Art. 15–21 DSGVO) sowie das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde.
          Wende dich dazu an die oben genannte E-Mail-Adresse.
        </p>,
      ],
      ['Stand', <p>{LEGAL.updated}</p>],
    ],
  },
  en: {
    title: 'Privacy policy',
    sections: [
      [
        'In short',
        <p>
          BarMint runs entirely in your browser. What you enter (names, IBANs, amounts, barcode content) is not sent to
          us or anyone else. There are no cookies, no tracking, no analytics and no external fonts.
        </p>,
      ],
      ['Controller', <Address />],
      [
        'Hosting and server logs',
        <p>
          The site is hosted on Microsoft Azure (Static Web Apps, West Europe data centre). When you open it, Microsoft
          processes technically necessary data such as your IP address, time, requested file and browser identifier to
          deliver the page and protect it from abuse. The legal basis is Art. 6(1)(f) GDPR (legitimate interest in
          secure operation). Microsoft acts as a processor under its Data Protection Addendum (DPA). Transfers to the
          USA cannot be ruled out; Microsoft is certified under the EU-US Data Privacy Framework. We do not analyse
          these logs.
        </p>,
      ],
      [
        'Your input',
        <p>
          Form data stays in your browser. When you share a link, it is stored in the part of the address after “#”.
          Browsers never send that part to the server. Anyone who receives a shared link can see the data, so only share
          links with people who may see it.
        </p>,
      ],
      [
        'Local storage',
        <p>
          Your language choice and the “Recent” list (up to 8 exported codes) are kept in your browser's localStorage,
          on your device only. This is required for features you use (§ 25(2) no. 2 TDDDG). You can remove the list at
          any time with “Clear” or by deleting the site data in your browser.
        </p>,
      ],
      [
        'Your rights',
        <p>
          You have the right of access, rectification, erasure, restriction of processing, data portability and
          objection (Art. 15–21 GDPR), and the right to lodge a complaint with a data protection supervisory authority.
          Contact us at the email address above.
        </p>,
      ],
      ['Last updated', <p>{LEGAL.updated}</p>],
    ],
  },
}

export function Legal({ page, lang, onBack }: { page: LegalPage; lang: Lang; onBack: () => void }) {
  const { title, sections } = (page === 'impressum' ? impressum : privacy)[lang]
  return (
    <div className="mx-auto max-w-3xl pt-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-mint-700 dark:text-mint-300 hover:bg-mint-500/10"
      >
        <ArrowLeft className="h-4 w-4" /> {lang === 'de' ? 'Zurück' : 'Back'}
      </button>
      <Card className="p-6 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">{title}</h1>
        <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300 [&_a]:text-mint-600 [&_a]:underline">
          {sections.map(([h, body]) => (
            <section key={h}>
              <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-white">{h}</h2>
              {body}
            </section>
          ))}
        </div>
      </Card>
    </div>
  )
}
