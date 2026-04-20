import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import logoImg from "../assets/cboi_logo.png";
import loadingIcon from "../assets/loading_logo.png";
import { AiOutlineDashboard, AiOutlineQuestionCircle } from "react-icons/ai";
import { HiOutlineDocumentText } from "react-icons/hi";
import { RiQrCodeLine } from "react-icons/ri";
import { MdOutlineTranslate } from "react-icons/md";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: <AiOutlineDashboard /> },
  { path: "/transaction-reports", label: "Transaction Reports", icon: <HiOutlineDocumentText /> },
  { path: "/qr-details", label: "QR Details", icon: <RiQrCodeLine /> },
  { path: "/language-update", label: "Language Update", icon: <MdOutlineTranslate /> },
];

/* ── Hamburger / menu icon (matches the "side trigger" / "manifold" in Figma) ── */
function MenuIcon() {
  return (
    <svg
      width="14.29"
      height="12.57"
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 1 }}
    >
      <path
        d="M0 1H16M0 7H16M0 13H16"
        stroke="#000000"
        strokeWidth="1.71"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const [helpExpanded, setHelpExpanded] = useState(false);

  return (
    /*
      Sidebar root:
        width: 260/64 | height: 1078 (full viewport height)
        border-right: 1px solid #F0F0F0
        background: #FFFFFF
    */
    <aside
      style={{
        width: isOpen ? '260px' : '64px',
        minHeight: '1078px',
        height: '100%',
        flexShrink: 0,
        background: 'var(--Other-Color-A1, #FFFFFF)',
        borderRight: '1px solid var(--Secondary-3, #F0F0F0)',
        opacity: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 50,
        transition: 'width 0.3s ease',
      }}
    >

      {/*
        Menu + Logo wrapper:
          width: 260/64 | height: 1078
          padding-top: 4px | padding-bottom: 4px
      */}
      <div style={{ width: isOpen ? '260px' : '64px', flex: 1, paddingTop: '4px', paddingBottom: '4px', display: 'flex', flexDirection: 'column' }}>

        {/*
          Menu (nav area):
            width: 260/64 | height: 1070
        */}
        <div style={{ width: isOpen ? '260px' : '64px', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/*
            Logo frame:
              width: 260/64 | height: 56 | gap: 10px
          */}
          <div
            style={{
              width: isOpen ? '260px' : '64px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexShrink: 0,
              borderBottom: '1px solid var(--Secondary-3, #F0F0F0)',
            }}
          >
            {isOpen ? (
              /* Image: 219×56 */
              <img
                src={logoImg}
                alt="Central Bank of India"
                style={{ width: '219px', height: '56px', objectFit: 'contain' }}
              />
            ) : (
              <img
                src={loadingIcon}
                alt="CBOI"
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              />
            )}
          </div>

          {/*
            Divider / spacer after logo:
              width: 260/64 | height: 24
              padding-top: 12px | padding-bottom: 12px
              padding-left: 25px | padding-right: 25px
          */}
          <div
            style={{
              width: isOpen ? '260px' : '64px',
              height: '24px',
              paddingTop: '12px',
              paddingRight: '25px',
              paddingBottom: '12px',
              paddingLeft: '25px',
              flexShrink: 0,
            }}
          />

          {/* Navigation items */}
          <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                /*
                  Inline element (nav row):
                    width: 260/64 | height: 44 | gap: 8px (outer)
                    padding-left: 25px | padding-right: 25px
                    border-right: 2px solid #156DC4 (active only)
                */
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={!isOpen ? item.label : undefined}
                  style={({ isActive: navActive }) => ({
                    width: isOpen ? '260px' : '64px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: isOpen ? '25px' : '0px',
                    paddingRight: isOpen ? '25px' : '0px',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    gap: isOpen ? '10px' : '0px',
                    flexShrink: 0,
                    borderRight: navActive && isOpen ? '2px solid #156DC4' : '2px solid transparent',
                    background: navActive ? '#f2f6fc' : 'transparent',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                  })}
                >
                  {({ isActive: navActive }) => (
                    /*
                      Inner wrapper: width: 210/64 | height: 44
                    */
                    <div
                      style={{
                        width: isOpen ? '210px' : '64px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          color: navActive ? '#156DC4' : '#3e4c5e',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>

                      {isOpen && (
                        <span
                          style={{
                            fontFamily: "'Public Sans', sans-serif",
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '22px',
                            letterSpacing: '0%',
                            color: navActive ? '#156DC4' : '#3e4c5e',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}

            {/* ── Help & Support group ── */}
            <div style={{ width: isOpen ? '260px' : '64px', flexShrink: 0 }}>
              <button
                onClick={() => isOpen && setHelpExpanded(!helpExpanded)}
                title={!isOpen ? "Help & Support" : undefined}
                style={{
                  width: isOpen ? '260px' : '64px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: isOpen ? '25px' : '0px',
                  paddingRight: isOpen ? '25px' : '0px',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  gap: isOpen ? '10px' : '0px',
                  borderRight: helpExpanded && isOpen ? '2px solid #156DC4' : '2px solid transparent',
                  background: helpExpanded && isOpen ? '#f2f6fc' : 'transparent',
                  cursor: 'pointer',
                  border: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: isOpen ? '210px' : '64px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'space-between' : 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        color: helpExpanded && isOpen ? '#156DC4' : '#3e4c5e',
                        flexShrink: 0,
                      }}
                    >
                      <AiOutlineQuestionCircle />
                    </div>
                    {isOpen && (
                      <span
                        style={{
                          fontFamily: "'Public Sans', sans-serif",
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '22px',
                          color: helpExpanded && isOpen ? '#156DC4' : '#3e4c5e',
                        }}
                      >
                        Help &amp; Support
                      </span>
                    )}
                  </div>

                  {isOpen && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={helpExpanded ? '#156DC4' : '#8898aa'}
                      strokeWidth="1.5"
                      style={{
                        width: '14px',
                        height: '14px',
                        transition: 'transform 0.2s ease',
                        transform: helpExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        flexShrink: 0,
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Dropdown sub-items */}
              {helpExpanded && isOpen && (
                <div style={{ background: '#fafafa' }}>
                  <NavLink
                    to="/raise-ticket"
                    style={({ isActive }) => ({
                      width: '260px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '49px',
                      paddingRight: '25px',
                      gap: '10px',
                      borderRight: isActive ? '2px solid #156DC4' : '2px solid transparent',
                      background: isActive ? '#f2f6fc' : 'transparent',
                      textDecoration: 'none',
                      boxSizing: 'border-box',
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke={isActive ? '#156DC4' : '#54657a'} strokeWidth="2" style={{ width: '14px', height: '14px', flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 500, fontSize: '13.5px', lineHeight: '22px', color: isActive ? '#156DC4' : '#54657a' }}>
                          Raise Ticket
                        </span>
                      </>
                    )}
                  </NavLink>
                  <NavLink
                    to="/view-tickets"
                    style={({ isActive }) => ({
                      width: '260px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '49px',
                      paddingRight: '25px',
                      gap: '10px',
                      borderRight: isActive ? '2px solid #156DC4' : '2px solid transparent',
                      background: isActive ? '#f2f6fc' : 'transparent',
                      textDecoration: 'none',
                      boxSizing: 'border-box',
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke={isActive ? '#156DC4' : '#54657a'} strokeWidth="2" style={{ width: '14px', height: '14px', flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 500, fontSize: '13.5px', lineHeight: '22px', color: isActive ? '#156DC4' : '#54657a' }}>
                          View Tickets
                        </span>
                      </>
                    )}
                  </NavLink>
                </div>
              )}
            </div>
          </nav>

          {/* Side trigger / toggle button */}
          <button
            onClick={onToggle}
            style={{
              width: isOpen ? '260px' : '64px',
              height: '40px',
              paddingLeft: isOpen ? '16px' : '0px',
              paddingRight: isOpen ? '16px' : '0px',
              background: '#FFFFFF',
              boxShadow: '0px 1px 0px 0px #F0F0F0 inset',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: isOpen ? 'flex-start' : 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                width: isOpen ? '228px' : '16px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'flex-start' : 'center',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                }}
              >
                <MenuIcon />
              </div>
            </div>
          </button>

        </div>{/* /Menu */}
      </div>{/* /Menu+Logo wrapper */}
    </aside>
  );
}
