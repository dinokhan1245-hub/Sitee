import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 border-t border-gray-800 pt-12 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-white text-lg font-bold mb-4 font-inter">ToysDeal</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Your one-stop destination for the best toys, games, and gifts for kids of all ages. Quality guaranteed.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</Link></li>
                            <li><Link href="/#products" className="text-gray-400 hover:text-white text-sm transition-colors">Shop All</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Policies</h4>
                        <ul className="space-y-2">
                            <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/refund-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Refund & Return Policy</Link></li>
                            <li><Link href="/terms-of-service" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
                            <li><Link href="/shipping-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Shipping Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Info</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="font-medium text-white">Email:</span>
                                <a href="mailto:support@toysdeal.shop" className="hover:text-white transition-colors">support@toysdeal.shop</a>
                            </li>
                            <li className="flex items-start gap-2 mt-2">
                                <span className="font-medium text-white">Hours:</span>
                                <span>Mon-Fri, 9AM to 6PM IST</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs text-center md:text-left">
                        &copy; {currentYear} ToysDeal. All rights reserved.
                    </p>
                    <div className="flex gap-4 items-center">
                        {/* Payment method icons could go here */}
                        <span className="text-gray-600 text-xs font-medium uppercase tracking-wider">100% Secure Checkout</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
