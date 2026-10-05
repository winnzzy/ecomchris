import './style.css';
import { api, business } from './api.js';
import { cart } from './store.js';

const LOGO_MARK = 'data:image/png;base64,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';
const products = api.getProducts();
const categories = api.getCategories();

const app = document.querySelector('#app');
const image = (id,w=900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
const responsiveImage = (id, sizes) => `srcset="${[320,480,700,1000,1400].map(w=>`${image(id,w)} ${w}w`).join(', ')}" sizes="${sizes}" decoding="async"`;
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:business.currency}).format(n);
const path = () => window.location.pathname.replace(/\/$/,'') || '/';
const slug = path();
const title = (text, eyebrow='THE DETAILS') => `<section class="page-heading wrap"><p class="eyebrow">${eyebrow}</p><h1>${text}</h1></section>`;
const review = (label) => `<span class="review">${label} to be confirmed by the business</span>`;
const productCard = p => `<article class="product-card" data-category="${p.category}"><button class="product-image" data-detail="${p.id}" aria-label="View ${p.name}"><img src="${image(p.image,700)}" ${responsiveImage(p.image, "(max-width: 650px) 45vw, (max-width: 900px) 44vw, 30vw")} width="700" height="875" loading="lazy" alt="${p.name}"/><span class="view-tag">View details</span></button><div class="product-meta"><span>${p.category}</span><button class="quick-add" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div><h3><button data-detail="${p.id}">${p.name}</button></h3><p class="price">${money(p.price)}</p></article>`;
const footer = `<footer class="footer"><div class="wrap footer-grid"><div><a class="logo footer-logo" href="/" aria-label="Socyn Crest home"><img class="logo-img" src="${LOGO_MARK}" alt="Socyn Crest logo"/><span>SOCYN CREST</span></a><p>Clothing & textiles, chosen with care.</p><small>Operated by ${business.legalName}</small></div><div><h4>Explore</h4><a href="/shop">Shop all</a><a href="/shop#Men">Men</a><a href="/shop#Women">Women</a><a href="/shop#Outerwear">Outerwear</a><a href="/contact">Contact</a></div><div><h4>Customer care</h4><a href="/shipping">Shipping policy</a><a href="/returns">Cancellation & refunds</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms & conditions</a></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} ${business.legalName}. All rights reserved.</span><span class="footer-fine"><span>Clothing & textiles for every day.</span><a href="/admin">Admin</a></span></div></footer>`;
const header = `<div class="announcement"><span id="announce-text">Clothing & textiles · The new season collection</span><span aria-hidden="true"> ✦</span></div><header class="site-header"><div class="wrap nav"><a class="logo" href="/" aria-label="Socyn Crest home"><img class="logo-img" src="${LOGO_MARK}" alt="Socyn Crest logo"/><span>SOCYN CREST</span></a><nav class="desktop-nav" aria-label="Main navigation"><a href="/" ${slug==='/'?'aria-current="page"':''}>Home</a><a href="/shop" ${slug==='/shop'?'aria-current="page"':''}>Shop</a><a href="/contact" ${slug==='/contact'?'aria-current="page"':''}>Contact</a></nav><div class="nav-actions"><button id="bag-trigger" aria-label="Open bag">Bag <span id="bag-count">0</span></button><button id="menu-trigger" class="menu-trigger" aria-expanded="false" aria-controls="mobile-nav" aria-label="Toggle menu"><span></span><span></span></button></div></div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="/">Home</a><a href="/shop">Shop</a><a href="/contact">Contact</a><a href="/shipping">Shipping</a><a href="/returns">Returns</a></nav></header>`;

