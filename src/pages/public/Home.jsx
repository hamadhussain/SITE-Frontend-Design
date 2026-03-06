import { Link } from 'react-router-dom'
import {
  Hammer,
  Shield,
  MessageSquare,
  Star,
  ArrowRight,
  ClipboardCheck,
  Users,
  HardHat,
  Truck,
  FileText,
  Building,
  Lock,
  Search,
  CheckCircle2,
  Quote
} from 'lucide-react'
import { useEffect, useRef } from "react";
import gsap from "gsap";
import HeroParticles from "./HeroParticles";
import CursorParticles from "./Cursor";
import ScrollStack from './ScrollStack'
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const trustFeatures = [
  {
    icon: Lock,
    title: 'Escrow Payments',
    description: 'Your funds are held securely and only released when project milestones are approved by you.'
  },
  {
    icon: Shield,
    title: 'Verified Professionals',
    description: 'Every builder and professional undergoes rigorous background checks and credential verification.'
  },
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'Communicate directly with your team, share files, and get instant updates on progress.'
  },
  {
    icon: ClipboardCheck,
    title: 'Systematic Inspections',
    description: 'Independent quality inspectors verify work quality before milestone payments are released.'
  },
  {
    icon: Star,
    title: 'Ratings & Badges',
    description: 'Hire with confidence based on real reviews, historical success rates, and achievement badges.'
  }
]

const steps = [
  {
    number: '01',
    title: 'Post Your Project',
    description: 'Describe your construction needs, set a budget, and specify your timelines in a few clicks.'
  },
  {
    number: '02',
    title: 'Receive Bids & Hire',
    description: 'Review proposals from verified professionals, compare their profiles, and select the best fit.'
  },
  {
    number: '03',
    title: 'Secure Payment & Completion',
    description: 'Pay safely via milestone escrow. Approve the work at each stage before any funds are released.'
  }
]

const roles = [
  {
    icon: Users,
    title: 'Clients',
    description: 'Post projects, hire top local talent, and manage your construction journey safely.'
  },
  {
    icon: HardHat,
    title: 'Builders',
    description: 'Find consistent verified work, submit competitive bids, and guarantee your payments.'
  },
  {
    icon: Truck,
    title: 'Suppliers',
    description: 'Provide quality construction materials and equipment directly to active project sites.'
  },
  {
    icon: FileText,
    title: 'Supervisors',
    description: 'Manage sites efficiently, oversee daily progress, and report seamlessly to clients.'
  },
  {
    icon: Building,
    title: 'Inspectors',
    description: 'Verify project milestones and maintain high quality standards across all sites.'
  }
]

const stats = [
  { value: '₨ 500M+', label: 'Secure Transactions' },
  { value: '1,200+', label: 'Projects Completed' },
  { value: '5,000+', label: 'Verified Pros' },
  { value: '4.8/5', label: 'Average Rating' }
]

