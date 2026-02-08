import {
  GraduationCap,
  MessageSquare,
  FileText,
  Search,
  Clock,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Brain,
  BookOpen,
  Zap,
  Quote,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook for scroll-triggered animations         */
/* ------------------------------------------------------------------ */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */
function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'instructor') navigate('/profile', { replace: true });
      else navigate('/home', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto" />
          <p className="mt-4 text-gray-500 tracking-wide text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] w-full overflow-x-hidden selection:bg-maroon/20 selection:text-maroon-dark">
      {/* ---- NAV ---- */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/60'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-lg transition-all ${
              scrolled
                ? 'bg-gradient-to-br from-maroon to-maroon-dark shadow-maroon/20'
                : 'bg-white/15 backdrop-blur-sm shadow-white/10'
            }`}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>HokieLearn</span>
              <span className={`text-lg font-bold tracking-tight ml-0.5 transition-colors ${scrolled ? 'text-maroon' : 'text-orange'}`}>AI</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-maroon' : 'text-white/80 hover:text-white'}`}>Features</a>
            <a href="#about" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-maroon' : 'text-white/80 hover:text-white'}`}>About</a>
            <a href="#testimonials" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-maroon' : 'text-white/80 hover:text-white'}`}>Testimonials</a>
            <Link
              to="/login"
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.97] ${
                scrolled
                  ? 'bg-maroon text-white hover:bg-maroon-dark hover:shadow-lg hover:shadow-maroon/25'
                  : 'bg-white text-maroon hover:bg-orange hover:text-white hover:shadow-lg hover:shadow-orange/25'
              }`}
            >
              Sign In
            </Link>
          </div>

          <button
            className={`md:hidden p-1 transition-colors ${scrolled ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 pb-5 pt-3 space-y-3 animate-fade-in">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-maroon py-2">Features</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-maroon py-2">About</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-maroon py-2">Testimonials</a>
            <Link to="/login" className="block w-full text-center px-5 py-3 bg-maroon text-white rounded-lg text-sm font-semibold">
              Sign In
            </Link>
          </div>
        )}
      </nav>

      {/* ---- HERO ---- */}
      <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 px-6 lg:px-10 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Diagonal cut */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-maroon via-maroon-dark to-[#3a0a1e]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 72%, 0 92%)' }}
          />
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          {/* Geometric accents */}
          <div className="absolute top-16 right-[8%] w-72 h-72 rounded-full bg-orange/10 blur-3xl animate-float" />
          <div className="absolute bottom-0 left-[15%] w-96 h-96 rounded-full bg-maroon-light/10 blur-3xl" />
          {/* Grid pattern on right */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-7xl mx-auto relative flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
          {/* Left column — text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="opacity-0 animate-rise inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-orange" />
              <span className="text-xs font-semibold tracking-widest uppercase">CISL Lab - Virginia Tech</span>
            </div>

            <h1 className="opacity-0 animate-rise-d1 font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] mb-6">
              Your Personal AI{' '}
              <span className="relative">
                Teaching
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-orange/60" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0 8 Q50 0 100 6 T200 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
              {' '}Assistant
            </h1>

            <p className="opacity-0 animate-rise-d2 text-base md:text-lg text-white/75 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              HokieLearn AI helps students instantly understand lectures, ask questions,
              and get AI-powered clarifications, built exclusively for Virginia Tech.
            </p>

            <div className="opacity-0 animate-rise-d3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                to="/login"
                className="group px-7 py-3.5 bg-white text-maroon rounded-xl font-semibold text-sm hover:bg-orange hover:text-white transition-all hover:shadow-xl hover:shadow-orange/30 hover:-translate-y-0.5 flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-7 py-3.5 text-white/80 border border-white/20 rounded-xl font-semibold text-sm hover:bg-white/10 hover:text-white transition-all"
              >
                Explore Features
              </a>
            </div>

            {/* Trust badges */}
            <div className="opacity-0 animate-rise-d4 mt-8 flex items-center justify-center lg:justify-start gap-5 text-white/70">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Canvas LMS Integrated
              </div>
              <div className="text-xs font-medium">Free for VT Students</div>
            </div>
          </div>

          {/* Right column — visual */}
          <div className="opacity-0 animate-rise-d3 flex-1 w-full max-w-md lg:max-w-lg">
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-6 bg-orange/20 rounded-3xl blur-2xl" />

              {/* Chat preview card */}
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-200/60 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-gray-400 font-medium">HokieLearn AI Chat</span>
                </div>

                <div className="p-5 space-y-4">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-maroon text-white px-4 py-2.5 rounded-2xl rounded-br-md text-sm max-w-[80%] leading-relaxed">
                      Can you explain the difference between TCP and UDP from today's lecture?
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-bl-md text-sm text-gray-700 max-w-[85%] leading-relaxed">
                      <p className="font-medium text-gray-900 mb-1.5">Great question!</p>
                      <p className="mb-2">Based on your <span className="text-maroon font-medium">CS 3214 lecture (Slide 14)</span>, here are the key differences:</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="text-orange font-bold mt-px">TCP</span>
                          <span className="text-gray-600">Connection-oriented, reliable delivery, ordered packets</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-maroon font-bold mt-px">UDP</span>
                          <span className="text-gray-600">Connectionless, faster but no delivery guarantee</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typing indicator */}
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <FeaturesSection />

      {/* ---- ABOUT / VT SECTION ---- */}
      <AboutSection />

      {/* ---- TESTIMONIALS ---- */}
      <TestimonialsSection />

      {/* ---- CTA ---- */}
      <CTASection />

      {/* ---- FOOTER ---- */}
      <footer className="bg-[#0a0a0f] text-white py-16 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-14">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">HokieLearn AI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI-powered teaching assistant built for Virginia Tech students by the CISL Lab, Department of Computer Science.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm tracking-wide uppercase text-gray-400 mb-4">Product</h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm tracking-wide uppercase text-gray-400 mb-4">Resources</h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm tracking-wide uppercase text-gray-400 mb-4">Legal</h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} HokieLearn AI. Virginia Tech.</p>
            <p className="text-xs text-gray-600">Built with pride at the CISL Lab, Dept. of Computer Science</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================== */
