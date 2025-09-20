import PropTypes from "prop-types";

const Header = ({ tagline }) => (
  <header className="top">
    <h1>Tienda</h1>
    <h3 className="tagline">
      <span>{tagline}</span>
    </h3>
  </header>
);

Header.propTypes = { tagline: PropTypes.string };

export default Header;