const testimonials = [
  {
    quote: "The escrow system completely removed the financial stress from our home renovation. Builders only got paid when we were happy with the milestone output.",
    author: "Ahmed K.",
    role: "Homeowner, Lahore",
    rating: 5
  },
  {
    quote: "As a contractor, I no longer chase payments. I know the funds are secure in escrow, allowing my team to focus entirely on delivering quality work.",
    author: "Raza Construction",
    role: "Verified Builder",
    rating: 5
  },
  {
    quote: "Finding reliable suppliers and managing the site used to be a nightmare. BuilderConnect brings everything into one transparent, easy-to-use dashboard.",
    author: "Sana F.",
    role: "Project Manager",
    rating: 5
  }
]
export default function Home() {
  const heroBgRef = useRef(null);
  const magBtnRef = useRef(null);
const horizontalRef = useRef(null);
const panelsRef = useRef([]);

const addPanel = (el) => {
  if (el && !panelsRef.current.includes(el)) {
    panelsRef.current.push(el);
  }
};

useEffect(() => {

  const sections = panelsRef.current;
  const container = horizontalRef.current;

  if (!container || sections.length === 0) return;

  gsap.to(sections, {
    xPercent: -100 * (sections.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      snap: 1 / (sections.length - 1),
      end: "+=" + container.offsetWidth
    }
  });

}, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text Reveal
      gsap.fromTo(
        '.gsap-reveal-line',
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 1.2, ease: 'power4.out', stagger: 0.15, delay: 0.1 }
      );

      // Floating effect
      gsap.to('.hero-float-shape', {
        y: -30,
        rotation: 3,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.5
      });
    });

    // Magnetic Button Effect
    const btn = magBtnRef.current;
    let hoverPulse, hoverLeave;
    if (btn) {
      hoverPulse = (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
      };
      hoverLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      };
      btn.addEventListener('mousemove', hoverPulse);
      btn.addEventListener('mouseleave', hoverLeave);
    }

    return () => {
      ctx.revert();
      if (btn) {
        btn.removeEventListener('mousemove', hoverPulse);
        btn.removeEventListener('mouseleave', hoverLeave);
      }
    };
  }, []);

  return (
    <div className="min-h-screen  font-sans text-slate-900 selection:bg-primary/20 selection:text-primary">
      {/* Header - Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 bgwhite/80 backdrop-blur-md borderb border-slate-200/80 transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Hammer className="h-6 w-6 text-black" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">Builder<span className="text-gray-500">Connect</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/builders" className="text-slate-600 hover:text-primary transition-colors">
              Find Builders
            </Link>
            <Link to="/how-it-works" className="text-slate-600 hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link to="/pricing" className="text-slate-600 hover:text-primary transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-5 font-medium">
            <Link to="/login" className="hidden sm:block text-slate-600 hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100">

        {/* Soft blur glow shapes & Floating shapes */}
        <div ref={heroBgRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full mix-blend-multiply opacity-60" />
          <div className="hero-float-shape absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-blue-400/20 blur-[120px] rounded-full mix-blend-multiply opacity-40" />
          <div className="hero-float-shape absolute -bottom-32 left-[30%] w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-multiply opacity-50" />
        </div>

        {/* Hero Particles */}
        <div className="absolute inset-0 z-10 pointer-events-none">

            <HeroParticles
    color="#ff6b35"
    speed={0.6}
    direction="forward"
    scale={1.1}
    opacity={0.8}
    mouseInteractive={true}
  />
          <CursorParticles />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 text-center">
          <div
            data-aos="fade-down" data-aos-delay="100"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bgwhite/80 backdrop-blur-sm text-black font-medium text-sm mb-8  border-primary/20 shadow-sm"
          >
            Pakistan's #1 Smart Construction Marketplace
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight flex flex-col items-center">
            <div className="overflow-hidden"><div className="gsap-reveal-line">Build Smarter.</div></div>
            <div className="overflow-hidden"><div className="gsap-reveal-line">Build Secure.</div></div>
          </h1>

          <p
            data-aos="fade-up" data-aos-delay="300"
            className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Connect with verified professionals across Pakistan.
            Your funds are protected by milestone-based escrow.
          </p>

          <div
            data-aos="zoom-in" data-aos-delay="400"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              ref={magBtnRef}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-bold hover:shadow-2xl hover:shadow-primary/40 transition-shadow flex items-center gap-2 relative z-50 inline-block group"
            >
              <div className="flex items-center gap-2 pointer-events-none group-hover:scale-105 transition-transform">Post a Project <ArrowRight className="h-5 w-5" /></div>
            </Link>
            <Link
              to="/builders"
              className="bg-white/80 backdrop-blur-sm text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-xl text-lg font-bold hover:border-primary/40 hover:bg-white hover:scale-105 hover:shadow-lg hover:shadow-slate-200/50 transition-all flex items-center gap-2"
            >
              <Search className="h-5 w-5 text-slate-500" /> Explore Builders
            </Link>
          </div>
        </div>
      </section>


<section className="relative py-24 bg-white overflow-hidden">

  {/* Background Decoration */}
  <div className="absolute inset-0 pointer-events-none opacity-40">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05),transparent_60%)]" />
  </div>

  <div className="relative z-10 container mx-auto px-6">
    <div className="grid lg:grid-cols-2 gap-16  items-center">

      {/* LEFT CONTENT */}
      <div className='  flex flex-col items-start justify-start'>
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Visualizing Success
        </span>

        <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
          What's in <span className="text-transparent bg-clip-text bg-gradient-to-r to-primary from-secondary">BuilderConnect?</span>
        </h2>

        <div className="mt-12 space-y-10">

          {/* Feature 1 */}
          <div className="flex gap-5 group">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-black/5 text-black group-hover:scale-110 transition-all duration-300">
              {/* Icon */}
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="1.5" d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <div>
              <h6 className="text-xl font-bold text-slate-900">Branding</h6>
              <p className="text-slate-600 mt-2">
                Consistent design makes it easy to brand your own.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-5 group">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-black/5 text-black group-hover:scale-110 transition-all duration-300">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <h6 className="text-xl font-bold text-slate-900">UI & UX Design</h6>
              <p className="text-slate-600 mt-2">
                Built on atomic design principles for better usability.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-5 group">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-black/5 text-black group-hover:scale-110 transition-all duration-300">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="1.5" d="M4 4h16v16H4z" />
              </svg>
            </div>
            <div>
              <h6 className="text-xl font-bold text-slate-900">Development</h6>
              <p className="text-slate-600 mt-2">
                Easy to customize and extend, saving time and money.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/home/home-chart.webp"
            alt="Home chart"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Glow Effect */}
        <div className="absolute -z-10 -bottom-10 -right-10 w-72 h-72 bg-primary/20 blur-[100px] rounded-full" />
      </div>

    </div>
  </div>