const catTiles = [
  {name:'Men', image:'photo-1576566588028-4147f3842f27', blurb:'Tees, denim & staples'},
  {name:'Women', image:'photo-1595777457583-95e059d581b8', blurb:'Dresses, knits & more'},
  {name:'Outerwear', image:'photo-1591047139829-d91aecb6caea', blurb:'Layers with attitude'},
];
const lookImages = [
  {id:'photo-1523381210434-271e8be1f52b', caption:'The everyday rail'},
  {id:'photo-1602810318383-e386cc2a3ccf', caption:'Pressed & ready'},
  {id:'photo-1434389677669-e08b4cac3105', caption:'Artisan knits'},
  {id:'photo-1556821840-3a63f95609a7', caption:'Weekend uniform'},
  {id:'photo-1445205170230-053b83016050', caption:'In the studio'},
  {id:'photo-1620799140408-edc6dcb6d633', caption:'Staples, styled'},
];

function home(){return `
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow hero-line">${business.legalName.toUpperCase()} · CLOTHING & TEXTILES</p>
    <h1 aria-label="Dress well, every day."><span class="h-line"><span>Dress well,</span></span> <span class="h-line"><span><em>every day.</em></span></span></h1>
    <p class="hero-sub hero-line">${business.legalName} is a clothing and textile retailer offering wardrobe essentials and quality fabrics — designed for comfort, made to last. Browse the collection and find your fit.</p>
    <p class="dba-line hero-line">Operated by <strong>${business.legalName}</strong></p>
    <div class="hero-cta hero-line"><a class="button button-light magnetic" href="/shop">Shop the collection <span aria-hidden="true">↗</span></a><a class="ghost-link" href="/shop#Women">New in: women <span aria-hidden="true">↓</span></a></div>
    <div class="hero-bottom hero-line"><span>THE NEW SEASON</span><span>CLOTHING & TEXTILES</span></div>
  </div>
  <div class="hero-art">
    <img src="${image('photo-1445205170230-053b83016050',1400)}" ${responsiveImage("photo-1445205170230-053b83016050", "(max-width: 650px) 100vw, 52vw")} fetchpriority="high" width="1400" height="1400" alt="Curated clothing rail at Socyn Crest"/>
    <div class="hero-badge" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs><text><textPath href="#circ">SOCYN CREST • NEW SEASON • SOCYN CREST • NEW SEASON •</textPath></text></svg><span>✦</span></div>
    <span class="hero-caption">The new season edit</span>
  </div>
</section>
<section class="marquee" aria-label="Our approach"><div>NEW SEASON <span>✳</span> CLOTHING & TEXTILES <span>✳</span> WARDROBE ESSENTIALS <span>✳</span> NEW SEASON <span>✳</span> CLOTHING & TEXTILES <span>✳</span></div></section>
<section class="section wrap">
  <div class="section-top"><div><p class="eyebrow">SHOP BY CATEGORY</p><h2>Find your <em>lane.</em></h2></div><a class="text-link" href="/shop">Shop all products <span aria-hidden="true">↗</span></a></div>
  <div class="cat-grid">${catTiles.map((c,i)=>`<a class="cat-tile reveal" style="transition-delay:${i*0.08}s" href="/shop#${c.name}"><span class="cat-img"><img src="${image(c.image,800)}" ${responsiveImage(c.image,"(max-width: 650px) 90vw, 30vw")} width="800" height="1000" loading="lazy" alt="${c.name} collection"/></span><span class="cat-label"><span><strong>${c.name}</strong><em>${c.blurb}</em></span><span class="cat-arrow" aria-hidden="true">↗</span></span></a>`).join('')}</div>
</section>
<section class="section wrap bestsellers">
  <div class="section-top"><div><p class="eyebrow">MOST LOVED</p><h2>The pieces <em>everyone asks about.</em></h2></div><a class="text-link" href="/shop">View everything <span aria-hidden="true">↗</span></a></div>
  <div class="products-grid">${products.slice(0,4).map(productCard).join('')}</div>
</section>
<section class="features"><div class="wrap features-grid">
  <div class="reveal"><span class="promise-icon">✦</span><h3>Free shipping over $75</h3><p>Standard delivery is on us when your bag hits $75.</p></div>
  <div class="reveal" style="transition-delay:.08s"><span class="promise-icon">◇</span><h3>30-day returns</h3><p>Unworn, tags on, no interrogation. Easy.</p></div>
  <div class="reveal" style="transition-delay:.16s"><span class="promise-icon">✳</span><h3>Fabrics that last</h3><p>Every textile is picked for feel, fit, and staying power.</p></div>
  <div class="reveal" style="transition-delay:.24s"><span class="promise-icon">↗</span><h3>Secure checkout soon</h3><p>Our full online checkout is on the way. Stay tuned.</p></div>
</div></section>
<section class="lookbook">
  <div class="wrap section-top"><div><p class="eyebrow">THE LOOKBOOK</p><h2>Worn <em>everywhere.</em></h2></div><span class="drag-hint" aria-hidden="true">Scroll →</span></div>
  <div class="look-track">${lookImages.map(l=>`<figure class="look-card"><img src="${image(l.id,640)}" ${responsiveImage(l.id,"60vw")} width="640" height="800" loading="lazy" alt="${l.caption}"/><figcaption>${l.caption}</figcaption></figure>`).join('')}</div>
</section>
<section class="story"><div class="story-photo"><img src="${image('photo-1558769132-cb1aea458c5e',1200)}" ${responsiveImage("photo-1558769132-cb1aea458c5e", "(max-width: 650px) 100vw, 50vw")} width="1200" height="1200" loading="lazy" alt="Rail of curated garments in soft neutral tones"/></div><div class="story-copy"><p class="eyebrow">FROM FABRIC TO FIT</p><h2>Quality you can <em>feel.</em></h2><p>Every piece at Socyn Crest is chosen for its fabric, fit, and finish — everyday clothing and textiles made to be worn on repeat, season after season.</p><a class="button button-dark magnetic" href="/shop">Browse the collection <span aria-hidden="true">↗</span></a></div></section>
<section class="stats"><div class="wrap stats-grid">
  <div class="reveal"><strong><span class="count" data-count="10">0</span>+</strong><span>Curated styles</span></div>
  <div class="reveal" style="transition-delay:.08s"><strong><span class="count" data-count="50">0</span></strong><span>States we ship to</span></div>
  <div class="reveal" style="transition-delay:.16s"><strong><span class="count" data-count="30">0</span></strong><span>Day return promise</span></div>
  <div class="reveal" style="transition-delay:.24s"><strong>$<span class="count" data-count="75">0</span>+</strong><span>Free standard shipping</span></div>
</div></section>
<section class="section wrap">
  <div class="section-top"><div><p class="eyebrow">FRESH THIS WEEK</p><h2>New <em>arrivals.</em></h2></div><a class="text-link" href="/shop">Shop all products <span aria-hidden="true">↗</span></a></div>
  <div class="products-grid">${products.slice(4,8).map(productCard).join('')}</div>
</section>
<section class="newsletter wrap"><div class="news-card reveal">
  <p class="eyebrow">THE CREST LIST</p>
  <h2>Be first to know about <em>new drops.</em></h2>
  <p>New arrivals, restocks, and the occasional good thing. Straight to your inbox.</p>
  <form id="news-form"><label class="sr-only" for="news-email">Email address</label><input id="news-email" type="email" required placeholder="you@example.com" autocomplete="email"/><button class="button button-light" type="submit">Join the list</button></form>
  <p class="fineprint">One email a month. No spam, unsubscribe anytime.</p>
</div></section>
<section class="cta"><p class="eyebrow">TAKE A LOOK AROUND</p><h2>Your next favorite is <em>waiting.</em></h2><a class="button button-light magnetic" href="/shop">View all products <span aria-hidden="true">↗</span></a></section>`}

