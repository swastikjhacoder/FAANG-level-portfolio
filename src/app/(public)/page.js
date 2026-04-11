export default function Home() {
  return (
    <main className="flex flex-col gap-32 px-4 md:px-10 py-24">
      {/* HERO */}
      <section
        id="about"
        className="min-h-[80vh] flex flex-col justify-center items-center text-center gap-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold gradient-text animate-gradient">
          MERN Architect & Full Stack Engineer
        </h1>

        <p className="max-w-2xl text-[var(--text-muted)]">
          I design and build scalable, high-performance web applications using
          modern architectures, microservices, and cloud-native technologies.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="#projects"
            className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold shadow-md hover:scale-105 transition"
          >
            View Projects
          </a>

          <a
            href="#contact"
            className="px-6 py-3 rounded-xl border border-[var(--glass-border)] hover:bg-white/10 transition"
          >
            Contact Me
          </a>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-6">Skills</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "React",
            "Node.js",
            "MongoDB",
            "Next.js",
            "AWS",
            "Docker",
            "Kubernetes",
            "TypeScript",
          ].map((skill) => (
            <div
              key={skill}
              className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-lg text-center"
            >
              {skill}
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-6">Experience</h2>

        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-lg">
            <h3 className="font-semibold">Senior Full Stack Developer</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Built scalable SaaS platforms and microservices architecture.
            </p>
          </div>
        </div>
      </section>

      {/* ACADEMIC */}
      <section id="academic" className="scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-6">Academic</h2>

        <div className="p-6 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-lg">
          <p>Bachelor’s in Computer Science</p>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-6">Projects</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((p) => (
            <div
              key={p}
              className="p-6 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-lg"
            >
              <h3 className="font-semibold">Project {p}</h3>
              <p className="text-sm text-[var(--text-muted)]">
                High-performance scalable application with modern stack.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-6">Services</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {["Web Development", "System Design", "Consulting"].map((service) => (
            <div
              key={service}
              className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-lg text-center"
            >
              {service}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="scroll-mt-24 mb-20">
        <h2 className="text-2xl font-semibold mb-6">Contact</h2>

        <div className="p-6 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-lg flex flex-col gap-4 max-w-xl">
          <input
            type="text"
            placeholder="Your Name"
            className="p-3 rounded-lg bg-transparent border border-[var(--glass-border)] outline-none"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="p-3 rounded-lg bg-transparent border border-[var(--glass-border)] outline-none"
          />
          <textarea
            placeholder="Your Message"
            rows="4"
            className="p-3 rounded-lg bg-transparent border border-[var(--glass-border)] outline-none"
          />

          <button className="px-4 py-2 rounded-xl gradient-bg text-white font-semibold hover:scale-105 transition">
            Send Message
          </button>
        </div>
      </section>
    </main>
  );
}