/*  FEATURES SECTION                                                    */
/* ================================================================== */
function FeaturesSection() {
  const { ref, visible } = useInView(0.1);

  const features = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Ask Anything About Your Lectures',
      desc: 'Point to any moment in a video, module, or assignment and get instant context-aware explanations.',
      accent: 'maroon',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Auto-Generated Notes',
      desc: 'Comprehensive study notes and summaries created automatically from every lecture.',
      accent: 'orange',
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Semantic Search',
      desc: 'Find exactly what you need across all your course materials with AI-powered search.',
      accent: 'maroon',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Timestamp-Aware Answers',
      desc: 'Responses reference specific moments in lectures with precise timestamps.',
      accent: 'orange',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Powered by Advanced AI',
      desc: 'Built on large language models, lecture embeddings, and vision models for deep understanding.',
      accent: 'maroon',
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'All VT Disciplines',
      desc: 'From CS and engineering to business and humanities, HokieLearn adapts to your coursework.',
      accent: 'orange',
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 px-6 lg:px-10 bg-white relative" ref={ref}>
      {/* Subtle top border accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-maroon to-orange rounded-full" />

      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange mb-3">Features</p>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="text-maroon italic">Excel</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Powerful AI tools designed to transform how you study and learn from lectures.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group relative p-6 rounded-2xl border border-gray-100 bg-white hover:border-transparent hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-500 hover:-translate-y-1 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${i * 80}ms` : '0ms' }}
            >
              {/* Hover gradient bg */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${
                f.accent === 'maroon' ? 'from-maroon/[0.03] to-transparent' : 'from-orange/[0.04] to-transparent'
              }`} />
              <div className="relative">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  f.accent === 'maroon'
                    ? 'bg-maroon/8 text-maroon group-hover:bg-maroon group-hover:text-white'
                    : 'bg-orange/10 text-orange group-hover:bg-orange group-hover:text-white'
                }`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  ABOUT / VT SECTION                                                 */
/* ================================================================== */
function AboutSection() {
  const { ref, visible } = useInView(0.1);

  return (
    <section id="about" className="relative py-24 md:py-32 px-6 lg:px-10 overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-maroon via-maroon-dark to-[#2d0815]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      {/* Glowing orbs */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-white/[0.04] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange/[0.06] rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange/80 mb-3">About</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-5">
            Built <span className="italic">Exclusively</span> for<br className="hidden md:block" /> Virginia Tech
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            Whether you're tackling advanced engineering problems, debugging code, solving complex math, or studying business case studies, HokieLearn AI understands your coursework and adapts to how you learn.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { title: 'Engineering & CS', desc: 'Deep understanding of technical concepts, code, algorithms, and problem-solving methodologies.', icon: <Zap className="w-5 h-5" /> },
            { title: 'Canvas Integrated', desc: 'Seamlessly connects with your Canvas LMS courses, assignments, modules, and announcements.', icon: <BookOpen className="w-5 h-5" /> },
            { title: 'All Disciplines', desc: 'From math and sciences to business and humanities, adapts to every major at Virginia Tech.', icon: <GraduationCap className="w-5 h-5" /> },
          ].map((card, i) => (
            <div
              key={card.title}
              className={`p-6 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/10 hover:bg-white/[0.1] hover:border-white/20 transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${200 + i * 120}ms` : '0ms' }}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-orange mb-4">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  TESTIMONIALS SECTION                                               */
/* ================================================================== */
function TestimonialsSection() {
  const { ref, visible } = useInView(0.1);

  const testimonials = [
    {
      name: 'Sarthak',
      role: 'Computer Science, Class of 2025',
      quote: 'HokieLearn AI has completely changed how I study. Instead of rewatching entire lectures, I can ask specific questions and get instant answers with timestamps. It\'s like having a TA available 24/7.',
    },
    {
      name: 'Jyothi',
      role: 'Electrical Engineering, Class of 2026',
      quote: 'The automatic note generation saves me hours every week. I can focus on understanding concepts during lectures instead of frantically taking notes. This tool is a game-changer for STEM students.',
    },
  ];

  return (
    <section id="testimonials" className="py-24 md:py-32 px-6 lg:px-10 bg-white" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange mb-3">Testimonials</p>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            What Students Are <span className="text-maroon italic">Saying</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`relative p-7 rounded-2xl border border-gray-100 bg-gradient-to-br from-[#faf9f7] to-white hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${150 + i * 120}ms` : '0ms' }}
            >
              <Quote className="w-8 h-8 text-maroon/10 mb-3" />
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon to-orange flex items-center justify-center text-white text-sm font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  CTA SECTION                                                        */
/* ================================================================== */
function CTASection() {
  const { ref, visible } = useInView(0.15);

  return (
    <section id="cta" className="py-24 md:py-32 px-6 lg:px-10 bg-[#faf9f7] relative overflow-hidden" ref={ref}>
      {/* Decorative bg elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-maroon/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative">
        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-5">
            Start Learning <span className="text-maroon italic">Smarter</span>,{' '}
            <br className="hidden sm:block" />
            Not Harder
          </h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Join Virginia Tech students who are already studying more effectively with AI-powered assistance.
          </p>
        </div>

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link
            to="/login"
            className="group px-8 py-4 bg-maroon text-white rounded-xl font-semibold text-sm hover:bg-maroon-dark transition-all hover:shadow-xl hover:shadow-maroon/25 hover:-translate-y-0.5 flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#features"
            className="px-8 py-4 text-maroon border-2 border-maroon/20 rounded-xl font-semibold text-sm hover:bg-maroon/5 hover:border-maroon/40 transition-all"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

export default Landing;