function shop(){return `${title('Shop the collection.','CLOTHING & TEXTILES')}<section class="wrap shop-intro"><p>Browse clothing and textiles from ${business.legalName} — everyday essentials with clear, honest prices.</p><div class="catalog-tools"><label class="search-box"><span class="sr-only">Search products</span><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><input id="product-search" type="search" placeholder="Search the collection" autocomplete="off"/></label><label class="sort-box">Sort by <select id="product-sort"><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name: A to Z</option></select></label></div><div class="filters" role="group" aria-label="Filter products"><button class="active" data-filter="All" aria-pressed="true">All <span>(${products.length})</span></button>${categories.map(c=>`<button data-filter="${c}" aria-pressed="false">${c}</button>`).join('')}</div><p id="result-count" class="result-count" role="status">Showing ${products.length} products</p><div class="products-grid shop-grid" id="shop-results">${products.map(productCard).join('')}</div><div class="empty" hidden><span>◇</span><h2>No matches yet.</h2><p>Try a different search or browse the full collection.</p><button id="clear-search" class="button button-dark">Clear search</button></div></section>`}

function contact(){return `${title('Let’s talk.','GET IN TOUCH')}<section class="wrap contact-layout"><div class="contact-lead"><h2>Here to help.</h2><p>Questions about sizing, an order, or our policies? Reach ${business.legalName} using the details below.</p><div class="contact-block"><span>PHONE</span>${business.phone?`<a href="tel:${business.phone.replace(/[^+\d]/g,'')}">${business.phone}</a>`:review('Phone number')}</div><div class="contact-block"><span>EMAIL</span>${business.email?`<a href="mailto:${business.email}">${business.email}</a>`:review('Email address')}</div><div class="contact-block"><span>BUSINESS ADDRESS</span>${business.address||review('Business address')}</div><div class="contact-block"><span>SUPPORT HOURS</span>${business.supportHours||review('Support hours')}</div></div><aside class="contact-aside"><span class="large-star">✳</span><h3>Good to know</h3><p>For a question about an order, include your order number and the email used at purchase. Please do not send payment card details by email.</p><div class="aside-links"><a href="/shipping">Shipping details <span>↗</span></a><a href="/returns">Cancellations & refunds <span>↗</span></a></div></aside></section>`}

