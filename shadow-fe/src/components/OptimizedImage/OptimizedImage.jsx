import React, { useState, useRef, useEffect } from "react";
import { Box, Image, Skeleton } from "@chakra-ui/react";

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  placeholder = null,
  fallback = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Generate optimized sources
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  const jpegSrc = src;

  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [lazy]);

  if (hasError && fallback) {
    return <Image src={fallback} alt={alt} {...props} />;
  }

  return (
    <Box ref={imgRef} position="relative" {...props}>
      {!isLoaded && placeholder && <Skeleton height={height} width={width} />}

      {(isLoaded || !lazy) && (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <Image
            src={jpegSrc}
            alt={alt}
            width={width}
            height={height}
            loading={lazy ? "lazy" : "eager"}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            transition="opacity 0.3s ease"
            opacity={isLoaded ? 1 : 0}
            {...props}
          />
        </picture>
      )}
    </Box>
  );
};

export default OptimizedImage;
