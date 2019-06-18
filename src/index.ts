const MINIMUM_AMOUNT_BY_CREDITDIGITAL = 250;
const DURATION_OF_TERM_IN_MONTHS = 12;
const INTEREST_RATE = 0.02025;
const CREDIT_DIGITAL_URL = 'https://www.creditdigital.co.uk/loans/new';

export interface ICheckoutPayload {
  [index: string]: any;
  cash_price: number;
  business_token: string;
  callback_url?: string;
  invoice_description?: string;
  invoice_number?: string;
}

const productHTML = `
<section id='credit-digital-product-listing'>
  <div class='creditdigital-monthly-rate'>
    <p class='creditdigital-monthly-rate__amount'>%s</p>
    <img alt='pay monthly' class='creditdigital-monthly-rate__logo' src='https://widget.creditdigital.co.uk/CD_logo.png'>
  </div>
  <div class='creditdigital-description'>
    <p class='creditdigital-description__content'>CreditDigital allows you to split the cost of your purchase into monthly installments.</p>
    <p class='creditdigital-description__content'>Simply select CreditDigital as your payment [method] at checkout to apply! Rates start at 1.2% monthly and vary depending on the credit profile of your business.</p>
    <p class='creditdigital-description__content'>Repay in full at any time and only be charged up to the day of repayment.</p>
  </div>
</section>
`;

const productCSS = `
.creditdigital-monthly-rate {
  padding: 8px;
}

.creditdigital-monthly-rate:after {
  content: "";
  clear: both;
  display: table;
}

.creditdigital-monthly-rate__amount {
  float: left;
  margin: 0;
}

.creditdigital-monthly-rate__logo {
  display: block;
  max-width: 100px;
  float: right;
}

.creditdigital-description {
  background: #f4f4f4;
  padding: 8px;
  border: 1px solid #ccc;
}

.creditdigital-description__content {
  margin: 0;
}
`;

const fallbackCheckoutCallback = (url: string) => {
  location.href = url;
};

export default class CreditDigital {
  public minimumAmount: number;
  public readonly creditDigitalURL: string;
  public readonly interestRate: number;
  public readonly durationOfTermInMonths: number;

  constructor(options?: { skipCSSInjection?: boolean }) {
    this.minimumAmount = MINIMUM_AMOUNT_BY_CREDITDIGITAL;
    this.durationOfTermInMonths = DURATION_OF_TERM_IN_MONTHS;
    this.interestRate = INTEREST_RATE;
    this.creditDigitalURL = CREDIT_DIGITAL_URL;

    if (options && !options.skipCSSInjection) {
      const style = document.createElement('style');
      style.innerHTML = productCSS;
      document.body.appendChild(style);
    }
  }

  public setMinimumAmount(minimumAmount: number) {
    if (minimumAmount < MINIMUM_AMOUNT_BY_CREDITDIGITAL) {
      console.warn(`Minimum amount cannot be lower than £${MINIMUM_AMOUNT_BY_CREDITDIGITAL}`);
    } else {
      this.minimumAmount = minimumAmount;
    }
  }

  public productListingMonthlyRate(productPrice: number): string {
    const monthlyRate =
      (productPrice * this.interestRate * Math.pow(1 + this.interestRate, this.durationOfTermInMonths)) /
      (Math.pow(1 + this.interestRate, this.durationOfTermInMonths) - 1);

    return monthlyRate.toFixed(2);
  }

  public productListingHtml(targetNode: string, productPrice: number) {
    const node = document.querySelector(targetNode) as HTMLElement;

    if (!node) {
      return;
    }

    const monthlyPrice = this.productListingMonthlyRate(productPrice);

    if (productPrice < this.minimumAmount) {
      node.innerHTML = productHTML.replace(
        '%s',
        `Monthly repayment plans are available for purchases over <strong>&pound;${this.minimumAmount}</strong>`,
      );
    } else {
      node.innerHTML = productHTML.replace('%s', `Or pay as little as <strong>&pound;${monthlyPrice}</strong>`);
    }
  }

  public checkoutHtml(targetNode: string, data: ICheckoutPayload, checkoutCallback?: (_: string) => any) {
    const node = document.querySelector(targetNode);
    const callback = checkoutCallback || fallbackCheckoutCallback;

    if (data.cash_price < this.minimumAmount) {
      return;
    }
    if (!node) {
      return;
    }

    node.innerHTML = `<div>
        <a style="color:black;cursor:pointer;" id="credit-digital-checkout">
          <img src="https://widget.creditdigital.co.uk/paywithcd.png" alt="pay monthly with CreditDigital" />
        </a>
      </div>`;

    const checkoutImg = document.querySelector(targetNode) as HTMLElement;
    if (!checkoutImg) {
      return;
    }

    data.plugin_source = window.location.host;

    const queryParams: string[] = [];

    Object.keys(data).forEach(key => {
      queryParams.push(`${key}=${data[key]}`);
    });

    const encodedUrl = encodeURI(`${this.creditDigitalURL}?${queryParams.join('&')}`);

    checkoutImg.addEventListener('click', _ => callback(encodedUrl));
  }
}
