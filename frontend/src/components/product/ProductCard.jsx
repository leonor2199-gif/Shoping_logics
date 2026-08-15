import { Link } from "react-router-dom";

function formatMoney(value) {
  return (Number(value || 0) / 100).toFixed(2);
}

function ProductCard({ product }) {
  const {
    _id,
    name,
    description,
    image,
    basePrice,
    cashbackBonus,
    minVipLevel,
    stockQuantity,
    category,
  } = product;

  const isOutOfStock = stockQuantity <= 0;

  return (
    <article className="product-card">
      {/* Image */}

      <Link
        to={`/products/${_id}`}
        className="product-card__image"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
          />
        ) : (
          <div className="product-card__image-placeholder">
            🛍️
          </div>
        )}
      </Link>

      {/* Content */}

      <div className="product-card__content">
        <div className="product-card__badges">
          <span className="product-card__category">
            {category || "General"}
          </span>

          <span className="product-card__vip">
            VIP {minVipLevel}+
          </span>
        </div>

        <Link
          to={`/products/${_id}`}
          className="product-card__name"
        >
          {name}
        </Link>

        <p className="product-card__description">
          {description}
        </p>

        {/* Price */}

        <div className="product-card__pricing">
          <div>
            <span className="product-card__price-label">
              Price
            </span>

            <strong>
              {formatMoney(basePrice)}
            </strong>
          </div>

          {cashbackBonus > 0 && (
            <span className="product-card__cashback">
              +{formatMoney(cashbackBonus)} cashback
            </span>
          )}
        </div>

        {/* Stock */}

        <div className="product-card__footer">
          <span
            className={
              stockQuantity > 0
                ? "product-card__stock"
                : "product-card__stock product-card__stock--empty"
            }
          >
            {isOutOfStock
              ? "Out of stock"
              : `${stockQuantity} available`}
          </span>

          <Link
            to={`/products/${_id}`}
            className={`btn btn-primary product-card__button ${
              isOutOfStock
                ? "product-card__button--disabled"
                : ""
            }`}
          >
            {isOutOfStock
              ? "Unavailable"
              : "View Product"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;