import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const TABS = [
  {
    id: 'security', label: 'Security',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
  },
  {
    id: '2fa', label: 'Two-Factor Authentication',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  },
  {
    id: 'privacy', label: 'Privacy & Safety',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
  },
  {
    id: 'notifications', label: 'Notifications & Sounds',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
  },
];

const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-steelblue-500' : 'bg-gray-200'}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const Row = ({ label, desc, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <div className="ml-4 flex-shrink-0">{children}</div>
  </div>
);

const PRIVACY_ROWS = {
  patient: [
    { key: 'showProfile', label: 'Show Profile to Others', desc: 'Allow clinic staff to view your profile information.' },
    { key: 'showAppointments', label: 'Show Appointment History', desc: 'Allow clinic staff to view your appointment history.' },
    { key: 'dataSharing', label: 'Data Sharing', desc: 'Allow anonymized data to be used for clinic analytics.' },
    { key: 'activityLog', label: 'Activity Log', desc: 'Keep a log of your account activity.' },
  ],
  admin: [
    { key: 'showProfile', label: 'Show Profile to Staff', desc: 'Allow other staff members to view your profile.' },
    { key: 'showAppointments', label: 'Show Managed Appointments', desc: 'Allow supervisors to review appointments you manage.' },
    { key: 'dataSharing', label: 'Data Sharing', desc: 'Allow anonymized data to be used for system analytics.' },
    { key: 'activityLog', label: 'Activity Log', desc: 'Keep a log of your admin account activity.' },
  ],
  superadmin: [
    { key: 'showProfile', label: 'Show Profile to Admins', desc: 'Allow admins to view your profile information.' },
    { key: 'showAppointments', label: 'Show System Activity', desc: 'Allow audit logs to include your system actions.' },
    { key: 'dataSharing', label: 'Data Sharing', desc: 'Allow system-wide anonymized data for reporting.' },
    { key: 'activityLog', label: 'Activity Log', desc: 'Keep a full audit log of all superadmin actions.' },
  ],
  doctor: [
    { key: 'showProfile', label: 'Show Profile to Patients', desc: 'Allow patients to view your professional profile.' },
    { key: 'showAppointments', label: 'Show Appointment History', desc: 'Allow clinic admin to review your appointment records.' },
    { key: 'dataSharing', label: 'Data Sharing', desc: 'Allow anonymized consultation data for clinic analytics.' },
    { key: 'activityLog', label: 'Activity Log', desc: 'Keep a log of your doctor account activity.' },
  ],
};