function admin(){return `${title('Admin console.','SOCYN CREST')}<section class="wrap admin"><div class="admin-card reveal visible"><img class="logo-img" src="${LOGO_MARK}" alt="Socyn Crest logo"/><p class="eyebrow">UNDER CONSTRUCTION</p><h2>The admin panel lives here soon.</h2><p>Inventory, orders, customers, and content management for the full Socyn Crest store — all in one place. We're building it now.</p><a class="button button-dark" href="/">Back to the store <span aria-hidden="true">↗</span></a></div></section>`}

function policy(kind){const data={
  '/privacy': ['Privacy policy',`<h2>Information we collect</h2><p>When you browse our site, contact us, or place an order, we may collect your name, email address, phone number, shipping and billing addresses, and order details. If you pay online, your payment information is processed securely by our payment provider — we do not see or store your full card number.</p><h2>How we use your information</h2><p>We use your information to process and deliver orders, respond to inquiries, provide customer support, send order updates, improve our website, and meet our legal and tax obligations. We do not sell your personal information to third parties.</p><h2>Cookies and similar technologies</h2><p>We use a small amount of browser storage to remember the items in your shopping bag on your own device. We do not use advertising cookies. Product images are served by our image host, which may receive basic technical request data when images load.</p><h2>How we share information</h2><p>We share information only as needed to run the store: with payment processors to take payments, with shipping carriers (USPS, UPS, and FedEx) to deliver orders, and with authorities when required by law. We never share your information with third parties for their own marketing.</p><h2>Data security</h2><p>We use reasonable administrative and technical safeguards to protect your information, including secure (HTTPS) connections throughout the site. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.</p><h2>Your choices and rights</h2><p>You may ask us to access, correct, or delete your personal information, subject to applicable law. To make a request, contact us using the details on our <a href="/contact">contact page</a>. You can clear your saved bag at any time through your browser settings.</p><h2>Children's privacy</h2><p>Our website is not directed to children under 13, and we do not knowingly collect their personal information.</p><h2>Changes to this policy</h2><p>We may update this policy from time to time. The latest version will always be posted on this page with its effective date.</p>`],
  '/terms': ['Terms & conditions',`<h2>Welcome</h2><p>These Terms & Conditions govern your use of the Socyn Crest website, operated by ${business.legalName} (“Socyn Crest”, “we”, “us”). By using this site, you agree to these terms.</p><h2>Products and pricing</h2><p>We sell clothing and textiles. Product descriptions and prices are shown in U.S. dollars (USD). We work hard to keep information accurate, but if an error occurs — for example, a mispriced item — we may correct it and cancel affected orders with a full refund.</p><h2>Orders and acceptance</h2><p>Placing an order is an offer to buy. We accept your offer when we confirm it by email. We may decline or cancel an order at any time — for example, if an item is out of stock or we suspect fraud — and will refund any payment taken.</p><h2>Payments</h2><p>Payments are processed securely through our third-party payment provider. We never see or store your full payment card number.</p><h2>Shipping, cancellations, and refunds</h2><p>See our <a href="/shipping">Shipping Policy</a> and <a href="/returns">Cancellation & Refund Policy</a> for processing times, delivery estimates, and return terms. Those policies form part of these terms.</p><h2>Intellectual property</h2><p>All text, images, logos (including the Socyn Crest mark), and designs on this site belong to ${business.legalName} or its licensors and may not be copied or reused without permission.</p><h2>Acceptable use</h2><p>You agree not to misuse this site — for example, by attempting to disrupt it, placing fraudulent orders, or submitting false information.</p><h2>Limitation of liability</h2><p>To the fullest extent permitted by law, ${business.legalName} is not liable for indirect, incidental, or consequential damages arising from your use of this site or our products, except where such a limitation is prohibited by law. Our total liability for any claim is limited to the amount you paid for the product in question.</p><h2>Governing law</h2><p>These terms are governed by the laws of the state in which ${business.legalName} is organized, without regard to conflict-of-law principles.</p><h2>Changes to these terms</h2><p>We may update these terms as our store grows. Continued use of the site after changes take effect means you accept the updated terms.</p><h2>Contact</h2><p>Questions about these terms? Reach us through our <a href="/contact">contact page</a>.</p>`],
  '/returns': ['Cancellation & refund policy',`<h2>Cancelling an order</h2><p>You may cancel your order within 24 hours of placing it, provided it has not yet shipped. To cancel, contact us with your order number. Cancelled orders are refunded in full to the original payment method.</p><h2>Our 30-day return promise</h2><p>If you're not happy with your purchase, you may return unused, unworn items in their original condition — with tags attached and in original packaging — within 30 days of delivery for a refund. Items marked as final sale cannot be returned.</p><h2>How to start a return</h2><p>Contact us with your order number and the items you'd like to return. We'll confirm eligibility and share return instructions, including where to send the items. Customers are responsible for return shipping unless the item arrived damaged, defective, or incorrect.</p><h2>Refund timing</h2><p>Once we receive and inspect your return, approved refunds are issued to the original payment method within 10 business days. Depending on your bank or card issuer, it may take a few additional days for the refund to appear on your statement.</p><h2>Damaged, defective, or wrong items</h2><p>Something wrong with your order? Contact us within 7 days of delivery with your order number and a photo of the issue. We'll make it right with a replacement or a full refund — including return shipping on us.</p><h2>Non-refundable costs</h2><p>Original shipping charges are non-refundable unless the return is due to our error.</p>`],
  '/shipping': ['Shipping policy',`<h2>Where we ship</h2><p>We currently ship to all 50 U.S. states. International shipping is coming soon — contact us if you're ordering from outside the U.S. and we'll do our best to help.</p><h2>Processing time</h2><p>Orders are processed within 2–3 business days (Monday–Friday, excluding public holidays). You'll receive a confirmation email as soon as your order ships.</p><h2>Shipping methods and delivery times</h2><p>We ship with trusted carriers including USPS, UPS, and FedEx:</p><ul><li><strong>Standard shipping (5–7 business days):</strong> $5.95, or FREE on orders over $75</li><li><strong>Express shipping (2–3 business days):</strong> $14.95</li></ul><p>Delivery estimates are counted from the ship date, not the order date.</p><h2>Tracking your order</h2><p>Every order includes tracking. We'll email your tracking number as soon as your order leaves our facility so you can follow it door to door.</p><h2>Shipping address</h2><p>Please double-check your shipping address at checkout — we can't reroute packages once they've shipped. If you notice a mistake, contact us immediately and we'll try to help before dispatch.</p><h2>Delays and lost packages</h2><p>Carriers occasionally experience delays beyond our control, especially during peak seasons or severe weather. If your tracking hasn't updated within 7 days past the estimated delivery date, contact us and we'll investigate with the carrier.</p><h2>Questions</h2><p>See our <a href="/contact">contact page</a> — we're happy to help with anything about your delivery.</p>`]
}; const [heading,sections]=data[kind];return `${title(heading,'CUSTOMER INFORMATION')}<article class="wrap policy"><div class="policy-meta"><span>${business.legalName}</span><span>Last updated ${business.updated}</span></div>${sections}<div class="policy-end">Have a question? <a href="/contact">Get in touch ↗</a></div></article>`}

