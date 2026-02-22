import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <nav className="mb-8">
                    <Link href="/" className="text-[#2874f0] hover:underline font-medium text-sm flex items-center gap-1">
                        <span>&larr;</span> Back to Home
                    </Link>
                </nav>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 font-inter">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 mb-8 border-b pb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
                        <p>
                            This Privacy Policy describes how ToysDeal ("we", "us", or "our") collects, uses, and shares your personal information when you visit or make a purchase from toysdeal.shop (the "Site").
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Personal Information We Collect</h2>
                        <p>
                            When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
                        </p>
                        <p>
                            Additionally, when you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number. We refer to this information as "Order Information".
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How Do We Use Your Personal Information?</h2>
                        <p>
                            We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Communicate with you;</li>
                            <li>Screen our orders for potential risk or fraud; and</li>
                            <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Sharing Your Personal Information</h2>
                        <p>
                            We share your Personal Information with third parties to help us use your Personal Information, as described above. We use Supabase for our database and authentication. We may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Data Retention</h2>
                        <p>
                            When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Changes</h2>
                        <p>
                            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
                        <p>
                            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <a href="mailto:support@toysdeal.shop" className="text-[#2874f0] hover:underline">support@toysdeal.shop</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
