const url = "https://libraryskill.com/raw/frontend/landing-page-html-dan-css-mobile-first-seo-friendly-lightweight-reusable.md";
fetch(url, {
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Accept": "text/markdown"
  }
})
.then(res => {
  console.log("Status:", res.status, res.statusText);
  return res.text();
})
.then(text => console.log("Content Length:", text.length, "bytes"))
.catch(err => console.error("Error:", err));
