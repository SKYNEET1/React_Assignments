// RaiseTicket.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "../components/PageLoader";
import { encryptRequest, decryptResponse } from "../services/cryptoService";
import cbioSymbol from "../assets/loading_logo.png";

// ── Shared field component ─────────────────────────────────────────────────────
function FormField({ label, helpText, children }) {
  return (
    <div style={{ width: '1078px', gap: '8px', display: 'flex', flexDirection: 'column' }}>
      {/* Label wrapper */}
      <div style={{ width: '1078px', height: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '20px',
          letterSpacing: '0.24px',
          color: '#1D242D',
        }}>
          {label}
        </span>
        {/* Tooltip icon placeholder */}
        <span style={{ width: '24px', height: '24px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#404040" strokeWidth="1.5"/>
            <text x="10" y="14" textAnchor="middle" fontSize="11" fill="#404040" fontFamily="Inter">i</text>
          </svg>
        </span>
        {helpText && (
          <span style={{
            fontFamily: 'Lato, sans-serif',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '18px',
            letterSpacing: '0.32px',
            color: '#6E6E6E',
          }}>
            {helpText}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '1078px',
  height: '54px',
  borderRadius: '4px',
  border: '1px solid #E2E2E2',
  background: '#FFFFFF',
  paddingTop: '8px',
  paddingRight: '12px',
  paddingBottom: '8px',
  paddingLeft: '12px',
  fontFamily: 'Lato, sans-serif',
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '20px',
  letterSpacing: '0.24px',
  color: '#1D242D',
  outline: 'none',
  boxSizing: 'border-box',
  appearance: 'none',
};

const placeholderColor = '#A3ADBB';

export default function RaiseTicket() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [issueTypes, setIssueTypes] = useState([]);
  const [issueSubTypes, setIssueSubTypes] = useState([]);
  const [issueType, setIssueType] = useState('');
  const [issueSubType, setIssueSubType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  // Attached file object contains name, size, isUploading, url, error
  const [attachedFile, setAttachedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFormStructure = async () => {
      try {
        const body = {
          "index": import.meta.env.VITE_OIDC_FORM_INDEX,
          "type": "em",
          "query": {
            "nested": {
              "path": "forms",
              "query": {
                "bool": {
                  "must": [{ "match": { "forms.id": 47501075391257 } }]
                }
              }
            }
          }
        };
        const response = await fetch(import.meta.env.VITE_OIDC_FORM_FETCH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!response.ok) return;
        const result = await response.json();
        const hits = result?.data?.hits;
        if (hits?.length) {
          const ticketFields = hits[0]?._source?.forms?.[0]?.ticket_fields;
          if (Array.isArray(ticketFields)) {
            const issueTypeField = ticketFields.find(f => f.title?.trim().toLowerCase() === "issue type");
            if (issueTypeField?.custom_field_options) setIssueTypes(issueTypeField.custom_field_options);
            
            const issueSubTypeField = ticketFields.find(f => f.title?.trim().toLowerCase() === "issue sub-type" || f.title?.trim().toLowerCase() === "issue sub type");
            if (issueSubTypeField?.custom_field_options) setIssueSubTypes(issueSubTypeField.custom_field_options);
          }
        }
      } catch (err) {
        console.error('Dynamic form loading failed:', err);
      }
    };
    fetchFormStructure();
  }, []);

  const isFormValid = issueType && issueSubType && subject.trim() && description.trim();

  const handleIssueTypeChange = (e) => {
    setIssueType(e.target.value);
    setIssueSubType('');
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('access_token');
    if (!token) return alert('Session expired.');

    const newFileObj = {
      name: file.name,
      size: file.size,
      isUploading: true,
      error: null,
      url: null,
    };
    setAttachedFile(newFileObj);

    try {
      const base64Data = await fileToBase64(file);
      const payload = { files: [{ base64string: base64Data, filename: file.name }] };
      const encryptedBody = await encryptRequest(payload);

      const response = await fetch(import.meta.env.VITE_OIDC_FILE_UPLOAD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
          'pass_key': import.meta.env.VITE_PASS_KEY
        },
        body: JSON.stringify({ "RequestData": encryptedBody })
      });

      if (!response.ok) throw new Error(`Upload Failed: ${response.status}`);
      const result = await response.json();
      const decrypted = await decryptResponse(result.ResponseData);
      
      const uploadedFile = decrypted?.data?.files?.[0];
      if (uploadedFile && uploadedFile.url) {
        setAttachedFile(prev => ({ ...prev, isUploading: false, url: uploadedFile.url }));
      } else {
        throw new Error(uploadedFile?.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setAttachedFile(prev => ({ ...prev, isUploading: false, error: 'Upload Failed' }));
    }
    e.target.value = '';
  };

  const handleRemoveFile = async () => {
    if (!attachedFile) return;
    const token = localStorage.getItem('access_token');
    if (attachedFile.url && token) {
      try {
        const payload = { url: attachedFile.url };
        const encryptedBody = await encryptRequest(payload);
        await fetch(import.meta.env.VITE_OIDC_FILE_DELETE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
            'pass_key': import.meta.env.VITE_PASS_KEY
          },
          body: JSON.stringify({ "RequestData": encryptedBody })
        });
      } catch (err) {
        console.error(err);
      }
    }
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    const token = localStorage.getItem('access_token');
    if (!token) return alert('Session expired.');

    setIsSubmitting(true);
    try {
      const payload = {
        body: description.trim(),
        subject: subject.trim(),
        ticket_form_id: 47501075391257,
        custom_fields: [
          { id: 900013325983, value: subject.trim() },
          { id: 32240028334873, value: issueType },
          { id: 32240169914009, value: issueSubType },
          { id: 900013326003, value: description.trim() }
        ]
      };
      
      if (attachedFile && attachedFile.url && !attachedFile.isUploading) {
        payload.attachmentName = attachedFile.name;
        payload.attachmentURL = attachedFile.url;
      }

      const encryptedBody = await encryptRequest(payload);
      const response = await fetch(import.meta.env.VITE_OIDC_CREATE_TICKET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
          'pass_key': import.meta.env.VITE_PASS_KEY
        },
        body: JSON.stringify({ "RequestData": encryptedBody })
      });
      
      if (!response.ok) throw new Error('Request Failed');
      const result = await response.json();
      const decrypted = await decryptResponse(result.ResponseData);
      
      if (decrypted && decrypted.statusCode === 0 && decrypted.status === 'SUCCESS') {
        setTicketId(decrypted.ticket_id);
        setShowModal(true);
      } else {
        throw new Error(decrypted?.status_desc || decrypted?.statusDesc || 'Ticket creation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIssueType('');
    setIssueSubType('');
    setSubject('');
    setDescription('');
    handleRemoveFile();
  };

  const handleModalClose = () => {
    setShowModal(false);
    handleCancel();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <PageLoader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px', paddingRight: '16px', paddingBottom: '16px', paddingLeft: '24px' }}>

        {/* ── Top Nav: 1126×72 ── */}
        <div style={{
          width: '1126px',
          height: '72px',
          borderRadius: '8px',
          padding: '16px',
          background: '#FFFFFF',
          boxShadow: '0px 4px 8px 0px rgba(68,68,68,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}>
          {/* Frame 17: 1094×54 */}
          <div style={{ width: '1094px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Back arrow: 34×34, border-radius 84, border #EFEF */}
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '84px',
                border: '1px solid #EFEFEF',
                background: '#FFFFFF',
                boxShadow: '1px 2px 4px 0px rgba(89,89,89,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Go Back"
            >
              {/* Vector: 18.28×16, color #546881 */}
              <svg width="18" height="16" viewBox="0 0 20 16" fill="none">
                <path d="M19 8H1M1 8L8 1M1 8L8 15" stroke="#546881" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Right contact info pill: 654×54, border-radius 44, border #EEF0F1 */}
            <div style={{
              width: '654px',
              height: '54px',
              borderRadius: '44px',
              border: '1px solid #EEF0F1',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              paddingTop: '8px',
              paddingRight: '14px',
              paddingBottom: '8px',
              paddingLeft: '14px',
              boxSizing: 'border-box',
            }}>
              {/* Phone: 333×24 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '333px', height: '24px' }}>
                {/* Phone Icon: 24×24, color #546881 */}
                <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#546881"/>
                  </svg>
                </div>
                {/* Merchant Support No: 297×19 */}
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '120%',
                  color: '#0C0C0D',
                  width: '297px',
                  height: '19px',
                  whiteSpace: 'nowrap',
                }}>
                  Merchant Support No. : 9124573230
                </span>
              </div>

              {/* Email: 269×24 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '269px', height: '24px' }}>
                {/* Email Icon: 24×24, bg #546881 */}
                <div style={{ width: '24px', height: '24px', background: '#546881', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                    <path d="M1 1h11v8H1V1zM1 1l5.5 5L12 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {/* Email text: 233×19 */}
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '120%',
                  color: '#0C0C0D',
                  width: '233px',
                  height: '19px',
                  whiteSpace: 'nowrap',
                }}>
                  Email : cboisupport@iserveu.in
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body Card: 1126×814, border-radius 8, padding 24, gap 24 ── */}
        <div style={{
          width: '1126px',
          borderRadius: '8px',
          gap: '24px',
          padding: '24px',
          background: '#FFFFFF',
          boxShadow: '0px 0px 21px 0px rgba(112,112,112,0.06)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}>

          {/* Frame 117 — Title row: 1078×26, gap 14 */}
          <div style={{ width: '1078px', height: '26px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Flag icon: 24×24 */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12zM4 22v-7" stroke="#546881" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* "Raise a Ticket": 147×26 */}
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '22px',
              lineHeight: '120%',
              color: '#0F1010',
              width: '147px',
              height: '26px',
            }}>
              Raise a Ticket
            </span>
          </div>

          {/* Frame 4692: form fields — gap 16 */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '1078px' }}>

            {/* Frame 4701 — 4 selects/inputs: gap 12 */}
            <div style={{ width: '1078px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* 1. Issue Type */}
              <FormField label="Issue Type *">
                <div style={{ position: 'relative', width: '1078px' }}>
                  <select
                    id="rt_issue_type"
                    value={issueType}
                    onChange={handleIssueTypeChange}
                    required
                    style={{
                      ...inputStyle,
                      color: issueType ? '#1D242D' : placeholderColor,
                    }}
                  >
                    <option value="" style={{ color: placeholderColor }}>Select Issue Type</option>
                    {issueTypes.map((opt) => (
                      <option key={opt.id || opt.value} value={opt.value} style={{ color: '#1D242D' }}>{opt.name}</option>
                    ))}
                  </select>
                  {/* Chevron: 12×6, border 2px solid #546881 */}
                  <svg width="12" height="6" viewBox="0 0 12 6" fill="none" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <path d="M1 1l5 4 5-4" stroke="#546881" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </FormField>

              {/* 2. Issue Sub-type */}
              <FormField label="Issue Sub-type *">
                <div style={{ position: 'relative', width: '1078px' }}>
                  <select
                    id="rt_issue_subtype"
                    value={issueSubType}
                    onChange={(e) => setIssueSubType(e.target.value)}
                    required
                    disabled={!issueType}
                    style={{
                      ...inputStyle,
                      color: issueSubType ? '#1D242D' : placeholderColor,
                      background: issueType ? '#FFFFFF' : '#F5F5F5',
                      cursor: issueType ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <option value="" style={{ color: placeholderColor }}>Select Issue Sub-type</option>
                    {issueSubTypes.map((opt) => (
                      <option key={opt.id || opt.value} value={opt.value} style={{ color: '#1D242D' }}>{opt.name}</option>
                    ))}
                  </select>
                  <svg width="12" height="6" viewBox="0 0 12 6" fill="none" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <path d="M1 1l5 4 5-4" stroke="#546881" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </FormField>

              {/* 3. Subject */}
              <FormField label="Subject *">
                <input
                  id="rt_subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter Subject"
                  required
                  style={{ ...inputStyle, color: subject ? '#1D242D' : placeholderColor }}
                />
              </FormField>
            </div>

            {/* Description: 1078×184 */}
            <div style={{ width: '1078px', height: '184px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Desc field: 1078×160, gap 8 */}
              <div style={{ width: '1078px', height: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Label */}
                <div style={{ width: '1078px', height: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '20px', letterSpacing: '0.24px', color: '#1D242D' }}>
                    Description *
                  </span>
                  <span style={{ width: '24px', height: '24px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="#404040" strokeWidth="1.5"/>
                      <text x="10" y="14" textAnchor="middle" fontSize="11" fill="#404040" fontFamily="Inter">i</text>
                    </svg>
                  </span>
                </div>
                {/* Textarea input: 1078×128 */}
                <textarea
                  id="rt_description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                  placeholder="Any additional details..."
                  required
                  style={{
                    width: '1078px',
                    height: '128px',
                    borderRadius: '4px',
                    border: '1px solid #E2E2E2',
                    background: '#FFFFFF',
                    paddingTop: '8px',
                    paddingRight: '12px',
                    paddingBottom: '8px',
                    paddingLeft: '12px',
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '20px',
                    letterSpacing: '0.24px',
                    color: description ? '#1D242D' : placeholderColor,
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {/* Helper text: 1078×20, padding 0 12px */}
              <div style={{ width: '1078px', height: '20px', paddingRight: '12px', paddingLeft: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '20px',
                  letterSpacing: '0.24px',
                  color: '#909DAD',
                }}>
                  Describe your issue within 300 characters ({description.length}/300)
                </span>
              </div>
            </div>

            {/* Attachment: 1078×136, gap 16 */}
            <div style={{ width: '1078px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* text-input wrapper: 1078×86, gap 8 */}
              <div style={{ width: '1078px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Label */}
                <div style={{ width: '1078px', height: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '20px', letterSpacing: '0.24px', color: '#1D242D' }}>
                    Attachment
                  </span>
                  <span style={{ width: '24px', height: '24px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="#404040" strokeWidth="1.5"/>
                      <text x="10" y="14" textAnchor="middle" fontSize="11" fill="#404040" fontFamily="Inter">i</text>
                    </svg>
                  </span>
                  <span style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', letterSpacing: '0.32px', color: '#6E6E6E' }}>
                    Optional — PDF, JPG, PNG accepted
                  </span>
                </div>

                {/* Attachment input: 1078×54 — prefix + text + trailing icons */}
                <input
                  type="file"
                  ref={fileInputRef}
                  id="rt_attachment"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '1078px',
                  height: '54px',
                  borderRadius: '4px',
                  border: '1px solid #E2E2E2',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}>
                  {/* Input item group: 64×52, #F9F9F9, left-rounded — paperclip prefix */}
                  <label
                    htmlFor="rt_attachment"
                    style={{
                      width: '64px',
                      height: '52px',
                      background: '#F9F9F9',
                      borderTopLeftRadius: '4px',
                      borderBottomLeftRadius: '4px',
                      borderRight: '1px solid #E2E2E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Paperclip: vector 16.5×17.95, border 2px #888888 */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                        stroke="#888888"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </label>

                  {/* Placeholder / filename text */}
                  <label
                    htmlFor="rt_attachment"
                    style={{
                      flex: 1,
                      paddingLeft: '12px',
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '20px',
                      letterSpacing: '0.24px',
                      color: attachedFile ? '#1D242D' : '#A3ADBB',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {attachedFile ? attachedFile.name : 'Please Add Attachment'}
                  </label>

                  {/* Right-side controls — only clear icon when file is selected */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '12px', flexShrink: 0 }}>
                    {/* Trailing clear icon: 28×28, × in #404040 — only when file selected */}
                    {attachedFile && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        style={{
                          width: '28px',
                          height: '28px',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#404040" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Frame 11712 — upload item row: 1078×34, gap 16 */}
              {attachedFile && (
                <div style={{ width: '1078px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Left: PDF icon + details — wrap: gap 14 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    {/* PDF icon or Loader */}
                    <div style={{ width: '16px', height: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {attachedFile.isUploading ? (
                        <img src={cbioSymbol} alt="Uploading..." style={{ width: '48px', height: '48px', animation: 'spin 1.5s linear infinite' }} />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="2" y="1" width="9" height="14" rx="1" fill="#546881" opacity="0.15"/>
                          <rect x="2" y="1" width="9" height="14" rx="1" stroke="#546881" strokeWidth="1.2"/>
                          <path d="M6 1v4h5" stroke="#546881" strokeWidth="1.2" strokeLinejoin="round"/>
                          <path d="M4 8h5M4 10.5h3.5" stroke="#546881" strokeWidth="1" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    {/* Details: gap 4 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center', minWidth: 0 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '16px', color: attachedFile.error ? '#ef4444' : '#546881', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attachedFile.name}
                      </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '14px', color: attachedFile.error ? '#ef4444' : '#546881' }}>
                        {attachedFile.error ? attachedFile.error : (attachedFile.isUploading ? 'Uploading...' : 'Uploaded')}
                      </span>
                    </div>
                  </div>

                  {/* Right: tags + kebab — 77×20, gap 8 */}
                  {!attachedFile.isUploading && (
                    <div style={{ width: '77px', height: '20px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {/* Retry/refresh icon: 16×16, circular arrow #CB3C3C */}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        title="Remove file"
                        style={{ width: '16px', height: '16px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13.65 2.35A8 8 0 1 0 14 8" stroke="#CB3C3C" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M14 2v4h-4" stroke="#CB3C3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {/* Tag pill: 53×20, border-radius 2, border #CDD3D8, "604KB" Inter 600 11px #546881 */}
                      <div style={{
                        width: '53px',
                        height: '20px',
                        borderRadius: '2px',
                        border: '1px solid #CDD3D8',
                        paddingTop: '4px',
                        paddingRight: '8px',
                        paddingBottom: '4px',
                        paddingLeft: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}>
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: '11px',
                          lineHeight: '12px',
                          color: '#546881',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}>
                          {formatFileSize(attachedFile.size)}
                        </span>
                      </div>

                      {/* 3-dot kebab menu: 3 circles 3×3, #546881 */}
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', justifyContent: 'center', height: '20px', width: '3px', flexShrink: 0 }}
                      >
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#546881', display: 'block' }} />
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#546881', display: 'block' }} />
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#546881', display: 'block' }} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', paddingTop: '16px', borderTop: '1px solid #F0F0F0', width: '1078px' }}>
              {/* Cancel: 160×54, border-radius 4, padding 12px 20px, border #546881, text Inter 500 16px #546881 */}
              <button
                type="button"
                id="rt_cancel_btn"
                onClick={handleCancel}
                style={{
                  width: '160px',
                  height: '54px',
                  borderRadius: '4px',
                  border: '1px solid #546881',
                  background: '#FFFFFF',
                  color: '#546881',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '120%',
                  paddingTop: '12px',
                  paddingRight: '20px',
                  paddingBottom: '12px',
                  paddingLeft: '20px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                Cancel
              </button>
              {/* Submit: 160×54, border-radius 4, padding 12px 20px, bg #A41929, border #00BED4, text Inter 500 16px #FFFFFF */}
              <button
                type="submit"
                id="rt_submit_btn"
                disabled={!isFormValid || isSubmitting}
                style={{
                  width: '160px',
                  height: '54px',
                  borderRadius: '4px',
                  border: '1px solid #00BED4',
                  background: '#A41929',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '24px',
                  paddingTop: '12px',
                  paddingRight: '20px',
                  paddingBottom: '12px',
                  paddingLeft: '20px',
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  opacity: isFormValid ? 1 : 0.5,
                  transition: 'opacity 0.2s',
                  boxSizing: 'border-box',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Success Modal ──
             The overlay has a VERY light blur (1.5px) — only it is blurred, the card itself is crystal clear.
        */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              /* Light semi-transparent overlay — only this layer blurs the background */
              background: 'rgba(0, 0, 0, 0.18)',
              backdropFilter: 'blur(1.5px)',
              WebkitBackdropFilter: 'blur(1.5px)',
            }}
          >
            {/* Modal card: 442×502, NO blur, crystal clear */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0px 9px 28px 8px rgba(0,0,0,0.05), 0px 6px 16px 0px rgba(0,0,0,0.08), 0px 3px 6px -4px rgba(0,0,0,0.12)',
              width: '442px',
              minHeight: '502px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflow: 'hidden',
              /* Ensure this card is NOT blurred */
              filter: 'none',
            }}>
              {/* Close button */}
              <button
                onClick={handleModalClose}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#909DAD', zIndex: 1 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              {/* Illustration area */}
              <div style={{
                width: '100%',
                height: '220px',
                background: 'linear-gradient(135deg, #EBF3FF 0%, #F0F7FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {/* Phone + checkmark illustration */}
                <svg width="140" height="160" viewBox="0 0 140 160" fill="none">
                  {/* Phone body */}
                  <rect x="38" y="20" width="64" height="110" rx="10" fill="#C8DEF5" stroke="#5B9BD5" strokeWidth="2"/>
                  <rect x="44" y="32" width="52" height="80" rx="4" fill="#EAF3FF"/>
                  {/* Big check circle */}
                  <circle cx="70" cy="72" r="24" fill="#156DC4" opacity="0.12"/>
                  <circle cx="70" cy="72" r="18" fill="#156DC4"/>
                  <path d="M61 72l6 7 12-14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Home button */}
                  <circle cx="70" cy="118" r="5" fill="#5B9BD5" opacity="0.5"/>
                  {/* Person silhouette */}
                  <ellipse cx="110" cy="130" rx="14" ry="18" fill="#546881" opacity="0.15"/>
                  <circle cx="110" cy="108" r="8" fill="#546881" opacity="0.25"/>
                </svg>
              </div>

              {/* Text + action area */}
              <div style={{ padding: '28px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '20px', lineHeight: '28px', color: '#0F1010', margin: '0 0 12px' }}>
                  Ticket Created Successfully!
                </h3>
                <p style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: '#6E6E6E', margin: '0 0 28px' }}>
                  You can check its status with the ticket ID:{' '}
                  <span style={{ fontWeight: 700, color: '#156DC4' }}>{ticketId}</span>
                </p>
                <button
                  onClick={handleModalClose}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#156DC4',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer',
                    letterSpacing: '0.2px',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
}
