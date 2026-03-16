import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const SetupProfile = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Your Profile</h1>
        <p className="text-gray-500 mb-6">Complete your profile to get started.</p>
        <Button onClick={() => navigate('/patient/dashboard')} className="w-full">Go to Dashboard</Button>
      </div>
    </div>
  );
};

export default SetupProfile;
