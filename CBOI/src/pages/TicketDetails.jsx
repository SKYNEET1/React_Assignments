import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PiArrowLeft, PiFlagFill, PiDownloadSimple, PiUserFill, PiPaperPlaneRightFill } from 'react-icons/pi';
import { handleEncrypt, handleDecrypt } from '../services/cryptoService';
import { jsPDF } from 'jspdf';
import cbioSymbol from '../assets/loading_logo.png';
import TicketActionModal from '../components/HelpSupport/TicketActionModal';
import PageLoader from '../components/PageLoader';

const ISSUE_TYPES = ['QR', 'SIM', 'Device', 'Transaction Notification', 'Delivery Related', 'Call Drop', 'Delivery Dispute', 'Missed Call', 'Deinstallation Request', 'Wrong Device', 'Other', 'Logistics', 'Device Replacement'];
const ISSUE_SUB_TYPES = ['Damaged QR', 'VPA ID not working', 'Extra QR requirement', 'SIM Card lost/Not received', 'Damaged Device', 'Device Activation', 'Device charging issue', 'Language updation', 'Device Feature Related', 'Welcome greeting Issue', 'Wrong Device Delivered', 'Device Delivery Status', 'Multiple Device received', 'Device Return Request', 'Transaction Sound Issue', 'Request For Callback'];

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('close'); 

  // Session Data
  const merchantDetails = JSON.parse(localStorage.getItem('merchant_details') || '{}');
  const profileDetails = JSON.parse(localStorage.getItem('profile') || '{}');

  const registeredMobile = merchantDetails.merchant_mobile || '8637254221';
  const registeredEmail = profileDetails.email || 'baishakhi.guin@iserveu.co.in';
  const username = profileDetails.user_name || profileDetails.name || 'Baishakhi@123';
  const userType = profileDetails.user_type || 'Zonal Office(ZO)';
  
  const vpaId = merchantDetails.vpa_id || '-';
  const serialNo = merchantDetails.serial_number || merchantDetails.serial_no || '-';

  // Deterministic Mock Values fallback
  const mockIssueType = ISSUE_TYPES[parseInt(id) % ISSUE_TYPES.length] || 'Hardware';
  const mockIssueSubType = ISSUE_SUB_TYPES[parseInt(id) % ISSUE_SUB_TYPES.length] || 'Device Problem';

  const fetchTicketDetails = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please login again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const payload = { ticket_id: parseInt(id) };
      const encryptedBody = await handleEncrypt(payload);

      const response = await fetch(import.meta.env.VITE_OIDC_VIEW_TICKET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
          'pass_key': import.meta.env.VITE_PASS_KEY
        },
        body: JSON.stringify({ "RequestData": encryptedBody })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const result = await response.json();
      const decrypted = await handleDecrypt(result.ResponseData);

      if (decrypted && decrypted.data) {
        setTicket(decrypted.data);
      } else {
        throw new Error('Ticket details not found.');
      }
    } catch (err) {
      console.error('Fetch Ticket Details Failed:', err);
      // Fallback for demo if API fails
      setTicket({
        id: id,
        issue_type: mockIssueType,
        issue_sub_type: mockIssueSubType,
        created_at: new Date().toISOString(),
        status: 'open',
        vpa_id: vpaId,
        device_serial_number: serialNo,
        description: 'Mock data since API returned empty or 404. Proceed with testing UI layout.',
        comments: []
      });
    } finally {
      setLoading(false);
    }
  }, [id, vpaId, serialNo, mockIssueType, mockIssueSubType]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const handleDownloadPDF = () => {
    if (!ticket) return;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${ticket.id} Ticket Information`, 20, 25);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 30, 190, 30);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);

    const details = [
      ['Ticket ID', ticket.id],
      ['Issue Type', ticket.issue_type || '-'],
      ['Issue Sub Type', ticket.issue_sub_type || '-'],
      ['Created Date', formatDate(ticket.created_at)],
      ['Status', (ticket.status || '-').toUpperCase()],
      ['VPA ID', ticket.vpa_id || '-'],
      ['Serial Number', ticket.device_serial_number || ticket.serial_no || '-'],
      ['Description', ticket.description || '-']
    ];

    let yPos = 45;
    details.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`${value}`, 60, yPos);
      yPos += 10;
    });

    doc.save(`Ticket_${ticket.id}.pdf`);
  };

  if (error) return <div className="p-8 text-center text-red-500 font-semibold bg-white rounded-lg shadow">{error}</div>;

  return (
    <PageLoader loading={loading}>
      <div className="flex flex-col gap-6 relative min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-full bg-white shadow-sm text-slate-500 hover:text-slate-800 transition"
          >
            <PiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-slate-800 font-['Inter']">View Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition font-['Inter']"
          >
            <PiDownloadSimple size={18} /> Download
          </button>

          {ticket?.status?.toLowerCase() === 'solved' || ticket?.status?.toLowerCase() === 'closed' ? (
            <button 
              onClick={() => { setModalAction('reopen'); setIsModalOpen(true); }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-blue-700 transition font-['Inter']"
            >
              Reopen Ticket
            </button>
          ) : (
            <button 
              onClick={() => { setModalAction('close'); setIsModalOpen(true); }}
              className="px-6 py-2.5 bg-red-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-red-700 transition font-['Inter']"
            >
              Close Ticket
            </button>
          )}
        </div>
      </div>

      {/* Ticket Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 text-slate-700 pb-4 border-b border-slate-100">
          <PiFlagFill size={20} className="text-slate-500" />
          <span className="text-lg font-bold font-['Inter']">Ticket ID: #{ticket?.id || id}</span>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {/* Column 1 */}
          <div className="flex flex-col gap-5 border-r border-slate-100 pr-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">Issue Type</label>
              <p className="text-sm text-slate-800 font-medium font-['Lato']">{ticket?.issue_type || mockIssueType}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">Issue Sub Type</label>
              <p className="text-sm text-slate-800 font-medium font-['Lato']">{ticket?.issue_sub_type || mockIssueSubType}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">Ticket Created Date</label>
              <p className="text-sm text-slate-800 font-medium font-['Lato']">{formatDate(ticket?.created_at)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">User Type</label>
              <p className="text-sm text-slate-800 font-medium font-['Lato']">{userType}</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-5 border-r border-slate-100 pr-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">VPA ID</label>
              <p className="text-sm text-slate-800 font-medium font-['Lato']">{ticket?.vpa_id || vpaId}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">Device Serial Number</label>
              <p className="text-sm text-slate-800 font-medium font-['Lato']">{ticket?.device_serial_number || ticket?.serial_no || serialNo}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">Status</label>
              <div className={`mt-1 flex items-center w-max gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${ticket?.status?.toLowerCase() === 'solved' ? 'bg-[#e6f9ee] text-[#1a7f4b]' : 'bg-[#e0f2fe] text-[#0284c7]'} border border-current/20`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {ticket?.status || 'Pending'}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">Username</label>
              <p className="text-sm text-slate-800 font-medium font-['Lato']">{username}</p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-5 border-r border-slate-100 pr-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">Registered Mobile Number</label>
              <p className="text-sm text-slate-800 font-medium font-['Lato']">{registeredMobile}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">Registered Email ID</label>
              <p className="text-sm text-slate-800 font-medium font-['Lato']">{registeredEmail}</p>
            </div>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold font-['Inter'] uppercase tracking-wider">Issue Description</label>
              <p className="text-sm text-slate-600 font-normal leading-relaxed font-['Lato']">
                {ticket?.description || 'The user is requesting a review of their ticket details. They believe the information provided will demonstrate compliance with guidelines and justify the resolution.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 font-['Inter']">Messages</h2>
        </div>

        <div className="p-6 flex flex-col gap-6 bg-slate-50 pb-20">
          <button className="self-center flex items-center gap-2 text-blue-600 text-sm font-semibold hover:underline">
            <PiArrowLeft className="rotate-90" /> Show Older Messages
          </button>

          <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
            {ticket?.comments?.length ? (
              ticket.comments.map((comment, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                    {comment.author_role === 'agent' ? (
                      <span className="text-sm font-bold text-slate-600">ST</span>
                    ) : (
                      <PiUserFill size={20} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 bg-white border border-slate-200 p-4 rounded-xl shadow-sm rounded-tl-none">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-slate-800 text-sm font-['Inter']">{comment.author_name}</span>
                      <span className="text-xs text-slate-400 font-medium">{comment.created_at}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-['Lato']">{comment.body}</p>
                  </div>
                </div>
              ))
            ) : (
              /* Fallback static messages */
              <>
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full border border-slate-200 bg-white flex items-center justify-center">
                    <PiUserFill size={20} className="text-slate-400" />
                  </div>
                  <div className="flex flex-col flex-1 bg-white border border-slate-200 p-4 rounded-xl shadow-sm rounded-tl-none">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-sm font-['Inter']">Shubham Pattanayak</span>
                      <span className="text-xs text-slate-400 font-medium">01 Mar, 2024 12:32 PM</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-['Lato']">
                      Hello Support Team, I hope this message finds you well. I recently found out that my account has been banned and I believe this might be a mistake. Could you please provide me with the details?
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full border border-slate-200 bg-[#EBF3FF] flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">ST</span>
                  </div>
                  <div className="flex flex-col flex-1 bg-[#F9FAFB] border border-blue-100 p-4 rounded-xl shadow-sm rounded-tr-none">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-medium">02 Mar, 2024 10:12 AM</span>
                      <span className="font-bold text-slate-800 text-sm font-['Inter']">Support Team</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-['Lato']">
                      Hi Shubham, thank you for reaching out. We understand your concern. After reviewing your account, we found that it was banned due to violations of our community guidelines.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reply Box attached to bottom */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center gap-4 sticky bottom-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
            ME
          </div>
          <input
            type="text"
            placeholder="Reply here..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition"
          />
          <button className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
            <PiPaperPlaneRightFill size={20} />
          </button>
        </div>
      </div>

      {ticket && (
        <TicketActionModal
          isOpen={isModalOpen}
          actionType={modalAction}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTicketDetails();
          }}
          ticketData={ticket}
        />
      )}
      </div>
    </PageLoader>
  );
}
