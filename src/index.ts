
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
  public static productHTML: string;
  public static productCSS: string;

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
    style.innerHTML = CreditDigital.productCSS;
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
      node.innerHTML = CreditDigital.productHTML.replace(
        "%s",
        `Monthly repayment plans are available for purchases over <span class="creditdigital-monthly-rate__price">&pound;${this.minimumAmount}</span>`,
      );
    } else {
      node.innerHTML = CreditDigital.productHTML.replace(
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

    if (data.cashPrice < this.minimumAmount) {
      return;
    }

    if (!node) {
      return;
    }

    node.innerHTML = `
      <a style="color: black; cursor: pointer;" class="creditdigital-checkout">
        <img src="https://d3h637fkwxijuq.cloudfront.net/creditdigital-logo-transparent.png" title="credit digital logo" width="50" class="creditdigital-checkout__logo" />
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
