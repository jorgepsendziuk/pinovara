import { useEffect, useState } from 'react';
import './ImageModal.css';

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

function ImageModal({ images, currentIndex, isOpen, onClose }: ImageModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setActiveIndex(index);
  };

  if (!isOpen) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="modal-image-container">
          <img
            src={images[activeIndex]}
            alt={`Imagem ${activeIndex + 1}`}
            className="modal-image"
          />
        </div>

        {images.length > 1 && (
          <>
            <button className="modal-nav modal-nav-prev" onClick={goToPrevious}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            <button className="modal-nav modal-nav-next" onClick={goToNext}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <div className="modal-indicators">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          </>
        )}

        <div className="modal-counter">
          {activeIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

export default ImageModal;
