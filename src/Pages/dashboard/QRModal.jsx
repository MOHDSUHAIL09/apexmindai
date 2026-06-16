// QRModal.jsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MdInfo } from "react-icons/md";

const QRModal = ({ isOpen, onClose, referralLink }) => {
    if (!isOpen) return null;


    
    const copyReferralLink = () => {
        navigator.clipboard.writeText(referralLink);
        alert("Referral link copied!");
    };

    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join',
                text: `Join using my referral`,
                url: referralLink,
            }).catch(() => console.log('Share cancelled'));
        } else {
            copyReferralLink();
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                zIndex: 1050,
                animation: "fadeIn 0.3s ease-out",
            }}
            onClick={onClose}
        >
            <style>
                {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-100px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          .modal-slide-down {
            animation: slideDown 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
          }
        `}
            </style>

            <div
                className="modal-slide-down"
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    maxWidth: "400px",
                    width: "90%",
                    padding: "20px",
                    position: "relative",
                    marginTop: "80px",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "#f3f4f6",
                        border: "none",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        fontSize: "16px",
                        cursor: "pointer",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e5e7eb";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#f3f4f6";
                    }}
                >
                    ✕
                </button>

                {/* Modal Content */}
                <div style={{ textAlign: "center" }}>
                    {/* Icon Circle */}
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "#f0fdf4",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "auto",
                            marginRight: "auto",
                            marginBottom: "12px",
                        }}
                    >
                      <MdInfo size={22} color="#04832f" />

                    </div>

                    <h3 style={{ marginBottom: "4px", color: "#2A3547", fontSize: "18px", fontWeight: "600" }}>
                        Invite Your Friends
                    </h3>
                    <p style={{ color: "#7C8FAC", marginBottom: "16px", fontSize: "12px" }}>
                        Share this QR code or link with your friends
                    </p>

                    {/* QR Code */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "16px",
                            padding: "12px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "12px",
                        }}
                    >
                        <QRCodeSVG
                            value={referralLink}
                            size={160}
                            bgColor={"#ffffff"}
                            fgColor={"#04832f"}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>

                    {/* Referral Link */}
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "20px",
                        }}
                    >
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            style={{
                                flex: 1,
                                padding: "8px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "6px",
                                fontSize: "11px",
                                backgroundColor: "#f8f9fa",
                                color: "#333",
                            }}
                        />
                    </div>

                    {/* Share and Copy Link Buttons - Flex */}
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            marginBottom: "16px",
                        }}
                    >
                        <button
                            onClick={handleNativeShare}
                            style={{
                                flex: 1,
                                backgroundColor: "#04832f",
                                color: "white",
                                border: "none",
                                padding: "10px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#036b26"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#04832f"}
                        >
                            Share
                        </button>

                        <button
                            onClick={copyReferralLink}
                            style={{
                                flex: 1,
                                backgroundColor: "#f3f4f6",
                                color: "#374151",
                                border: "none",
                                padding: "10px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                        >
                            Copy Link
                        </button>
                    </div>

                    {/* Instruction Text */}
                    <p style={{ fontSize: "10px", color: "#7C8FAC", margin: 0 }}>
                        Scan QR code or share link to invite friends
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRModal;