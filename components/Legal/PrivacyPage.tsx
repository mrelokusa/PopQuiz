import React from 'react';
import LegalLayout from './LegalLayout';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-6">
    <h2 className="text-xl font-black uppercase tracking-tight mt-6 mb-2">{title}</h2>
    <div className="text-sm leading-relaxed text-gray-700 space-y-2">{children}</div>
  </section>
);

const PrivacyPage: React.FC = () => {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="2026-04-25">
      <Section title="What we collect">
        <ul className="list-disc list-inside space-y-1">
          <li>Email address and password (hashed) when you sign up.</li>
          <li>Your username, avatar choice, and quizzes you create.</li>
          <li>Results of quizzes you take (which outcome you got, when).</li>
          <li>Logs of AI generation requests, used solely for rate limiting.</li>
        </ul>
        <p>We do not collect analytics, advertising identifiers, or location data.</p>
      </Section>

      <Section title="How we use it">
        <p>
          To run the service: authenticating you, displaying quizzes you create, showing quiz
          authors who has taken their quizzes, and preventing abuse of the AI generation feature.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>
          Quiz authors can see the username and result of anyone who takes their quiz. Public
          quizzes and your username are visible to anyone using PopQuiz.
        </p>
        <p>
          We use Supabase (database and authentication) and Vercel (hosting). Quiz prompts you
          send to the AI generator are processed by Google's Gemini API.
        </p>
      </Section>

      <Section title="Cookies and storage">
        <p>
          We store your authentication session in your browser's local storage. We do not use
          tracking cookies or third-party analytics.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can export a copy of your data or permanently delete your account from the My Hub
          page. Both happen immediately and are processed automatically.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Privacy questions: <a className="underline" href="mailto:privacy@popquiz.app">privacy@popquiz.app</a>.
        </p>
      </Section>
    </LegalLayout>
  );
};

export default PrivacyPage;
