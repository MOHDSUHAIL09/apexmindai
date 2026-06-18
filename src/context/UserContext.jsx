import { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../api/apiClient";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [userData, setUserData] = useState(null);
  const [stakeData, setStakeData] = useState(null);
  const [payoutData, setPayoutData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD FROM LOCALSTORAGE =================
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData);
        setUserData(parsed);
      } catch (e) {
        console.error("Error loading from localStorage:", e);
      }
    }
  }, []);

  // ================= Dashboard Fetch =================
  const fetchData = async () => {
    setLoading(true);
    
    try {
      let Regno = localStorage.getItem('regno');
      if (!Regno) {
        Regno = localStorage.getItem('Regno');
      }
      
      if (!Regno) {
        console.error("❌ No regno found in localStorage");
        setLoading(false);
        return null;
      }
      
      const response = await apiClient.get(`http://api.apexmindai.in/api/Dashboard/Dashboard/${Regno}`);     
      console.log("Dashboard Api:", response.data);
      
      if (response.data?.result === "true" && response.data?.response) {
        const apiData = response.data.response;
        
        
        const newUserData = {
          fname: apiData.fname,
          loginid: apiData.loginid || user?.loginid,
          MobileNo: apiData.mobile || user?.MobileNo,
          email: apiData.emailID || user?.email,
          kid: apiData.kid,
          Depositfund: apiData.TopupWallet || 0,
          Invest: apiData.InvestAmount || 0,
          WorkingWallet: apiData.WorkingWallet || 0,
          TotalIncome: apiData.TotalIncome || 0,
          withdrawal: apiData.withdrawal || 0,
          TeamCount: apiData.TeamCount || 0,
          ActiveTeam: apiData.ActiveTeam || 0,
          InactiveTeam: apiData.InactiveTeam || 0,
          DirectIncome: apiData.DirectIncome || 0,
          LevelIncome: apiData.LevelIncome || 0,
          miningRoi: apiData.miningRoi || 0,
          Reward: apiData.Reward || 0,
          AIBOTIncome: apiData.AIBOTIncome || 0,
          CompoundingIncome: apiData.CompoundingIncome || 0,
          SocialBonus: apiData.SocialBonus || 0,
          SelfTrade: apiData.SelfTrade || 0,
          Salary: apiData.Salary || 0,
          SponsorIncome: apiData.SponsorIncome || 0,
          inDirectIncome: apiData.inDirectIncome || 0,
          CompoundingFund: apiData.CompoundingFund || 0,
          Ranks: apiData.Ranks,
          firstTopupDate: apiData.firstTopupDate,
          capping: apiData.capping || 0,
          IdStatus: apiData.IdStatus,
          todayBusiness: apiData.todayBusiness || 0,
          status: apiData.status || 0,
          BonusBusiness: apiData.BonusBusiness || 0,
          Criteria: apiData.Criteria || 0,
          BonusStatus: apiData.BonusStatus,
          TourEndDate: apiData.TourEndDate,
          loginAttempt: apiData.loginAttempt || 0,
          OpenLevel: apiData.OpenLevel || 0,
          directId: apiData.directid || 0,
          regDate: apiData.regDate,
          totalbusiness: apiData.totalbusiness || 0,
          Green: apiData.Green,
          address: apiData.address,
          LockedPeriod: apiData.LockedPeriod || 0,
          introregno: apiData.introregno,
          topupdate: apiData.topupdate,
          AIBOTIncome_Today: apiData.AIBOTIncome_Today || 0,
          CompoundingIncome_Today: apiData.CompoundingIncome_Today || 0,
          LevelIncome_Today: apiData.LevelIncome_Today || 0,
          SocialBonus_Today: apiData.SocialBonus_Today || 0,
          SelfTrade_Today: apiData.SelfTrade_Today || 0,
          TodayIncome: apiData.TodayIncome || 0,
          introid: apiData.introid,
          strongLeg: apiData.strongLeg || 0,
          weakerLeg: apiData.weakerLeg || 0,
          leftCarry: apiData.leftCarry || 0,
          rightCarry: apiData.rightCarry || 0,
          LeftPerMonth: apiData.LeftPerMonth || 0,
          RightPerMonth: apiData.RightPerMonth || 0,
          LeftBusiness: apiData.LeftBusiness || 0,
          RightBusiness: apiData.RightBusiness || 0,
          IBIncome: apiData.IBIncome || 0,
          RoyaltyIncome: apiData.RoyaltyIncome || 0,
          GlobalRoyaltyIncome: apiData.GlobalRoyaltyIncome || 0,
          TradingPassiveIncome: apiData.TradingPassiveIncome || 0,
          CoinRate: apiData.CoinRate || 0,
          TotalAmountBuyToken: apiData.TotalAmountBuyToken || 0,
          TotalTokenInWallet: apiData.TotalTokenInWallet || 0,
          TokenStakeBonus: apiData.TokenStakeBonus,
          tokenBonusOnUpgrade: apiData.tokenBonusOnUpgrade,
          


        };
      
        setUserData(newUserData);
        localStorage.setItem("userData", JSON.stringify(newUserData));       
        return newUserData;
      } else {
        console.error("❌ Dashboard API error:", response.data);
        return null;
      }
    } catch (error) {
      console.error("❌ Dashboard Fetch Error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ================= RESTORE SESSION ON MOUNT =================
  useEffect(() => {
    const restoreSession = async () => {      
      const storedRegno = localStorage.getItem('regno') || localStorage.getItem('Regno');
      const storedUser = localStorage.getItem('user');
      
      if (storedRegno) {
        await fetchData();
      }
      
      if (storedUser && !user) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
    };
    
    restoreSession();
  }, []); // Runs once on component mount

  // ================= LOGIN =================
  const loginUser = (userData ) => {    
    let regnoValue = userData.regno || userData.Regno || userData.regNo;
    
    if (!regnoValue && userData.introregno) {
      regnoValue = userData.introregno;
    }
    
    if (regnoValue) {
      console.log("✅ Setting regno:", regnoValue);
      localStorage.setItem("regno", String(regnoValue));
      localStorage.setItem("Regno", String(regnoValue));
    } else {
      console.error("❌ No regno found in userData:", userData);
    } 
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("loginId", userData.loginid || userData.LoginID || userData.me);
    localStorage.setItem("isLoggedIn", "true");
    
    setUser(userData);
    
    setTimeout(() => {
      console.log("⏰ Fetching data after login...");
      fetchData();
    }, 100);
  };

  // ================= LOGOUT =================
  const logoutUser = () => {
    console.log("🚪 Logging out user");
    setUser(null);
    setUserData(null);
    setStakeData(null);
    setPayoutData(null);
    localStorage.removeItem("user");
    localStorage.removeItem("regno");
    localStorage.removeItem("Regno");
    localStorage.removeItem("userData");
    localStorage.removeItem("loginId");
    localStorage.removeItem("isLoggedIn");
  };

  // ================= REFRESH =================
  const refreshData = async () => {
    console.log("🔄 Manual refresh triggered");
    return await fetchData();
  };

  const refreshUserData = async () => {
    const savedData = localStorage.getItem("userData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setUserData(parsed);
      return parsed;
    }
    return userData;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        stakeData,
        payoutData,
        refreshData,
        refreshUserData,
        loginUser,
        logoutUser,
        loading
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('❌ useUser must be used within a UserProvider');
  }
  return context;
};