</section>






      {/* Trust Section */}
      <section className="py-24 bg-white  bordert border-slate-200" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Enterprise-Grade Protection</h2>
            <p className="text-lg text-slate-600">
              We've built Pakistan's safest construction marketplace with end-to-end security, transparency, and quality assurance for your peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {trustFeatures.map((feature, idx) => (
              <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">How BuilderConnect Works</h2>
            <p className="text-lg text-slate-600">
              A streamlined, secure process from project posting to final handover.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -z-10" />
            {steps.map((step, idx) => (
              <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} className="relative z-10 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:scale-105 hover:border-primary/30 transition-all duration-300 text-center md:text-left">
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 mx-auto md:mx-0 shadow-lg shadow-primary/20 ring-4 ring-white">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
<ScrollStack/>
      {/* Roles Section */}
      <section className="py-24  bg-white border-slate-200" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Built for the Entire Ecosystem</h2>
            <p className="text-lg text-slate-600">
              A unified platform connecting every stakeholder seamlessly in the construction lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {roles.map((role, idx) => (
              <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 hover:shadow-xl hover:scale-105 hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14  rounded-xl flex items-center justify-center text-primary border border-slate-100 mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <role.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{role.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative overflow-hidden" data-aos="fade-up">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 divide-x-0 md:divide-x divide-slate-200">
            {stats.map((stat, idx) => (
              <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} className="text-center px-4">
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">{stat.value}</div>
                <div className="text-slate-600 font-medium text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Trusted by Thousands</h2>
            <p className="text-lg text-slate-600">
              See what our community of homeowners and professionals have to say about BuilderConnect.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} className="bg-slate p-8 rounded-2xl border border-slate-100 flex flex-col hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <p className="text-slate-700 leading-relaxed mb-8 flex-grow text-lg italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mr-4 border border-primary/20">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.author}</h4>
                    <span className="text-sm text-slate-500">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-white py-24 bg-primary overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[500px] h-[500px] bg-white/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-black/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10" data-aos="zoom-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6 tracking-tight">Ready to Build Smarter?</h2>
          <p className="text-xl text-black/90 mb-10 max-w-2xl mx-auto">
            Join BuilderConnect today and experience the future of construction management and hiring in Pakistan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-primary px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 hover:shadow-xl hover:shadow-black/10 transition-all hover:-translate-y-1"
            >
              Create Free Account
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/10 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                  <Hammer className="w-6 h-6" />
                </div>
                <span className="font-bold text-2xl text-white">Builder<span className="text-primary">Connect</span></span>
              </Link>
              <p className="text-slate-400 mb-8 max-w-sm leading-relaxed">
                Pakistan's premium smart construction marketplace connecting clients with verified professionals under a secure structured ecosystem.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">For Clients</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link to="/builders" className="hover:text-primary transition-colors">Find Builders</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing Options</Link></li>
                <li><Link to="/quality-assurance" className="hover:text-primary transition-colors">Quality Assurance</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">For Professionals</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/register?role=BUILDER" className="hover:text-primary transition-colors">Join as Builder</Link></li>
                <li><Link to="/register?role=SUPPLIER" className="hover:text-primary transition-colors">Join as Supplier</Link></li>
                <li><Link to="/subscriptions" className="hover:text-primary transition-colors">Subscriptions</Link></li>
                <li><Link to="/success-stories" className="hover:text-primary transition-colors">Success Stories</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
                <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} BuilderConnect v2. All rights reserved.</p>
            <div className="flex gap-6 font-medium">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/security" className="hover:text-white transition-colors">Security Details</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}