function notFound(){return `${title('Page not found.','404')}<section class="wrap not-found"><p>We couldn’t find that page.</p><a class="button button-dark" href="/">Back to home</a></section>`}

const pages={'/':home,'/shop':shop,'/contact':contact,'/admin':admin,'/privacy':()=>policy('/privacy'),'/terms':()=>policy('/terms'),'/returns':()=>policy('/returns'),'/shipping':()=>policy('/shipping')};
app.innerHTML = `<a href="#main" class="skip-link">Skip to content</a>${header}<main id="main" tabindex="-1">${(pages[slug]||notFound)()}</main>${footer}<div class="overlay" id="overlay" hidden></div><aside class="drawer" id="bag-drawer" aria-label="Shopping bag" aria-modal="true" role="dialog" hidden><div class="drawer-head"><div><span class="eyebrow">YOUR SELECTION</span><h2>Shopping bag</h2></div><button class="close" id="bag-close" aria-label="Close bag">×</button></div><div id="bag-items"></div><div class="drawer-foot"><div class="total"><span>Subtotal</span><strong id="bag-total">$0.00</strong></div><p>Our online checkout is coming soon — to place an order today, please contact us directly.</p><a href="/contact" class="button button-dark">Contact us <span>↗</span></a></div></aside><div class="modal" id="product-modal" role="dialog" aria-modal="true" aria-label="Product details" hidden></div><div class="toast" id="toast" role="status" aria-live="polite"></div>`;
document.title = `${slug==='/'?'Clothing & textiles':slug==='/shop'?'Shop':slug==='/contact'?'Contact':slug==='/admin'?'Admin console':slug==='/returns'?'Cancellation & refunds':slug==='/shipping'?'Shipping policy':slug==='/privacy'?'Privacy policy':slug==='/terms'?'Terms & conditions':'Page not found'} | Socyn Crest`;

