/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/superadmin/dashboard',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
      {
        source: '/signout',
        destination: '/sign-in',
        permanent: true,
      },
      // Add any other static redirects
    ]
  }
}

module.exports = nextConfig;
