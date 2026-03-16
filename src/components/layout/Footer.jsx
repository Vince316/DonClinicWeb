import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">DC</div>
              <span className="font-bold text-lg">DonClinic</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Providing world-class healthcare services with compassion and excellence.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-100">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-100">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>General Consultation</li>
              <li>Specialist Care</li>
              <li>Lab Tests</li>
              <li>Health Checkups</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-100">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>info@donclinic.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Medical Drive</li>
              <li>Health City, HC 12345</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} DonClinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
