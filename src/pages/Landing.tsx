import { GraduationCap, MessageSquare, FileText, Search, Clock, Sparkles, ChevronRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white w-full">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="w-full mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <GraduationCap className="w-10 h-10 text-maroon" />
                <span className="text-3xl font-bold text-maroon">HokieLearn AI</span>
              </div>
              <p className="text-sm text-gray-500 ml-14">Developed by CSIL, CS</p>
            </div>

            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-base font-medium text-gray-700 hover:text-maroon transition-colors">Features</a>
              <a href="#testimonials" className="text-base font-medium text-gray-700 hover:text-maroon transition-colors">Testimonials</a>
              <a href="#cta" className="text-base font-medium text-gray-700 hover:text-maroon transition-colors">Get Started</a>
              <Link to="/login" className="px-8 py-3 bg-maroon text-white rounded-lg hover:bg-maroon-dark transition-all hover:shadow-lg hover:shadow-maroon/20 text-base font-semibold">
                Try the Demo
              </Link>
            </div>

            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 space-y-3">
              <a href="#features" className="block text-base font-medium text-gray-700 hover:text-maroon transition-colors py-2">Features</a>
              <a href="#testimonials" className="block text-base font-medium text-gray-700 hover:text-maroon transition-colors py-2">Testimonials</a>
              <a href="#cta" className="block text-base font-medium text-gray-700 hover:text-maroon transition-colors py-2">Get Started</a>
              <Link to="/login" className="block w-full px-8 py-3 bg-maroon text-white rounded-lg hover:bg-maroon-dark transition-all text-center text-base font-semibold">
                Try the Demo
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-32 pb-20 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon/5 via-orange/5 to-transparent"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-maroon/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange/10 rounded-full blur-3xl"></div>

        <div className="w-full mx-auto relative max-w-6xl">
          <div className="text-center mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/10 text-orange rounded-full mb-5 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Built for Virginia Tech Students</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 leading-tight animate-slide-up">
              Your Personal AI<br />
              <span className="bg-gradient-to-r from-maroon to-orange bg-clip-text text-transparent">
                Teaching Assistant
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto animate-slide-up-delay">
              HokieLearn AI helps students instantly understand lectures, ask questions,
              and get clarifications using AI-powered insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay">
              <Link to="/login" className="group px-8 py-4 bg-maroon text-white rounded-xl hover:bg-maroon-dark transition-all hover:shadow-xl hover:shadow-maroon/30 hover:-translate-y-0.5 flex items-center gap-2 text-lg font-semibold">
                Try the Demo
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-white text-maroon border-2 border-maroon rounded-xl hover:bg-maroon/5 transition-all hover:shadow-lg flex items-center gap-2 text-lg font-semibold">
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Everything You Need to <span className="text-maroon">Excel</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful AI features designed to transform how you learn from lectures
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="Ask Questions from Any Lecture, Module, Assignment or Grades"
              description="Point to any moment in a video, module, assignment, or grades page and get instant, context-aware explanations powered by AI."
              gradient="from-maroon/10 to-maroon/5"
            />

            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Automatic Notes & Summaries"
              description="Generate comprehensive study notes and summaries from any lecture automatically."
              gradient="from-orange/10 to-orange/5"
            />

            <FeatureCard
              icon={<Search className="w-8 h-8" />}
              title="Search Across All Lectures"
              description="Find exactly what you're looking for across all your course materials instantly."
              gradient="from-maroon/10 to-maroon/5"
            />

            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Timestamp-Aware Explanations"
              description="Get answers that reference specific moments in your lectures with precise timestamps."
              gradient="from-orange/10 to-orange/5"
            />

            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Built with Advanced AI"
              description="Powered by LLMs, lecture embeddings, and vision models for accurate understanding."
              gradient="from-maroon/10 to-maroon/5"
            />

            <FeatureCard
              icon={<GraduationCap className="w-8 h-8" />}
              title="Optimized for Engineering, CS and All VT Coursework"
              description="Deep integration with all Virginia Tech disciplines. From advanced technical subjects to humanities, we've got you covered."
              gradient="from-orange/10 to-orange/5"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-gradient-to-br from-maroon to-maroon-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange rounded-full blur-3xl"></div>
        </div>

        <div className="w-full mx-auto text-center relative max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            Built for Virginia Tech Students
          </h2>
          <p className="text-lg text-white/90 mb-10 leading-relaxed max-w-3xl mx-auto">
            HokieLearn AI is designed specifically for the Virginia Tech experience.
            Whether you're tackling advanced engineering problems, debugging code,
            solving complex math equations, or studying business case studies,
            our AI assistant understands your coursework and adapts to your learning style.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-3">Engineering & CS</h3>
              <p className="text-white/80">
                Deep understanding of technical concepts, code snippets, and problem-solving methodologies.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-3">All Disciplines</h3>
              <p className="text-white/80">
                From math and sciences to business and humanities, HokieLearn AI adapts to your major.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-8 bg-white">
        <div className="w-full mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              What Students Are Saying
            </h2>
            <p className="text-lg text-gray-600">
              See how HokieLearn AI is transforming the learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <TestimonialCard
              name="Sarthak"
              role="Computer Science, Class of 2025"
              quote="HokieLearn AI has completely changed how I study. Instead of rewatching entire lectures, I can ask specific questions and get instant answers with timestamps. It's like having a TA available 24/7."
            />

            <TestimonialCard
              name="Jyothi"
              role="Electrical Engineering, Class of 2026"
              quote="The automatic note generation saves me hours every week. I can focus on understanding concepts during lectures instead of frantically taking notes. This tool is a game-changer for STEM students."
            />
          </div>
        </div>
      </section>

      <section id="cta" className="py-20 px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full mx-auto text-center max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Start Learning Smarter —<br />
            <span className="bg-gradient-to-r from-maroon to-orange bg-clip-text text-transparent">
              Not Harder
            </span>
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of Virginia Tech students who are already learning more effectively with AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="group px-10 py-5 bg-maroon text-white rounded-xl hover:bg-maroon-dark transition-all hover:shadow-2xl hover:shadow-maroon/30 hover:-translate-y-1 flex items-center gap-2 text-lg font-semibold">
              Try the Demo
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-10 py-5 bg-white text-maroon border-2 border-maroon rounded-xl hover:bg-maroon/5 transition-all hover:shadow-xl flex items-center gap-2 text-lg font-semibold">
              Get Early Access
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16 px-8">
        <div className="w-full mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-8 h-8 text-orange" />
                  <span className="text-2xl font-bold">HokieLearn AI</span>
                </div>
                <p className="text-xs text-gray-500 ml-10 mb-3">Developed by CSIL, CS</p>
              </div>
              <p className="text-gray-400">
                AI-powered teaching assistant built for Virginia Tech students.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 HokieLearn AI. Built with pride for Virginia Tech students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-maroon/20 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-maroon mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function TestimonialCard({ name, role, quote }: {
  name: string;
  role: string;
  quote: string;
}) {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-maroon/20 transition-all hover:shadow-xl">
      <p className="text-base text-gray-700 mb-5 leading-relaxed italic">"{quote}"</p>
      <div>
        <p className="font-bold text-gray-900 text-base">{name}</p>
        <p className="text-gray-600 text-sm">{role}</p>
      </div>
    </div>
  );
}

export default Landing;

