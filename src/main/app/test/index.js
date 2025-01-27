const fetch = require("node-fetch");
const cheerio = require("cheerio");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const submitVehicleSearch = async () => {
  const formUrl = "https://vehicle-search.gov.je";
  const searchUrl = "https://vehicle-search.gov.je/search";

  try {
    // Step 1: Fetch the form HTML
    const formResponse = await fetch(formUrl, {
        headers: {
            "Host": "vehicle-search.gov.je",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        }
    });

    

    if (!formResponse.ok) {
      throw new Error(`Failed to fetch form: ${formResponse.status} ${formResponse.statusText}`);
    }
    const formHtml = await formResponse.text();

    const cookies = formResponse.headers.get('set-cookie');
console.log('Captured Cookies:', cookies);

// Step 2: Parse cookies if necessary (optional)
let parsedCookies = '';
if (cookies) {
    parsedCookies = cookies.split(';').map(cookie => cookie.trim()).join('; ');
}2

    // Step 2: Parse the HTML to extract the CSRF token using Cheerio
    const $ = cheerio.load(formHtml);
    const csrfToken = $('input[name="_csrf"]').val();

    if (!csrfToken) {
      throw new Error("CSRF token not found in the HTML");
    }

    // Step 3: Prepare the form data
    const formData = new URLSearchParams();
    formData.append("_csrf", csrfToken);
    formData.append("plate", "J121551");
    console.log("csrf is " + csrfToken);
    // Step 6: Submit the form via POST
    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
       "Host": "vehicle-search.gov.je",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Referer": "https://vehicle-search.gov.je/", // Add Referer header
        "Origin": "https://vehicle-search.gov.je", // Add Origin header
        "Cookie": parsedCookies
      },
      body: formData.toString()
    });

    if (response.ok) {
      const result = await response.text(); // Or use .json() if the response is JSON
      console.log("Response:", result);
    } else {
      console.error("Failed to fetch:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Run the function
submitVehicleSearch();
