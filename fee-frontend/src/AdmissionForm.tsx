import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './AdmissionForm.css';

interface AdmissionFormProps {
  studentData: any;
}

export default function AdmissionForm({ studentData }: AdmissionFormProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);

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
  const motherName = getField(['motherName', 'mothersName']);
  
  let dob = getField(['dob', 'dateOfBirth']);
  if (dob) {
    const date = new Date(dob);
    if (!isNaN(date.getTime())) {
      dob = date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    }
  }

  const gender = getField(['gender', 'sex']);
  const collegeRollNo = getField(['collegeRollNo', 'rollNo']);
  const uniRollNo = getField(['uniRollNo', 'universityRollNo']);
  const kuRegNo = getField(['regNo', 'kuRegNo', 'registrationNo']);
  const abcId = getField(['abcId', 'abcIdNo']);
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
  const semester = getField(['batch', 'semester', 'sem']);

  const downloadPDF = async () => {
    if (!formRef.current) return;
    
    try {
      setIsDownloading(true);

      // Force update DOM attributes so html2canvas captures current input values
      const inputs = formRef.current.querySelectorAll('input[type="text"]');
      inputs.forEach((input: any) => {
        input.setAttribute('value', input.value);
      });

      const canvas = await html2canvas(formRef.current, {
        scale: window.innerWidth < 768 ? 1.5 : 2, // slightly lower scale on mobile to prevent crashes
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const studentId = getField(['regNo', 'id', '_id']);
      const fileName = `Admission_Form_${collegeRollNo || studentId || 'Student'}.pdf`;

      // On mobile, native downloads of large files via JS often fail or get blocked.
      // The most reliable way is to open the PDF directly in the browser tab using a Blob URL,
      // allowing the user to use their phone's native "Share" or "Save to Files" options.
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        window.location.href = blobUrl;
      } else {
        // Desktop browsers handle this perfectly
        pdf.save(fileName);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="admission-form-container">
      <div className="print-area" ref={formRef} style={{ backgroundColor: 'white', padding: '20px' }}>
        
        {/* HEADER */}
        <div className="form-header">
          <div className="header-text">
            <h1>R.K.S.D. COLLEGE, KAITHAL</h1>
            <h2>(2026-27)</h2>
          </div>
          <div className="photo-placeholder" style={{ position: 'relative', overflow: 'hidden' }}>
            <label style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%', margin: 0 }}>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              {localPhoto || getField(['photoUrl', 'photo', 'image', 'profilePic', 'studentPhoto', 'profile_image', 'avatar']) ? (
                <img 
                  src={localPhoto || getField(['photoUrl', 'photo', 'image', 'profilePic', 'studentPhoto', 'profile_image', 'avatar'])} 
                  alt="Student" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  Affix Passport<br/>Size Photo
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
          <span style={{ display: 'flex', flex: 1.5, alignItems: 'flex-end' }}><strong>ABC ID No.</strong> <input type="text" className="editable-input" defaultValue={abcId} /></span>
          <span className="small-text" style={{ flex: 0.5, textAlign: 'center' }}>(Only for 2nd Year Students)</span>
          <span style={{ display: 'flex', flex: 1.5, alignItems: 'flex-end' }}><strong>Name</strong> <input type="text" className="editable-input" defaultValue={name} /></span>
        </div>

        {/* PERSONAL DETAILS */}
        <div className="form-row">
          <span style={{flex: 1}}></span>
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
        <button className="form-button" onClick={() => window.print()} disabled={isDownloading}>
          Print Form
        </button>
        <button 
          className="form-button" 
          onClick={downloadPDF} 
          disabled={isDownloading}
          style={{ background: 'var(--success-color)' }}
        >
          {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}
