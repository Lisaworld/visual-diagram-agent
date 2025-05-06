/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // 실험적 기능 활성화
  experimental: {
    // webpack 설정 오버라이드 허용
    webpackBuildWorker: true,
  },

  // 타입체크 임시 비활성화
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint 경고 무시
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { dev, isServer }) => {
    // webpack 설정
    config.resolve.fallback = { fs: false };

    if (dev) {
      // 개발 환경에서 소스맵 비활성화
      config.devtool = false;
      
      // HMR 최적화 설정
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
        emitOnErrors: true,
      };
    } else {
      // 프로덕션 환경 설정
      config.devtool = 'source-map';
      config.optimization = {
        ...config.optimization,
        minimize: true,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      };
    }

    return config;
  },

  // CSP 설정
  async headers() {
    // 프로덕션 환경의 CSP 설정
    const productionCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-src 'self'",
      "manifest-src 'self'",
      "media-src 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      "upgrade-insecure-requests",
    ].join('; ');

    // 개발 환경의 CSP 설정 - HMR 허용
    const developmentCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: http: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss: http: https:",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-src 'self' http: https:",
      "manifest-src 'self'",
      "media-src 'self' data: blob:",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' ? developmentCSP : productionCSP
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 