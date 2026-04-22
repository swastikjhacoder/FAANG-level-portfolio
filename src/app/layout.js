import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://swastikjha.com"),

  title: {
    default: "Swastik Jha - The MERN Architect",
    template: "%s | Swastik Jha",
  },

  description:
    "Swastik Jha is a MERN Architect specializing in scalable, high-performance web applications using MERN, microservices, and cloud-native architectures.",

  keywords: [
    "MERN Architect",
    "Technical Architect",
    "Project Manager",
    "Engineering Manager",
    "Team Lead",
    "Lead Software Engineer",
    "Senior Full Stack Developer",
    "MongoDB",
    "Express.js",
    "React.js",
    "Node.js",
    "MERN Stack Developer",
    "Full Stack JavaScript",
    "Scalable Architecture",
    "Microservices Architecture",
    "System Design",
    "Cloud Architecture",
    "Distributed Systems",
    "AWS",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "DevOps Engineer",
    "Serverless Architecture",
    "REST API Development",
    "GraphQL",
    "API Security",
    "Authentication Systems",
    "JWT Authentication",
    "Next.js",
    "Frontend Architecture",
    "Responsive Design",
    "Performance Optimization",
    "NoSQL Databases",
    "Database Optimization",
    "AI Integration",
    "SaaS Development",
    "Agile Development",
    "Scrum",
    "Software Delivery",
    "Code Quality",
    "Technical Leadership",
  ],

  authors: [{ name: "Swastik Jha", url: "https://swastikjha.com" }],
  creator: "Swastik Jha",
  publisher: "Swastik Jha",

  alternates: {
    canonical: "https://swastikjha.com",
  },

  openGraph: {
    title: "Swastik Jha - MERN Architect",
    description:
      "Building scalable SaaS platforms, microservices, and cloud-native applications.",
    url: "https://swastikjha.com",
    siteName: "Swastik Jha Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Swastik Jha - MERN Architect",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Swastik Jha - MERN Architect",
    description:
      "Full Stack Engineer specializing in scalable architectures and SaaS systems.",
    images: ["/og-image.png"],
    creator: "@your_twitter_handle",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Swastik Jha",
              url: "https://swastikjha.com",
              image: "https://swastikjha.com/og-image.png",
              jobTitle: "MERN Architect",
              description:
                "Full Stack Engineer specializing in scalable architectures, microservices, and cloud-native systems.",
              sameAs: [
                "https://github.com/yourusername",
                "https://linkedin.com/in/yourprofile",
              ],
              knowsAbout: [
                "MongoDB",
                "Express.js",
                "React",
                "Node.js",
                "System Design",
                "Microservices",
                "AWS",
                "Docker",
                "Kubernetes",
              ],
            }),
          }}
        />
      </head>

      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
