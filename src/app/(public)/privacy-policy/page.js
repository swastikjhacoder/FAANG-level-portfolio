import React from "react";

export const metadata = {
  title: "Privacy Policy | Swastik Jha",
  description:
    "Learn how your data is collected, used, and protected while using this website.",
  alternates: {
    canonical: "/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy | Swastik Jha",
    description:
      "Learn how your data is collected, used, and protected while using this website.",
    url: "/privacy-policy",
    siteName: "Swastik Jha Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Swastik Jha",
    description: "Learn how your data is collected, used, and protected.",
  },
};

const LAST_UPDATED = "April 23, 2026";

const Section = ({ title, children }) => (
  <section>
    <h2 className="text-xl md:text-2xl font-semibold text-(--text-color) mb-3">
      {title}
    </h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const PrivacyPolicyPage = () => {
  return (
    <main className="min-h-screen bg-(--background)">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text animate-gradient mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-(--text-muted)">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="space-y-10 text-sm md:text-base leading-relaxed text-(--text-muted)">
          <Section title="1. Information We Collect">
            <p>
              We may collect personal information such as your name, email
              address, and any data you voluntarily provide through contact
              forms or communication channels.
            </p>
            <p>
              Additionally, non-personal data such as browser type, device
              information, IP address, and usage analytics may be collected
              automatically to improve the performance and usability of the
              platform.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>Your information may be used for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To respond to inquiries and communication requests</li>
              <li>To improve website functionality and user experience</li>
              <li>To monitor performance, security, and analytics</li>
              <li>To prevent fraudulent or malicious activity</li>
            </ul>
          </Section>

          <Section title="3. Data Protection">
            <p>
              We implement industry-standard security measures to safeguard your
              data against unauthorized access, alteration, disclosure, or
              destruction.
            </p>
            <p>
              However, no system is completely secure, and we cannot guarantee
              absolute security of transmitted data.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>
              This website may use third-party services such as hosting
              providers, analytics tools, or content delivery networks.
            </p>
            <p>
              These services may collect and process data according to their own
              privacy policies. We recommend reviewing their policies
              independently.
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>
              Cookies and similar tracking technologies may be used to enhance
              user experience, analyze traffic, and personalize content.
            </p>
            <p>
              You can modify your browser settings to disable cookies, though
              this may impact certain functionalities of the site.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>
              Depending on your jurisdiction, you may have rights including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Accessing the personal data we hold about you</li>
              <li>Requesting correction or deletion of your data</li>
              <li>Withdrawing consent for data processing</li>
            </ul>
            <p>
              To exercise these rights, please reach out via the contact section
              of this website.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain personal data only for as long as necessary to fulfill
              the purposes outlined in this policy unless a longer retention
              period is required or permitted by law.
            </p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>
              This Privacy Policy may be updated periodically to reflect changes
              in legal requirements or service improvements.
            </p>
            <p>
              Continued use of the website after updates constitutes acceptance
              of the revised policy.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy, you can reach out through the contact section of
              this website.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
