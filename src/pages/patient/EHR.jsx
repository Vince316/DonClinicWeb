import { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';

const RECORD_TYPES = [
  { value: 'All',          color: '' },
  { value: 'Diagnosis',    color: 'bg-blue-100 text-blue-700' },
  { value: 'Lab Result',   color: 'bg-green-100 text-green-700' },
  { value: 'Prescription', color: 'bg-purple-100 text-purple-700' },
  { value: 'Imaging',      color: 'bg-orange-100 text-orange-700' },
];

const typeColor = (type) => RECORD_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-600';

const EHR = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'healthRecords'), where('patientId', '==', user.uid)));
        setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const availableTypes = ['All', ...RECORD_TYPES.filter(t => t.value !== 'All' && records.some(r => r.type === t.value)).map(t => t.value)];
  const visible = filter === 'All' ? records : records.filter(r => r.type === filter);

  return (
    <div className="flex">
      <PatientSidebar />
      <div className="flex-1 ml-64">
        <PatientNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto animate-fade-up">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Health Records</h1>

            {/* Filter tabs */}
            {availableTypes.length > 1 && (
              <div className="flex gap-2 flex-wrap mb-5">
                {availableTypes.map(t => (
                  <button key={t} onClick={() => setFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === t ? 'bg-steelblue-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
            ) : visible.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-gray-400 text-sm">No {filter !== 'All' ? filter.toLowerCase() : ''} health records found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visible.map((r, i) => (
                  <button key={r.id} onClick={() => setSelected(r)}
                    className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:bg-steelblue-50 hover:border-steelblue-200 transition-colors animate-fade-up text-left"
                    style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColor(r.type)}`}>{r.type}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {r.type === 'Diagnosis' && (r.diagnosis || 'Diagnosis Record')}
                          {r.type === 'Lab Result' && (r.testName || 'Lab Result')}
                          {r.type === 'Prescription' && (r.medications?.[0]?.name ? `${r.medications[0].name}${r.medications.length > 1 ? ` +${r.medications.length - 1} more` : ''}` : 'Prescription')}
                          {r.type === 'Imaging' && (r.imagingType ? `${r.imagingType}${r.bodyPart ? ` — ${r.bodyPart}` : ''}` : 'Imaging')}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{r.date}{r.doctorName ? ` · Dr. ${r.doctorName}` : ''}</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColor(selected.type)}`}>{selected.type}</span>
                <span className="text-xs text-gray-400">{selected.date}</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {selected.doctorName && (
                <p className="text-xs text-gray-500">Recorded by <span className="font-medium text-gray-700">Dr. {selected.doctorName}</span></p>
              )}

              {selected.type === 'Diagnosis' && (
                <div className="space-y-3">
                  {[['Symptoms', selected.symptoms], ['Diagnosis', selected.diagnosis], ['Treatment Plan', selected.treatmentPlan], ['Follow-up', selected.followUp]]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <p className="text-sm text-gray-800">{value}</p>
                      </div>
                    ))}
                </div>
              )}

              {selected.type === 'Lab Result' && (
                <div className="space-y-3">
                  {[['Test Name', selected.testName], ['Result Summary', selected.resultSummary], ['Normal Range', selected.normalRange], ['Interpretation', selected.interpretation]]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <p className="text-sm text-gray-800">{value}</p>
                      </div>
                    ))}
                </div>
              )}

              {selected.type === 'Prescription' && (
                <div className="space-y-3">
                  {selected.medications?.map((m, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-800">{m.name} — {m.dosage}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.frequency} · {m.duration}</p>
                    </div>
                  ))}
                  {selected.instructions && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Special Instructions</p>
                      <p className="text-sm text-gray-800">{selected.instructions}</p>
                    </div>
                  )}
                </div>
              )}

              {selected.type === 'Imaging' && (
                <div className="space-y-3">
                  {[['Imaging Type', selected.imagingType], ['Body Part', selected.bodyPart], ['Findings', selected.findings], ['Impression', selected.impression]]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <p className="text-sm text-gray-800">{value}</p>
                      </div>
                    ))}
                </div>
              )}

              {selected.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Additional Notes</p>
                  <p className="text-sm text-gray-800">{selected.notes}</p>
                </div>
              )}

              {selected.fileUrl && (
                <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-steelblue-50 border border-steelblue-200 rounded-xl text-sm text-steelblue-600 font-medium hover:bg-steelblue-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  View Attached File
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EHR;
