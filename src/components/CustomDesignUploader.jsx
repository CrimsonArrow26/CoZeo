import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export default function CustomDesignUploader({ 
  onUploadComplete, 
  label = 'Upload Your Custom Design',
  existingImage = null,
  onClear 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(existingImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('custom-designs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('custom-designs')
        .getPublicUrl(fileName);

      onUploadComplete?.({
        url: publicUrl,
        path: fileName,
        name: file.name,
        size: file.size,
        type: file.type
      });

      toast.success('Design uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload design: ' + error.message);
      setPreviewUrl(existingImage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (previewUrl) {
    return (
      <div className="custom-design-preview">
        <div className="preview-image-container">
          <img 
            src={previewUrl} 
            alt="Custom design preview" 
            className="preview-image"
          />
          <button 
            type="button"
            className="clear-preview-btn"
            onClick={handleClear}
            title="Remove design"
          >
            <X size={16} />
          </button>
        </div>
        <span className="preview-label">{label}</span>
      </div>
    );
  }

  return (
    <div className="custom-design-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden-input"
        disabled={isUploading}
      />
      
      <button
        type="button"
        className="uploader-button"
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload size={20} />
            <span>{label}</span>
          </>
        )}
      </button>
      
      <p className="uploader-hint">
        <ImageIcon size={12} />
        Max 5MB, JPG/PNG/WEBP
      </p>
    </div>
  );
}
