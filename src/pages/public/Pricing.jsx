import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Hammer,
    CheckCircle2,
    Building,
    HelpCircle
} from 'lucide-react'
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger);

const builderPlans = [
    {
        name: 'Starter',
        price: 'Free',
        period: '',
        description: 'Perfect for new professionals getting started.',
        features: [
            'Basic profile listing',
            '3 Bids per month',
            'Standard support',
            'Platform fee applies on payout'
        ],
        buttonText: 'Join for Free',
        buttonClass: 'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300',
        popular: false
    },
    {
        name: 'Professional',
        price: '₨ 4,999',
        period: '/month',
        description: 'The standard for established builders scaling up.',
        features: [
            'Verified Badge & Priority listing',
            '30 Bids per month',
            '10 Premium Lead Credits',
            'Smart Project Management Tools',
            'Reduced platform fee',
            '24/7 Priority Support'
        ],
        buttonText: 'Start Professional',
        buttonClass: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
        popular: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For large construction firms with volume needs.',
        features: [
            'Unlimited Bids',
            'Unlimited Lead Credits',
            'Dedicated Account Manager',
            'Custom API Integrations',
            'Lowest platform fee',
            'Advanced Team Management'
        ],
        buttonText: 'Contact Sales',
        buttonClass: 'bg-slate-900 text-white hover:bg-slate-800',
        popular: false
    }
];

const faqs = [
    {
        question: 'How do milestone payments work?',
        answer: 'Funds for each milestone are held securely in escrow. They are only released to the builder once you (the client) approve the work for that milestone.'
    },
    {
        question: 'Are there hidden fees for clients?',
        answer: 'Posting projects is completely free. We charge a nominal 1.5% escrow service fee on the total transaction amount to cover payment processing and security.'
    },
    {
        question: 'Can builders cancel their subscription?',
        answer: 'Yes, builders can upgrade, downgrade, or cancel their monthly subscriptions at any time from their account settings. Changes take effect on the next billing cycle.'
    },
    {
        question: 'How do lead credits work?',
        answer: 'Lead credits allow Professional and Enterprise builders to directly message clients for premium projects even before placing a formal bid.'
    }
];

export default function Pricing() {
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero text animation
            gsap.fromTo('.anim-hero',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
            );

            // Pricing cards
            gsap.utils.toArray('.anim-card').forEach((card, i) => {
                gsap.fromTo(card,
                    { y: 50, opacity: 0 },
                    {
                        scrollTrigger: { trigger: '.anim-cards-container', start: "top 80%" },
                        y: 0, opacity: 1, duration: 0.7, delay: i * 0.15, ease: "back.out(1.2)"
                    }
                );
            });

            // FAQ reveal
            gsap.utils.toArray('.anim-faq').forEach((faq, i) => {
                gsap.fromTo(faq,
                    { x: -30, opacity: 0 },
                    {
                        scrollTrigger: { trigger: faq, start: "top 90%" },
                        x: 0, opacity: 1, duration: 0.6, ease: "power2.out"
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
                        <Link to="/how-it-works" className="text-slate-600 hover:text-primary transition-colors">
                            How It Works
                        </Link>
                        <Link to="/pricing" className="text-primary transition-colors">
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
            <section className="pt-40 pb-24 text-center px-4 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10" />
                <div className="container mx-auto max-w-3xl">
                    <h1 className="anim-hero text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Simple & Transparent Pricing
                    </h1>
                    <p className="anim-hero text-xl text-slate-600 leading-relaxed">
                        Whether you are a homeowner building a dream or a professional scaling your business, our flexible pricing fits your goals.
                    </p>
                </div>
            </section>

            {/* Pricing Cards Section */}
            <section className="pb-24 px-4 bg-white relative">
                <div className="container mx-auto max-w-6xl">

                    {/* Client Notice */}
                    <div className="anim-hero mb-16 bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center max-w-3xl mx-auto flex flex-col items-center">
                        <Building className="w-12 h-12 text-primary mb-4" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">For Clients & Homeowners</h3>
                        <p className="text-lg text-slate-600">
                            Posting projects is completely <span className="font-bold text-slate-900">FREE</span>.
                            Review bids, chat with professionals, and hire at zero cost.
                            We only charge a small 1.5% escrow service fee when you fund a milestone payment.
                        </p>
                    </div>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">Builder Subscriptions</h2>
                    </div>

                    <div className="anim-cards-container grid md:grid-cols-3 gap-8 items-start">
                        {builderPlans.map((plan, idx) => (
                            <div
                                key={idx}
                                className={`anim-card relative rounded-3xl p-8 transition-all duration-300 ${plan.popular
                                        ? 'bg-white border-2 border-primary shadow-2xl scale-105 z-10'
                                        : 'bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg">
                                        Recommended
                                    </div>
                                )}

                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <p className="text-slate-500 h-10 mb-6">{plan.description}</p>

                                <div className="flex items-end gap-1 mb-8">
                                    <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
                                    {plan.period && <span className="text-lg text-slate-500 mb-1">{plan.period}</span>}
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700">
                                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/register?role=BUILDER"
                                    className={`block w-full py-4 text-center rounded-xl font-bold transition-all ${plan.buttonClass}`}
                                >
                                    {plan.buttonText}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-16">
                        <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="anim-faq bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="text-lg font-bold text-slate-900 mb-3">{faq.question}</h4>
                                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
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
                                <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                                <li><Link to="/builders" className="hover:text-primary transition-colors">Find Builders</Link></li>
                                <li><Link to="/pricing" className="text-primary transition-colors">Pricing Options</Link></li>
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
