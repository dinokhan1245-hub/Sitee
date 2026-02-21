import { redirect } from 'next/navigation';

export default function BuyRedirect({ params }: { params: { id: string } }) {
    // Redirect /buy/[id] directly to the checkout page with the product ID parameter.
    redirect(`/checkout?product=${params.id}`);
}
