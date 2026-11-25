import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Shared shell for the privacy policy and terms of service pages.
 * Body copy mirrors docs/privacyPolicy.md and docs/termsOfService.md —
 * keep the two in sync when the text changes.
 */
export type LegalBlock = { p: string } | { ul: string[] } | { node: ReactNode }

export interface LegalSection {
    h: string
    body: LegalBlock[]
}

function Block({ block }: { block: LegalBlock }) {
    if ('ul' in block) {
        return (
            <ul className="list-disc space-y-2 pl-5 marker:text-primary">
                {block.ul.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        )
    }
    if ('node' in block) return <p>{block.node}</p>
    return <p>{block.p}</p>
}

interface LegalPageProps {
    title: string
    updated: string
    contact: string
    sections: LegalSection[]
    /** link shown at the bottom, e.g. the sibling legal page */
    siblingTo?: string
    siblingLabel?: string
}

function LegalPage({ title, updated, contact, sections, siblingTo, siblingLabel }: LegalPageProps) {
    return (
        <div className="mx-auto my-10 w-full max-w-2xl px-4 pb-16">
            <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow-soft sm:p-8">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-base-content">{title}</h1>
                <p className="mt-2 text-sm text-base-content/60">
                    effective date: {updated} · questions:{' '}
                    <a className="link link-primary" href={`mailto:${contact}`}>{contact}</a>
                </p>

                <div className="mt-6 space-y-6 text-base-content/85">
                    {sections.map((section) => (
                        <section key={section.h}>
                            <h2 className="font-display text-xl font-semibold text-base-content">{section.h}</h2>
                            <div className="mt-2 space-y-3">
                                {section.body.map((block, i) => <Block key={i} block={block} />)}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-base-300 pt-5 text-sm">
                    {siblingTo && siblingLabel && (
                        <Link className="link link-primary" to={siblingTo}>{siblingLabel}</Link>
                    )}
                    <Link className="link" to="/">back home</Link>
                </div>
            </div>
        </div>
    )
}

export default LegalPage
