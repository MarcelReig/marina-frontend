import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

import contactPagePicture from "../../images/auth/login.jpg";

const Contact = () => {
  return (
    <div className="content-page-wrapper">
      <div
        className="left-column"
        style={{
          background: "url(" + contactPagePicture + ") no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="right-column">
        <div className="contact-bullet-points">
          <div className="bullet-point-group">
            <div className="icon">
              <FontAwesomeIcon icon={faPhone} />
            </div>

            <div className="text">642-60-81-03</div>
          </div>

          <div className="bullet-point-group">
            <div className="icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>

            <div className="text">marinaibarragarcia@gmail.com</div>
          </div>

          <div className="bullet-point-group">
            <div className="icon">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <div className="text">Alaior, Menorca</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
