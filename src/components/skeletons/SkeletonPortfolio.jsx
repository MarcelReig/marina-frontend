import Shimmer from "./Shimmer";
import SkeletonElement from "./SkeletonElement";

const SkeletonPortfolio = () => {
  return (
    <div className="skeleton-wrapper">
      <SkeletonElement type="thumbnail" />
      <SkeletonElement type="title" />
      <Shimmer />
    </div>
  );
};

export default SkeletonPortfolio;
