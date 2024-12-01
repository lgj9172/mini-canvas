/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; // canvas 모듈을 외부 의존성으로 처리
    return config;
  },
};

module.exports = nextConfig;
