import CreditDigital, { ICheckoutPayload } from "../index";

test("default minimumAmount is set", () => {
  const creditDigital = new CreditDigital();

  expect(creditDigital.minimumAmount).toEqual(250);
});

test("setMinimumAmount changes the amount if it is higher than the minimum by CreditDigital", () => {
  const creditDigital = new CreditDigital();
  const minimumAmount = 500;

  creditDigital.setMinimumAmount(minimumAmount);

  expect(creditDigital.minimumAmount).toEqual(minimumAmount);
});

test("setMinimumAmount does not change the amount if it is lower than the minimum by CreditDigital", () => {
  const creditDigital = new CreditDigital();
  const minimumAmount = 249;

  creditDigital.setMinimumAmount(minimumAmount);

  expect(creditDigital.minimumAmount).toEqual(250);
});
test("productListingMonthlyRate when product price is less than the minimumAmount", () => {
  const creditDigital = new CreditDigital();

  expect(creditDigital.productListingMonthlyRate(5)).toEqual("0.00");
});

test("productListingMonthlyRate when product price is a simple number", () => {
  const creditDigital = new CreditDigital();

  expect(creditDigital.productListingMonthlyRate(1000)).toEqual("94.70");
});

test("displays a message about the monthly price for the product price", () => {
  const creditDigital = new CreditDigital();
  const targetNode = "product-listing";

  document.body.innerHTML = `<div id="${targetNode}"></div>`;
  creditDigital.productListingHtml(`#${targetNode}`, creditDigital.minimumAmount);

  const textNode = document.querySelector(".creditdigital-monthly-rate__amount") as HTMLElement;

  expect(textNode.textContent).toEqual("Or pay as little as £23.68 per month");
});

test("displays a message about product total price being less than the minimum", () => {
  const creditDigital = new CreditDigital();
  const targetNode = "product-listing";

  document.body.innerHTML = `<div id="${targetNode}"></div>`;
  creditDigital.productListingHtml(`#${targetNode}`, creditDigital.minimumAmount - 1);

  const textNode = document.querySelector(".creditdigital-monthly-rate__amount") as HTMLElement;

  expect(textNode.textContent).toEqual("Monthly repayment plans are available for purchases over £250");
});

test("checkout flow", () => {
  const creditDigital = new CreditDigital();
  const targetNode = "checkout";
  const payload = { cashPrice: 500, businessToken: "amazing token" };
  const callback = (url: string) => {
    encodedUrl = url;
  };
  let encodedUrl = "";

  document.body.innerHTML = `<div id="${targetNode}"></div>`;
  creditDigital.checkoutHtml(`#${targetNode}`, payload, callback);

  const checkoutBtn = document.getElementById("credit-digital-checkout") as HTMLElement;
  checkoutBtn.click();

  expect(encodedUrl).toEqual(
    "https://www.creditdigital.co.uk/loans/new?cash_price=500&business_token=amazing%20token&plugin_source=localhost",
  );
});
