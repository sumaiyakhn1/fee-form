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
      const canvas = await html2canvas(formRef.current, {
        scale: 2, // Higher quality
        useCORS: true, // For remote images
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
      pdf.save(`Admission_Form_${collegeRollNo || studentId || 'Student'}.pdf`);
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
          <span><strong>Class in Which admission is sought</strong> <span className="underline">{className || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
          <span style={{ marginLeft: 'auto' }}><strong>Semester</strong> <span className="underline">{semester || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        <div className="form-row">
          <span><strong>College RollNo.</strong> <span className="underline">{collegeRollNo || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
          <span><strong>University Roll No.</strong> <span className="underline">{uniRollNo || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
          <span><strong>K.U. Reg. No.</strong> <span className="underline">{kuRegNo || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        <div className="form-row">
          <span><strong>ABC ID No.</strong> <span className="underline">{abcId || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
          <span className="small-text">(Only for 2nd Year Students)</span>
          <span><strong>Name</strong> <span className="underline">{name || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        {/* PERSONAL DETAILS */}
        <div className="form-row">
          <span style={{flex: 1}}></span>
          <span><strong>Family ID (PPP) :</strong> <span className="underline">{familyId || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        <div className="form-row">
          <span style={{flex: 1}}><strong>Father's Name</strong> <span className="underline">{fatherName || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
          <span style={{flex: 1}}><strong>Mother's Name</strong> <span className="underline">{motherName || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        <div className="form-row">
          <span style={{flex: 1}}><strong>DOB</strong> <span className="underline">{dob || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
          <span style={{flex: 1}}><strong>Gender</strong> <span className="underline">{gender || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        {/* DEMOGRAPHICS */}
        <div className="form-row checkbox-row">
          <span><strong>Whether belong to minority, if yes tick:</strong></span>
          <label><input type="checkbox" checked={minority?.toLowerCase() === 'sikh'} readOnly /> Sikh</label>
          <label><input type="checkbox" checked={minority?.toLowerCase() === 'jain'} readOnly /> Jain</label>
          <label><input type="checkbox" checked={minority?.toLowerCase() === 'christian'} readOnly /> Christian</label>
          <label><input type="checkbox" checked={minority?.toLowerCase() === 'muslim'} readOnly /> Muslim</label>
        </div>

        <div className="form-row checkbox-row">
          <span><strong>Category :</strong></span>
          <label><input type="checkbox" checked={category?.toLowerCase() === 'gen' || category?.toLowerCase() === 'general'} readOnly /> Gen</label>
          <label><input type="checkbox" checked={category?.toLowerCase() === 'obc'} readOnly /> OBC</label>
          <label><input type="checkbox" checked={category?.toLowerCase() === 'sc'} readOnly /> SC</label>
          <label><input type="checkbox" checked={category?.toLowerCase() === 'st'} readOnly /> ST</label>
          <label><input type="checkbox" checked={category?.toLowerCase() === 'ewc' || category?.toLowerCase() === 'ews'} readOnly /> EWC</label>
          <label><input type="checkbox" checked={category?.toLowerCase() === 'phw' || category?.toLowerCase() === 'ph'} readOnly /> PHW</label>
        </div>

        {/* CONTACT DETAILS */}
        <div className="form-row">
          <span style={{flex: 1}}><strong>Home Address</strong> <span className="underline">{address || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        <div className="form-row">
          <span style={{flex: 1}}><strong>Mob. No. (Student ):</strong> <span className="underline">{studentMob || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
          <span style={{flex: 1}}><strong>Mob. No. (Parents ):</strong> <span className="underline">{parentMob || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        <div className="form-row">
          <span style={{flex: 1}}><strong>E-Mail ID.</strong> <span className="underline">{email || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        <div className="form-row">
          <span style={{flex: 1}}><strong>Aadhar No.</strong> <span className="underline">{aadhar || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
          <span style={{flex: 1}}><strong>Voter ID No.:</strong> <span className="underline">{voterId || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></span>
        </div>

        {/* SUBJECTS */}
        <div className="form-row" style={{ marginTop: '1rem' }}>
          <strong>Subjects Opted:</strong>
        </div>
        
        <div className="form-row">
          <span style={{flex: 1}}><strong>Major: Sub 1</strong> <span className="underlineBlank"></span></span>
          <span style={{flex: 1}}><strong>Sub 2</strong> <span className="underlineBlank"></span></span>
          <span style={{flex: 1}}><strong>Sub 3</strong> <span className="underlineBlank"></span></span>
        </div>

        <div className="form-row">
          <span style={{flex: 1}}><strong>Minor: Sub 4</strong> <span className="underlineBlank"></span></span>
          <span style={{flex: 1}}><strong>AEC</strong> <span className="underlineBlank"></span></span>
          <span style={{flex: 1}}><strong>VAC</strong> <span className="underlineBlank"></span></span>
        </div>

        <div className="form-row">
          <span style={{flex: 1, paddingLeft: '3rem'}}><strong>SEC</strong> <span className="underlineBlank" style={{width: '60%'}}></span></span>
          <span style={{flex: 2}}><strong>MDC</strong> <span className="underlineBlank" style={{width: '60%'}}></span></span>
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
