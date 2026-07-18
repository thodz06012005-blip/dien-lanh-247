import type { ImgHTMLAttributes } from 'react';
import OptimizedImage from './OptimizedImage';
import type { ImageAssetKey } from '@/config/imageAssets';

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'srcSet'> {
  fallbackSrc?: string;
  widths?: number[];
  sizes?: string;
  assetKey?: ImageAssetKey;
}

/**
 * @deprecated Dùng `OptimizedImage` cho code mới. Component này chỉ giữ tương thích
 * với các import cũ trong khi dự án chuyển dần sang thư viện ảnh canonical.
 */
export default function ImageWithFallback({
  src = '',
  alt = 'Hình ảnh minh họa dịch vụ',
  fallbackSrc = '/images/placeholders/image-unavailable.svg',
  widths = [240, 360, 480, 720],
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  loading = 'lazy',
  decoding = 'async',
  width = 440,
  height = 440,
  assetKey,
  ...props
}: ImageWithFallbackProps) {
  return (
    <OptimizedImage
      src={src || fallbackSrc}
      alt={alt}
      fallbackSrc={fallbackSrc}
      widths={widths}
      sizes={sizes}
      priority={loading === 'eager'}
      width={width}
      height={height}
      assetKey={assetKey}
      decoding={decoding}
      {...props}
    />
  );
}
