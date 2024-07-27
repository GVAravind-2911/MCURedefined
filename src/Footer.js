import React from 'react';
import ReactDOM from 'react-dom/client';

function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-separator" />
      <div className="footercontainer">
        <div className="bottomlogo">
          <img src="../static/img/FooterLogo.png" className="footerlogo" alt="Footer Logo" />
        </div>
        <div className="iop">
          <span className="text31" style={{ color: '#EC1D24' }}>Contact Us</span>
          <span className="text32">
            <a href="mailto:mcuredefined@gmail.com">mcuredefined@gmail.com</a>
          </span>
        </div>
        <div className="home-socials1">
          <span className="text33" style={{ color: '#EC1D24' }}>Follow Us</span>
          <div className="footersocials">
            <a href="https://twitter.com/Mcu_Redefined" target="_blank" rel="noreferrer noopener">
              <img alt="Twitter Icon" src="../static/img/Icons/twitter.svg" className="imagetwitter" />
            </a>
            <a href="https://discord.com/invite/KwG9WBup" target="_blank" rel="noreferrer noopener">
              <img alt="Discord Icon" src="../static/img/Icons/discord.svg" className="imagediscord" />
            </a>
            <a href="https://www.instagram.com/mcu_redefined/" target="_blank" rel="noreferrer noopener">
              <img alt="Instagram Icon" src="../static/img/Icons/instagram.svg" className="imageinsta" />
            </a>
          </div>
        </div>
      </div>
      <div className="home-separator" />
      <div className="tagline">
        <p>Unleashing Marvel Magic, One Fan at a Time!</p>
      </div>
    </footer>
  );
}

const domContainer = document.querySelector('#main-home-footer-container');
const root = ReactDOM.createRoot(domContainer);
root.render(<Footer />);