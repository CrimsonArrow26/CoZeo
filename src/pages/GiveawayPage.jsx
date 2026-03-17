import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';
import { supabase } from '../integrations/supabase/client';
import { Upload, Gift, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function GiveawayPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    instagram: '',
    twitter: '',
    agreed: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit to Google Form using pre-filled URL
  const submitToGoogleForm = async (data) => {
    // Replace these with your actual Google Form field IDs
    // To get these: Open your Google Form → 3 dots → Get pre-filled link
    // Fill in fields and submit to generate the URL with entry IDs
    const GOOGLE_FORM_ID = 'YOUR_GOOGLE_FORM_ID';
    const ENTRY_NAME = 'entry.XXXXXXXX'; // Replace with your form's name field ID
    const ENTRY_EMAIL = 'entry.XXXXXXXX'; // Replace with your form's email field ID
    const ENTRY_PHONE = 'entry.XXXXXXXX'; // Replace with your form's phone field ID
    const ENTRY_COLLEGE = 'entry.XXXXXXXX'; // Replace with your form's college field ID
    const ENTRY_INSTAGRAM = 'entry.XXXXXXXX'; // Replace with your form's instagram field ID
    const ENTRY_TWITTER = 'entry.XXXXXXXX'; // Replace with your form's twitter field ID

    const formUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;
    
    const formData = new FormData();
    formData.append(ENTRY_NAME, data.name);
    formData.append(ENTRY_EMAIL, data.email);
    if (data.phone) formData.append(ENTRY_PHONE, data.phone);
    if (data.college) formData.append(ENTRY_COLLEGE, data.college);
    if (data.instagram) formData.append(ENTRY_INSTAGRAM, data.instagram);
    if (data.twitter) formData.append(ENTRY_TWITTER, data.twitter);

    try {
      // Use fetch with no-cors to submit silently
      await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      });
    } catch (error) {
      // Silent fail - Google Form submission is best effort
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('giveaway-entries')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('giveaway-entries')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Check for duplicate email
      const { data: existing } = await supabase
        .from('giveaway_entries')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existing) {
        toast.error("You've already entered! Good luck 🤞");
        setIsSubmitting(false);
        return;
      }

      // Submit entry to Supabase
      const { error } = await supabase.from('giveaway_entries').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        college: formData.college || null,
        instagram: formData.instagram || null,
        twitter: formData.twitter || null,
        image_url: imageUrl,
      });

      if (error) throw error;

      // Submit to Google Form (using pre-filled URL)
      await submitToGoogleForm(formData);

      setIsSuccess(true);
      toast.success("You're in! 🎉 We'll announce the winner soon.");
    } catch (error) {
      toast.error('Failed to submit entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      {/* Hero Banner */}
      <div className="giveaway-hero">
        <div className="container">
          <div className="giveaway-hero-content">
            <span className="hero-text-badge">Limited Time Offer</span>
            <h1>Win Free CoZeo Drops</h1>
            <p>Enter our giveaway for a chance to win exclusive streetwear</p>
            <div className="prize-list">
              <div className="prize-item">
                <Gift size={24} />
                <span>T-Shirt</span>
              </div>
              <div className="prize-item">
                <Gift size={24} />
                <span>Hoodie</span>
              </div>
              <div className="prize-item">
                <Gift size={24} />
                <span>Cap</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Form */}
      <div className="section">
        <div className="container">
          {isSuccess ? (
            <div className="giveaway-success">
              <CheckCircle size={80} className="success-icon" />
              <h2>You're in! 🎉</h2>
              <p>We'll announce the winner soon. Good luck!</p>
              <Link to="/" className="primary-button">Continue Shopping</Link>
            </div>
          ) : (
            <div className="giveaway-form-card">
              <h2 className="animated-title">Enter the Giveaway</h2>
              <form onSubmit={handleSubmit} className="giveaway-form">
                <div className="form-row">
                  <div className="form-group text-box-anim">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={formData.name ? 'filled' : ''}
                    />
                  </div>
                  <div className="form-group text-box-anim text-box-anim-delay-1">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={formData.email ? 'filled' : ''}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group text-box-anim text-box-anim-delay-2">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formData.phone ? 'filled' : ''}
                    />
                  </div>
                  <div className="form-group text-box-anim text-box-anim-delay-2">
                    <label>College / University</label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      className={formData.college ? 'filled' : ''}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group text-box-anim text-box-anim-delay-3">
                    <label>Instagram Handle (@)</label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className={formData.instagram ? 'filled' : ''}
                    />
                  </div>
                  <div className="form-group text-box-anim text-box-anim-delay-3">
                    <label>Twitter / X Handle (@)</label>
                    <input
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className={formData.twitter ? 'filled' : ''}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="form-group text-box-anim text-box-anim-delay-4">
                  <label>Upload Your Photo *</label>
                  <div className="image-upload-zone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="giveaway-image"
                      required
                    />
                    <label htmlFor="giveaway-image" className="upload-label">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                      ) : (
                        <>
                          <Upload size={32} />
                          <span>Click to upload or drag and drop</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Terms */}
                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    name="agreed"
                    checked={formData.agreed}
                    onChange={handleInputChange}
                  />
                  <span>I agree to the terms and conditions *</span>
                </label>

                <button
                  type="submit"
                  className="primary-button submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit My Entry →'}
                </button>
              </form>

              {/* Rules */}
              <div className="giveaway-rules">
                <h3>Rules & Eligibility</h3>
                <ul>
                  <li>Must be 18+ years old to participate</li>
                  <li>One entry per person</li>
                  <li>Winner will be announced on our Instagram page</li>
                  <li>Prizes are non-transferable and cannot be exchanged for cash</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
