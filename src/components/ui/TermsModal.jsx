const TermsModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Terms & Conditions</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>
      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 text-sm text-gray-600 leading-relaxed">
        <p className="text-xs text-gray-400">Last updated: June 2025</p>

        {[
          ['1. Acceptance of Terms', 'By accessing or using the DonClinic web application, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.'],
          ['2. Use of Services', 'DonClinic provides an online platform for scheduling medical appointments, viewing health records, and communicating with healthcare providers. Our services are intended for personal, non-commercial use only. You agree not to misuse the platform, including submitting false information, attempting unauthorized access, or interfering with the system\'s functionality.'],
          ['3. Account Registration', 'To use certain features, you must register an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must provide accurate and complete information during registration. DonClinic reserves the right to suspend or terminate accounts that violate these terms.'],
          ['4. Appointment Booking', 'Appointments booked through DonClinic are subject to availability and confirmation by our administrative staff. A confirmed appointment does not guarantee immediate medical attention in emergency situations. Patients are expected to arrive on time. Repeated no-shows may result in restrictions on future bookings.'],
          ['5. Medical Disclaimer', 'DonClinic is a scheduling and records management platform. The information provided on this website is for general informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for medical diagnosis and treatment. In case of a medical emergency, contact emergency services immediately.'],
          ['6. Intellectual Property', 'All content on this platform, including logos, text, graphics, and software, is the property of DonClinic and is protected by applicable intellectual property laws. You may not reproduce or distribute any content without prior written permission.'],
          ['7. Limitation of Liability', 'DonClinic shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to missed appointments, data loss, or reliance on information provided.'],
          ['8. Changes to Terms', 'We reserve the right to update these Terms and Conditions at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.'],
          ['9. Contact Us', 'If you have questions about these Terms, please contact us at support@donclinic.com.'],
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

export default TermsModal;
