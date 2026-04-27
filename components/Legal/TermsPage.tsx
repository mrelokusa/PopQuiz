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
    <LegalLayout title="Terms of Service" lastUpdated="2026-04-27">
      <Section title="Acceptance of these terms">
        <p>
          By accessing or using PopQuiz you agree to be bound by these Terms of Service. If you
          do not agree, please do not use the service.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          You are responsible for any activity that takes place under your account and for
          keeping your sign-in credentials secure. You must be old enough in your jurisdiction
          to enter into a binding agreement to use PopQuiz, and at minimum 13 years of age.
        </p>
        <p>
          Choose a username that is not misleading, offensive, or impersonating another person.
          We may reclaim usernames that violate this requirement.
        </p>
      </Section>

      <Section title="User content">
        <p>
          You retain ownership of the quizzes and other content you create. By making content
          public or sharing a link to it, you grant PopQuiz a non-exclusive, worldwide,
          royalty-free licence to host, store, reproduce, and display that content for the
          purpose of operating the service.
        </p>
        <p>
          You agree not to post content that is unlawful, hateful, harassing, sexually explicit,
          or that infringes the rights of others. We may remove content and suspend or terminate
          accounts that violate these terms.
        </p>
      </Section>

      <Section title="AI-generated content">
        <p>
          PopQuiz uses third-party generative AI to create quiz content from prompts you supply.
          Output is produced automatically and may be inaccurate, incomplete, biased, or
          unsuitable for your purposes. You are responsible for reviewing AI-generated content
          before publishing it.
        </p>
      </Section>

      <Section title="Service availability">
        <p>
          We aim to keep PopQuiz available but do not guarantee uninterrupted access. We may
          modify, suspend, or discontinue features at any time without notice.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          You may delete your account at any time from the My Hub page; deletion is immediate
          and removes your data from our systems. We may suspend or terminate accounts that
          violate these terms.
        </p>
      </Section>

      <Section title="Disclaimers and liability">
        <p>
          PopQuiz is provided "as is" and "as available" without warranties of any kind, whether
          express or implied. To the fullest extent permitted by law, PopQuiz and its operators
          are not liable for any indirect, incidental, or consequential damages arising from
          your use of the service.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these Terms from time to time. Continued use of PopQuiz after changes
          take effect constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these Terms can be sent to <a className="underline" href="mailto:hello@popquiz.app">hello@popquiz.app</a>.
        </p>
      </Section>
    </LegalLayout>
  );
};

export default TermsPage;