/* ---------- Cart rendering (driven by the store) ---------- */
let lastCount = -1;
function renderBag(){
  const count = cart.count();
  const badge = document.querySelector('#bag-count');
  badge.textContent = count;
  if (lastCount >= 0 && count !== lastCount) {
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');
  }
  lastCount = count;
  const entries = cart.entries();
  document.querySelector('#bag-items').innerHTML = entries.length
    ? entries.map(({product:p, qty:n}) => `<div class="bag-item"><img src="${image(p.image,180)}" width="180" height="210" decoding="async" alt=""/><div><strong>${p.name}</strong><span>${money(p.price)}</span><div class="qty"><button data-qty="${p.id}" data-delta="-1" aria-label="Remove one ${p.name}">−</button><span>${n}</span><button data-qty="${p.id}" data-delta="1" aria-label="Add one ${p.name}">+</button></div></div></div>`).join('')
    : '<div class="bag-empty"><span>◇</span><h3>Your bag is empty</h3><p>Find something you like in the collection.</p><a href="/shop">Explore products ↗</a></div>';
  document.querySelector('#bag-total').textContent = money(cart.subtotal());
}
cart.subscribe(renderBag);
renderBag();

/* ---------- Panels, drawer, modal ---------- */
let priorFocus=null;const overlay=document.querySelector('#overlay'),drawer=document.querySelector('#bag-drawer'),modal=document.querySelector('#product-modal');
function closePanels(){
  if(overlay.hidden)return;
  drawer.hidden=true;modal.hidden=true;overlay.hidden=true;
  document.body.classList.remove('locked');
  document.querySelectorAll('.site-header, main, footer, .announcement, .skip-link').forEach(el=>el.inert=false);
  if(priorFocus?.isConnected)priorFocus.focus();priorFocus=null;
}
function openPanel(el){
  priorFocus=document.activeElement;overlay.hidden=false;el.hidden=false;document.body.classList.add('locked');
  mobile.hidden=true;menu.setAttribute('aria-expanded','false');
  document.querySelectorAll('.site-header, main, footer, .announcement, .skip-link').forEach(node=>node.inert=true);
  el.querySelector('button')?.focus();
}
const toast=document.querySelector('#toast');let toastTimer;function notify(s){toast.textContent=s;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2500)}
document.querySelector('#bag-trigger').addEventListener('click',()=>openPanel(drawer));document.querySelector('#bag-close').addEventListener('click',closePanels);overlay.addEventListener('click',closePanels);document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!overlay.hidden)closePanels();else if(!mobile.hidden){mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.focus()}}if(e.key==='Tab'&&!overlay.hidden){const panel=!modal.hidden?modal:drawer;const focusable=[...panel.querySelectorAll('a[href],button:not([disabled])')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
const menu=document.querySelector('#menu-trigger'),mobile=document.querySelector('#mobile-nav');menu.addEventListener('click',()=>{mobile.hidden=!mobile.hidden;menu.setAttribute('aria-expanded',String(!mobile.hidden))});
document.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add){const ok=cart.add(add.dataset.add);notify(ok?'Added to your bag':'Added for this visit; browser storage is unavailable');return}const qty=e.target.closest('[data-qty]');if(qty){const id=qty.dataset.qty;const delta=Number(qty.dataset.delta);const cur=cart.getItems()[id]||0;cart.setQty(id,cur+delta);const next=drawer.querySelector(`[data-qty="${id}"][data-delta="${delta}"]`);(next||drawer.querySelector('#bag-close')).focus();return}const detail=e.target.closest('[data-detail]');if(detail){const p=api.getProduct(detail.dataset.detail);modal.innerHTML=`<button class="modal-close close" aria-label="Close product details">×</button><img src="${image(p.image,950)}" ${responsiveImage(p.image, "(max-width: 650px) 90vw, 450px")} width="950" height="1187" alt="${p.name}"/><div class="modal-copy"><p class="eyebrow">${p.category} / ${p.badge}</p><h2>${p.name}</h2><p>${p.description}</p><strong>${money(p.price)}</strong><p class="fineprint">Price in USD. Shipping is calculated at checkout.</p><button class="button button-dark magnetic" data-add="${p.id}">Add to bag <span>+</span></button></div>`;modal.setAttribute('aria-label',p.name);modal.querySelector('.modal-close').addEventListener('click',closePanels);openPanel(modal)}});

