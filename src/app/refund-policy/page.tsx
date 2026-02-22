import Link from 'next/link';

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <nav className="mb-8">
                    <Link href="/" className="text-[#2874f0] hover:underline font-medium text-sm flex items-center gap-1">
                        <span>&larr;</span> Back to Home
                    </Link>
                </nav>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 font-inter">Refund & Return Policy</h1>
                    <p className="text-sm text-gray-500 mb-8 border-b pb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
                        <p className="font-medium text-gray-900">
                            At ToysDeal, we want you to be completely satisfied with your purchase. Our refund and return policy is designed to be fair and transparent.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7-Day Return Window</h2>
                        <p>
                            We offer a 7-day return policy, which means you have 7 days after receiving your item to request a return.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Eligibility for Returns</h2>
                        <p>
                            To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase (Order ID).
                        </p>
                        <p>
                            <strong>Non-returnable items:</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Items damaged after delivery due to misuse.</li>
                            <li>Products missing original tags, manuals, or packaging accessories.</li>
                            <li>Clearance or sale items explicitly marked as non-returnable.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Processing a Return</h2>
                        <p>
                            To start a return, you can contact us at <a href="mailto:support@toysdeal.shop" className="text-[#2874f0] hover:underline">support@toysdeal.shop</a>. If your return is accepted, we’ll send you instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Damages and issues</h2>
                        <p>
                            Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right. We require photographic evidence of the damaged product and packaging.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Refunds</h2>
                        <p>
                            We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within 5-7 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Contact</h2>
                        <p>
                            If you have any questions concerning our return policy, please contact us at: <a href="mailto:support@toysdeal.shop" className="text-[#2874f0] hover:underline">support@toysdeal.shop</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
