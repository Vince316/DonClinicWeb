import { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, addDoc, doc, getDoc } from '../../lib/firebase';
import { storage, ref, uploadBytes, getDownloadURL } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorNavbar from '../../components/doctor/DoctorNavbar';

const RECORD_TYPES = [
  { value: 'Diagnosis', label: 'Diagnosis', color: 'bg-blue-100 text-blue-700' },
  { value: 'Lab Result', label: 'Lab Result', color: 'bg-green-100 text-green-700' },
  { value: 'Prescription', label: 'Prescription', color: 'bg-purple-100 text-purple-700' },
  { value: 'Imaging', label: 'Imaging', color: 'bg-orange-100 text-orange-700' },
];

const EMPTY_FORM = {
  type: 'Diagnosis',
  date: new Date().toISOString().split('T')[0],
  // Diagnosis
  symptoms: '', diagnosis: '', treatmentPlan: '', followUp: '',
  // Lab Result
  testName: '', resultSummary: '', normalRange: '', interpretation: '',
  // Prescription
  medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
  instructions: '',
  // Imaging
  imagingType: '', bodyPart: '', findings: '', impression: '',
  // Shared
  notes: '', file: null,
};

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400';
const TEXTAREA = `${INPUT} resize-none`;
const LABEL = 'block text-xs font-medium text-gray-600 mb-1';

