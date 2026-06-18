import  { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/index.css';


import logoApex from '../../assets/images/logo/logo-apex.png';
import logoFooter from '../../assets/images/logo/footer-logo.png';
// import logoMobile from '../../assets/images/logo/Apexmindai logo 170x50-5-05.png';
import playstoreImg from '../../assets/images/logo/playstore.png';
import appstoreImg from '../../assets/images/logo/appstore.webp';

// Hero Section Images
import heroImg from '../../assets/images/hero_img.png';
import ellipse1Img from '../../assets/images/ellipse-1.png';
import ellipse2Img from '../../assets/images/ellipse-2.png';
import rocketImg from '../../assets/images/rocket.png';
import globeImg from '../../assets/images/globe.png';
import bannerCoinImg from '../../assets/images/banner-coin.png';
import coin1Img from '../../assets/images/coin-1.png';

// Explore Section Icons
import spotTradingImg from '../../assets/images/spot-trading.png';
import marginTradeImg from '../../assets/images/margin-trade.png';
import derivativeImg from '../../assets/images/derivative.png';
import earnImg from '../../assets/images/earn.png';
// import buyImg from '../..brands';
import marginImg from '../../assets/images/margin.png';

// Try Section
import tryImg from '../../assets/images/try.png';

// FAQ Section
import faqImg from '../../assets/images/faq/faqimg-Photoroom.png';
import { FaArrowDown } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [cryptoData, setCryptoData] = useState([]);
  const [activeFaq, setActiveFaq] = useState(2);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    country: 0,
    investor: 0,
    coin: 0,
    volume: 0
  });

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    setTimeout(() => setLoading(false), 300);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch crypto data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
        );
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
    };
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animate stats
  useEffect(() => {
    const animateValue = (start, end, duration, setter) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setter(Math.floor(progress * (end - start) + start));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateValue(0, 20, 2000, (val) => setStats(prev => ({ ...prev, country: val })));
          animateValue(0, 6, 2000, (val) => setStats(prev => ({ ...prev, investor: val })));
          animateValue(0, 700, 2000, (val) => setStats(prev => ({ ...prev, coin: val })));
          animateValue(0, 1.36, 2000, (val) => setStats(prev => ({ ...prev, volume: val.toFixed(2) })));
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
    setMobileMenu(false);
  };

  const handleFaqToggle = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Explore items with imported images
  const exploreItems = [
    { title: "Price Prediction", icon: spotTradingImg, desc: "Predict the movement of crypto prices and earn rewards for accurate forecasts." },
    { title: "Real-Time Insights", icon: marginTradeImg, desc: "Get live market data and analytics to make informed trading decisions." },
    { title: "Apexmindai Trading", icon: derivativeImg, desc: "Our smart bot trades for you, offering automated and precise predictions for better results." },
    { title: "Risk-Free Trading", icon: earnImg, desc: "Trade without buying or selling crypto—just predict price movements and win." },
    // { title: "Secure & Fast", icon: buyImg, desc: "Experience fast and secure trading with advanced security features and instant transactions." },
    { title: "Instant Rewards", icon: marginImg, desc: "Borrow, trade, and repay. Leverage your assets with margin trading." }
  ];

  const highlights = [
    { icon: "infinity", title: "Accurate Predictions", desc: "Predict crypto price movements with precision and stay ahead in the market." },
    { icon: "shield-bolt", title: "Secure & Reliable", desc: "Trade with confidence using our rock-solid security and encrypted transactions." },
    { icon: "brand-speedtest", title: "Instant Results", desc: "Get real-time prediction outcomes in seconds and react to market changes fast!" },
    { icon: "droplet", title: "Smart Trading Bot", desc: "Let our AI-powered bot analyze the market and trade for you automatically." }
  ];

  const faqData = [
    { q: "1. What is the Apexmindai app?", a: "Apexmindai is a trading prediction platform where users can bet on crypto price movements and win rewards." },
    { q: "2. Does Apexmindai involve real trading?", a: "No, users do not buy or sell crypto assets. Instead, they predict whether the price will go up or down and earn rewards based on their predictions." },
    { q: "3. How does the trading bot work?", a: "Apexmindai's AI-powered trading bot analyzes market trends and makes automated trading decisions to increase your chances of winning." },
    { q: "4. Do I need to trade manually to use the bot?", a: "No, the bot is fully automated. You just need to set your preferences, and the bot will trade for you without any manual effort." }
  ];

  return (
    <>
      {/* Loader */}
      {loading && (
        <div className="duration-700 fixed inset-0 z-[60] grid place-content-center bg-accent5">
          <div className="loader">
            <img src={bannerCoinImg} alt="loader" />
          </div>
        </div>
      )}


      {/* Header */}
      <header className={`d-flex z-10 py-3 xxl:py-6 border-b border-neutral4/15 fixed top-0 left-0 right-0 w-full transition-all duration-300 ${scrolled ? 'bg-accent2' : ''}`}>
        <div className="container flex justify-between items-center header-main">
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            <img src={logoApex} className="max-sm:w-28" width="130" alt="Site logo icon" />
          </a>
          
          <ul className="hidden lg:flex gap-3 lg:gap-4 xxl:gap-8 xl:text-lg mx-auto">
            <li><a className="lg:text-lg py-2 inline-flex cursor-pointer" onClick={() => scrollToSection('home')}>Home</a></li>
            <li><a className="lg:text-lg py-2 inline-flex cursor-pointer" onClick={() => scrollToSection('explore')}>Explore</a></li>
            <li><a className="lg:text-lg py-2 inline-flex cursor-pointer" onClick={() => scrollToSection('market')}>Market</a></li>
            <li><a className="lg:text-lg py-2 inline-flex cursor-pointer" onClick={() => scrollToSection('start')}>Get Started</a></li>
            <li><a className="lg:text-lg py-2 inline-flex cursor-pointer" onClick={() => scrollToSection('faq')}>Faq</a></li>
          </ul>

<div className="flex gap-3">
  {/* Desktop View */}
  <div className="hidden lg:flex gap-3">
    <Link to="/login" >
    <div className="btn-primary color-d">
      Login
      </div>
    </Link>
    
    <Link to="/signup" className="btn-primary color-d">
      Register
    </Link>
  </div>
  
  {/* Download Button */}
  <a 
    className="btn-primary color-d " 
    href="ApexmindaiAI.apk" 
    download
  >
    <FaArrowDown/>
    <span className="hidden sm:inline">Download</span>
  </a>
  
  {/* Mobile Menu Button */}
  <button onClick={() => setMobileMenu(!mobileMenu)} className="text-2xl lg:hidden">
    <i className="ti ti-menu-2"></i>
  </button>
</div>
        </div>
        {/* Mobile Menu */}
      {/* Mobile Menu */}
<div className={`fixed h-screen overflow-y-auto bg-accent51 lg:hidden top-0 left-0 z-50 duration-300 p-4 w-[300px] ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
  <div className="flex justify-between items-center mb-6">
    <img src={logoApex} className="max-sm:w-28" width="130" alt="Site logo icon" />
    <button onClick={() => setMobileMenu(false)} className="text-xl">
      <i className="ti ti-x"></i>
    </button>
  </div>
  
  {/* Mobile Menu Buttons - Login & Register */}
<div className="flex gap-3 mb-6">
  <Link to="/login" className="btn-primary color-d flex-1 text-center py-2">
    Login
  </Link>
  <Link to="/signup" className="btn-primary color-d flex-1 text-center py-2" >
    Register
  </Link>
</div>
  
  {/* Divider */}
  <div className="border-t border-accent4 my-4"></div>
  
  {/* Mobile Navigation Links */}
  <ul className="flex flex-col gap-3 lg:gap-4">
    <li><a className="py-2 inline-flex cursor-pointer text-lg" onClick={() => scrollToSection('home')}>Home</a></li>
    <li><a className="py-2 inline-flex cursor-pointer text-lg" onClick={() => scrollToSection('explore')}>Explore</a></li>
    <li><a className="py-2 inline-flex cursor-pointer text-lg" onClick={() => scrollToSection('market')}>Market</a></li>
    <li><a className="py-2 inline-flex cursor-pointer text-lg" onClick={() => scrollToSection('start')}>Get Started</a></li>
    <li><a className="py-2 inline-flex cursor-pointer text-lg" onClick={() => scrollToSection('faq')}>Faq</a></li>
  </ul>
</div>
        {mobileMenu && <div onClick={() => setMobileMenu(false)} className="fixed bg-neutral1/10 z-20 w-full h-full inset-0 lg:hidden"></div>}
      </header>

      {/* Go to Top Button */}
      <div className="fixed bottom-5 right-5 xl:right-7 xl:bottom-7 z-30">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`size-12 ease-bounce duration-500 f-center rounded-full bg-primary shadow-xl text-2xl ${scrolled ? 'translate-y-0' : 'translate-y-[300px]'}`}>
          <i className="ti ti-arrow-up"></i>
        </button>
      </div>

      {/* Main Content */}
      <main className="mt-[82px] xxl:mt-[98px]">
        {/* Hero Section */}
        <section className="relative overflow-hidden" id="home">
          <img className="max-xxl:hidden absolute left-0 top-8" src={ellipse1Img} alt="" />
          <img className="max-xl:hidden absolute right-0 bottom-16" src={ellipse2Img} alt="" />
          <img className="max-xl:hidden rocket absolute left-10 bottom-8 z-[2]" src={rocketImg} alt="" />
          <img className="max-md:hidden absolute right-5 top-12 animate-slow-rotate" src={globeImg} alt="" />
          <img className="absolute absolute-coin left-[5%] bottom-[30%] animate-slow-rotate-reverse" src={bannerCoinImg} alt="" />
          <img className="absolute right-[12%] top-[40%] animate-slow-rotate" src={coin1Img} alt="" />
                  <div class="max-lg:hidden w-[250px] h-[204px] xxl:w-[404px] xxl:h-[404px] absolute bottom-[-15%] blur-[85px] left-[-12%] bg-[rgba(240,185,11,0.50)]"></div>
        <div class="max-lg:hidden w-[250px] xxl:w-[350px] h-[250px] xxl:h-[350px] absolute top-[6%] blur-[85px] left-[-12%] bg-primary/50"></div>
        <div class="max-lg:hidden w-[250px] xxl:w-[350px] h-[250px] xxl:h-[350px] absolute bottom-[6%] blur-[85px] right-[-8%] bg-accent1/50"></div>
          
          <div className="container pt-120 pb-120 grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 lg:col-span-6 relative z-[2] max-lg:flex max-lg:flex-col max-lg:items-center max-lg:text-center">
              <h2 className="display-4 mb-4 text-white">
                Powering Your Trades, Maximizing Your Profits! For
                <span className="text-primary display-4 underline">Apex</span>
                <span className="display-4 underline" style={{ color: "#ffbb55" }}>Mindai</span>
              </h2>
              <p className="mb-8 xl:mb-10 max-w-md lg:text-lg text-white">At Apexmindai, we empower traders with cutting-edge tools and insights, ensuring every trade is strategic and every profit is maximized.</p>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 relative max-lg:flex max-lg:justify-center">
              <img src={heroImg} className="relative z-[3]" alt="" />
              <div className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] absolute top-[6%] blur-[85px] left-0 bg-primary/50"></div>
            </div>

            {/* Stats Section */}
            <div className="stats-section col-span-12 gap-6 grid grid-cols-12 xl:divide-x divide-neutral4/60 pt-120 relative z-[2]">
              <div className="col-span-6 md:col-span-3">
                <h3 className="h3 mb-3 text-white">{stats.country}+</h3>
                <p className="text-neutral1/80 lg:text-lg t">Countries Covered</p>
              </div>
              <div className="col-span-6 md:col-span-3 xl:pl-8">
                <h3 className="h3 mb-3 text-white">{stats.investor} Million</h3>
                <p className="text-neutral1/80 lg:text-lg">Global Investors</p>
              </div>
              <div className="col-span-6 md:col-span-3 xl:pl-8">
                <h3 className="h3 mb-3 text-white">{stats.coin}+</h3>
                <p className="text-neutral1/80 lg:text-lg">Coins</p>
              </div>
              <div className="col-span-6 md:col-span-3 xl:pl-8">
                <h3 className="h3 mb-3 text-white">${stats.volume} Million</h3>
                <p className="text-neutral1/80 lg:text-lg">24h Trading Volume</p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Section */}
        <section className="bg-accent5 relative overflow-hidden" id="explore">
          <div className="container pb-120 pt-120 relative z-[2]">
            <div className="mb-10 xl:mb-[60px] flex flex-wrap justify-between items-center gap-5">
              <div className="max-w-lg">
                <h2 className="mb-2 text-white">Explore <span className="text-primary h2 underline">Apex</span><span style={{ color: "#ffbb55" }}>Mindai</span></h2>
                <p className="lg:text-lg text-neutral4">Coin Apexmindai is the easiest, safest, and fastest way to buy &amp; sell crypto asset exchange.</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 lg:gap-6 text-white">
              {exploreItems.map((item, index) => (
                <div key={index} className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-4 group">
                  <div className="bg-accent5 text-center group-hover:bg-accent6 duration-300 px-6 lg:px-10 py-5 lg:py-8 rounded-xl border border-accent4 flex flex-col items-center h-full">
                    <div className="size-20 rounded-full group-hover:bg-primary border border-primary flex justify-center items-center mb-6 xl:mb-8">
                      <img src={item.icon} alt={item.title} />
                    </div>
                    <h4 className="mb-3">{item.title}</h4>
                    <p className="text-neutral4 lg:text-lg">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Market Section */}
        <section className="bg-accent2" id="market">
          <div className="container pt-120 pb-120">
            <div className="flex justify-between flex-wrap items-center gap-4 mb-5 xl:mb-8">
              <div className="flex flex-wrap gap-4 xl:gap-6">
                <button className={`text-xl xl:text-2xl py-2.5 font-medium ${activeTab === 'all' ? 'border-b border-secondary text-neutral1' : 'text-neutral4/70'}`} onClick={() => setActiveTab('all')}>
                  All Cryptos
                </button>
              </div>
            </div>

            {activeTab === 'all' && (
              <div className="overflow-x-auto mb-10 xl:mb-[60px]">
                <table className="w-full whitespace-nowrap">
                  <thead>
                    <tr className="bg-accent6 text-start text-white">
                      <th className="px-6 py-4">Coin</th>
                      <th className="px-6 py-4">Price (USD)</th>
                      <th className="px-6 py-4">Rate Change (%)</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cryptoData.map((coin) => (
                      <tr key={coin.id} className="hover:bg-accent5 duration-300">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <img src={coin.image} alt={coin.name} width="32" />
                            <p className="text-neutral1 font-medium">
                              {coin.symbol.toUpperCase()}
                              <span className="text-xs text-neutral4/70 ms-2">{coin.name}</span>
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">${coin.current_price?.toFixed(2)}</td>
                        <td className={`px-6 py-4 ${coin.price_change_percentage_24h > 0 ? 'green' : 'red'}`}>
                          {coin.price_change_percentage_24h?.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <a href="#" className="text-xl"><i className="ti ti-file-search"></i></a>
                            <a href="#" className="text-xl"><i className="ti ti-trending-up"></i></a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* How To Get Started Section */}
        <section className="bg-accent5 relative overflow-x-hidden" id="start">
          <div className="container pt-120 pb-120">
            <h2 className="mb-10 xl:mb-[60px] text-center text-white">How To Get <span className="h2 text-primary underline">Started</span></h2>
            <div className="grid grid-cols-12 gap-4 xl:gap-6">
              <div className="col-span-12 md:col-span-6 xl:col-span-3 p-4 lg:p-6 rounded-xl bg-primary flex flex-col items-center">
                <div className="size-[60px] text-primary text-2xl f-center rounded-full bg-neutral1 mb-4 xl:mb-6">
                  <i className="ti ti-user-plus"></i>
                </div>
                <h4 className="mb-4 xl:mb-6">1. Download App</h4>
                <p className="mb-7 xl:mb-10 lg:text-lg text-center">Get the Apexmindai app on your device and start your trading journey with ease.</p>
                <a href="#" className="btn-white hover:outline-neutral1">Download Now</a>
              </div>
              <div className="col-span-12 md:col-span-6 xl:col-span-3 p-4 lg:p-6 rounded-xl flex flex-col items-center text-white">
                <div className="size-[60px] text-2xl f-center rounded-full bg-accent4 mb-4 xl:mb-6"><h5>02</h5></div>
                <h4 className="mb-4 xl:mb-6">2. Account Setup</h4>
                <p className="mb-7 xl:mb-10 text-neutral1/80 lg:text-lg text-center">Sign up, confirm your registration, and log in to start predicting market trends on Apexmindai.</p>
              </div>
              <div className="col-span-12 md:col-span-6 xl:col-span-3 p-4 lg:p-6 rounded-xl flex flex-col items-center text-white">
                <div className="size-[60px] text-2xl f-center rounded-full bg-accent4 mb-4 xl:mb-6"><h5>03</h5></div>
                <h4 className="mb-4 xl:mb-6">3. Start Predicting</h4>
                <p className="mb-7 xl:mb-10 text-neutral1/80 lg:text-lg text-center">After logging in, you can predict coin price movements and place your bets instantly on Apexmindai.</p>
              </div>
              <div className="col-span-12 md:col-span-6 xl:col-span-3 p-4 lg:p-6 rounded-xl flex flex-col items-center text-white">
                <div className="size-[60px] text-2xl f-center rounded-full bg-accent4 mb-4 xl:mb-6"><h5>04</h5></div>
                <h4 className="mb-4 xl:mb-6">4. Auto Trade</h4>
                <p className="mb-7 xl:mb-10 text-neutral1/80 lg:text-lg text-center">Use the smart trading bot on Apexmindai to automate your predictions and trade hands-free with advanced accuracy.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Try Bot Section */}
        <section className="bg-accent5 relative overflow-hidden">
          <div className="container pt-120 pb-120 grid grid-cols-12 gap-6 xl:gap-10 items-center relative z-[2]">
            <div className="col-span-12 lg:col-span-5">
              <img src={tryImg} alt="Try Bot" />
            </div>
            <div className="col-span-12 lg:col-span-7">
              <h2 className="mb-4 text-white">Try <span className="text-primary h2 underline">Apex</span><span style={{ color: "#ffbb55" }}>Mind</span> Now!</h2>
              <p className="lg:text-lg mb-8 xl:mb-10 text-white">Predict Crypto Price Movements & Place Your Bets Instantly!</p>
              <div className="rounded-3xl p-4 lg:p-6 xxl:p-8 bg-accent6 border border-accent4 flex gap-4 flex-wrap items-center justify-between">
                <div className="max-w-sm">
                  <h3 className="mb-3 text-white">Download Now</h3>
                  <p className="lg:text-lg text-neutral4">Join Apexmindai and Start Predicting Today!</p>
                </div>
                <div className="flex gap-3">
                  <a href="ApexmindaiAI.apk" download className="py-3 text-sm md:text-base xl:text-lg px-5 rounded-3xl bg-primary inline-flex items-center gap-3 text-white">
                    Download App <i className="ti ti-chevron-right"></i>
                  </a>
                  <a href="ApexmindaiAI.apk" download><img src={playstoreImg} alt="Play Store" className="h-12" /></a>
                  <a href="ApexmindaiAI.apk" download><img src={appstoreImg} alt="App Store" className="h-12" /></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* App Highlights Section */}
        <section className="bg-accent2 relative overflow-hidden">
          <div className="container pb-120 pt-120 relative z-[2] text-center">
            <h2 className="mb-10 xl:mb-[60px] text-white">App <span className="text-primary h2 underline">Highlights</span></h2>
            <div className="grid grid-cols-12 gap-6 text-white">
              {highlights.map((item, index) => (
                <div key={index} className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3">
                  <div className="group bg-accent5 text-center hover:bg-accent6 duration-300 p-5 xl:p-7 rounded-xl border border-accent4 flex flex-col items-center h-full">
                    <div className="size-20 rounded-full group-hover:bg-primary border border-primary flex justify-center items-center mb-6 xl:mb-8 text-4xl">
                      <i className={`ti ti-${item.icon}`}></i>
                    </div>
                    <h5 className="mb-3">{item.title}</h5>
                    <p className="text-neutral4/70 lg:text-lg">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-accent2 relative overflow-hidden text-white" id="faq">
          <div className="container">
            <div className="row">
              <div className="col-md-5">
                <div className="faq-img">
                  <img src={faqImg} alt="faq" />
                </div>
              </div>
              <div className="col-md-7 pb-120">
                <div className="col-span-12 lg:col-span-7 p-4 lg:p-6 xl:p-8 xxl:px-10 bg-accent5 border border-accent4 rounded-xl flex flex-col gap-4 xxl:gap-7">
                  {faqData.map((faq, index) => (
                    <div key={index} className={`p-4 rounded-xl border border-accent4 cursor-pointer ${activeFaq === index + 1 ? 'bg-accent6' : ''}`} onClick={() => handleFaqToggle(index + 1)}>
                      <div className="flex justify-between items-center">
                        <p className="text-sm lg:text-base xxl:text-xl font-medium">{faq.q}</p>
                        <span className={`size-8 md:size-10 cursor-pointer rounded-full f-center text-lg shrink-0 md:text-2xl duration-300 ${activeFaq === index + 1 ? 'bg-primary rotate-180' : 'bg-accent6'}`}>
                          <i className="ti ti-chevron-down"></i>
                        </span>
                      </div>
                      {activeFaq === index + 1 && (
                        <p className="text-sm lg:text-base xxl:text-lg pt-3">{faq.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-accent5 relative overflow-hidden footer text-white">
        <div className="new-pro-pad pt-120 relative z-[2] container grid grid-cols-12 xxl:grid-cols-10 gap-6 lg:divide-x divide-accent4">
          <div className="col-span-12 md:col-span-6 xl:col-span-6 xxl:col-span-4">
            <div className="text-center px-4 md:px-6 lg:px-10 xxl:px-16 new-footer">
              <img src={logoFooter} className="mb-2" width="130" alt="Footer Logo" />
              <p className="text-left lg:text-lg mb-8 xl:mb-10">Welcome to Apexmindai Your ultimate platform for crypto price predictions and automated trading. Predict, trade, and win with our AI-powered bot. Start your journey today!</p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 xl:col-span-3">
            <h3 className="mb-4 xl:mb-6">Quick Links</h3>
            <div className="grid grid-cols-2">
              <div className="col-span-1 flex flex-col gap-4">
                <a href="#" className="cursor-pointer" onClick={(e) => { e.preventDefault(); scrollToSection('explore'); }}>Explore</a>
                <a href="#" className="cursor-pointer" onClick={(e) => { e.preventDefault(); scrollToSection('market'); }}>Market</a>
                <a href="#" className="cursor-pointer" onClick={(e) => { e.preventDefault(); scrollToSection('start'); }}>Get Started</a>
                <a href="#" className="cursor-pointer" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>Faq</a>
              </div>
            </div>
          </div>
          <div className="col-span-12 xl:col-span-3">
            <div className="text-center pl-4 lg:pl-6 xxl:pl-10">
              <h3 className="mb-4 xl:mb-6">Follow Us</h3>
              <div className="mb-7 xl:mb-10 flex justify-center gap-4">
                <a className="social-link" href="#" aria-label="facebook link"><i className="ti ti-brand-facebook"></i></a>
                <a className="social-link" href="#" aria-label="twitch link"><i className="ti ti-brand-twitch"></i></a>
                <a className="social-link" href="#" aria-label="instagram link"><i className="ti ti-brand-instagram"></i></a>
                <a className="social-link" href="#" aria-label="discord link"><i className="ti ti-brand-discord"></i></a>
              </div>
              <p className="text-neutral4 lg:text-lg">empowers you to explore a wide range of popular cryptocurrencies</p>
            </div>
          </div>
        </div>
        <div className="py-5 xl:py-8 border-t border-accent4">
          <div className="container text-center flex justify-between gap-2 sm:gap-3 items-center relative z-[2]">
            <div className="footer-menu">
              <a href="./Privacy-Policy.html">Privacy Policy</a>
              <a href="./terms-conditions.html">Terms &amp; Conditions</a>
            </div>
          </div>
        </div>
      </footer>
 

      {/* CSS for green/red colors */}
      <style>{`
        .green { color: rgb(22, 239, 22); }
        .red { color: red; }
      `}</style>
    </>
  );
};

export default LandingPage;