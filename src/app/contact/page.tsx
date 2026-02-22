import Link from 'next/link';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactUs() {
    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <nav className="mb-8">
                    <Link href="/" className="text-[#2874f0] hover:underline font-medium text-sm flex items-center gap-1">
                        <span>&larr;</span> Back to Home
                    </Link>
                </nav>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 font-inter">Contact Us</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We're here to help! If you have any questions about an order, our products, or our policies, please don't hesitate to reach out.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                        {/* Contact Information */}
                        <div className="space-y-8">
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Business Information</h2>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-[#2874f0] rounded-full shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Email Updates & Support</h3>
                                    <a href="mailto:support@toysdeal.shop" className="text-[#2874f0] hover:underline mt-1 block">
                                        support@toysdeal.shop
                                    </a>
                                    <p className="text-xs text-gray-500 mt-1">We aim to reply within 24 hours.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-[#2874f0] rounded-full shrink-0">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Business Hours</h3>
                                    <p className="text-gray-600 mt-1">Monday - Friday</p>
                                    <p className="text-gray-600">9:00 AM - 6:00 PM (IST)</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-[#2874f0] rounded-full shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Operating Address</h3>
                                    <p className="text-gray-600 mt-1">ToysDeal Operations</p>
                                    <p className="text-gray-600">New Delhi, Delhi</p>
                                    <p className="text-gray-600">India - 110001</p>
                                    <p className="text-xs text-orange-600 font-medium mt-1">Online Only - No Physical Storefront</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Contact Form */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-6">Send a Message</h2>
                            <form className="space-y-4" onSubmit={(e) => {
                                e.preventDefault();
                                alert("Thank you for your message! Our team will get back to you shortly at the email provided.");
                                // Simply reset for appearance as this is a static layout
                                (e.target as HTMLFormElement).reset();
                            }}>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input type="text" id="name" required className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" id="email" required className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">Order Number (Optional)</label>
                                    <input type="text" id="order" className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none" placeholder="e.g. ORD-12345" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea id="message" rows={4} required className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-[#2874f0] text-white font-medium py-3 px-4 rounded hover:bg-blue-700 transition-colors">
                                    Send Message
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
