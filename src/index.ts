const MINIMUM_AMOUNT_BY_CREDITDIGITAL = 250;
const DURATION_OF_TERM_IN_MONTHS = 12;
const INTEREST_RATE = 0.02025;
const CREDIT_DIGITAL_URL = "https://www.creditdigital.co.uk/loans/new";

export interface ICheckoutPayload {
  [index: string]: any;
  cashPrice: number;
  businessToken: string;
  callbackUrl?: string;
  invoiceDescription?: string;
  invoiceNumber?: string;
}

const productHTML = `
<section class='creditdigital'>
  <div class='creditdigital-monthly-rate'>
    <p class='creditdigital-monthly-rate__amount'>%s</p>
    <img alt='pay monthly' class='creditdigital-monthly-rate__logo' src='https://widget.creditdigital.co.uk/CD_logo.png'>
  </div>
  <div class='creditdigital-description'>
    <p class='creditdigital-description__content'><a href="https://www.creditdigital.co.uk" target="_blank">CreditDigital</a> allows you to split the cost of your purchase into monthly installments.</p>
    <p class='creditdigital-description__content'>Simply select CreditDigital as your payment method at checkout to apply! Rates start at <span class="creditdigital-description__interest-rate">1.2%</span> monthly and vary depending on the credit profile of your business. Repay in full at any time and only be charged up to the day of repayment.</p>
  </div>
</section>
`;

const productCSS = `
.creditdigital {
  border: 1px solid #ccc;
}

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

.creditdigital-monthly-rate__price {
  font-weight: bold;
}

.creditdigital-monthly-rate__logo {
  display: block;
  max-width: 100px;
  float: right;
}

.creditdigital-description {
  background: #f4f4f4;
  padding: 8px;
}

.creditdigital-description__content {
  margin: 0;
}

.creditdigital-description__content:first-child {
  padding-bottom: 20px;
}

.creditdigital-description__interest-rate {}

.creditdigital-checkout {
  display: inline-flex;
  align-items: center;
  margin: 0;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  background-image: none;
  border: 1px solid transparent;
  padding: 2px 12px;
  border-radius: 8px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-transform: none;
  text-decoration: none;
  border-color: rgba(127, 127, 127, 0.4);;
  color: #363636;
  background: rgba(224, 224, 224, 0.5);
}

.creditdigital-checkout:hover {
  color: #363636;
  text-decoration: none;
}

.creditdigital-checkout__logo {
  padding-right: 6px;
}
`;

const fallbackCheckoutCallback = (url: string) => {
  location.href = url;
};

const camelToSnake = (s: string): string => {
  return s
    .replace(/[\w]([A-Z])/g, (m: string): string => {
      return m[0] + "_" + m[1];
    })
    .toLowerCase();
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

    if (options && options.skipCSSInjection) {
      return;
    }
    const style = document.createElement("style");
    style.innerHTML = productCSS;
    document.body.appendChild(style);
  }

  public setMinimumAmount(minimumAmount: number) {
    if (minimumAmount < MINIMUM_AMOUNT_BY_CREDITDIGITAL) {
      console.warn(`Minimum amount cannot be lower than £${MINIMUM_AMOUNT_BY_CREDITDIGITAL}`);
    } else {
      this.minimumAmount = minimumAmount;
    }
  }

  public productListingMonthlyRate(productPrice: number): string {
    if (productPrice < this.minimumAmount) {
      return "0.00";
    }

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
        "%s",
        `Monthly repayment plans are available for purchases over <span class="creditdigital-monthly-rate__price">&pound;${this.minimumAmount}</span>`,
      );
    } else {
      node.innerHTML = productHTML.replace(
        "%s",
        `Or pay as little as <span class="creditdigital-monthly-rate__price">&pound;${monthlyPrice}</span> per month`,
      );
    }
  }

  public checkoutHtml(targetNode: string, data: ICheckoutPayload, checkoutCallback?: (_: string) => any) {
    const node = document.querySelector(targetNode);
    const callback = checkoutCallback || fallbackCheckoutCallback;

    if (!data.businessToken) {
      console.warn("[CreditDigital Widget] businessToken is required");
      return;
    }

    if (data.cash_price < this.minimumAmount) {
      return;
    }

    if (!node) {
      return;
    }

    node.innerHTML = `
        <a href="https://www.creditdigital.co.uk" class="creditdigital-checkout">
          <img src="https://creditdigital-widget.s3.eu-west-2.amazonaws.com/creditdigital-logo-transparent.png" title="credit digital logo" width="50" class="creditdigital-checkout__logo" />
          Pay in instalments
      </a>`;

    const checkoutImg = document.querySelector(targetNode) as HTMLElement;
    if (!checkoutImg) {
      return;
    }

    data.plugin_source = window.location.host;

    const queryParams: string[] = [];

    Object.keys(data).forEach(key => {
      queryParams.push(`${camelToSnake(key)}=${data[key]}`);
    });

    const encodedUrl = encodeURI(`${this.creditDigitalURL}?${queryParams.join("&")}`);

    checkoutImg.addEventListener("click", _ => callback(encodedUrl));
  }
}
