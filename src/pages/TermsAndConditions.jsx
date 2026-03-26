import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

const TermsAndConditions = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
        <p className="text-gray-500 text-sm">Last updated: June 2025</p>
      </div>
    </section>

    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using the DonClinic web application, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        </Section>

        <Section title="2. Use of Services">
          <p>DonClinic provides an online platform for scheduling medical appointments, viewing health records, and communicating with healthcare providers. Our services are intended for personal, non-commercial use only.</p>
          <p>You agree not to misuse the platform, including but not limited to: submitting false information, attempting unauthorized access, or interfering with the system's functionality.</p>
        </Section>

        <Section title="3. Account Registration">
          <p>To use certain features, you must register an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
          <p>You must provide accurate and complete information during registration. DonClinic reserves the right to suspend or terminate accounts that violate these terms.</p>
        </Section>

        <Section title="4. Appointment Booking">
          <p>Appointments booked through DonClinic are subject to availability and confirmation by our administrative staff. A confirmed appointment does not guarantee immediate medical attention in emergency situations.</p>
          <p>Patients are expected to arrive on time. Repeated no-shows may result in restrictions on future bookings.</p>
        </Section>

        <Section title="5. Medical Disclaimer">
          <p>DonClinic is a scheduling and records management platform. The information provided on this website is for general informational purposes only and does not constitute medical advice.</p>
          <p>Always consult a qualified healthcare professional for medical diagnosis and treatment. In case of a medical emergency, contact emergency services immediately.</p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>All content on this platform, including logos, text, graphics, and software, is the property of DonClinic and is protected by applicable intellectual property laws. You may not reproduce or distribute any content without prior written permission.</p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>DonClinic shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to missed appointments, data loss, or reliance on information provided.</p>
        </Section>

        <Section title="8. Changes to Terms">
          <p>We reserve the right to update these Terms and Conditions at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.</p>
        </Section>

        <Section title="9. Contact Us">
          <p>If you have questions about these Terms, please contact us at <span className="text-sky-600 font-medium">support@donclinic.com</span> or visit our <a href="/contact" className="text-sky-600 underline">Contact page</a>.</p>
        </Section>

      </div>
    </section>

    <Footer />
  </div>
);

export default TermsAndConditions;
