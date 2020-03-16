const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

/**
* An HTTP endpoint that acts as a webhook for Stripe charge.failed event
* @param {object} event
* @param {object} charge
* @returns {object} result Your return value
*/
module.exports = async (event, charge) => {

  // Store API Responses
  const result = {stripe: {}, microsoftteams: {}};

  result.stripe.customer = await lib.stripe.customers['@0.1.3'].identify({
    id: `${charge.customer}`
  });

  let chargeAmount = '$' + (charge.amount / 100).toFixed(2);
  let stripeDashboardLink = `https://dashboard.stripe.com${event.livemode ? '/' : '/test/'}charges/${charge.id}/`;
  
  result.microsoftteams.returnValue = await lib.microsoftteams.messages['@0.0.2'].create({
    channel: `General`,
    body: [
      `[**Stripe Charge Failure**](${stripeDashboardLink})`,
      `We were unable to process a charge for [*${result.stripe.customer.email}*](mailto:${result.stripe.customer.email}).`,
      `**Amount:** ${chargeAmount}`
    ].join('<br>')
  });
  

  return result;

};