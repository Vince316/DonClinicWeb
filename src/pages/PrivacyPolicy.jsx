import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: June 2025</p>
      </div>
    </section>

    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">

        <Section title="1. Introduction">
          <p>DonClinic ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, and address provided during registration.</li>
            <li><strong>Health Information:</strong> Medical history, appointment details, prescriptions, and health records you provide or that are entered by your healthcare provider.</li>
            <li><strong>Usage Data:</strong> Pages visited, actions taken, and device/browser information collected automatically.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Process and manage your appointment bookings</li>
            <li>Send appointment confirmations and reminders via email</li>
            <li>Maintain your electronic health records</li>
            <li>Improve our platform and services</li>
            <li>Comply with legal and regulatory obligations</li>
          </ul>
        </Section>

        <Section title="4. Sharing of Information">
          <p>We do not sell or rent your personal information to third parties. We may share your information only in the following cases:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>With doctors and clinic staff directly involved in your care</li>
            <li>With service providers (e.g., email delivery via EmailJS, database via Firebase) under strict confidentiality agreements</li>
            <li>When required by law or to protect the rights and safety of our users</li>
          </ul>
        </Section>

        <Section title="5. Data Storage & Security">
          <p>Your data is stored securely using Google Firebase, which employs industry-standard encryption and security practices. We implement appropriate technical and organizational measures to protect your information from unauthorized access, loss, or misuse.</p>
          <p>However, no method of transmission over the internet is 100% secure. We encourage you to use a strong password and keep your login credentials confidential.</p>
        </Section>

        <Section title="6. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for non-essential data processing</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <span className="text-sky-600 font-medium">support@donclinic.com</span>.</p>
        </Section>

        <Section title="7. Cookies">
          <p>DonClinic may use cookies and similar technologies to enhance your experience. These are used for session management and analytics. You can disable cookies in your browser settings, though some features may not function properly.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us immediately.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by posting the new policy on this page with an updated date. Continued use of the platform constitutes acceptance of the revised policy.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>If you have any questions or concerns about this Privacy Policy, please contact us at <span className="text-sky-600 font-medium">support@donclinic.com</span> or visit our <a href="/contact" className="text-sky-600 underline">Contact page</a>.</p>
        </Section>

      </div>
    </section>

    <Footer />
  </div>
);

export default PrivacyPolicy;
