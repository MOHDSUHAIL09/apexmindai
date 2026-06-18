import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const DepositFund = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        const fetchAddress = () => {
            try {
                console.log("🔍 Searching for wallet address in localStorage...");
                
                // ✅ Check userData se address
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const parsed = JSON.parse(userData);
                    const userAddress = parsed?.address || parsed?.Address || parsed?.walletAddress;
                    if (userAddress && userAddress !== 'null' && userAddress !== null && userAddress !== '') {
                        setWalletAddress(userAddress);
                        console.log("✅ Address found in userData:", userAddress);
                        setLoading(false);
                        return;
                    }
                }

                // ✅ Check user se address
                const user = localStorage.getItem('user');
                if (user) {
                    const parsed = JSON.parse(user);
                    const userAddress = parsed?.address || parsed?.Address || parsed?.walletAddress;
                    if (userAddress && userAddress !== 'null' && userAddress !== null && userAddress !== '') {
                        setWalletAddress(userAddress);
                        console.log("✅ Address found in user:", userAddress);
                        setLoading(false);
                        return;
                    }
                }

                // ✅ Direct localStorage check
                const address = localStorage.getItem('walletAddress') || 
                               localStorage.getItem('WalletAddress') ||
                               localStorage.getItem('address') ||
                               localStorage.getItem('Address');
                
                if (address && address !== 'null' && address !== null && address !== '') {
                    setWalletAddress(address);
                    console.log("✅ Address found in localStorage:", address);
                    setLoading(false);
                    return;
                }

                // ❌ Address not found
                console.warn("❌ No wallet address found in localStorage");
                setWalletAddress(null);
                setLoading(false);

            } catch (error) {
                console.error("❌ Error getting wallet address:", error);
                setWalletAddress(null);
                setLoading(false);
            }
        };

        fetchAddress();
    }, []);

    const handleCopy = async () => {
        if (!walletAddress) return;
        try {
            await navigator.clipboard.writeText(walletAddress);
            setCopySuccess('✅ Copied!');
            console.log("📋 Address copied:", walletAddress);
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (error) {
            console.error("❌ Copy failed:", error);
            const textArea = document.createElement('textarea');
            textArea.value = walletAddress;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess('✅ Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }
    };

    const handleShare = async () => {
        if (!walletAddress) return;
        const shareData = {
            title: 'Deposit Wallet Address',
            text: `Please send payment to this wallet address: ${walletAddress}`,
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                console.log("📤 Shared successfully");
            } else {
                await navigator.clipboard.writeText(`Wallet Address: ${walletAddress}`);
                alert('📋 Wallet address copied to clipboard!');
            }
        } catch (error) {
            console.error("❌ Share failed:", error);
            await navigator.clipboard.writeText(`Wallet Address: ${walletAddress}`);
            alert('📋 Wallet address copied to clipboard!');
        }
    };

    const truncateAddress = (address) => {
        if (!address) return '';
        if (address.length <= 20) return address;
        return `${address.slice(0, 10)}...${address.slice(-8)}`;
    };

    return (
        <div className="">
            <div className="modal-content">
                <div className="modal-header">
                    <h4>Deposit Fund</h4>
                    <Link to="/dashboard/DepositHistory">
                        <button type="button" className="btn btn-primary">History</button>
                    </Link>
                </div>

                <div className="modal-body">
                    {/* QR Code Section */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        height: '100%',
                        width: '100%',
                        padding: '20px 0',
                        minHeight: '250px'
                    }}>
                        {loading ? (
                            // ✅ Loading State
                            <>
                                <div className="spinner-border text-primary" role="status" style={{ width: '50px', height: '50px' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p style={{ marginTop: '15px', color: '#6c757d', fontSize: '14px' }}>
                                    ⏳ Fetching wallet address...
                                </p>
                                <p style={{ color: '#6c757d', fontSize: '12px' }}>
                                    Please wait while we load your wallet details
                                </p>
                            </>
                        ) : walletAddress ? (
                            // ✅ QR Code Show
                            <>
                                <QRCodeSVG
                                    value={walletAddress}
                                    size={200}
                                    bgColor={"#ffffff"}
                                    fgColor={"#000000"}
                                    level={"H"}
                                    includeMargin={true}
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '10px'
                                    }}
                                />
                                <p style={{
                                    marginTop: '10px',
                                    fontSize: '12px',
                                    color: '#6c757d'
                                }}>
                                    📱 Scan QR Code to pay
                                </p>
                            </>
                        ) : (
                            // ❌ No Address Found
                            <>
                                <div style={{
                                    fontSize: '50px',
                                    marginBottom: '10px'
                                }}>
                                    ❌
                                </div>
                                <p style={{
                                    color: '#dc3545',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Wallet Address Not Found
                                </p>
                                <p style={{
                                    color: '#6c757d',
                                    fontSize: '13px',
                                    textAlign: 'center',
                                    maxWidth: '300px'
                                }}>
                                    Please contact support to set up your wallet address
                                </p>
                                <button 
                                    className="btn btn-primary mt-2"
                                    onClick={() => {
                                        setLoading(true);
                                        setTimeout(() => {
                                            // Retry fetch
                                            const userData = localStorage.getItem('userData');
                                            if (userData) {
                                                const parsed = JSON.parse(userData);
                                                const addr = parsed?.address;
                                                if (addr && addr !== 'null') {
                                                    setWalletAddress(addr);
                                                    console.log("✅ Address found on retry:", addr);
                                                }
                                            }
                                            setLoading(false);
                                        }, 1000);
                                    }}
                                >
                                    🔄 Retry
                                </button>
                            </>
                        )}
                    </div>

                    {/* Wallet Address Section - Only show if address exists */}
                    {walletAddress && (
                        <>
                            <div
                                style={{
                                    background: "#f8f9fa",
                                    border: "1px solid #dee2e6",
                                    borderRadius: "10px",
                                    padding: "12px",
                                    marginTop: "10px",
                                    lineHeight: "1.8",
                                }}
                            >
                                <div
                                    style={{
                                        color: "#0d6efd",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        marginBottom: "8px",
                                        textAlign: "center",
                                    }}
                                >
                                    Scan QR Code or copy the wallet address below to make payment
                                </div>

                                <div className='text-center'>
                                    <span
                                        style={{
                                            fontWeight: "700",
                                            color: "#212529",
                                            marginRight: "8px",
                                            textAlign: "center",
                                        }}
                                    >
                                        Wallet Address:
                                    </span>

                                    <span
                                        style={{
                                            color: "#198754",
                                            fontFamily: "monospace",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            background: "#e8f5e9",
                                            padding: "4px 8px",
                                            borderRadius: "5px",
                                            wordBreak: "break-all",
                                            textAlign: "center",
                                            display: 'inline-block',
                                            maxWidth: '100%'
                                        }}
                                    >
                                        {truncateAddress(walletAddress)}
                                    </span>
                                </div>

                                <div className='text-center mt-1'>
                                    <small style={{ color: '#6c757d', fontSize: '10px' }}>
                                        Full: {walletAddress}
                                    </small>
                                </div>
                            </div>

                            {/* SHARE & COPY BUTTONS */}
                            <div className='d-flex gap-3 justify-content-center mt-3'>
                                <button
                                    className="btn btn-success px-4 py-2"
                                    onClick={handleShare}
                                    style={{
                                        fontWeight: '600',
                                        borderRadius: '8px'
                                    }}
                                >
                                    📤 Share
                                </button>
                                <button
                                    className="btn btn-primary px-4 py-2"
                                    onClick={handleCopy}
                                    style={{
                                        fontWeight: '600',
                                        borderRadius: '8px',
                                        position: 'relative'
                                    }}
                                >
                                    📋 {copySuccess || 'Copy'}
                                </button>
                            </div>

                            {copySuccess && (
                                <div className="text-center mt-2">
                                    <span style={{ color: '#28a745', fontSize: '14px', fontWeight: '600' }}>
                                        {copySuccess}
                                    </span>
                                </div>
                            )}
                        </>
                    )}

                    <span
                        style={{
                            display: "block",
                            marginTop: "10px",
                            fontSize: "12px",
                            fontWeight: "600",
                            textAlign: "center",
                            color: "red"
                        }}
                    >
                        Note: If your wallet balance is not updated immediately, please wait a few minutes and try again.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DepositFund;