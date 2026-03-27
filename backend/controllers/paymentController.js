
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

const createCheckoutSession = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const booking = await Booking.findByPk(booking_id, { include: ['Room'] });
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Room ${booking.Room.room_number} Booking`,
            },
            unit_amount: Math.round(booking.total_price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      metadata: { booking_id: booking.id.toString() },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateAccessCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const booking_id = session.metadata.booking_id;

    const booking = await Booking.findByPk(booking_id);
    if (booking && booking.payment_status !== 'paid') {
      booking.payment_status = 'paid';
      booking.status = 'confirmed';
      booking.access_code = generateAccessCode();
      await booking.save();
    }
  }

  res.json({ received: true });
};

module.exports = { createCheckoutSession, handleWebhook };
