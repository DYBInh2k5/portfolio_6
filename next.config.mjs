
const isGitHubPages = process.env.DEPLOY_TARGET === "gh-pages";
const basePath = isGitHubPages ? "/geeky-nextjs" : "";

const nextConfig = {
  basePath,
  assetPrefix: isGitHubPages ? basePath : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
