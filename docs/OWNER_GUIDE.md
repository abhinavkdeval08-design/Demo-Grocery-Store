# Owner guide / मालिक गाइड

Update prices and stock from a Google Sheet. No app rebuild needed.
गूगल शीट से दाम और स्टॉक बदलें। ऐप दोबारा बनाने की ज़रूरत नहीं।

## English

1. Open Google Sheets and import `docs/sample-catalog.csv` (File → Import). Keep the header row exactly as is.
2. Columns: `id` (unique, never change it), `name`, `unit`, `price`, `mrp` (optional, shown only if higher than price), `category`, `image` (full https link, optional), `inStock` (`yes` / `no`), `description` (optional).
3. Publish: File → Share → Publish to web → choose your sheet tab → format **Comma-separated values (.csv)** → Publish. Copy the link.
4. Ask your developer to paste that link in `config/store.ts` as `catalogUrl` (one time only), then build the app.
5. After that, just edit the sheet. Customers get the new prices the next time they open the app or pull down on the Shop screen (Google can take a few minutes to publish edits).

Notes:
- Rows with a missing id, name or a price of zero are ignored (the rest still load).
- Items marked `no` are removed from customers' carts. Price changes are applied to carts automatically.
- Without internet the app shows the last saved prices.

## हिन्दी

1. Google Sheets खोलें और `docs/sample-catalog.csv` इम्पोर्ट करें। पहली लाइन (हेडर) वैसी ही रखें।
2. कॉलम: `id` (हर प्रोडक्ट का अलग, कभी न बदलें), `name`, `unit`, `price`, `mrp` (ज़रूरी नहीं), `category`, `image` (https लिंक, ज़रूरी नहीं), `inStock` (`yes` या `no`), `description`।
3. File → Share → Publish to web → अपनी शीट चुनें → **CSV** चुनें → Publish। लिंक कॉपी करें।
4. यह लिंक अपने डेवलपर से `config/store.ts` में `catalogUrl` में एक बार डलवाएं।
5. इसके बाद सिर्फ़ शीट में दाम बदलें। ग्राहकों को अगली बार ऐप खोलने या Shop स्क्रीन पर नीचे खींचने पर नए दाम दिखेंगे।

ध्यान दें: `inStock = no` वाले सामान ग्राहकों के कार्ट से हट जाते हैं। इंटरनेट न हो तो पिछले सेव किए दाम दिखते हैं।
