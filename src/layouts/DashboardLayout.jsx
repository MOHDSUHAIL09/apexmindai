import { useState } from 'react';
import Sidebar from '../Componenets/dashboard/Sidebar';
import Header from '../Componenets/dashboard/Header';
import Dashboard from '../Pages/dashboard/Dashboard';
import { Routes, Route, useLocation } from 'react-router-dom';
import UserProfile from '../Pages/dashboard/Profile/UserProfile';
import Console from '../Pages/dashboard/Consolepage/Console';
import Changepassword from '../Pages/dashboard/Profile/Changepassword';
import Support from '../Pages/dashboard/Profile/Support';
import Reward from '../Pages/dashboard/Reward'
import Treeview from '../Pages/dashboard/Treeview';
import DownlineTeam from '../Pages/dashboard/DownlineTeam';
import Royalty from '../Pages/dashboard/Royalty';
import InvestmentHistory from '../Pages/dashboard/InvestmentHistory';
import DepositHistory from '../Pages/dashboard/DepositHistory';
import Fundtransfer from '../Pages/dashboard/Fundtransfer';
import AccStatement from '../Pages/dashboard/AccStatement';
import IncomePayout from '../Pages/dashboard/IncomePayout';
import InvestFund from '../Pages/dashboard/InvestFund/InvestFund';
import AgreementForm from '../Pages/dashboard/InvestFund/AgreementForm';
import SocalMediaTask from '../Pages/dashboard/SocalMediaTask/SocalMediaTask';
import SocalMediaTaskHistory from '../Pages/dashboard/SocalMediaTask/SocalMediaTaskHistory';
import PayOutHistory from '../Pages/dashboard/PayOutHistory';
import '../assets/Main.css'
import FundtransferHistory from '../Pages/dashboard/FundtransferHistory';
import IncomeReport from '../Pages/dashboard/IncomeReport';
import BotTreading from '../Pages/dashboard/BotTreading';
import DepositFund from '../Pages/dashboard/DepositFund';
import SelfTradingHistory from '../Pages/dashboard/SelfTradingHistory';

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= 992) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const location = useLocation();

  // Pages jahan sidebar aur header nahi chahiye
  const noSidebarPages = ['/dashboard/console', '/dashboard/tree-view'];
  const hideSidebarAndHeader = noSidebarPages.includes(location.pathname);

  return (
    <div className={`app-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {!hideSidebarAndHeader && (
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          mobileSidebarOpen={mobileSidebarOpen}
          closeMobileSidebar={closeMobileSidebar}
        />
      )}
      <div className={`main-wrapper ${hideSidebarAndHeader ? 'full-screen-mode' : ''}`}>
        {!hideSidebarAndHeader && <Header toggleSidebar={toggleSidebar} />}
        <div className={`main-content ${hideSidebarAndHeader ? 'full-screen-content' : ''}`}>
          <Routes>
            <Route index element={<Dashboard />} />           
            <Route path="console" element={<Console />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="changepassword" element={<Changepassword />} />
            <Route path="support" element={<Support />} />
            <Route path="BotTreading" element={<BotTreading/>} />
            <Route path="SocalMediaTask" element={<SocalMediaTask/>} />
            <Route path="SocalMediaTaskHistory" element={<SocalMediaTaskHistory/>} />
            <Route path="InvestFund" element={<InvestFund/>} />
            <Route path="DepositFund" element={<DepositFund/>} />
            <Route path="IncomePayout" element={<IncomePayout/>} />
            <Route path="PayOutHistory" element={<PayOutHistory/>} />
            <Route path="Fundtransfer" element={<Fundtransfer />} />
            <Route path="FundtransferHistory" element={<FundtransferHistory/>} />
            <Route path="DashboardLayout" element={<DashboardLayout/>} />
            <Route path="IncomeReport" element={<IncomeReport/>} />
            <Route path="SelfTradingHistory" element={<SelfTradingHistory/>} />
            <Route path="AccStatement" element={<AccStatement/>} />
            <Route path="Deposit-History" element={<DepositHistory/>} />
            <Route path="InvestmentHistory" element={<InvestmentHistory />} />
            <Route path="downline-team" element={<DownlineTeam />} />
            <Route path="Royalty" element={<Royalty />} />
            <Route path="reward" element={<Reward />} />
            <Route path="tree-view" element={<Treeview />} />
            <Route path="AgreementForm" element={<AgreementForm />}/>
          </Routes>
        </div>
      </div>
      {mobileSidebarOpen && <div className="sidebar-overlay" onClick={closeMobileSidebar}></div>}
    </div>
  );
}

export default DashboardLayout;