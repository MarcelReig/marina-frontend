import Shimmer from "./Shimmer";
import SkeletonElement from "./SkeletonElement";

const SkeletonShop = () => {
  return (
    <div className="skeleton-wrapper">
      <div className="product-wrapper">
        <SkeletonElement type="thumbnail-small" />
      </div>
      <Shimmer />
    </div>
  );
};

export default SkeletonShop;
