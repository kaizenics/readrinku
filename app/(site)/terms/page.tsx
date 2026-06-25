import type { Metadata } from "next"

import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "The terms and conditions governing your use of ReadRinku, including license, disclaimers, limitations, and governing law.",
  path: "/terms",
  keywords: ["terms of service", "terms and conditions", "readrinku terms"],
})

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Legal
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Terms and Conditions
        </h1>
      </header>

      <div className="flex max-w-3xl flex-col gap-8 text-sm leading-7 text-muted-foreground">
        <Section title="1. Terms">
          <p>
            By accessing this Website, accessible from https://readrinku.xyz, you
            are agreeing to be bound by these Website Terms and Conditions of Use
            and agree that you are responsible for the agreement with any
            applicable local laws. If you disagree with any of these terms, you
            are prohibited from accessing this site. The materials contained in
            this Website are protected by copyright and trade mark law.
          </p>
        </Section>

        <Section title="2. Use License">
          <p>
            Permission is granted to temporarily download one copy of the
            materials on ReadRinku&apos;s Website for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>modify or copy the materials;</li>
            <li>
              use the materials for any commercial purpose or for any public
              display;
            </li>
            <li>
              attempt to reverse engineer any software contained on
              ReadRinku&apos;s Website;
            </li>
            <li>
              remove any copyright or other proprietary notations from the
              materials; or
            </li>
            <li>
              transferring the materials to another person or &quot;mirror&quot;
              the materials on any other server.
            </li>
          </ul>
          <p>
            This will let ReadRinku to terminate upon violations of any of these
            restrictions. Upon termination, your viewing right will also be
            terminated and you should destroy any downloaded materials in your
            possession whether it is printed or electronic format.
          </p>
        </Section>

        <Section title="3. Disclaimer">
          <p>
            All the materials on ReadRinku&apos;s Website are provided &quot;as
            is&quot;. ReadRinku makes no warranties, may it be expressed or
            implied, therefore negates all other warranties. Furthermore,
            ReadRinku does not make any representations concerning the accuracy or
            reliability of the use of the materials on its Website or otherwise
            relating to such materials or any sites linked to this Website.
          </p>
        </Section>

        <Section title="4. Limitations">
          <p>
            ReadRinku or its suppliers will not be hold accountable for any
            damages that will arise with the use or inability to use the materials
            on ReadRinku&apos;s Website, even if ReadRinku or an authorize
            representative of this Website has been notified, orally or written, of
            the possibility of such damage. Some jurisdiction does not allow
            limitations on implied warranties or limitations of liability for
            incidental damages, these limitations may not apply to you.
          </p>
        </Section>

        <Section title="5. Revisions and Errata">
          <p>
            The materials appearing on ReadRinku&apos;s Website may include
            technical, typographical, or photographic errors. ReadRinku will not
            promise that any of the materials in this Website are accurate,
            complete, or current. ReadRinku may change the materials contained on
            its Website at any time without notice. ReadRinku does not make any
            commitment to update the materials.
          </p>
        </Section>

        <Section title="6. Links">
          <p>
            ReadRinku has not reviewed all of the sites linked to its Website and
            is not responsible for the contents of any such linked site. The
            presence of any link does not imply endorsement by ReadRinku of the
            site. The use of any linked website is at the user&apos;s own risk.
          </p>
        </Section>

        <Section title="7. Site Terms of Use Modifications">
          <p>
            ReadRinku may revise these Terms of Use for its Website at any time
            without prior notice. By using this Website, you are agreeing to be
            bound by the current version of these Terms and Conditions of Use.
          </p>
        </Section>

        <Section title="8. Your Privacy">
          <p>Please read our Privacy Policy.</p>
        </Section>

        <Section title="9. Governing Law">
          <p>
            Any claim related to ReadRinku&apos;s Website shall be governed by the
            laws of bq without regards to its conflict of law provisions.
          </p>
        </Section>
      </div>
    </div>
  )
}
