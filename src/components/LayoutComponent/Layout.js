import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ Component }) => {
  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main">
        <Header />
        <main className="content">
          <Component />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
