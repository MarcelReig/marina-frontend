import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReact } from "@fortawesome/free-brands-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

function Footer() {
  return (
    <footer className="footer">
      Made with <FontAwesomeIcon icon={faHeart} className="footer-icon" /> & React <FontAwesomeIcon icon={faReact} className="footer-icon"/>
    </footer>
  );
}

export default Footer;
