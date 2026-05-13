import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useCart } from "../CartContext";

export default function GoToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { cartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (cartOpen) return null;

  return (
    <button
      className={`go-to-top-btn ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Go to top"
      title="Go to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}
