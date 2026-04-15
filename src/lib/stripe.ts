export async function getStripeEnabled(): Promise<boolean> { return false }
export async function createCheckoutSession(_productId: number): Promise<string> { throw new Error('Stripe not configured') }
