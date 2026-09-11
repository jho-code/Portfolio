import './App.css'

const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'Data visualizations', href: '#visualizations' },
  { label: 'Writing', href: '#writing' },
  { label: 'About', href: '#about' },
]

function App() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Jennifer's Desk home">
          <span className="wordmark-mark" aria-hidden="true">
            /
          </span>
          <span>Jennifer's Desk</span>
        </a>

        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main-content">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <p className="eyebrow">Hello, I'm Jennifer.</p>
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title">
                A look inside how I think about
                <span className="accent-text"> data, policy, and the questions I care about.</span>
              </h1>
              <p className="hero-intro">
                I use this space to share projects, writing, and things I am
                learning.
              </p>
              <a className="text-link" href="#visualizations">
                See the work <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="hero-note">
              <span className="note-label">This site</span>
              <p>A working archive of charts, briefs, and notes.</p>
            </div>
          </div>
        </section>

        <section
          className="preview-section"
          id="visualizations"
          aria-labelledby="visualizations-title"
        >
          <div className="section-heading">
            <p className="eyebrow">01 / In progress</p>
            <h2 id="visualizations-title">Data visualizations</h2>
          </div>
          <div className="placeholder-card">
            <span className="placeholder-icon" aria-hidden="true">
              ◌
            </span>
            <p>Interactive data projects.</p>
          </div>
        </section>

        <section
          className="preview-section split-section"
          id="writing"
          aria-labelledby="writing-title"
        >
          <div className="section-heading">
            <p className="eyebrow">02 / In progress</p>
            <h2 id="writing-title">Writing</h2>
          </div>
          <p className="section-description">
            Policy briefs and analytical writing.
          </p>
        </section>

        <section
          className="preview-section split-section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="section-heading">
            <p className="eyebrow">03 / In progress</p>
            <h2 id="about-title">About</h2>
          </div>
          <p className="section-description">
            My background and the experiences that shaped my work.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <p>Jennifer's Desk</p>
        <a href="#home">Back to top ↑</a>
      </footer>
    </div>
  )
}

export default App
