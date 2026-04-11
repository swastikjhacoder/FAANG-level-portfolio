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
  title: "Swastik Jha - The MERN Architect",
  description:
    "Swastik Jha is a MERN Architect specializing in designing and building scalable, high-performance web applications using MongoDB, Express.js, React, and Node.js. Experienced in cloud-native architectures, microservices, and modern DevOps practices, delivering robust SaaS and AI-driven systems with a focus on performance, security, and maintainability.",

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

  alternates: {
    canonical: "https://swastikjha.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
