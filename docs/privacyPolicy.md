<!--
  Source note (repo only): drafted for the Clerk/OAuth verification process,
  based on the actual data handling in this codebase. Not legal advice — review
  before publishing. Mirrored as UI pages in src/pages/PrivacyPolicy.tsx;
  keep both in sync if the text changes.
-->

# privacy policy

**Effective date:** November 25, 2026
**Service:** simple rank — https://simplerank.io
**Contact:** support@lorfakl.industries (data requests, questions)

## 1. overview

this privacy policy explains what information simple rank ("the service", "we") collects,
why we collect it, who we share it with, and the choices you have. by using simple rank
you agree to the collection and use of information as described here.

simple rank is a ranking/list creation app: you make lists of things, order them, and can
share them with other people.

## 2. information we collect

**account information**
- your email address
- a display name and avatar url (display name defaults to the part of your email before
  the "@"; you can change it)
- authentication is handled by clerk, an authentication provider. passwords are never
  stored in plain text and are not visible to us; clerk processes your credentials under
  its own privacy policy

**content you create**
- rankings you make: titles, descriptions, and any links or images you put in them
- rank items inside those rankings: names, descriptions, order, and optional images
- share links you generate for individual rankings

**usage information**
- reactions and view counts on rankings, recorded to keep counts honest
- **ip addresses are recorded alongside reactions** so the same person cannot react to
  the same ranking repeatedly, and to detect abuse. anonymous (signed-out) reactions are
  also recorded by ip address.

**technical information**
- simple rank uses `localStorage` in your browser to keep you signed in and remember
  display preferences. **we do not use cookies** and we run **no advertising or
  third-party analytics**.
- standard web server logs (ip address, request, time) are kept by our hosting provider
  for operating and securing the service.

**information we do not collect**
- payment information (the service is free)
- precise location, contacts, or device contacts
- data from other apps or websites

## 3. how we use your information

- to provide the service: authenticate you, store your rankings, and show them back to you
- to keep features honest: dedupe reactions, count views, prevent spam and abuse
- to keep the service running: debugging, security monitoring, and responding to support
  requests
- to comply with law when we are legally required to

**legal bases (gdpr):** processing is based on performance of a contract (providing the
service you signed up for), our legitimate interest in preventing abuse and keeping the
service working, and consent where required (for example, where we load content from a
third party).

## 4. who we share it with

we do not sell your information, and we do not share it for advertising.

we use a small number of service providers who process information only to run the
service:

- **clerk** (clerk.com) — account authentication
- **our hosting provider** — runs the app and database
- **google fonts** (fonts.google.com) — the typeface used on the site. when your browser
  loads the site it makes a request to google, which receives your ip address under
  google's privacy policy

we may disclose information if required by law, or if necessary to protect the rights,
safety, or property of the service or its users (for example, responding to a valid legal
process).

## 5. retention and deletion

- account and content data is kept while your account exists
- reaction/view history with ip addresses is kept for a limited period needed to prevent
  abuse, and is then deleted or anonymized
- server logs are kept by our host for a short operational period

you can request deletion of your account and everything tied to it at any time by
emailing **support@lorfakl.industries**. we will act on verified requests within a
reasonable period, except where we are required to keep something by law.

## 6. your rights

depending on where you live, you may have the right to:

- access the personal data we hold about you
- correct inaccurate data
- delete your data
- export a copy of your data (data portability)
- object to or restrict certain processing

to exercise any of these, email **support@lorfakl.industries**. you may also lodge a
complaint with your local data protection authority.

## 7. children

simple rank is not directed at children under 13 (or the minimum age in your
jurisdiction). we do not knowingly collect data from children under that age. if you
believe a child has provided us with data, contact us and we will delete it.

## 8. security

- data in transit is encrypted with tls (https)
- passwords are hashed (never stored in plain text), and authentication is handled by
  clerk
- access to the database and servers is limited to operating the service

no system is perfectly secure. if we learn of a breach affecting your data, we will
notify you and the relevant authorities as required by law.

## 9. international transfers

the service and its providers may process data in the united states and other countries.
where data is transferred out of your region, we rely on the safeguards provided by the
relevant providers (such as standard contractual clauses).

## 10. changes to this policy

we may update this policy. the effective date at the top changes when we do, and material
changes will be announced on the site. continued use after a change means you accept the
updated policy.

## 11. contact

questions, data requests, or complaints:
**support@lorfakl.industries**
