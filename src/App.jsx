import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

import AdminDashboard from './pages/admin/AdminDashboard';
import Appointments from './pages/admin/Appointments';
import Patients from './pages/admin/Patients';
import Doctors from './pages/admin/Doctors';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import WalkInPatient from './pages/admin/WalkInPatient';

import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import BookAppointment from './pages/patient/BookAppointment';
import EHR from './pages/patient/EHR';
import Profile from './pages/patient/Profile';
import Prescriptions from './pages/patient/Prescriptions';
import SetupProfile from './pages/patient/SetupProfile';
import PatientSettings from './pages/patient/Settings';

import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManageAdmins from './pages/superadmin/ManageAdmins';
import ManageDoctors from './pages/superadmin/ManageDoctors';
import AddAdmin from './pages/superadmin/AddAdmin';
import AddDoctor from './pages/superadmin/AddDoctor';
import SuperAdminSettings from './pages/superadmin/SuperAdminSettings';
import VerifyAdmin from './pages/superadmin/VerifyAdmin';
import AdminProfile from './pages/admin/AdminProfile';
import SuperAdminProfile from './pages/superadmin/SuperAdminProfile';
import SuperAdminReports from './pages/superadmin/SuperAdminReports';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorSettings from './pages/doctor/DoctorSettings';
import DoctorHealthRecords from './pages/doctor/DoctorHealthRecords';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Admin & Doctor */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute adminOnly><Appointments /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute adminOnly><Patients /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute adminOnly><Doctors /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
          <Route path="/admin/walkin" element={<ProtectedRoute adminOnly><WalkInPatient /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute adminOnly><AdminProfile /></ProtectedRoute>} />

          {/* Patient */}
          <Route path="/patient/dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute><PatientAppointments /></ProtectedRoute>} />
          <Route path="/patient/book" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/ehr" element={<ProtectedRoute><EHR /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
          <Route path="/patient/setup-profile" element={<ProtectedRoute><SetupProfile /></ProtectedRoute>} />
          <Route path="/patient/settings" element={<ProtectedRoute><PatientSettings /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor" element={<ProtectedRoute doctorOnly><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute doctorOnly><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/health-records" element={<ProtectedRoute doctorOnly><DoctorHealthRecords /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute doctorOnly><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor/settings" element={<ProtectedRoute doctorOnly><DoctorSettings /></ProtectedRoute>} />

          {/* Superadmin */}
          <Route path="/superadmin" element={<ProtectedRoute superAdminOnly><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin/admins" element={<ProtectedRoute superAdminOnly><ManageAdmins /></ProtectedRoute>} />
          <Route path="/superadmin/doctors" element={<ProtectedRoute superAdminOnly><ManageDoctors /></ProtectedRoute>} />
          <Route path="/superadmin/add-admin" element={<ProtectedRoute superAdminOnly><AddAdmin /></ProtectedRoute>} />
          <Route path="/superadmin/add-doctor" element={<ProtectedRoute superAdminOnly><AddDoctor /></ProtectedRoute>} />
          <Route path="/superadmin/settings" element={<ProtectedRoute superAdminOnly><SuperAdminSettings /></ProtectedRoute>} />
          <Route path="/superadmin/verify-admin" element={<ProtectedRoute superAdminOnly><VerifyAdmin /></ProtectedRoute>} />
          <Route path="/superadmin/profile" element={<ProtectedRoute superAdminOnly><SuperAdminProfile /></ProtectedRoute>} />
          <Route path="/superadmin/reports" element={<ProtectedRoute superAdminOnly><SuperAdminReports /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
