import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <nav className="mb-8">
                    <Link href="/" className="text-[#2874f0] hover:underline font-medium text-sm flex items-center gap-1">
                        <span>&larr;</span> Back to Home
                    </Link>
                </nav>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 font-inter">Terms of Service</h1>
                    <p className="text-sm text-gray-500 mb-8 border-b pb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Terms</h2>
                        <p>
                            By accessing this Website, accessible from toysdeal.shop, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The materials contained in this Website are protected by copyright and trade mark law.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Use License</h2>
                        <p>
                            Permission is granted to temporarily download one copy of the materials on ToysDeal's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>modify or copy the materials;</li>
                            <li>use the materials for any commercial purpose or for any public display;</li>
                            <li>attempt to reverse engineer any software contained on ToysDeal's Website;</li>
                            <li>remove any copyright or other proprietary notations from the materials; or</li>
                            <li>transfering the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>
                        <p>
                            This will let ToysDeal to terminate upon violations of any of these restrictions. Upon termination, your viewing right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Disclaimer</h2>
                        <p>
                            All the materials on ToysDeal’s Website are provided "as is". ToysDeal makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, ToysDeal does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Limitations</h2>
                        <p>
                            ToysDeal or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on ToysDeal’s Website, even if ToysDeal or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Revisions and Errata</h2>
                        <p>
                            The materials appearing on ToysDeal’s Website may include technical, typographical, or photographic errors. ToysDeal will not promise that any of the materials in this Website are accurate, complete, or current. ToysDeal may change the materials contained on its Website at any time without notice. ToysDeal does not make any commitment to update the materials.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Links</h2>
                        <p>
                            ToysDeal has not reviewed all of the sites linked to its Website and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by ToysDeal of the site. The use of any linked website is at the user’s own risk.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Site Terms of Use Modifications</h2>
                        <p>
                            ToysDeal may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Governing Law</h2>
                        <p>
                            Any claim related to ToysDeal's Website shall be governed by the laws of India without regards to its conflict of law provisions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
