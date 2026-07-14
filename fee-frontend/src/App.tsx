import { useState, useEffect } from 'react';
import AdmissionForm from './AdmissionForm';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [duesData, setDuesData] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [regNo, setRegNo] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRegNo = params.get('regNo');
    if (urlRegNo) {
      setRegNo(urlRegNo);
      fetchData(urlRegNo);
    }
  }, []);

  const fetchData = async (searchRegNo: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('https://admission-api.odpay.in/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Using the requested mobile number and password
        body: JSON.stringify({ mobile: '9898767665', password: '9898767665' }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Invalid credentials or server error');
      }

      // Extract token from response. Handle common token keys
      const token = data.token || data.accessToken || data.access_token || data.data?.token || data.data?.accessToken;
      
      setMessage({ text: 'Login successful! Checking dues...', type: 'success' });
      
      // Step 1: Fetch student details by regNo to get the actual student ID
      const studentResponse = await fetch(`https://fee2-api.odpay.in/api/view/student?entity=6487ec9e91f7297664a62ffc&session=2025-26%20Odd&regNo=${searchRegNo}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': token } : {})
        }
      });
      
      const studentJson = await studentResponse.json().catch(() => ({}));
      if (!studentResponse.ok) {
        throw new Error(studentJson.message || 'Failed to fetch student details');
      }

      // Extract the student ID (could be an array or single object)
      const studentDataObj = Array.isArray(studentJson) ? studentJson[0] : studentJson;
      if (!studentDataObj || (!studentDataObj._id && !studentDataObj.id)) {
        throw new Error('Student not found for the given registration number');
      }
      
      const studentId = studentDataObj._id || studentDataObj.id;
      setStudentData(studentDataObj);

      // Step 2: Fetch dues using the extracted student ID
      const duesResponse = await fetch(`https://fee2-api.odpay.in/api/checkDues/student?id=${studentId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': token } : {})
        }
      });
      
      const duesJson = await duesResponse.json().catch(() => ({}));
      
      if (!duesResponse.ok) {
        throw new Error(duesJson.message || duesJson.error || 'Failed to check dues');
      }

      setDuesData(duesJson);
      
      if (duesJson.dueAmount === 0) {
        setMessage({ text: 'No Dues! You are cleared.', type: 'success' });
      } else {
        setMessage({ text: `You have pending dues.`, type: 'error' });
      }
      
    } catch (error: any) {
      setMessage({ 
        text: error.message || 'An unexpected error occurred. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regNo) {
      const url = new URL(window.location.href);
      url.searchParams.set('regNo', regNo);
      const targetUrl = url.toString();

      // Detect in-app browsers (WebViews, Instagram, Facebook, etc.)
      const isWebView = /wv|instagram|fbav|fban|line|snapchat/i.test(navigator.userAgent) || 
                        /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent) ||
                        /(android).*version\/[\d.]+.*safari/i.test(navigator.userAgent);

      // If we are in a WebView, escape to external browser BEFORE entering the dashboard
      if (isWebView) {
        if (/android/i.test(navigator.userAgent)) {
          const urlWithoutScheme = targetUrl.replace(/^https?:\/\//i, '');
          const intentUrl = `intent://${urlWithoutScheme}#Intent;scheme=https;package=com.android.chrome;end;`;
          window.location.href = intentUrl;
          
          // Fallback if intent fails
          setTimeout(() => {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
          }, 1000);
        } else {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
        return; // Stop execution in WebView
      }

      // Normal execution if in a regular browser
      fetchData(regNo);
    }
  };

  return (
    <div className={`login-container ${duesData && duesData.dueAmount === 0 ? 'expanded' : ''}`}>
      <div className="login-header">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', gap: '15px' }}>
          <img src="/rksd.jpg" alt="RKSD College" style={{ height: '70px', objectFit: 'contain' }} />
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary-color)', fontWeight: 'bold' }}>R.K.S.D. COLLEGE, KAITHAL</h2>
        </div>
        <h1 className="login-title">Welcome</h1>
        <p className="login-subtitle">Please sign in to your account to continue</p>
      </div>

      {!duesData ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="regNo">College Roll No</label>
            <input
              id="regNo"
              type="text"
              className="form-input"
              placeholder="Enter college roll no"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="form-button"
            disabled={isLoading || !regNo}
          >
            {isLoading ? (
              <>
                <div className="loader"></div>
                <span>Entering...</span>
              </>
            ) : (
              'Enter Dashboard'
            )}
          </button>
        </form>
      ) : (
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Dues Dashboard</h3>
          
          {studentData && (
            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <p><strong>Student Name:</strong> {studentData.name || studentData.studentName || 'N/A'}</p>
              <p><strong>Course:</strong> {studentData.course || studentData.courseName || 'N/A'}</p>
            </div>
          )}

          {duesData.dueAmount === 0 ? (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--success-color)', marginBottom: '1rem' }}>
                ✅ You have no pending dues!
              </div>
              <AdmissionForm studentData={studentData} />
            </div>
          ) : (
            <div style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--error-color)' }}>
              ⚠️ You have pending dues. Admission form unavailable.
            </div>
          )}
          <button onClick={() => { setDuesData(null); setStudentData(null); }} className="form-button" style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
            Go Back
          </button>
        </div>
      )}

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Powered by Okie Dokie */}
      <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Powered by</p>
        <img src="/okiedokie.png" alt="Okie Dokie" style={{ height: '40px', objectFit: 'contain' }} />
      </div>
    </div>
  );
}

export default App;
