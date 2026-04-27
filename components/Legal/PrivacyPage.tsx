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
    <LegalLayout title="Privacy Policy" lastUpdated="2026-04-27">
      <Section title="Information we collect">
        <ul className="list-disc list-inside space-y-1">
          <li>Account information: your email address and a hashed password.</li>
          <li>Profile information: your username and avatar.</li>
          <li>Content: the quizzes you create and the results of quizzes you take.</li>
          <li>Service logs: limited records of AI generation requests, used for rate limiting.</li>
        </ul>
        <p>
          We do not collect device identifiers, location data, or use third-party advertising
          or analytics trackers.
        </p>
      </Section>

      <Section title="How we use your information">
        <p>
          We use the information above to operate the service: to authenticate you, display
          quizzes you create, show quiz authors who has taken their quizzes, and prevent abuse
          of the AI generation feature.
        </p>
      </Section>

      <Section title="Sharing">
        <p>
          Your username is visible to other users in the context of quizzes you create or take.
          Quiz authors can see the usernames and outcomes of people who have taken their
          quizzes; people who have taken a public quiz can see the same for that quiz.
        </p>
        <p>
          We rely on the following service providers to operate PopQuiz: Supabase
          (authentication and database), Vercel (hosting), and Google's Gemini API for AI quiz
          generation. Quiz prompts you submit are sent to Gemini for processing.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          We store your authentication session in your browser's local storage so that you stay
          signed in between visits. We do not use tracking cookies.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can export a copy of your data or delete your account at any time from the My Hub
          page. Account deletion removes your profile, quizzes, and results from our systems.
        </p>
        <p>
          Depending on your jurisdiction you may have additional rights, including the right to
          access, rectify, restrict, or object to certain processing of your personal data.
          Contact us using the address below to exercise these rights.
        </p>
      </Section>

      <Section title="Data retention">
        <p>
          We retain your account information and content for as long as your account is active.
          When you delete your account, we remove your data from our systems within a
          reasonable period, except where retention is required by law.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. The "last updated" date at the
          top reflects when changes were made.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Privacy questions can be sent to <a className="underline" href="mailto:privacy@popquiz.app">privacy@popquiz.app</a>.
        </p>
      </Section>
    </LegalLayout>
  );
};

export default PrivacyPage;
