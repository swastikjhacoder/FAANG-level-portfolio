import React from "react";

const Section = ({ id, title, children }) => {
  return (
    <section
      id={id}
      className="min-h-screen px-6 py-20 border-b border-(--glass-border)"
    >
      <h2 className="text-3xl font-bold mb-6 gradient-text">{title}</h2>
      {children}
    </section>
  );
};

const Home = () => {
  return (
    <main className="pt-20">
      <Section id="about" title="About Me">
        <p>Introduce yourself here...</p>
      </Section>

      <Section id="skills" title="Skills">
        <p>Your technical skills...</p>
      </Section>

      <Section id="experience" title="Experience">
        <p>Your work experience...</p>
      </Section>

      <Section id="academic" title="Academic">
        <p>Your education details...</p>
      </Section>

      <Section id="projects" title="Projects">
        <p>Your projects...</p>
      </Section>

      <Section id="services" title="Services">
        <p>What you offer...</p>
      </Section>

      <Section id="contact" title="Contact">
        <p>Contact details...</p>
      </Section>
    </main>
  );
};

export default Home;
