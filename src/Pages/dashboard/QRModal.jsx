// QRModal.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MdInfo } from "react-icons/md";
import { useUser } from '../../context/UserContext'; // ✅ Import useUser

const QRModal = ({ isOpen, onClose }) => {
    const { userData } = useUser();
    const [referralLink, setReferralLink] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        if (isOpen && userData) {
            generateReferralLink();
        }
    }, [isOpen, userData]);

    const generateReferralLink = () => {
        try {
            // ✅ Get regno from localStorage
            const loginid =  userData?.loginid ;
            
            // ✅ Base URL
            const baseUrl = 'http://apexmindai.in';
            
            
            // ✅ Generate referral link with regno
            const link = `${baseUrl}/signup?ref=${loginid}`;
            
            console.log("🔗 Generated Referral Link:", link);
            console.log("📋 Referral Code:");
            
            setReferralLink(link);
        } catch (error) {
            console.error("❌ Error generating referral link:", error);
            // Fallback link
            setReferralLink('http://apexmindai.in/signup');
        }
    };

    const copyReferralLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopySuccess('✅ Copied!');
            console.log("📋 Referral link copied:", referralLink);
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (error) {
            console.error("❌ Copy failed:", error);
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = referralLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess('✅ Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }
    };

    const handleNativeShare = async () => {
        const shareData = {
            title: 'Join ApexMind AI',
            text: `Join ApexMind AI using my referral link and start earning! 🚀`,
            url: referralLink,
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                console.log("📤 Shared successfully");
            } else {
                await copyReferralLink();
                alert('📋 Referral link copied to clipboard!');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("❌ Share failed:", error);
                await copyReferralLink();
                alert('📋 Referral link copied to clipboard!');
            }
        }
    };

    if (!isOpen) return null;

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
                        {referralLink ? (
                            <QRCodeSVG
                                value={referralLink}
                                size={160}
                                bgColor={"#ffffff"}
                                fgColor={"#04832f"}
                                level={"H"}
                                includeMargin={true}
                            />
                        ) : (
                            <div style={{ 
                                width: "160px", 
                                height: "160px", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                backgroundColor: "#f0f0f0"
                            }}>
                                <p style={{ color: "#999", fontSize: "12px" }}>Loading...</p>
                            </div>
                        )}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "16px",
                        }}
                    >
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            style={{
                                flex: 1,
                                padding: "8px 12px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "6px",
                                fontSize: "11px",
                                backgroundColor: "#f8f9fa",
                                color: "#333",
                                wordBreak: "break-all"
                            }}
                        />
                    </div>

                    {/* Copy Success Message */}
                    {copySuccess && (
                        <div style={{ 
                            marginBottom: "10px",
                            color: "#28a745",
                            fontSize: "13px",
                            fontWeight: "600"
                        }}>
                            {copySuccess}
                        </div>
                    )}

                    {/* Share and Copy Link Buttons */}
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