import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          ShopHub
        </Link>

        <div className="navbar-right">
          {!loading &&
            (user ? (
              <>
                <Link to="/orders" className="nav-link">
                  Orders
                </Link>
                <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
                <button className="link-button" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Log in
                </Link>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </>
            ))}

          <Link to="/cart" className="cart-link">
            Cart
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}