const DoctorHealthRecords = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    if (!user?.uid) return;
    const fetchPatients = async () => {
      const snap = await getDocs(query(collection(db, 'appointments'), where('doctorId', '==', user.uid)));
      const seen = new Set();
      const list = [];
      for (const d of snap.docs) {
        const data = d.data();
        if (!data.patientId || seen.has(data.patientId)) continue;
        seen.add(data.patientId);
        let name = data.patientName;
        if (!name) {
          const patientDoc = await getDoc(doc(db, 'patients', data.patientId));
          name = patientDoc.exists() ? patientDoc.data().name : 'Unknown';
        }
        list.push({ id: data.patientId, name });
      }
      setPatients(list);
    };
    fetchPatients();
  }, [user]);

  const fetchRecords = async (patientId) => {
    const snap = await getDocs(query(
      collection(db, 'healthRecords'),
      where('patientId', '==', patientId),
      where('doctorId', '==', user.uid)
    ));
    setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
  };

  const handleSelect = (patient) => {
    setSelected(patient);
    setForm(EMPTY_FORM);
    setMsg(null);
    setShowForm(false);
    setFilterType('All');
    fetchRecords(patient.id);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const updateMed = (i, key, val) => setForm(f => {
    const meds = [...f.medications];
    meds[i] = { ...meds[i], [key]: val };
    return { ...f, medications: meds };
  });

  const addMed = () => setForm(f => ({ ...f, medications: [...f.medications, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const removeMed = (i) => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMsg(null);
    try {
      let fileUrl = null, fileName = null;
      if (form.file) {
        const fileRef = ref(storage, `healthRecords/${selected.id}/${Date.now()}_${form.file.name}`);
        await uploadBytes(fileRef, form.file);
        fileUrl = await getDownloadURL(fileRef);
        fileName = form.file.name;
      }
      const base = {
        patientId: selected.id, patientName: selected.name,
        doctorId: user.uid, doctorName: user.name,
        type: form.type, date: form.date, notes: form.notes,
        fileUrl, fileName, createdAt: new Date(),
      };
      const typeData = {
        Diagnosis: { symptoms: form.symptoms, diagnosis: form.diagnosis, treatmentPlan: form.treatmentPlan, followUp: form.followUp },
        'Lab Result': { testName: form.testName, resultSummary: form.resultSummary, normalRange: form.normalRange, interpretation: form.interpretation },
        Prescription: { medications: form.medications, instructions: form.instructions },
        Imaging: { imagingType: form.imagingType, bodyPart: form.bodyPart, findings: form.findings, impression: form.impression },
      };
      await addDoc(collection(db, 'healthRecords'), { ...base, ...typeData[form.type] });
      setMsg({ type: 'success', text: 'Record saved successfully.' });
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchRecords(selected.id);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to save record.' });
      console.error(err);
    }
    setUploading(false);
  };

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const visibleRecords = filterType === 'All' ? records : records.filter(r => r.type === filterType);

  const typeColor = (type) => RECORD_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-600';

  return (
    <div className="flex">
      <DoctorSidebar />
      <div className="flex-1 ml-64">
        <DoctorNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto flex gap-6 animate-fade-up">

            {/* Patient List */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">My Patients</h2>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search patient..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-steelblue-400" />
                </div>
                <div className="divide-y divide-gray-100 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {filtered.length === 0
                    ? <p className="text-sm text-gray-400 p-4">No patients found.</p>
                    : filtered.map(p => (
                      <button key={p.id} onClick={() => handleSelect(p)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${selected?.id === p.id ? 'bg-steelblue-50' : 'hover:bg-gray-50'}`}>
                        <div className="w-8 h-8 rounded-full bg-steelblue-100 text-steelblue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {p.name[0]}
                        </div>
                        <span className={`text-sm font-medium truncate ${selected?.id === p.id ? 'text-steelblue-600' : 'text-gray-800'}`}>{p.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Main Panel */}
            <div className="flex-1 space-y-5">
              {!selected ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="text-gray-400 text-sm">Select a patient to manage their health records.</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">{selected.name}</h2>
                      <p className="text-xs text-gray-400">{records.length} record{records.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => { setShowForm(!showForm); setMsg(null); }}
                      className="px-4 py-2 bg-steelblue-500 hover:bg-steelblue-600 text-white text-sm font-medium rounded-lg transition-colors">
                      {showForm ? 'Cancel' : '+ Add Record'}
                    </button>
                  </div>

                  {msg && (
                    <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg.text}</div>
                  )}

                  {/* Add Record Form */}
                  {showForm && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-fade-down">
                      <h3 className="text-sm font-semibold text-gray-700 mb-5">New Health Record</h3>
                      <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Type + Date */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>Record Type</label>
                            <select value={form.type} onChange={e => setField('type', e.target.value)} className={INPUT}>
                              {RECORD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={LABEL}>Date</label>
                            <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} className={INPUT} />
                          </div>
                        </div>

                        {/* Diagnosis Fields */}
                        {form.type === 'Diagnosis' && (
                          <div className="space-y-4">
                            <div>
                              <label className={LABEL}>Symptoms</label>
                              <textarea value={form.symptoms} onChange={e => setField('symptoms', e.target.value)}
                                placeholder="e.g. Fever, headache, fatigue for 3 days" rows={2} className={TEXTAREA} />
                            </div>
                            <div>
                              <label className={LABEL}>Diagnosis</label>
                              <input value={form.diagnosis} onChange={e => setField('diagnosis', e.target.value)}
                                placeholder="e.g. Acute Pharyngitis" className={INPUT} />
                            </div>
                            <div>
                              <label className={LABEL}>Treatment Plan</label>
                              <textarea value={form.treatmentPlan} onChange={e => setField('treatmentPlan', e.target.value)}
                                placeholder="e.g. Rest, increase fluid intake, prescribed antibiotics" rows={2} className={TEXTAREA} />
                            </div>
                            <div>
                              <label className={LABEL}>Follow-up</label>
                              <input value={form.followUp} onChange={e => setField('followUp', e.target.value)}
                                placeholder="e.g. Return after 7 days if no improvement" className={INPUT} />
                            </div>
                          </div>
                        )}

                        {/* Lab Result Fields */}
                        {form.type === 'Lab Result' && (
                          <div className="space-y-4">
                            <div>
                              <label className={LABEL}>Test Name</label>
                              <input value={form.testName} onChange={e => setField('testName', e.target.value)}
                                placeholder="e.g. Complete Blood Count (CBC)" className={INPUT} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={LABEL}>Result Summary</label>
                                <input value={form.resultSummary} onChange={e => setField('resultSummary', e.target.value)}
                                  placeholder="e.g. WBC: 11.2 x10³/µL" className={INPUT} />
                              </div>
                              <div>
                                <label className={LABEL}>Normal Range</label>
                                <input value={form.normalRange} onChange={e => setField('normalRange', e.target.value)}
                                  placeholder="e.g. 4.5–11.0 x10³/µL" className={INPUT} />
                              </div>
                            </div>
                            <div>
                              <label className={LABEL}>Interpretation</label>
                              <textarea value={form.interpretation} onChange={e => setField('interpretation', e.target.value)}
                                placeholder="e.g. Slightly elevated WBC, may indicate infection" rows={2} className={TEXTAREA} />
                            </div>
                          </div>
                        )}

                        {/* Prescription Fields */}
                        {form.type === 'Prescription' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-1">
                              <label className={LABEL + ' mb-0'}>Medications</label>
                              <button type="button" onClick={addMed}
                                className="text-xs text-steelblue-500 hover:underline font-medium">+ Add Medication</button>
                            </div>
                            {form.medications.map((med, i) => (
                              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-500">Medication {i + 1}</span>
                                  {form.medications.length > 1 && (
                                    <button type="button" onClick={() => removeMed(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={LABEL}>Drug Name</label>
                                    <input value={med.name} onChange={e => updateMed(i, 'name', e.target.value)}
                                      placeholder="e.g. Amoxicillin" className={INPUT} />
                                  </div>
                                  <div>
                                    <label className={LABEL}>Dosage</label>
                                    <input value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)}
                                      placeholder="e.g. 500mg" className={INPUT} />
                                  </div>
                                  <div>
                                    <label className={LABEL}>Frequency</label>
                                    <input value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)}
                                      placeholder="e.g. 3x a day" className={INPUT} />
                                  </div>
                                  <div>
                                    <label className={LABEL}>Duration</label>
                                    <input value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)}
                                      placeholder="e.g. 7 days" className={INPUT} />
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div>
                              <label className={LABEL}>Special Instructions</label>
                              <textarea value={form.instructions} onChange={e => setField('instructions', e.target.value)}
                                placeholder="e.g. Take after meals, avoid alcohol" rows={2} className={TEXTAREA} />
                            </div>
                          </div>
                        )}

                        {/* Imaging Fields */}
                        {form.type === 'Imaging' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={LABEL}>Imaging Type</label>
                                <select value={form.imagingType} onChange={e => setField('imagingType', e.target.value)} className={INPUT}>
                                  <option value="">Select type</option>
                                  {['X-Ray', 'Ultrasound', 'ECG', 'MRI', 'CT Scan', 'Other'].map(t => <option key={t}>{t}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className={LABEL}>Body Part / Area</label>
                                <input value={form.bodyPart} onChange={e => setField('bodyPart', e.target.value)}
                                  placeholder="e.g. Chest, Abdomen" className={INPUT} />
                              </div>
                            </div>
                            <div>
                              <label className={LABEL}>Findings</label>
                              <textarea value={form.findings} onChange={e => setField('findings', e.target.value)}
                                placeholder="e.g. No consolidation or pleural effusion noted" rows={2} className={TEXTAREA} />
                            </div>
                            <div>
                              <label className={LABEL}>Impression</label>
                              <textarea value={form.impression} onChange={e => setField('impression', e.target.value)}
                                placeholder="e.g. Normal chest X-ray" rows={2} className={TEXTAREA} />
                            </div>
                          </div>
                        )}

                        {/* Shared: Notes + File */}
                        <div>
                          <label className={LABEL}>Additional Notes (optional)</label>
                          <textarea value={form.notes} onChange={e => setField('notes', e.target.value)}
                            placeholder="Any other remarks..." rows={2} className={TEXTAREA} />
                        </div>
                        <div>
                          <label className={LABEL}>Attach File (optional — PDF, image)</label>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e => setField('file', e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-steelblue-50 file:text-steelblue-600 hover:file:bg-steelblue-100" />
                        </div>

                        <button type="submit" disabled={uploading}
                          className="px-6 py-2.5 bg-steelblue-500 hover:bg-steelblue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                          {uploading ? 'Saving...' : 'Save Record'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Filter Tabs */}
                  <div className="flex gap-2 flex-wrap">
                    {['All', ...RECORD_TYPES.map(t => t.value)].map(t => (
                      <button key={t} onClick={() => setFilterType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === t ? 'bg-steelblue-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Records List */}
                  <div className="space-y-3">
                    {visibleRecords.length === 0 ? (
                      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <p className="text-sm text-gray-400">No {filterType !== 'All' ? filterType.toLowerCase() : ''} records found.</p>
                      </div>
                    ) : visibleRecords.map((r, i) => (
                      <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColor(r.type)}`}>{r.type}</span>
                            <span className="text-xs text-gray-400">{r.date}</span>
                          </div>
                          {r.fileUrl && (
                            <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-steelblue-500 hover:underline font-medium">View File</a>
                          )}
                        </div>

                        {r.type === 'Diagnosis' && (
                          <div className="space-y-1.5 text-sm">
                            {r.symptoms && <p><span className="font-medium text-gray-600">Symptoms:</span> <span className="text-gray-700">{r.symptoms}</span></p>}
                            {r.diagnosis && <p><span className="font-medium text-gray-600">Diagnosis:</span> <span className="text-gray-700">{r.diagnosis}</span></p>}
                            {r.treatmentPlan && <p><span className="font-medium text-gray-600">Treatment:</span> <span className="text-gray-700">{r.treatmentPlan}</span></p>}
                            {r.followUp && <p><span className="font-medium text-gray-600">Follow-up:</span> <span className="text-gray-700">{r.followUp}</span></p>}
                          </div>
                        )}

                        {r.type === 'Lab Result' && (
                          <div className="space-y-1.5 text-sm">
                            {r.testName && <p><span className="font-medium text-gray-600">Test:</span> <span className="text-gray-700">{r.testName}</span></p>}
                            {r.resultSummary && <p><span className="font-medium text-gray-600">Result:</span> <span className="text-gray-700">{r.resultSummary}</span></p>}
                            {r.normalRange && <p><span className="font-medium text-gray-600">Normal Range:</span> <span className="text-gray-700">{r.normalRange}</span></p>}
                            {r.interpretation && <p><span className="font-medium text-gray-600">Interpretation:</span> <span className="text-gray-700">{r.interpretation}</span></p>}
                          </div>
                        )}

                        {r.type === 'Prescription' && (
                          <div className="space-y-2 text-sm">
                            {r.medications?.map((m, i) => (
                              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-800">{m.name} — {m.dosage}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{m.frequency} · {m.duration}</p>
                              </div>
                            ))}
                            {r.instructions && <p><span className="font-medium text-gray-600">Instructions:</span> <span className="text-gray-700">{r.instructions}</span></p>}
                          </div>
                        )}

                        {r.type === 'Imaging' && (
                          <div className="space-y-1.5 text-sm">
                            {r.imagingType && <p><span className="font-medium text-gray-600">Type:</span> <span className="text-gray-700">{r.imagingType} — {r.bodyPart}</span></p>}
                            {r.findings && <p><span className="font-medium text-gray-600">Findings:</span> <span className="text-gray-700">{r.findings}</span></p>}
                            {r.impression && <p><span className="font-medium text-gray-600">Impression:</span> <span className="text-gray-700">{r.impression}</span></p>}
                          </div>
                        )}

                        {r.notes && <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">Note: {r.notes}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorHealthRecords;
