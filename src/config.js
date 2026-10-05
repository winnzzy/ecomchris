// Business information for Socyn Crest LLC.
// The owner should verify every field here before sending the site to the bank:
// the phone number is still a placeholder.
export const business = {
  name: 'Socyn Crest',
  legalName: 'Socyn Crest LLC',
  trade: 'Clothing & textiles',
  phone: '',
  email: 'contact@socyncrest.com',
  address: '4660 90th Ave SE, Eyota, MN 55934',
  supportHours: 'Monday–Friday, 9:00 AM – 5:00 PM Central Time',
  currency: 'USD',
  shipping: 'Orders are processed within 1–2 business days and shipped via USPS, UPS, or FedEx.',
  returns: '30-day returns on unused, unworn items. Refunds go to the original payment method within 10 business days.',
  updated: 'October 6, 2026',
};

/* Industry-standard U.S. shipping rates. Single source of truth for the
   storefront, checkout, and both backends. */
export const shippingRates = {
  standard: { label: 'Standard', eta: '3–5 business days', price: 5.95, freeOver: 75 },
  express: { label: 'Express', eta: '2 business days', price: 14.95 },
};
export const shippingFor = (subtotal, method = 'standard') =>
  method === 'express' ? shippingRates.express.price : (subtotal >= shippingRates.standard.freeOver ? 0 : shippingRates.standard.price);

// Product catalog with example prices for the clothing & textile store.
// Replace images with real product photography before launch.
export const products = [
  {id:'essential-tee', name:'Essential Cotton T-Shirt', category:'Men', price:24.99, badge:'Everyday essential', image:'photo-1521572163474-6864f9cf17ab', description:'A breathable 100% cotton tee with a clean, classic cut. The foundation of every wardrobe.'},
  {id:'heritage-tee', name:'Graphic Heritage Tee', category:'Men', price:29.99, badge:'Bold print', image:'photo-1576566588028-4147f3842f27', description:'Soft-touch cotton tee with a heritage-inspired chest print. Comfort with character.'},
  {id:'cloud-hoodie', name:'Cloud Fleece Hoodie', category:'Men', price:54.99, badge:'Cozy staple', image:'photo-1556821840-3a63f95609a7', description:'Brushed-back fleece hoodie with a relaxed fit and kangaroo pocket. Made for slow weekends.'},
  {id:'white-sweatshirt', name:'Classic White Sweatshirt', category:'Women', price:49.99, badge:'Soft & simple', image:'photo-1620799140408-edc6dcb6d633', description:'A crisp white sweatshirt in soft loopback cotton. Pairs with absolutely everything.'},
  {id:'slim-jeans', name:'Slim-Fit Denim Jeans', category:'Men', price:69.99, badge:'Denim classic', image:'photo-1542272604-787c3835535d', description:'Slim through the leg with a touch of stretch for all-day comfort. A denim drawer essential.'},
  {id:'scarlet-dress', name:'Scarlet Wrap Midi Dress', category:'Women', price:79.99, badge:'Evening ready', image:'photo-1595777457583-95e059d581b8', description:'A flowing wrap midi dress in bold scarlet. Made to turn heads.'},
  {id:'blush-joggers', name:'Blush Jogger Pants', category:'Women', price:39.99, badge:'Lounge in style', image:'photo-1594633312681-425c7b97ccd1', description:'Soft blush joggers with cuffed ankles and a flattering high rise. Comfort, elevated.'},
  {id:'rust-bomber', name:'Rust Bomber Jacket', category:'Outerwear', price:99.99, badge:'Statement layer', image:'photo-1591047139829-d91aecb6caea', description:'A rust-toned bomber with a modern cut and matte hardware. Your go-to layer.'},
  {id:'knit-poncho', name:'Hand-Knit Poncho', category:'Women', price:64.99, badge:'Artisan knit', image:'photo-1434389677669-e08b4cac3105', description:'A hand-finished knit poncho with fringe detail. Cozy craftsmanship you can feel.'},
  {id:'chambray-shirt', name:'Chambray Everyday Shirt', category:'Women', price:44.99, badge:'Easy layer', image:'photo-1596755094514-f87e34085b2c', description:'Lightweight chambray shirt that layers over everything, in every season.'},
];
