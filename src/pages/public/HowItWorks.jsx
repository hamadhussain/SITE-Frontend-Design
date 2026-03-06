import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Hammer,
    ArrowRight,
    Shield,
    MessageSquare,
    ClipboardCheck,
    CheckCircle2,
    Lock,
    Search,
    Check
} from 'lucide-react'
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        number: '01',
        title: 'Post Your Construction Project',
        description: 'Describe your requirements, set a budget, and specify your timeline. Our smart forms guide you to create the perfect project brief. It\'s completely free for clients.'
    },
    {
        number: '02',
        title: 'Receive Bids from Verified Builders',
        description: 'Watch competitive proposals roll in. Review builder profiles, past projects, ratings, and verify their credentials all in one place.'
    },
    {
        number: '03',
        title: 'Hire and Start Milestones',
        description: 'Select your preferred professional and agree on project milestones. Our digital contract system ensures both parties are aligned.'
    },
    {
        number: '04',
        title: 'Secure Escrow Payments & Completion',
        description: 'Deposit milestone funds securely. Money is only released when you approve the completed work. Build with 100% financial peace of mind.'
    }
];

const features = [
    {
        icon: Lock,
        title: 'Milestone Escrow',
        description: 'Your funds are held in a secure trust and released strictly upon milestone approval.'
    },
    {
        icon: MessageSquare,
        title: 'Unified Communication',
        description: 'Discuss details, share files, and clear doubts directly via our built-in real-time chat.'
    },
    {
        icon: ClipboardCheck,
        title: 'Quality Inspections',
        description: 'Optionally hire verified inspectors to independently verify milestone completion before payment release.'
    }
];

export default function HowItWorks() {
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero simple fade in
            gsap.fromTo('.hero-text-anim',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.1 }
            );

            // Step cards reveal
            gsap.utils.toArray('.step-card').forEach((card, i) => {
                gsap.fromTo(card,
                    { y: 50, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                        },
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power3.out"
                    }
                );
            });

            // Feature blocks
            gsap.utils.toArray('.feature-block').forEach((block, i) => {
                gsap.fromTo(block,
                    { scale: 0.9, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: block,
                            start: "top 85%",
                        },
                        scale: 1,
                        opacity: 1,
                        duration: 0.6,
                        ease: "back.out(1.5)"
                    }
                );
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-primary/20 selection:text-primary flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300">
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
                        <Link to="/how-it-works" className="text-primary transition-colors">
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
            <section className="relative pt-40 pb-20 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-200">
                <div className="absolute inset-0 bg-primary/5 pattern-dots pointer-events-none" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="hero-text-anim text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
                        How BuilderConnect Works
                    </h1>
                    <p className="hero-text-anim text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
                        From project posting to final handover, discover a streamlined, secure, and transparent construction ecosystem.
                    </p>
                </div>
            </section>

            {/* Timeline Steps Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Your Journey to Success</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Follow our simple 4-step process to build with confidence and transparency.</p>
                    </div>

                    <div className="relative">
                        {/* Vertical Line for timeline */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-slate-100 -translate-x-1/2 rounded-full" />

                        <div className="space-y-12 md:space-y-24">
                            {steps.map((step, idx) => (
                                <div key={idx} className={`step-card relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                    {/* Content */}
                                    <div className={`flex-1 md:w-1/2 ${idx % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                        <p className="text-slate-600 leading-relaxed text-lg">{step.description}</p>
                                    </div>

                                    {/* Icon / Number Marker */}
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-16 h-16 bg-primary text-white rounded-2xl items-center justify-center text-2xl font-bold shadow-lg ring-8 ring-white z-10">
                                        {step.number}
                                    </div>

                                    {/* Mobile number indicator */}
                                    <div className="md:hidden w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg mb-4 mx-auto">
                                        {step.number}
                                    </div>

                                    {/* Empty Spacer */}
                                    <div className="flex-1 md:w-1/2 hidden md:block" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Overview */}
            <section className="py-24 bg-slate-50 border-y border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Core Features</h2>
                        <p className="text-lg text-slate-600">
                            We provide the tools you need to stay in control and communicate effectively.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="feature-block bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-primary relative overflow-hidden flex-grow">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[400px] h-[400px] bg-white/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6 tracking-tight">Start Your Project Today</h2>
                    <p className="text-xl text-black/80 mb-10 max-w-2xl mx-auto">
                        Experience peace of mind with our milestone-based system and verified professionals.
                    </p>
                    <Link
                        to="/register"
                        className="bg-white text-primary px-8 py-4 rounded-xl text-lg font-bold hover:shadow-2xl hover:bg-slate-50 transition-all inline-flex items-center gap-2 group"
                    >
                        Get Started Now <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-16 mt-auto">
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
                                <li><Link to="/how-it-works" className="text-primary transition-colors">How It Works</Link></li>
                                <li><Link to="/builders" className="hover:text-primary transition-colors">Find Builders</Link></li>
                                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing Options</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-6">For Professionals</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link to="/register?role=BUILDER" className="hover:text-primary transition-colors">Join as Builder</Link></li>
                                <li><Link to="/register?role=SUPPLIER" className="hover:text-primary transition-colors">Join as Supplier</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-6">Company</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>&copy; {new Date().getFullYear()} BuilderConnect v2. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