const NOTIF_ROWS = {
  patient: [
    { key: 'appointmentUpdates', label: 'Appointment Updates', desc: 'Get notified when your appointment status changes.' },
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email.' },
    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive notifications via text message.' },
    { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play a sound when a new notification arrives.' },
    { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Show browser desktop notifications.' },
  ],
  admin: [
    { key: 'appointmentUpdates', label: 'New Appointment Requests', desc: 'Get notified when a patient books an appointment.' },
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive admin alerts via email.' },
    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive urgent alerts via text message.' },
    { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play a sound when a new notification arrives.' },
    { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Show browser desktop notifications.' },
  ],
  superadmin: [
    { key: 'appointmentUpdates', label: 'System Alerts', desc: 'Get notified about critical system events.' },
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive superadmin reports and alerts via email.' },
    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive urgent system alerts via text message.' },
    { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play a sound when a new notification arrives.' },
    { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Show browser desktop notifications.' },
  ],
  doctor: [
    { key: 'appointmentUpdates', label: 'New Appointment Assignments', desc: 'Get notified when you are assigned to an appointment.' },
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive appointment and schedule alerts via email.' },
    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive urgent patient alerts via text message.' },
    { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play a sound when a new notification arrives.' },
    { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Show browser desktop notifications.' },
  ],
};

const SettingsContent = ({ role = 'patient' }) => {
  const [tab, setTab] = useState('security');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPwFields, setShowPwFields] = useState({ current: false, next: false, confirm: false });

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const [twoFA, setTwoFA] = useState(false);

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showAppointments: false,
    dataSharing: false,
    activityLog: true,
  });

  const [notif, setNotif] = useState({
    appointmentUpdates: true,
    emailNotifications: true,
    smsNotifications: false,
    soundEnabled: true,
    desktopNotifications: false,
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.next !== pwForm.confirm) return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
    if (pwForm.next.length < 6) return setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    setPwLoading(true);
    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwForm.next);
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' ? 'Current password is incorrect.' : err.message });
    } finally { setPwLoading(false); }
  };

  return (
    <div className="flex gap-6 items-start">
      {/* Tab Nav */}
      <div className="w-60 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors text-left border-b border-gray-100 last:border-0 ${tab === t.id ? 'bg-steelblue-50 text-steelblue-500' : 'text-gray-600 hover:bg-gray-50'}`}>
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1">

        {tab === 'security' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Security</h2>
            <p className="text-sm text-gray-400 mb-6">Manage your password and account security.</p>

            {/* Change Password Toggle */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button
                type="button"
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">Change Password</p>
                    <p className="text-xs text-gray-400">Update your account password</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${showChangePassword ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showChangePassword && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  {pwMsg && (
                    <div className={`p-3 rounded-lg text-sm mb-4 ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {pwMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    {[['Current Password', 'current'], ['New Password', 'next'], ['Confirm New Password', 'confirm']].map(([label, key]) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                        <div className="relative">
                          <input
                            type={showPwFields[key] ? 'text' : 'password'}
                            value={pwForm[key]}
                            onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwFields(p => ({ ...p, [key]: !p[key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPwFields[key] ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="submit" disabled={pwLoading}
                      className="px-6 py-2.5 bg-steelblue-500 text-white text-sm font-medium rounded-lg hover:bg-steelblue-600 transition-colors disabled:opacity-50">
                      {pwLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Active Sessions</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Current Device</p>
                    <p className="text-xs text-gray-400">Active now</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>
            </div>
          </div>
        )}

        {tab === '2fa' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-400 mb-6">Add an extra layer of security to your account.</p>
            <div className="divide-y divide-gray-100">
              <Row label="Enable Two-Factor Authentication" desc="Require a verification code when signing in.">
                <Toggle checked={twoFA} onChange={setTwoFA} />
              </Row>
            </div>
            <div className={`mt-6 p-4 rounded-xl border ${twoFA ? 'bg-steelblue-50 border-steelblue-100' : 'bg-yellow-50 border-yellow-100'}`}>
              <p className={`text-sm font-medium mb-1 ${twoFA ? 'text-steelblue-700' : 'text-yellow-800'}`}>
                {twoFA ? '2FA is enabled' : '2FA is not enabled'}
              </p>
              <p className={`text-xs ${twoFA ? 'text-steelblue-500' : 'text-yellow-600'}`}>
                {twoFA
                  ? 'A verification code will be sent to your registered email each time you sign in.'
                  : 'We recommend enabling two-factor authentication to protect your account.'}
              </p>
            </div>
          </div>
        )}

        {tab === 'privacy' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Privacy & Safety</h2>
            <p className="text-sm text-gray-400 mb-6">Control who can see your information and how your data is used.</p>
            <div className="divide-y divide-gray-100">
              {PRIVACY_ROWS[role].map(({ key, label, desc }) => (
                <Row key={key} label={label} desc={desc}>
                  <Toggle checked={privacy[key]} onChange={v => setPrivacy(p => ({ ...p, [key]: v }))} />
                </Row>
              ))}
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Notifications & Sounds</h2>
            <p className="text-sm text-gray-400 mb-6">Choose how and when you want to be notified.</p>
            <div className="divide-y divide-gray-100">
              {NOTIF_ROWS[role].map(({ key, label, desc }) => (
                <Row key={key} label={label} desc={desc}>
                  <Toggle checked={notif[key]} onChange={v => setNotif(p => ({ ...p, [key]: v }))} />
                </Row>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsContent;
