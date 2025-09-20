import { Outlet } from "react-router-dom";
import Navbar from "../navigation/Navbar";
import Footer from "../footer/Footer";

const LayoutPublic = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default LayoutPublic;
