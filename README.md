# CreditDigital JS Widget
To be able to use this widget you must have an account with CreditDigital. If you don't have one, please [sign up](https://www.creditdigital.co.uk/business).

The widget has no external dependencies 🎉

## Basic usage
The widget provides:
- A information box with the monthly finance price given a price. This can be used both on product page and on the checkout.
- A "Checkout with CreditDigital" button for checkout pages.

### Installation
You can pull the source code from https://unpkg.com/creditdigital-widget@0.0.2/dist/index.js. You can either vendor the code or put it in a `script` tag.
```html
<script src="https://unpkg.com/creditdigital-widget@0.0.2/dist/index.js"></script>
```

### Monthy pricing box
To make the monthly pricing box appear:
```javascript
var creditDigital = new CreditDigital();
var targetNode = "#my-id"; // The node on which the monthly pricing box to appear
var price = 1000; // The total amount for monthly finance

creditDigital.productListingHtml(targetNode, price);
```

### Checkout

For the checkout page:
```javascript
var creditDigital = new CreditDigital();
var targetNode = "#my-id"; // The node on which the checkout button to appear
var options = { cash_price: 1000, business_token: "abc-123", } // The required data for the widget

creditDigital.checkoutHtml(targetNode, options);
```
By default, when a user clicks on the checkout button, they will be redirect to CreditDigital to start the application process.

### Customize the callback
You can pass your own callback to the `.checkoutHtml` which will override the redirect to CreditDigital when the checkout button is clicked. Your callback function will receive the full encoded url for the CreditDigital application.
```javascript
var creditDigital = new CreditDigital();
var targetNode = "#my-id"; // The node on which the checkout button to appear
var options = { cash_price: 1000, business_token: "abc-123", } // The required data for the widget
var myCallback = function (url) {
  // Do something with the URL
  console.log(url);
}

creditDigital.checkoutHtml(targetNode, options, myCallback);
```


### Possible options for checkout
The available options to pass on the checkout are:
- `cashPrice` (number : required): The total amount of the purchase
- `businessToken` (string : required): The token identifier for your business. You are able to retrieve this from your CreditDigital dashboard.
- `callbackUrl` (string : optional): A webhook url to keep you informed on the status of a particular application.
- `invoiceNumber` (string : optional): An invoice number to be attached to the CreditDigital application for your reference.
- `invoiceDescription` (string : optional): An invoice description to be attached to the CreditDigital application for your reference.

### Minimum Amount
CreditDigital by default imposes a £250 minimum amount. If the total amount of a product or checkout is less than the minimum amount the checkout button will not appear and the product listing box will inform the user about the minimum.

You can change the minimumAmount to fit your requirements as long as it's more than the CreditDigital imposed one:
```javascript
var creditDigital = new CreditDigital();
creditDigital.setMinimumAmount(300);
```

### CSS rules
CreditDigital by default, will inject default styles for the product listing box. You can opt-out via:
```javascript
creditDigital = new CreditDigital({ skipCSSInjection: true })
```

*Note: You might want to opt-out in the checkout page if you are not planning to display the product listing container.*

If you prefer to override some or all of the styles to make the resulting HTML match the look and fill of your website, these are the classes you can override:

```css
/* The main widget container */
.creditdigital {}

/* Controls the container that displays the monthly price and logo */
.creditdigital-monthly-rate {}

/* Controls the element with the monthly rate content */
.creditdigital-monthly-rate__amount {}

/* Controls the logo */
.creditdigital-monthly-rate__logo {}

/* Controls the container around the description of CreditDigital and the overall product */
.creditdigital-description {}

/* Controls each paragraph around the description of CreditDigital */
.creditdigital-description__content {}
```

## Advance Usage
If the above does not fit your application's constraints or architecture, you can still use the plugin to get the necessary information.

### Get the monthly price
You can call `.productListingMonthlyRate` to get the monthly price for a product. A `React` example would be
```javascript
import React from "react";
import CreditDigital from "creditdigital-widget";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.creditDigital = new CreditDigital({ skipCSSInjection: true });
  }

  render() {
    return <p>The monthly price will be { this.creditDigital.productListingMonthlyRate(props.totalAmount) }</p>;
  }
}
```

*Note: If you the amount passed in is less than the minimumAmount, a "0.00" will be returned*

### Checkout without the checkout button
You can build your own checkout experience as long as you make a `GET` request to CreditDigital at the end. Remember to encode the URL.
```javascript
import React from "react";
import CreditDigital from "creditdigital-widget";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.creditDigital = new CreditDigital({ skipCSSInjection: true });
  }

  render() {
    const href = encodeURI(`${this.creditDigital.creditDigitalURL}?cash_price=500&business_token=abc123`);

    return <a href={`${href}`} target="_blank">Checkout with CreditDigital</a>;
  }
}
```

