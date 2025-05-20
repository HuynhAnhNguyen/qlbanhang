import React, { useEffect } from 'react';

const Navbar = () => {
  useEffect(() => {
    const initializeSidebarToggle = () => {
      const sidebar = document.getElementsByClassName("js-sidebar")[0];
      const toggleButton = document.getElementsByClassName("js-sidebar-toggle")[0];
      
      if (sidebar && toggleButton) {
        toggleButton.addEventListener("click", () => {
          sidebar.classList.toggle("collapsed");
          
          sidebar.addEventListener("transitionend", () => {
            window.dispatchEvent(new Event("resize"));
          }, { once: true }); // Sử dụng { once: true } để tự động remove listener sau khi chạy
        });
      }
    };

    initializeSidebarToggle();
    
    // Cleanup function để remove event listener khi component unmount
    return () => {
      const toggleButton = document.getElementsByClassName("js-sidebar-toggle")[0];
      if (toggleButton) {
        toggleButton.replaceWith(toggleButton.cloneNode(true)); // Cách đơn giản để remove all event listeners
      }
    };
  }, []);

  return (
    <nav className="navbar navbar-expand navbar-light navbar-bg">
      <a className="sidebar-toggle js-sidebar-toggle" style={{cursor: 'pointer'}}>
        <i className="hamburger align-self-center"></i>
      </a>
      
      <div>
        <span className="header-title">
          HỆ THỐNG QUẢN LÝ MUA BÁN HÀNG SIÊU THỊ
        </span>
      </div>
      
      <div className="navbar-collapse collapse">
        <ul className="navbar-nav navbar-align">
          {/* <img 
            style={{height: "50px"}} 
            src="/assets/images/logo/codang.webp" 
            alt="CoDang" 
          /> */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;