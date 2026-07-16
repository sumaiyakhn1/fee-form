import { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './AdmissionForm.css';

interface AdmissionFormProps {
  studentData: any;
}

export default function AdmissionForm({ studentData }: AdmissionFormProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoPrint') === 'true') {
      // Remove autoPrint from URL so it doesn't print repeatedly on refresh
      const regNo = params.get('regNo');
      window.history.replaceState({}, '', window.location.pathname + (regNo ? '?regNo=' + regNo : ''));
      setTimeout(() => {
        if (regNo) {
          fetch('https://fee-form.onrender.com/api/log-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regNo })
          }).catch(console.error);
        }
        window.print();
      }, 1500); // Give images a moment to load in the new browser tab
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLocalPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helpers to get data safely
  const getField = (fieldNames: string[]) => {
    for (const name of fieldNames) {
      if (studentData?.[name]) return studentData[name];
    }
    return '';
  };

  const name = getField(['name', 'studentName', 'firstName']);
  const fatherName = getField(['fatherName', 'fathersName', 'parentName']);
  const motherNameRaw = getField(['motherName', 'mothersName']);
  const motherName = motherNameRaw?.toLowerCase() === 'na' ? '' : motherNameRaw;

  let dob = getField(['dob', 'dateOfBirth']);
  if (dob) {
    const date = new Date(dob);
    if (!isNaN(date.getTime())) {
      dob = date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    }
  }

  const gender = getField(['gender', 'sex']);
  const collegeRollNo = getField(['regNo']);
  const uniRollNo = '';
  const kuRegNo = '';
  const abcId = getField(['abcId', 'abcIdNo', 'apaarId', 'apaar_id']);
  const familyId = getField(['familyId', 'ppp']);
  const category = getField(['socialCategory', 'category', 'casteCategory']);
  const minority = getField(['religion', 'minority']);

  const addressRaw = getField(['address', 'homeAddress', 'permanentAddress']);
  const city = getField(['city']);
  const state = getField(['state']);
  const pinCode = getField(['pinCode']);
  const address = [addressRaw, city, state, pinCode].filter(Boolean).join(', ');

  const studentMob = getField(['phone', 'mobile', 'studentMobile']);
  const parentMob = getField(['parentMobile', 'guardianMobile', 'fatherMobile']);
  const email = getField(['email', 'emailId']);
  const aadhar = getField(['uid', 'aadhar', 'aadharNo']);
  const voterId = getField(['voterId', 'voterIdNo']);
  const className = getField(['course', 'stream', 'courseName', 'class']);
  const semester = '';
  const photo = getField(['photoUrl', 'photo', 'image', 'profilePic', 'studentPhoto', 'profile_image', 'avatar', 'studentProfilePic', 'studentImage', 'profileImage', 'picture']);

  const logDownload = async () => {
    if (!collegeRollNo) return;
    try {
      await fetch('https://fee-form.onrender.com/api/log-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo: collegeRollNo })
      });
    } catch (err) {
      console.error('Failed to log download', err);
    }
  };

  const printForm = async () => {
    await logDownload();
    window.print();
  };

  if (generatedImage) {
    return (
      <div className="admission-form-container">

        <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>✅ Form Ready!</h2>

          <button
            type="button"
            className="form-button"
            onClick={() => {
              logDownload();
              const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = pdf.internal.pageSize.getHeight();
              pdf.addImage(generatedImage, 'PNG', 0, 0, pdfWidth, pdfHeight);
              pdf.save(`Admission_Form_${collegeRollNo || 'Student'}.pdf`);
            }}
            style={{ marginBottom: '1rem', backgroundColor: '#10b981', maxWidth: '300px', margin: '0 auto 1rem auto', display: 'block' }}
          >
            🖨️ Download PDF
          </button>

          <button
            type="button"
            className="form-button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied!');
            }}
            style={{ marginBottom: '2rem', backgroundColor: '#3b82f6', maxWidth: '300px', margin: '0 auto 2rem auto', display: 'block' }}
          >
            📋 Copy URL
          </button>

          <div style={{ border: '2px solid var(--primary-color)', padding: '5px', display: 'inline-block', borderRadius: '8px', maxWidth: '100%' }}>
            <img
              src={generatedImage}
              alt="Admission Form"
              style={{ width: '100%', maxWidth: '800px', display: 'block' }}
            />
          </div>
          <br />
          <button
            type="button"
            className="form-button"
            onClick={() => setGeneratedImage(null)}
            style={{ marginTop: '2rem', maxWidth: '300px', margin: '2rem auto 0 auto', display: 'block' }}
          >
            Back to Form
          </button>
        </div>

        {/* Render the original form invisibly so window.print() still captures the high-quality layout */}
        <div style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
          <div className="print-area" ref={formRef} style={{ backgroundColor: 'white', padding: '20px' }}>
            {/* ... Form will be rendered here for print only ... */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admission-form-container">
      <div className="print-area" ref={formRef} style={{ backgroundColor: 'white', padding: '20px', position: 'relative' }}>

        {/* WATERMARKS */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden'
        }}>
          {/* Top Left */}
          <div style={{
            position: 'absolute', top: '25%', left: '25%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '5rem', fontWeight: 'bold',
            color: 'rgba(0, 0, 0, 0.04)', whiteSpace: 'nowrap',
            textAlign: 'center', userSelect: 'none'
          }}>
            RKSD<br />{collegeRollNo}
          </div>
          
          {/* Center */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '5rem', fontWeight: 'bold',
            color: 'rgba(0, 0, 0, 0.04)', whiteSpace: 'nowrap',
            textAlign: 'center', userSelect: 'none'
          }}>
            RKSD<br />{collegeRollNo}
          </div>

          {/* Bottom Right */}
          <div style={{
            position: 'absolute', top: '75%', left: '75%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '5rem', fontWeight: 'bold',
            color: 'rgba(0, 0, 0, 0.04)', whiteSpace: 'nowrap',
            textAlign: 'center', userSelect: 'none'
          }}>
            RKSD<br />{collegeRollNo}
          </div>
        </div>

        {/* HEADER */}
        <div className="form-header" style={{ position: 'relative', zIndex: 1 }}>
          <div className="header-text">
            <h1>R.K.S.D. COLLEGE, KAITHAL</h1>
            <h2>(2026-27)</h2>
          </div>
          <div className="photo-placeholder" style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'transparent' }}>
            <label style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%', margin: 0 }}>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              {localPhoto ? (
                <img src={localPhoto} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : photo ? (
                <img src={photo} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'white' }}>
                  Affix Passport<br />Size Photo
                  <small style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>(Click to attach)</small>
                </span>
              )}
            </label>
          </div>
        </div>

        {/* ACADEMIC DETAILS */}
        <div className="form-row">
          <span style={{ display: 'flex', flex: 2, alignItems: 'flex-end' }}><strong>Class in Which admission is sought</strong> <input type="text" className="editable-input" defaultValue={className} /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end', marginLeft: 'auto' }}><strong>Semester</strong> <input type="text" className="editable-input" defaultValue={semester} /></span>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>College RollNo.</strong> <input type="text" className="editable-input" defaultValue={collegeRollNo} /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>University Roll No.</strong> <input type="text" className="editable-input" defaultValue={uniRollNo} /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>K.U. Reg. No.</strong> <input type="text" className="editable-input" defaultValue={kuRegNo} /></span>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1.5, alignItems: 'flex-end' }}><strong>APAAR ID No.</strong> <input type="text" className="editable-input" defaultValue={abcId} /></span>
          <span className="small-text" style={{ flex: 0.5, textAlign: 'center' }}>(Only for 2nd & 3rd Year Students)</span>
          <span style={{ display: 'flex', flex: 1.5, alignItems: 'flex-end' }}><strong>Name</strong> <input type="text" className="editable-input" defaultValue={name} /></span>
        </div>

        {/* PERSONAL DETAILS */}
        <div className="form-row">
          <span style={{ flex: 1 }}></span>
          <span style={{ display: 'flex', flex: 2, alignItems: 'flex-end' }}><strong>Family ID (PPP) :</strong> <input type="text" className="editable-input" defaultValue={familyId} /></span>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Father's Name</strong> <input type="text" className="editable-input" defaultValue={fatherName} /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Mother's Name</strong> <input type="text" className="editable-input" defaultValue={motherName} /></span>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>DOB</strong> <input type="text" className="editable-input" defaultValue={dob} /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Gender</strong> <input type="text" className="editable-input" defaultValue={gender} /></span>
        </div>

        {/* DEMOGRAPHICS */}
        <div className="form-row checkbox-row">
          <span><strong>Whether belong to minority, if yes tick:</strong></span>
          <label><input type="checkbox" defaultChecked={minority?.toLowerCase() === 'sikh'} /> Sikh</label>
          <label><input type="checkbox" defaultChecked={minority?.toLowerCase() === 'jain'} /> Jain</label>
          <label><input type="checkbox" defaultChecked={minority?.toLowerCase() === 'christian'} /> Christian</label>
          <label><input type="checkbox" defaultChecked={minority?.toLowerCase() === 'muslim'} /> Muslim</label>
        </div>

        <div className="form-row checkbox-row">
          <span><strong>Category :</strong></span>
          <label><input type="checkbox" defaultChecked={category?.toLowerCase() === 'gen' || category?.toLowerCase() === 'general'} /> Gen</label>
          <label><input type="checkbox" defaultChecked={category?.toLowerCase() === 'obc'} /> OBC</label>
          <label><input type="checkbox" defaultChecked={category?.toLowerCase() === 'sc'} /> SC</label>
          <label><input type="checkbox" defaultChecked={category?.toLowerCase() === 'st'} /> ST</label>
          <label><input type="checkbox" defaultChecked={category?.toLowerCase() === 'ewc' || category?.toLowerCase() === 'ews'} /> EWC</label>
          <label><input type="checkbox" defaultChecked={category?.toLowerCase() === 'phw' || category?.toLowerCase() === 'ph'} /> PHW</label>
        </div>

        {/* CONTACT DETAILS */}
        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Home Address</strong> <input type="text" className="editable-input" defaultValue={address} /></span>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Mob. No. (Student ):</strong> <input type="text" className="editable-input" defaultValue={studentMob} /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Mob. No. (Parents ):</strong> <input type="text" className="editable-input" defaultValue={parentMob} /></span>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>E-Mail ID.</strong> <input type="text" className="editable-input" defaultValue={email} /></span>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Aadhar No.</strong> <input type="text" className="editable-input" defaultValue={aadhar} /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Voter ID No.:</strong> <input type="text" className="editable-input" defaultValue={voterId} /></span>
        </div>

        {/* SUBJECTS */}
        <div className="form-row" style={{ marginTop: '1rem' }}>
          <strong>Subjects Opted:</strong>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Major: Sub 1</strong> <input type="text" className="editable-input" /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Sub 2</strong> <input type="text" className="editable-input" /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Sub 3</strong> <input type="text" className="editable-input" /></span>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>Minor: Sub 4</strong> <input type="text" className="editable-input" /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>AEC</strong> <input type="text" className="editable-input" /></span>
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}><strong>VAC</strong> <input type="text" className="editable-input" /></span>
        </div>

        <div className="form-row">
          <span style={{ display: 'flex', flex: 1, alignItems: 'flex-end', paddingLeft: '3rem' }}><strong>SEC</strong> <input type="text" className="editable-input" /></span>
          <span style={{ display: 'flex', flex: 2, alignItems: 'flex-end' }}><strong>MDC</strong> <input type="text" className="editable-input" /></span>
        </div>

        {/* DECLARATION */}
        <div className="declaration-section">
          <strong>Declaration :</strong>
          <ol>
            <li>I will abide by the rules of the College and University. I will not participate in any such activity which goes against the rules of the College / affiliating University.</li>
            <li>I will not indulge in ragging of any kind.</li>
            <li>The Principal will have the right to suspend/expel/rusticate me from the College on disciplinary grounds.</li>
            <li>I have not taken admission in any other college.</li>
            <li>All the facts mentioned by me in the admission form are true and correct-to the best of my knowledge.</li>
            <li>I am taking admission in the college provisionally at my own risk and responsibility.</li>
            <li>If at any stage, I am declared ineligible under the rules, I will not claim admission.</li>
          </ol>
        </div>

        <div className="signature-section">
          <strong>Signature of Student</strong>
        </div>
      </div>

      <div className="print-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          type="button"
          className="form-button"
          onClick={printForm}
        >
          Print Form
        </button>
      </div>
    </div>
  );
}
