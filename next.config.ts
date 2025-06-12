import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com', // For Google profile pictures
            },
            {
                protocol: 'https',
                hostname: 's.gravatar.com', // For Gravatar (some Auth0 profiles use this)
            },
            {
                protocol: 'https',
                hostname: '**.auth0.com', // If your Auth0 domain serves profile images
            },
        ],
    },
};

export default nextConfig;
