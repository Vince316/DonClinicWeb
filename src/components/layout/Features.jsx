const Features = () => {
  const features = [
    {
      icon: (
        <svg className="w-7 h-7 text-steelblue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments with your preferred doctors in just a few clicks, anytime and anywhere.'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-steelblue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Digital Health Records',
      description: 'Access your complete medical history, test results, and prescriptions securely from one place.'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-steelblue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Expert Medical Team',
      description: 'Our team of experienced doctors and specialists are dedicated to providing the best care possible.'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-steelblue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security and strict privacy standards.'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-steelblue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '24/7 Availability',
      description: 'Access healthcare services and support around the clock, whenever you need it most.'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-steelblue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Health Analytics',
      description: 'Track your health trends and get personalized insights to help you make better health decisions.'
    }
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Stats Cards */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <div className="bg-white px-8 py-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-steelblue-500 to-steelblue-700 bg-clip-text text-transparent">10K+</div>
            <div className="text-gray-600 mt-1">Patients</div>
          </div>
          <div className="bg-white px-8 py-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-steelblue-500 to-steelblue-700 bg-clip-text text-transparent">50+</div>
            <div className="text-gray-600 mt-1">Doctors</div>
          </div>
          <div className="bg-white px-8 py-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-steelblue-500 to-steelblue-700 bg-clip-text text-transparent">98%</div>
            <div className="text-gray-600 mt-1">Satisfaction</div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Choose DonClinic?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive healthcare solutions designed to make your medical journey seamless and stress-free.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-fade-up">
              <div className="w-14 h-14 bg-steelblue-50 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
