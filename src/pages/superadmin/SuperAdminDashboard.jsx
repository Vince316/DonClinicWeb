import { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../lib/firebase';
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ admins: 0, doctors: 0, patients: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [adminsSnap, doctorsSnap, patientsSnap] = await Promise.all([
          getDocs(collection(db, 'admins')),
          getDocs(collection(db, 'doctors')),
          getDocs(collection(db, 'patients'))
        ]);
        setStats({ admins: adminsSnap.size, doctors: doctorsSnap.size, patients: patientsSnap.size });
      } catch (error) { console.error(error); }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Admins', value: stats.admins, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Doctors', value: stats.doctors, color: 'bg-green-50 text-green-600' },
    { label: 'Total Patients', value: stats.patients, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="flex">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64">
        <SuperAdminNavbar />
        <main className="mt-16 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Super Admin Dashboard</h1>
            <div className="grid sm:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div key={card.label} className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
