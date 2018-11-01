'use strict';

require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';

const pry = NODE_ENV === 'development' ? require('pryjs') : null;
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = new Koa();
const router = new Router();

router
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.error(err, err.stack);
      ctx.redirect('back');
    }
  })
  .post('/', async (ctx, next) => {
    const { stripeToken, stripeEmail, amount, redirectUrl } = ctx.request.body;
    const charge = await stripe.charges.create({
      amount: parseInt(amount, 10),
      currency: 'usd',
      source: stripeToken,
      description: `Charge for ${stripeEmail}`
    });
    console.log(`Charged ${stripeEmail} ${charge.amount / 100} ${charge.currency} (charge_id: ${charge.id}).`);
    console.log(`Redirecting to ${redirectUrl} ..`);
    ctx.redirect(redirectUrl);
  });

app
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(process.env.PORT || 3000);
