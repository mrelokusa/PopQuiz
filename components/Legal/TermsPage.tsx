import React from 'react';
import LegalLayout from './LegalLayout';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-6">
    <h2 className="text-xl font-black uppercase tracking-tight mt-6 mb-2">{title}</h2>
    <div className="text-sm leading-relaxed text-gray-700 space-y-2">{children}</div>
  </section>
);

const TermsPage: React.FC = () => {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="2026-04-25">
      <Section title="1. Acceptance">
        <p>
          By using PopQuiz you agree to these Terms. If you do not agree, do not use the service.
        </p>
      </Section>

      <Section title="2. Accounts">
        <p>
          You are responsible for keeping your account credentials secure. You must be at least 13
          years old to create an account. You may not impersonate another person or use a username
          that is misleading or offensive.
        </p>
      </Section>

      <Section title="3. Your content">
        <p>
          You retain ownership of quizzes you create. By making a quiz public or sharing a link,
          you grant PopQuiz a non-exclusive, worldwide licence to host, display, and distribute it
          so the service can function.
        </p>
        <p>
          Do not post content that is illegal, hateful, harassing, sexually explicit, or that
          infringes someone else's rights. We may remove content and suspend accounts that violate
          this rule, with or without notice.
        </p>
      </Section>

      <Section title="4. AI generation">
        <p>
          PopQuiz uses third-party AI models to generate quiz content from prompts you provide.
          Output is generated automatically and may be inaccurate, biased, or inappropriate. You
          are responsible for reviewing AI-generated content before publishing.
        </p>
      </Section>

      <Section title="5. Termination">
        <p>
          You may delete your account at any time from the My Hub page. We may suspend or delete
          accounts that violate these Terms.
        </p>
      </Section>

      <Section title="6. Disclaimers">
        <p>
          PopQuiz is provided "as is" without warranties of any kind. We do not guarantee
          uninterrupted service or that the content will meet your expectations.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Questions about these Terms? Email <a className="underline" href="mailto:hello@popquiz.app">hello@popquiz.app</a>.
        </p>
      </Section>
    </LegalLayout>
  );
};

export default TermsPage;
