import React from 'react'

const DepositFund = () => {
  return (
       <div className="">
                    <div className="modal-content" >
                        <div className="modal-header">
                            <h4>Deposit Fund</h4>
                            <button style={{padding: "10px 20px", background: 'rgb(131, 148, 144)', borderRadius: "8px", color:"#fff"}}>history</button>
                        </div>


                        <div className="modal-body">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                width: '100%'
                            }}>
                                <img
                                    className=''
                                    src='https://i.pinimg.com/736x/25/49/9b/25499bcc4bff599bf0d2f00886f0b3cd.jpg'
                                    alt='deposit'
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto'
                                    }}
                                />
                            </div>
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
                                        }}
                                    >
                                         "0x1234567890abcdef1234567890abcdef12345678"
                                    </span>
                                </div>
                            </div>
                            {/* ✅ SHARE & COPY BUTTONS */}
                            <div className='d-flex gap-3 justify-content-center mt-3'>
                                <button
                                    className="btn btn-success px-4 py-2"

                                    style={{
                                        fontWeight: '600',
                                        borderRadius: '8px'
                                    }}
                                >
                                    📤 Share
                                </button>
                                <button
                                    className="btn btn-primary px-4 py-2"

                                    style={{
                                        fontWeight: '600',
                                        borderRadius: '8px'
                                    }}
                                >
                                    📋 Copy
                                </button>
                            </div>
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
  )
}

export default DepositFund