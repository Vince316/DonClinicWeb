import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const About = () => {
  const team = [
    { name: 'Dr. Maria Santos', role: 'Chief Medical Officer', specialty: 'Cardiology' },
    { name: 'Dr. James Reyes', role: 'Head of Surgery', specialty: 'General Surgery' },
    { name: 'Dr. Anna Cruz', role: 'Lead Pediatrician', specialty: 'Pediatrics' },
    { name: 'Dr. Carlos Mendoza', role: 'Neurology Head', specialty: 'Neurology' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">About DonClinic</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            We are committed to providing exceptional healthcare services with compassion, 
            innovation, and excellence. Our mission is to make quality healthcare accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="bg-sky-50 p-8 rounded-2xl">
            <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To deliver world-class healthcare services that improve the quality of life for every patient 
              we serve, through innovation, compassion, and clinical excellence.
            </p>
          </div>
          <div className="bg-green-50 p-8 rounded-2xl">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To be the leading healthcare provider, recognized for our commitment to patient care, 
              medical innovation, and building healthier communities.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-sky-600">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[['10K+', 'Patients Served'], ['50+', 'Expert Doctors'], ['15+', 'Years of Service'], ['98%', 'Satisfaction Rate']].map(([value, label]) => (
            <div key={label}>
              <p className="text-4xl font-bold mb-2">{value}</p>
              <p className="text-sky-100">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600">Our experienced medical professionals are dedicated to your health.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {member.name.split(' ')[1][0]}
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-sky-600 font-medium">{member.role}</p>
                <p className="text-sm text-gray-500 mt-1">{member.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
