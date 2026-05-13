import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Upload,
  Sparkles,
  CheckCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { useCampaign } from "../hooks/useCampaigns";
import { useCart } from "../CartContext";
import {
  useCustomDesignApparelTypes,
  useApparelBasePrices,
  useApparelPrintPrices,
} from "../hooks/useAppSettings";
import Header from "../components/Header";
import { formatPrice } from "../lib/utils";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

export default function CampaignPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(slug);
  const { data: apparelTypes = ["hoodie"] } = useCustomDesignApparelTypes();
  const { data: basePrices = { hoodie: 999, tshirt: 499 } } =
    useApparelBasePrices();
  const { data: printPrices = { single: 299, both: 598 } } =
    useApparelPrintPrices();
  const { addToCart } = useCart();

  // ── apparel / print state ──────────────────────────────────────────────────
  const [apparelType, setApparelType] = useState("hoodie");
  const [printLocation, setPrintLocation] = useState("front");
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customNotes, setCustomNotes] = useState("");
  const [selectedSize, setSelectedSize] = useState("M");

  // ── button states ──────────────────────────────────────────────────────────
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Sync default apparel type when settings arrive
  useEffect(() => {
    if (apparelTypes.length > 0 && !apparelTypes.includes(apparelType)) {
      setApparelType(apparelTypes[0]);
    }
  }, [apparelTypes, apparelType]);

  // ── derived campaign data ──────────────────────────────────────────────────
  const products = campaign?.campaign_products || [];
  const regularProducts = products.filter((p) => !p.is_custom_design_slot);
  const customDesignSlot = products.find((p) => p.is_custom_design_slot);
  const hasCustomDesign = !!customDesignSlot;

  const designIsReady =
    !hasCustomDesign ||
    (printLocation === "front" && !!frontPreview) ||
    (printLocation === "back" && !!backPreview) ||
    (printLocation === "both" && !!frontPreview && !!backPreview);

  // ── image upload (mirrors ProductPage exactly) ─────────────────────────────
  const handleImageUpload = async (file, side) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5 MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${side}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("custom-designs")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("custom-designs").getPublicUrl(fileName);

      if (side === "front") setFrontPreview(publicUrl);
      else setBackPreview(publicUrl);

      toast.success(`${side === "front" ? "Front" : "Back"} design uploaded!`);
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFrontUpload = (e) => {
    const f = e.target.files[0];
    if (f) handleImageUpload(f, "front");
  };
  const handleBackUpload = (e) => {
    const f = e.target.files[0];
    if (f) handleImageUpload(f, "back");
  };

  // ── validation helper ──────────────────────────────────────────────────────
  const validateDesign = () => {
    if (!hasCustomDesign) return true;
    if (printLocation === "front" && !frontPreview) {
      toast.error("Please upload the front design");
      return false;
    }
    if (printLocation === "back" && !backPreview) {
      toast.error("Please upload the back design");
      return false;
    }
    if (printLocation === "both" && (!frontPreview || !backPreview)) {
      toast.error("Please upload both front and back designs");
      return false;
    }
    return true;
  };

  // ── build the cart items for this campaign ─────────────────────────────────
  const buildCartItems = () => {
    const items = [];

    // 1. All regular campaign products
    regularProducts.forEach((cp) => {
      if (!cp.product) return;
      items.push({
        id: cp.product.id,
        name: cp.product.name,
        price: cp.product.discount_price || cp.product.price,
        discount_price: cp.product.discount_price || cp.product.price, // needed for guest cart
        size: selectedSize,
        images: cp.product.images || [],
        image: cp.product.images?.[0],
        qty: cp.min_quantity || 1,
        campaign_id: campaign.id,
        maxStock: cp.product.stock || 10,
      });
    });

    // 2. Custom design item (only if the campaign requires one)
    if (hasCustomDesign) {
      const slotProduct = customDesignSlot?.product;
      // Price is 0 — the combo_price already covers the full bundle value
      items.push({
        id: slotProduct?.id || `custom-${campaign.id}`,
        name: `${campaign.custom_design_label || "Custom Apparel"} (${apparelType === "hoodie" ? "Hoodie" : "T-Shirt"})`,
        price: 0,
        discount_price: 0,
        size: selectedSize,
        images: slotProduct?.images || [],
        image:
          frontPreview ||
          backPreview ||
          slotProduct?.images?.[0] ||
          "/images/hoodie-placeholder.png",
        qty: 1,
        campaign_id: campaign.id,
        is_custom_design: true,
        custom_design_front: frontPreview || null,
        custom_design_back: backPreview || null,
        apparel_type: apparelType,
        print_location: printLocation,
        custom_notes: customNotes || null,
        maxStock: slotProduct?.stock || 10,
      });
    }

    return items;
  };

  // ── Add to Cart ────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!validateDesign()) return;

    setIsAddingToCart(true);
    try {
      const items = buildCartItems();
      for (const item of items) {
        await addToCart(item, item.size, item.qty, null);
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
      toast.success(`${campaign.name} added to cart!`);
    } catch (err) {
      toast.error("Could not add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ── Buy Now ────────────────────────────────────────────────────────────────
  const handleBuyNow = async () => {
    if (!validateDesign()) return;

    setIsAddingToCart(true);
    try {
      const items = buildCartItems();
      for (const item of items) {
        await addToCart(item, item.size, item.qty, null);
      }
      navigate("/checkout");
    } catch (err) {
      toast.error("Something went wrong");
      setIsAddingToCart(false);
    }
  };

  // ── loading / not-found guards ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div style={{ padding: "100px 0", textAlign: "center" }}>
          Loading campaign…
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="page-wrapper">
        <Header />
        <div
          className="container"
          style={{ padding: "100px 0", textAlign: "center" }}
        >
          <h2>Campaign not found</h2>
          <Link
            to="/"
            className="theme-button"
            style={{ marginTop: "20px", display: "inline-flex" }}
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // ── derived display values ─────────────────────────────────────────────────
  const savings = campaign.original_total - campaign.combo_price;
  const discountPercentage = Math.round(
    (savings / campaign.original_total) * 100,
  );
  const endDate = new Date(campaign.ends_at);
  const daysRemaining = Math.ceil(
    (endDate - new Date()) / (1000 * 60 * 60 * 24),
  );
  const displayImage =
    campaign.image_url ||
    regularProducts[0]?.product?.images?.[0] ||
    "/images/hoodie-placeholder.png";

  const printCost =
    printLocation === "both"
      ? printPrices.both
      : printLocation === "front" || printLocation === "back"
        ? printPrices.single
        : 0;

  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="page-wrapper">
      <Header />
      <section className="campaign-detail-section">
        <div className="container">
          <Link
            to="/"
            className="back-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
              color: "#666",
            }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <div className="campaign-detail-grid">
            {/* ── Left: campaign image ── */}
            <div className="campaign-detail-image">
              <img src={displayImage} alt={campaign.name} />
            </div>

            {/* ── Right: details + custom design ── */}
            <div className="campaign-detail-info">
              {campaign.badge && (
                <span className="campaign-detail-badge">{campaign.badge}</span>
              )}

              <h1 className="campaign-detail-title">{campaign.name}</h1>
              <p className="campaign-detail-description">
                {campaign.description}
              </p>

              {/* What's Included */}
              <div className="campaign-detail-products">
                <h3>What's Included</h3>
                {regularProducts.map((cp) => (
                  <div key={cp.id} className="campaign-detail-product-item">
                    {cp.product?.images?.[0] ? (
                      <img src={cp.product.images[0]} alt={cp.product.name} />
                    ) : (
                      <div className="campaign-detail-product-placeholder">
                        <Package size={24} />
                      </div>
                    )}
                    <div className="campaign-detail-product-info">
                      <div className="name">{cp.product?.name}</div>
                      <div className="qty">
                        Quantity: {cp.min_quantity || 1}
                      </div>
                    </div>
                  </div>
                ))}

                {hasCustomDesign && (
                  <div className="campaign-detail-product-item custom-design">
                    {frontPreview || backPreview ? (
                      <img
                        src={frontPreview || backPreview}
                        alt="Custom Design"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="campaign-detail-product-placeholder custom">
                        <Sparkles size={24} />
                      </div>
                    )}
                    <div className="campaign-detail-product-info">
                      <div className="name">
                        {campaign.custom_design_label || "Custom Apparel"}
                      </div>
                      <div className="qty">
                        {designIsReady ? (
                          <span
                            style={{
                              color: "#22c55e",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <CheckCircle size={14} /> Design ready
                          </span>
                        ) : (
                          <span style={{ color: "#ef4444" }}>
                            Design required — upload below
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Custom Design Upload Panel ──────────────────────────────── */}
              {hasCustomDesign && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "24px",
                    marginBottom: "24px",
                    border: "2px dashed #1a1a1a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    <Sparkles size={22} color="#1a1a1a" />
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "17px",
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      Customise Your Apparel
                    </h3>
                  </div>

                  {/* Apparel type */}
                  <div style={{ marginBottom: "18px" }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "10px",
                        color: "#1a1a1a",
                      }}
                    >
                      Choose Apparel Type:
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {apparelTypes.map((type) => {
                        const p =
                          basePrices[type] || (type === "hoodie" ? 999 : 499);
                        return (
                          <button
                            key={type}
                            onClick={() => setApparelType(type)}
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              border:
                                apparelType === type
                                  ? "2px solid #1a1a1a"
                                  : "2px solid #d1d5db",
                              background:
                                apparelType === type ? "#f3f4f6" : "#fff",
                              borderRadius: "10px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                color:
                                  apparelType === type ? "#1a1a1a" : "#374151",
                              }}
                            >
                              {type === "hoodie" ? "Hoodie" : "T-Shirt"}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                marginTop: "3px",
                              }}
                            >
                              ₹{p}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Print location */}
                  <div style={{ marginBottom: "18px" }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "10px",
                        color: "#1a1a1a",
                      }}
                    >
                      Print Location{" "}
                      <span style={{ color: "#6b7280", fontWeight: 400 }}>
                        (+₹{printPrices.single}/side, +₹{printPrices.both} both)
                      </span>
                      :
                    </p>
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {[
                        { value: "front", label: "Front Only" },
                        { value: "back", label: "Back Only" },
                        { value: "both", label: "Front + Back" },
                      ].map((loc) => (
                        <button
                          key={loc.value}
                          onClick={() => setPrintLocation(loc.value)}
                          style={{
                            padding: "8px 14px",
                            border:
                              printLocation === loc.value
                                ? "2px solid #1a1a1a"
                                : "2px solid #d1d5db",
                            background:
                              printLocation === loc.value ? "#f3f4f6" : "#fff",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 500,
                            color:
                              printLocation === loc.value
                                ? "#1a1a1a"
                                : "#374151",
                            transition: "all 0.2s",
                          }}
                        >
                          {loc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Front upload */}
                  {(printLocation === "front" || printLocation === "both") && (
                    <div style={{ marginBottom: "14px" }}>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          marginBottom: "8px",
                          color: "#1a1a1a",
                        }}
                      >
                        Front Design:
                      </p>
                      <div
                        style={{
                          position: "relative",
                          border: frontPreview
                            ? "2px solid #22c55e"
                            : "2px dashed #9ca3af",
                          borderRadius: "12px",
                          padding: "16px",
                          textAlign: "center",
                          background: "#fafafa",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFrontUpload}
                          style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0,
                            cursor: "pointer",
                          }}
                          disabled={isUploading}
                        />
                        {frontPreview ? (
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <img
                              src={frontPreview}
                              alt="Front"
                              style={{
                                maxHeight: "140px",
                                borderRadius: "8px",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                width: "22px",
                                height: "22px",
                                background: "#22c55e",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CheckCircle size={13} color="#fff" />
                            </div>
                            {/* Re-upload hint */}
                            <p
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                marginTop: "6px",
                              }}
                            >
                              Click to change
                            </p>
                          </div>
                        ) : (
                          <>
                            {isUploading ? (
                              <p style={{ color: "#6b7280", fontSize: "13px" }}>
                                Uploading…
                              </p>
                            ) : (
                              <>
                                <Upload
                                  size={28}
                                  color="#9ca3af"
                                  style={{ marginBottom: "6px" }}
                                />
                                <p
                                  style={{ fontSize: "13px", color: "#6b7280" }}
                                >
                                  Click to upload front design
                                </p>
                                <p
                                  style={{ fontSize: "11px", color: "#9ca3af" }}
                                >
                                  PNG, JPG up to 5 MB
                                </p>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Back upload */}
                  {(printLocation === "back" || printLocation === "both") && (
                    <div style={{ marginBottom: "14px" }}>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          marginBottom: "8px",
                          color: "#1a1a1a",
                        }}
                      >
                        Back Design:
                      </p>
                      <div
                        style={{
                          position: "relative",
                          border: backPreview
                            ? "2px solid #22c55e"
                            : "2px dashed #9ca3af",
                          borderRadius: "12px",
                          padding: "16px",
                          textAlign: "center",
                          background: "#fafafa",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBackUpload}
                          style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0,
                            cursor: "pointer",
                          }}
                          disabled={isUploading}
                        />
                        {backPreview ? (
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <img
                              src={backPreview}
                              alt="Back"
                              style={{
                                maxHeight: "140px",
                                borderRadius: "8px",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                width: "22px",
                                height: "22px",
                                background: "#22c55e",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CheckCircle size={13} color="#fff" />
                            </div>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                marginTop: "6px",
                              }}
                            >
                              Click to change
                            </p>
                          </div>
                        ) : (
                          <>
                            {isUploading ? (
                              <p style={{ color: "#6b7280", fontSize: "13px" }}>
                                Uploading…
                              </p>
                            ) : (
                              <>
                                <Upload
                                  size={28}
                                  color="#9ca3af"
                                  style={{ marginBottom: "6px" }}
                                />
                                <p
                                  style={{ fontSize: "13px", color: "#6b7280" }}
                                >
                                  Click to upload back design
                                </p>
                                <p
                                  style={{ fontSize: "11px", color: "#9ca3af" }}
                                >
                                  PNG, JPG up to 5 MB
                                </p>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Design notes */}
                  <div style={{ marginTop: "16px" }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "8px",
                        color: "#1a1a1a",
                      }}
                    >
                      Design Instructions{" "}
                      <span style={{ fontWeight: 400, color: "#6b7280" }}>
                        (optional)
                      </span>
                      :
                    </p>
                    <textarea
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="e.g., 'Centre the logo, 2 inches from top'"
                      style={{
                        width: "100%",
                        minHeight: "72px",
                        padding: "10px 12px",
                        border: "2px solid #d1d5db",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        resize: "vertical",
                        transition: "border-color 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>

                  {/* Size selector */}
                  <div style={{ marginTop: "16px" }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "10px",
                        color: "#1a1a1a",
                      }}
                    >
                      Size:{" "}
                      <span style={{ fontWeight: 400 }}>{selectedSize}</span>
                    </p>
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          style={{
                            padding: "7px 14px",
                            border:
                              selectedSize === s
                                ? "2px solid #1a1a1a"
                                : "1px solid #d1d5db",
                            background: selectedSize === s ? "#1a1a1a" : "#fff",
                            color: selectedSize === s ? "#fff" : "#374151",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 500,
                            transition: "all 0.2s",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price summary */}
                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      marginTop: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <span style={{ color: "#6b7280" }}>
                        Base ({apparelType === "hoodie" ? "Hoodie" : "T-Shirt"}
                        ):
                      </span>
                      <span>
                        ₹
                        {basePrices[apparelType] ||
                          (apparelType === "hoodie" ? 999 : 499)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <span style={{ color: "#6b7280" }}>Print cost:</span>
                      <span>₹{printCost}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 600,
                        fontSize: "15px",
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "8px",
                      }}
                    >
                      <span>Custom Apparel:</span>
                      <span>
                        ₹
                        {(basePrices[apparelType] ||
                          (apparelType === "hoodie" ? 999 : 499)) + printCost}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        margin: "6px 0 0",
                        lineHeight: 1.4,
                      }}
                    >
                      * Custom apparel pricing is included in the combo deal
                      below.
                    </p>
                  </div>
                </div>
              )}

              {/* Combo Pricing */}
              <div className="campaign-detail-pricing">
                <div className="price-row">
                  <span>Original Total</span>
                  <span className="original">
                    {formatPrice(campaign.original_total)}
                  </span>
                </div>
                <div className="price-row">
                  <span>Combo Price</span>
                  <span className="combo">
                    {formatPrice(campaign.combo_price)}
                  </span>
                </div>
                <div className="price-row">
                  <span>You Save</span>
                  <span className="savings">
                    {formatPrice(savings)} ({discountPercentage}%)
                  </span>
                </div>
              </div>

              {daysRemaining > 0 && daysRemaining <= 7 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#f59e0b",
                    fontSize: "14px",
                    fontWeight: 500,
                    marginBottom: "16px",
                  }}
                >
                  <Clock size={16} />
                  Limited time: Ends in {daysRemaining} day
                  {daysRemaining !== 1 ? "s" : ""}
                </div>
              )}

              {/* ── Action Buttons ─────────────────────────────────────────── */}
              <div className="campaign-detail-actions">
                {/* Buy Now */}
                <button
                  className="campaign-detail-add-cart"
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || isUploading || !designIsReady}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity:
                      isAddingToCart || isUploading || !designIsReady ? 0.6 : 1,
                    cursor:
                      isAddingToCart || isUploading || !designIsReady
                        ? "not-allowed"
                        : "pointer",
                    background: "#1a1a1a",
                    color: "#fff",
                  }}
                >
                  <CreditCard size={18} />
                  {isUploading
                    ? "Uploading Design…"
                    : !designIsReady
                      ? "Upload Design to Continue"
                      : isAddingToCart
                        ? "Processing…"
                        : "Buy Now"}
                </button>

                {/* Add to Cart */}
                <button
                  className="campaign-detail-add-cart"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isUploading || !designIsReady}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity:
                      isAddingToCart || isUploading || !designIsReady ? 0.6 : 1,
                    cursor:
                      isAddingToCart || isUploading || !designIsReady
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addedToCart ? (
                    <CheckCircle size={18} />
                  ) : (
                    <ShoppingCart size={18} />
                  )}
                  {!designIsReady
                    ? "Upload Design to Continue"
                    : addedToCart
                      ? "Added to Cart ✓"
                      : isAddingToCart
                        ? "Adding…"
                        : "Add Combo to Cart"}
                </button>

                <Link to="/shop" className="theme-button secondary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Standalone Custom Design Upload Page (kept for legacy routes) ──────────
export function CustomDesignPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(slug);

  // Just redirect to the campaign page — design upload is now inline
  useEffect(() => {
    if (!isLoading && campaign) {
      navigate(`/campaign/${campaign.slug}`, { replace: true });
    }
  }, [isLoading, campaign, navigate]);

  return (
    <div className="page-wrapper">
      <Header />
      <div style={{ padding: "100px 0", textAlign: "center" }}>
        Redirecting to campaign…
      </div>
    </div>
  );
}
