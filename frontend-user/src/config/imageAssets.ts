export interface ImageAssetDefinition {
  src: string;
  srcSet?: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio: `${number} / ${number}`;
  fallbackSrc: string;
  objectPosition?: string;
}

const fallbackSrc = '/images/placeholders/image-unavailable.svg';
const technicianHero = {
  src: '/images/service/hero-technician-1280.webp',
  srcSet: [
    '/images/service/hero-technician-768.webp 768w',
    '/images/service/hero-technician-1280.webp 1280w',
    '/images/service/hero-technician-1672.webp 1672w',
  ].join(', '),
  width: 1672,
  height: 941,
  aspectRatio: '16 / 9' as const,
  fallbackSrc,
};

export const imageAssets = {
  'home.hero': {
    ...technicianHero,
    alt: 'Kỹ thuật viên Điện Lạnh 247 kiểm tra điều hòa tại nhà',
    objectPosition: '68% center',
  },
  'about.team': {
    ...technicianHero,
    alt: 'Kỹ thuật viên thực hiện kiểm tra thiết bị theo quy trình',
    objectPosition: '70% center',
  },
  'service.card': {
    ...technicianHero,
    alt: 'Dịch vụ kiểm tra và sửa chữa thiết bị điện lạnh',
    objectPosition: '72% center',
  },
  'service.detail': {
    ...technicianHero,
    alt: 'Kỹ thuật viên chẩn đoán tình trạng thiết bị tại địa điểm phục vụ',
    objectPosition: '70% center',
  },
  'project.cover': {
    ...technicianHero,
    alt: 'Hồ sơ dự án dịch vụ điện lạnh đã thực hiện',
    objectPosition: '65% center',
  },
  'article.cover': {
    ...technicianHero,
    alt: 'Nội dung hướng dẫn sử dụng và bảo trì thiết bị điện lạnh',
    objectPosition: '68% center',
  },
  'contact.service-area': {
    ...technicianHero,
    alt: 'Khu vực tiếp nhận và điều phối dịch vụ Điện Lạnh 247',
    objectPosition: '55% center',
  },
} satisfies Record<string, ImageAssetDefinition>;

export type ImageAssetKey = keyof typeof imageAssets;

export function getImageAsset(key?: ImageAssetKey) {
  return key ? imageAssets[key] : undefined;
}
