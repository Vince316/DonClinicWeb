const PrivacyModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Privacy Policy</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>
      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 text-sm text-gray-600 leading-relaxed">
        <p className="text-xs text-gray-400">Last updated: June 2025</p>

        {[
          ['1. Introduction', 'DonClinic ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.'],
          ['2. Information We Collect', 'We collect: Personal Information (name, email, phone, date of birth, address), Health Information (medical history, appointments, prescriptions, health records), and Usage Data (pages visited, actions taken, device/browser info).'],
          ['3. How We Use Your Information', 'We use your information to process appointment bookings, send confirmation emails, maintain electronic health records, improve our platform, and comply with legal obligations.'],
          ['4. Sharing of Information', 'We do not sell or rent your personal information. We may share it with doctors and clinic staff involved in your care, service providers (EmailJS, Firebase) under confidentiality agreements, or when required by law.'],
          ['5. Data Storage & Security', 'Your data is stored securely using Google Firebase with industry-standard encryption. We implement appropriate technical measures to protect your information. However, no internet transmission is 100% secure — please use a strong password and keep your credentials confidential.'],
          ['6. Your Rights', 'You have the right to access, correct, or request deletion of your personal data, and to withdraw consent for non-essential processing. Contact us at support@donclinic.com to exercise these rights.'],
          ['7. Cookies', 'DonClinic may use cookies for session management and analytics. You can disable cookies in your browser settings, though some features may not function properly.'],
          ['8. Children\'s Privacy', 'Our platform is not intended for children under 13. We do not knowingly collect data from children. If you believe a child has provided us with their data, please contact us immediately.'],
          ['9. Changes to This Policy', 'We may update this Privacy Policy from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised policy.'],
          ['10. Contact Us', 'For questions about this Privacy Policy, contact us at support@donclinic.com.'],
        ].map(([title, body]) => (
          <div key={title}>
            <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-gray-100">
        <button onClick={onClose} className="w-full py-2.5 bg-steelblue-500 hover:bg-steelblue-600 text-white text-sm font-medium rounded-lg transition-colors">
          Close
        </button>
      </div>
    </div>
  </div>
);

export default PrivacyModal;
