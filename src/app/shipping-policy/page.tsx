import Link from 'next/link';

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <nav className="mb-8">
                    <Link href="/" className="text-[#2874f0] hover:underline font-medium text-sm flex items-center gap-1">
                        <span>&larr;</span> Back to Home
                    </Link>
                </nav>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 font-inter">Shipping Policy</h1>
                    <p className="text-sm text-gray-500 mb-8 border-b pb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Order Processing Times</h2>
                        <p>
                            All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
                        </p>
                        <p className="text-sm italic text-gray-500">
                            Please note that during high volume periods or due to postal service problems outside of our control, processing and shipping times may be slightly delayed.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Shipping Rates & Estimates</h2>
                        <p>
                            We offer <strong>Free Standard Shipping</strong> on all orders within India.
                        </p>
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mt-4">
                            <table className="min-w-full divide-y divide-blue-200">
                                <thead>
                                    <tr>
                                        <th scope="col" className="text-left text-sm font-semibold text-blue-900 py-2">Shipping Method</th>
                                        <th scope="col" className="text-left text-sm font-semibold text-blue-900 py-2">Estimated Delivery Time</th>
                                        <th scope="col" className="text-left text-sm font-semibold text-blue-900 py-2">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-200">
                                    <tr>
                                        <td className="py-2 text-sm text-blue-800">Standard Delivery</td>
                                        <td className="py-2 text-sm text-blue-800">3 to 5 business days</td>
                                        <td className="py-2 text-sm text-green-600 font-bold">Free</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Order Tracking</h2>
                        <p>
                            When your order has shipped, you will receive an email and/or SMS notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">In-Store Pickup</h2>
                        <p>
                            At this time, we do not offer local pickup or in-store options. All orders are strictly fulfilled via courier delivery.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">International Shipping</h2>
                        <p>
                            We currently do not ship outside of India. We only accept orders with shipping addresses located within the Indian sub-continent.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
                        <p>
                            If you have any further questions or if your order hasn't arrived within the estimated delivery time, please contact us at <a href="mailto:support@toysdeal.shop" className="text-[#2874f0] hover:underline">support@toysdeal.shop</a> with your name and order number.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
