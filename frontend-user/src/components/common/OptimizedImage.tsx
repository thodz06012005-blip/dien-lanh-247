import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/design-system';
import { getImageAsset, type ImageAssetKey } from '@/config/imageAssets';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'srcSet' | 'loading' | 'src' | 'alt'> {
  src?: string;
  alt?: string;
  priority?: boolean;
  widths?: number[];
  sizes?: string;
  fallbackClassName?: string;
  fallbackSrc?: string;
  assetKey?: ImageAssetKey;
}

function appendImageParams(src: string, width: number, format?: 'avif' | 'webp') {
  const separator = src.includes('?') ? '&' : '?';
  const fm = format ? `&fm=${format}` : '';
  return `${src}${separator}fit=crop&w=${width}&q=72${fm}`;
}

function buildSrcSet(src: string, widths: number[], format?: 'avif' | 'webp') {
  return widths.map((itemWidth) => `${appendImageParams(src, itemWidth, format)} ${itemWidth}w`).join(', ');
}

export default function OptimizedImage({
  src,
  alt,
  priority = false,
  widths = [320, 480, 768, 1024, 1440],
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px',
  className,
  fallbackClassName,
  fallbackSrc,
  assetKey,
  width,
  height,
  onError,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [hasFallbackError, setHasFallbackError] = useState(false);
  const asset = getImageAsset(assetKey);
  const requestedSource = src || asset?.src || asset?.fallbackSrc || '/images/placeholders/image-unavailable.svg';
  const resolvedAlt = alt || asset?.alt || 'Hình ảnh minh họa dịch vụ';
  const resolvedWidth = Number(width || asset?.width || 1200);
  const resolvedHeight = Number(height || asset?.height || 800);
  const resolvedFallback = fallbackSrc || asset?.fallbackSrc || '/images/placeholders/image-unavailable.svg';
  const isRemoteSource = /^https?:\/\//i.test(requestedSource);
  const source = priority && isRemoteSource && asset ? asset.src : requestedSource;
  const supportsRemoteResponsiveSource = /images\.unsplash\.com|images\.pexels\.com/.test(source);
  const resolvedSrc = supportsRemoteResponsiveSource ? appendImageParams(source, resolvedWidth, 'webp') : source;
  const localSrcSet = source === asset?.src ? asset?.srcSet : undefined;

  if (hasError && priority) {
    return (
      <div
        role="img"
        aria-label={resolvedAlt}
        data-image-key={assetKey}
        className={cn(
          'pointer-events-none bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950',
          fallbackClassName,
          className,
        )}
      />
    );
  }

  if (hasError && !hasFallbackError) {
    return (
      <img
        src={resolvedFallback}
        alt={resolvedAlt}
        width={resolvedWidth}
        height={resolvedHeight}
        loading="lazy"
        decoding="async"
        data-image-key={assetKey}
        className={cn('block max-w-full bg-slate-100 object-cover', fallbackClassName, className)}
        onError={() => setHasFallbackError(true)}
      />
    );
  }

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={resolvedAlt}
        data-image-key={assetKey}
        className={cn(
          'flex min-h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-6 text-center text-sm font-semibold text-slate-500',
          fallbackClassName,
          className,
        )}
      >
        Hình ảnh đang được cập nhật
      </div>
    );
  }

  const image = (
    <img
      src={resolvedSrc}
      srcSet={localSrcSet || (supportsRemoteResponsiveSource ? buildSrcSet(source, widths, 'webp') : undefined)}
      sizes={localSrcSet || supportsRemoteResponsiveSource ? sizes : undefined}
      alt={resolvedAlt}
      width={resolvedWidth}
      height={resolvedHeight}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      data-image-key={assetKey}
      className={cn('block max-w-full bg-slate-100', className)}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
      {...props}
    />
  );

  if (!supportsRemoteResponsiveSource) return image;
  return (
    <picture data-image-key={assetKey}>
      <source type="image/avif" srcSet={buildSrcSet(source, widths, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={buildSrcSet(source, widths, 'webp')} sizes={sizes} />
      {image}
    </picture>
  );
}
