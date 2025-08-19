/**
 * Smart image loading utilities for better performance
 */

/**
 * Preload critical images
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = (imageSources) => {
  return Promise.all(imageSources.map(preloadImage));
};

/**
 * Get optimized image format preference
 */
export const getOptimizedImageSrc = (baseSrc) => {
  // Check WebP support
  const supportsWebP = () => {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  };

  if (supportsWebP()) {
    return baseSrc.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  }
  return baseSrc;
};

/**
 * Lazy load image with intersection observer
 */
export const useLazyImage = (src, options = {}) => {
  const { threshold = 0.1, rootMargin = "50px" } = options;

  return {
    ref: (element) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.src = src;
            element.classList.add("loaded");
            observer.disconnect();
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
    },
  };
};

/**
 * Image compression utility (client-side)
 */
export const compressImage = (file, quality = 0.8, maxWidth = 1920) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, "image/jpeg", quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Critical images that should be preloaded immediately
 */
export const CRITICAL_IMAGES = [
  "/src/assets/shadowGolden.png", // Logo
];

/**
 * Preload critical images on app start
 */
export const preloadCriticalImages = () => {
  CRITICAL_IMAGES.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
};