/* ---------- Shop: search, sort, filter (+ deep links like /shop#Women) ---------- */
const searchInput=document.querySelector('#product-search');
if(searchInput){
  const sortSelect=document.querySelector('#product-sort');
  const results=document.querySelector('#shop-results');
  const empty=document.querySelector('.empty');
  const count=document.querySelector('#result-count');
  const filterButtons=[...document.querySelectorAll('[data-filter]')];
  let category='All';
  const setCategory=c=>{
    category=c;
    filterButtons.forEach(x=>{const active=x.dataset.filter===c;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});
    updateCatalog();
  };
  const updateCatalog=()=>{
    const term=searchInput.value.trim().toLocaleLowerCase();
    const matched=products.filter(p=>(category==='All'||p.category===category)&&`${p.name} ${p.category} ${p.description}`.toLocaleLowerCase().includes(term));
    const sort=sortSelect.value;
    if(sort==='price-asc')matched.sort((a,b)=>a.price-b.price);
    if(sort==='price-desc')matched.sort((a,b)=>b.price-a.price);
    if(sort==='name')matched.sort((a,b)=>a.name.localeCompare(b.name));
    results.innerHTML=matched.map(productCard).join('');
    results.querySelectorAll('.product-card').forEach((el,i)=>{el.classList.add('pop-in');el.style.animationDelay=`${Math.min(i*0.05,0.4)}s`});
    count.textContent=`Showing ${matched.length} ${matched.length===1?'product':'products'}`;
    empty.hidden=matched.length>0;
    results.hidden=matched.length===0;
    observeReveals();
  };
  filterButtons.forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.filter)));
  searchInput.addEventListener('input',updateCatalog);
  sortSelect.addEventListener('change',updateCatalog);
  document.querySelector('#clear-search').addEventListener('click',()=>{
    searchInput.value='';setCategory('All');searchInput.focus();
  });
  const deep=decodeURIComponent(location.hash.replace('#',''));
  if(deep&&categories.includes(deep))setCategory(deep);
}

