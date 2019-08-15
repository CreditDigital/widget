import CreditDigital from "./index.ts";
import fs from "fs";
CreditDigital.productHTML = fs.readFileSync(__dirname + "/product_listing.html", "utf-8");
CreditDigital.productCSS = fs.readFileSync(__dirname + "/../dist/product_listing.css", "utf-8");

window.CreditDigital = CreditDigital;
