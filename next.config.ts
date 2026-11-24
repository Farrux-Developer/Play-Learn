import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/static/index.html' },
        { source: '/index.html', destination: '/static/index.html' },
        { source: '/tests.html', destination: '/static/tests.html' },
        { source: '/styles.css', destination: '/static/styles.css' },
        { source: '/app.js', destination: '/static/app.js' },
        { source: '/data.js', destination: '/static/data.js' },
        { source: '/css/:path*', destination: '/static/css/:path*' },
        { source: '/js/:path*', destination: '/static/js/:path*' },
        { source: '/data/:path*', destination: '/static/data/:path*' },
        { source: '/vendor/:path*', destination: '/static/vendor/:path*' },
      ],
    };
  },
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