/* ---------- Announcement rotator ---------- */
const announcements=[
  'Clothing & textiles · The new season collection',
  'Free standard shipping on orders over $75',
  '30-day easy returns, no questions asked',
];
{
  let n=0;
  const at=document.querySelector('#announce-text');
  if(at&&announcements.length>1){
    setInterval(()=>{
      n=(n+1)%announcements.length;
      at.classList.add('fade');
      setTimeout(()=>{at.textContent=announcements[n];at.classList.remove('fade')},280);
    },4200);
  }
}

/* ---------- Animated stat counters ---------- */
function animateCount(el){
  const target=Number(el.dataset.count),dur=1400,t0=performance.now();
  const step=t=>{const p=Math.min(1,(t-t0)/dur);el.textContent=Math.round(target*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
}

/* ---------- Scroll reveals ---------- */
let revealObserver=null;
function observeReveals(){
  if(!('IntersectionObserver' in window))return;
  if(!revealObserver){
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.08});
  }
  document.querySelectorAll('.reveal:not(.visible)').forEach(el=>revealObserver.observe(el));
}
observeReveals();
if('IntersectionObserver' in window){
  const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){animateCount(e.target);cio.unobserve(e.target)}}),{threshold:.4});
  document.querySelectorAll('.count').forEach(c=>cio.observe(c));
}

/* ---------- Newsletter (front-end only for now) ---------- */
const newsForm=document.querySelector('#news-form');
if(newsForm){
  newsForm.addEventListener('submit',e=>{
    e.preventDefault();
    const em=newsForm.querySelector('input');
    if(em.value){notify('You are on the list — welcome to Socyn Crest.');em.value='';}
  });
}

/* ---------- Magnetic buttons (fine pointers only) ---------- */
if(matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.magnetic').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*0.12}px,${(e.clientY-r.top-r.height/2)*0.2}px)`;
    });
    btn.addEventListener('mouseleave',()=>{btn.style.transform=''});
  });
}
