import LegalPage from '../components/LegalPage'
import type { LegalSection } from '../components/LegalPage'

/** Body copy mirrors docs/privacyPolicy.md — keep both in sync. */
const sections: LegalSection[] = [
    {
        h: '1. overview',
        body: [
            { p: 'this privacy policy explains what information simple rank ("the service", "we") collects, why we collect it, who we share it with, and the choices you have. by using simple rank you agree to the collection and use of information as described here.' },
            { p: 'simple rank is a ranking/list creation app: you make lists of things, order them, and can share them with other people.' },
        ],
    },
    {
        h: '2. information we collect',
        body: [
            { node: <><strong>account information</strong> — your email address; a display name and avatar url (display name defaults to the part of your email before the "@" and you can change it). authentication is handled by clerk, an authentication provider: passwords are never stored in plain text and are not visible to us, and clerk processes your credentials under its own privacy policy.</> },
            { node: <><strong>content you create</strong> — rankings: titles, descriptions, and any links or images you put in them; rank items: names, descriptions, order, and optional images; share links you generate for individual rankings.</> },
            { node: <><strong>usage information</strong> — reactions and view counts on rankings, recorded to keep counts honest. ip addresses are recorded alongside reactions so the same person cannot react to the same ranking repeatedly, and to detect abuse; anonymous reactions are also recorded by ip address.</> },
            { node: <><strong>technical information</strong> — simple rank uses localStorage in your browser to keep you signed in and remember display preferences. we do not use cookies, and we run no advertising or third-party analytics. standard web server logs (ip address, request, time) are kept by our hosting provider for operating and securing the service.</> },
            { node: <><strong>we do not collect</strong> — payment information (the service is free), precise location, contacts, or data from other apps or websites.</> },
        ],
    },
    {
        h: '3. how we use your information',
        body: [
            { ul: [
                'to provide the service: authenticate you, store your rankings, and show them back to you',
                'to keep features honest: dedupe reactions, count views, prevent spam and abuse',
                'to keep the service running: debugging, security monitoring, and responding to support requests',
                'to comply with law when we are legally required to',
            ] },
            { p: 'legal bases (gdpr): processing is based on performance of a contract (providing the service you signed up for), our legitimate interest in preventing abuse and keeping the service working, and consent where required.' },
        ],
    },
    {
        h: '4. who we share it with',
        body: [
            { p: 'we do not sell your information, and we do not share it for advertising. we use a small number of service providers who process information only to run the service:' },
            { ul: [
                'clerk (clerk.com) — account authentication',
                'our hosting provider — runs the app and database',
                'google fonts (fonts.google.com) — the typeface used on the site; when your browser loads the site it makes a request to google, which receives your ip address under google’s privacy policy',
            ] },
            { p: 'we may disclose information if required by law, or if necessary to protect the rights, safety, or property of the service or its users (for example, responding to a valid legal process).' },
        ],
    },
    {
        h: '5. retention and deletion',
        body: [
            { ul: [
                'account and content data is kept while your account exists',
                'reaction/view history with ip addresses is kept for the limited period needed to prevent abuse, then deleted or anonymized',
                'server logs are kept by our host for a short operational period',
            ] },
            { p: 'you can request deletion of your account and everything tied to it at any time by emailing support@lorfakl.industries. we act on verified requests within a reasonable period, except where we are required to keep something by law.' },
        ],
    },
    {
        h: '6. your rights',
        body: [
            { p: 'depending on where you live, you may have the right to access the personal data we hold about you, correct it, delete it, export a copy of it (data portability), or object to or restrict certain processing.' },
            { p: 'to exercise any of these, email support@lorfakl.industries. you may also lodge a complaint with your local data protection authority.' },
        ],
    },
    {
        h: '7. children',
        body: [
            { p: 'simple rank is not directed at children under 13 (or the minimum age in your jurisdiction). we do not knowingly collect data from children under that age. if you believe a child has provided us with data, contact us and we will delete it.' },
        ],
    },
    {
        h: '8. security',
        body: [
            { ul: [
                'data in transit is encrypted with tls (https)',
                'passwords are hashed (never stored in plain text) and authentication is handled by clerk',
                'access to the database and servers is limited to operating the service',
            ] },
            { p: 'no system is perfectly secure. if we learn of a breach affecting your data, we will notify you and the relevant authorities as required by law.' },
        ],
    },
    {
        h: '9. international transfers',
        body: [
            { p: 'the service and its providers may process data in the united states and other countries. where data is transferred out of your region, we rely on the safeguards provided by the relevant providers (such as standard contractual clauses).' },
        ],
    },
    {
        h: '10. changes to this policy',
        body: [
            { p: 'we may update this policy. the effective date at the top changes when we do, and material changes will be announced on the site. continued use after a change means you accept the updated policy.' },
        ],
    },
    {
        h: '11. contact',
        body: [
            { p: 'questions, data requests, or complaints: support@lorfakl.industries' },
        ],
    },
]

function PrivacyPolicy() {
    return (
        <LegalPage
            title="privacy policy"
            updated="november 25, 2026"
            contact="support@lorfakl.industries"
            sections={sections}
            siblingTo="/terms"
            siblingLabel="terms of service"
        />
    )
}

export default PrivacyPolicy
