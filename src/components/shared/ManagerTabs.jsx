import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faList } from "@fortawesome/free-solid-svg-icons";

const ManagerTabs = ({ activeTab, onTabChange, createLabel = "Crear", listLabel = "Lista" }) => {
  return (
    <div className="manager-tabs">
      <button
        className={`manager-tab ${activeTab === "create" ? "active" : ""}`}
        onClick={() => onTabChange("create")}
        aria-pressed={activeTab === "create"}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>{createLabel}</span>
      </button>
      <button
        className={`manager-tab ${activeTab === "list" ? "active" : ""}`}
        onClick={() => onTabChange("list")}
        aria-pressed={activeTab === "list"}
      >
        <FontAwesomeIcon icon={faList} />
        <span>{listLabel}</span>
      </button>
    </div>
  );
};

ManagerTabs.propTypes = {
  activeTab: PropTypes.oneOf(["create", "list"]).isRequired,
  onTabChange: PropTypes.func.isRequired,
  createLabel: PropTypes.string,
  listLabel: PropTypes.string,
};

export default ManagerTabs;

