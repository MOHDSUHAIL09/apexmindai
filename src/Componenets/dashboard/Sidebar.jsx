import  { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt } from "react-icons/fa";
import { 
  IconHome, 
  IconLayoutBottombar, 
  IconDeviceImacDollar, 
  IconReplaceUser, 
  IconCreditCardRefund, 
  IconHistory, 
  IconUsersGroup, 
  IconBinaryTree2, 
  IconAward, 
  IconPower
} from '@tabler/icons-react';
import { RiHandCoinFill } from "react-icons/ri";
import { FaWallet } from "react-icons/fa";
import dashboardlogo from '../../assets/images/logo/dashboardlogo.png'
import { useUser } from '../../context/UserContext';

const Sidebar = ({ sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar }) => {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
   const { userData, refreshData } = useUser();

  const toggleMenu = (menu) => {
    if (!sidebarCollapsed || window.innerWidth <= 992) {
      setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    }
  };


  useEffect(() => {
    if (sidebarCollapsed && window.innerWidth > 992) {
      setOpenMenus({});
    }
  }, [sidebarCollapsed]);

  // Close sidebar when clicking on link in mobile
  const handleLinkClick = () => {
    if (window.innerWidth <= 992 && closeMobileSidebar) {
      closeMobileSidebar();
    }
  };

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('regno');
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      navigate('/')
  };

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className={`left-sidebar with-vertical ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
      <div>
        {/* Brand Logo */}
        <div className="brand-logo d-flex align-items-center justify-content-between">
          <Link to="/" className="text-nowrap logo-img" onClick={handleLinkClick}>
            <img 
              src={dashboardlogo}
              alt="Logo-Dark" 
              className="dark-logo"
              style={{width: "180px"}}
            />
          </Link>
          <button 
            className="mobile-close-btn d-lg-none"
            onClick={closeMobileSidebar}
          >
            <i className="ti ti-x"></i>
          </button>
        </div>

        <nav className="sidebar-nav scroll-sidebar" data-simplebar>
          <ul id="sidebarnav">
            {/* Dashboard Items */}
            <li className="sidebar-item mt-3">
              <Link 
                className={`sidebar-link ${isActive('./dashboard') ? 'active' : ''}`} 
                to="/dashboard" 
                onClick={handleLinkClick}
              >
                <span><IconHome stroke={2}/></span>               
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Home</span>}
              </Link>
            </li>
                        <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/InvestFund') ? 'active' : ''}`} 
                to="/dashboard/InvestFund" 
                onClick={handleLinkClick}
              >
                <span><IconDeviceImacDollar stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Invest</span>}
              </Link>
            </li>
                                                <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/InvestmentHistory') ? 'active' : ''}`} 
                to="/dashboard/InvestmentHistory"
                onClick={handleLinkClick}
              >
                <span><IconHistory stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Invest History</span>}
              </Link>
            </li>

                                    <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/Subscription') ? 'active' : ''}`} 
                to="/dashboard/DepositFund" 
                onClick={handleLinkClick}
              >
                <span style={{fontSize: "20px"}}><FaWallet stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Deposit Fund</span>}
              </Link>
            </li>
                         <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/DepositHistory') ? 'active' : ''}`} 
                to="/dashboard/DepositHistory"
                onClick={handleLinkClick}
              >
                <span><IconHistory stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Deposit History</span>}
              </Link>
            </li>

                        <li className="sidebar-item ms-1 ">
              <Link 
                className={`sidebar-link ${isActive('/InvestFund') ? 'active' : ''}`} 
                to="/dashboard/InvestToken" 
                onClick={handleLinkClick}
              >
                <span style={{fontSize: "20px"}}><RiHandCoinFill stroke={2}/></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Token Mining</span>}
              </Link>
            </li>
            
                        <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/Subscription') ? 'active' : ''}`} 
                to="/dashboard/BotTreading" 
                onClick={handleLinkClick}
              >
                <span><IconLayoutBottombar stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Bot Trading</span>}
              </Link>
            </li>
                                            <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/SelfTradingHistory') ? 'active' : ''}`} 
                to="/dashboard/BotTradingHistory"
                onClick={handleLinkClick}
              >
                <span><IconHistory stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Bot Trading History</span>}
              </Link>
            </li>
                                   {/* <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/SelfTrading') ? 'active' : ''}`} 
                to="/dashboard/SelfTrading" 
                onClick={handleLinkClick}
              >
                <span><IconLayoutBottombar stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Self Trading</span>}
              </Link>
            </li> */}
                                    {/* <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/SelfTradingHistory') ? 'active' : ''}`} 
                to="/dashboard/SelfTradingHistory"
                onClick={handleLinkClick}
              >
                <span><IconHistory stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Self Trading History</span>}
              </Link>
            </li> */}

            <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/Fundtransfer') ? 'active' : ''}`} 
                to="/dashboard/Fundtransfer" 
                onClick={handleLinkClick}
              >
                <span><IconReplaceUser stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Fund Transfer</span>}
              </Link>
            </li>




            <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('IncomePayout') ? 'active' : ''}`} 
                to="/dashboard/IncomePayout" 
                onClick={handleLinkClick}
              >
                <span><IconCreditCardRefund stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Income Payout</span>}
              </Link>
            </li>
                                    <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/IncomeReport') ? 'active' : ''}`} 
                to="/dashboard/IncomeReport" 
                onClick={handleLinkClick}
              >
                <span><IconAward stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Income Report</span>}
              </Link>
            </li>



            {/* <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/DepositToDeposit') ? 'active' : ''}`} 
                to="/dashboard/DepositToDeposit" 
                onClick={handleLinkClick}
              >
                <span><IconGitCompare stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Income To Deposit</span>}
              </Link>
            </li> */}

            {/* <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/deposit-history') ? 'active' : ''}`} 
                to="/dashboard/Deposit-History"
                onClick={handleLinkClick}
              >
                <span><IconHistory stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Deposit History</span>}
              </Link>
            </li> */}




            {/* Downline Team */}
            <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/downline-team') ? 'active' : ''}`} 
                to="/dashboard/downline-team" 
                onClick={handleLinkClick}
              >
                <span><IconUsersGroup stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Downline Team</span>}
              </Link>
            </li>

            {/* Tree View */}
            <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/tree-view') ? 'active' : ''}`} 
                to="/dashboard/tree-view" 
                onClick={handleLinkClick}
              >
                <span><IconBinaryTree2 stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Tree View</span>}
              </Link>
            </li>
                        <li className="sidebar-item ms-1 ">
              <Link 
                className={`sidebar-link ${isActive('/InvestFund') ? 'active' : ''}`} 
                to="/dashboard/SocalMediaTask" 
                onClick={handleLinkClick}
              >
                <span><FaExternalLinkAlt stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Socal Media Task</span>}
              </Link>
            </li>

            {/* Reward */}
            {/* <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/reward') ? 'active' : ''}`} 
                to="/dashboard/reward" 
                onClick={handleLinkClick}
              >
                <span><IconAward stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Reward</span>}
              </Link>
            </li> */}

            {/* Royalty Status */}
            {/* <li className="sidebar-item">
              <Link 
                className={`sidebar-link ${isActive('/royalty-status') ? 'active' : ''}`} 
                to="/dashboard/royalty" 
                onClick={handleLinkClick}
              >
                <span><IconDeviceComputerCamera stroke={2} /></span>
                {(!sidebarCollapsed || window.innerWidth <= 992) && <span className="hide-menu">Royalty Status</span>}
              </Link>
            </li> */}

            {/* Fixed Profile Section */}
            <div className={`fixed-profile ${(!sidebarCollapsed || window.innerWidth <= 992) ? '' : 'collapsed-profile'}`}>
              <div className="hstack gap-3">
                <div className="john-img">
                  <img 
                    src='https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/profile/user-1.jpg' 
                    className="rounded-circle" 
                    width="45px" 
                    height="45px" 
                    alt="profile" 
                  />
                </div>
                {(!sidebarCollapsed || window.innerWidth <= 992) && (
                  <>
                    <div className="john-title"> 
                      <h6 className="mb-0 text-dark amount-report">{userData?.fname}</h6>
                      <span className=""style={{fontSize: "18px"}}>{userData?.loginid}</span>
                    </div>
                    <div
                      className="border-0 bg-transparent text-primary ms-auto"
                      onClick={handleLogout}
                    >
                      <IconPower stroke={2} size={20} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;