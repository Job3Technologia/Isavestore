const header = document.getElementById('site-header');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const searchInput = document.getElementById('searchInput');

// Simple state
let cart = JSON.parse(localStorage.getItem('isave_cart') || '[]');
// Other catalogs (filled later)
let macs = [];
let watches = [];

// Accounts/auth state
const users = JSON.parse(localStorage.getItem('isave_users') || '{}');
function saveUsers(){ localStorage.setItem('isave_users', JSON.stringify(users)); }
function getSessionEmail(){ return localStorage.getItem('isave_session_email'); }
function setSessionEmail(email){ email ? localStorage.setItem('isave_session_email', email) : localStorage.removeItem('isave_session_email'); }
function currentUser(){ const e=getSessionEmail(); return e && users[e] ? users[e] : null; }
function ensureAuth(onSuccess){ const u=currentUser(); if(u){ onSuccess && onSuccess(); return; } openAuthModal(onSuccess); }

function openAuthModal(onSuccess){
  const overlay = document.createElement('div');
  overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.background='rgba(0,0,0,.35)'; overlay.style.backdropFilter='blur(2px)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center';
  const panel = document.createElement('div');
  panel.style.width='min(620px, 92vw)'; panel.style.background='#fff'; panel.style.borderRadius='16px'; panel.style.boxShadow='0 20px 60px rgba(11,18,32,.15)'; panel.style.padding='18px';
  panel.innerHTML = `
    <h3 style="margin:6px 0 12px">Sign in or Create Account</h3>
    <div style="display:flex;gap:10px;margin-bottom:10px">
      <button id="tabLogin" class="btn btn-primary">Login</button>
      <button id="tabCreate" class="btn">Create Account</button>
    </div>
    <div id="loginForm">
      <div class="actions" style="gap:10px">
        <input id="loginEmail" type="email" placeholder="Email (username)" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
        <input id="loginPass" type="password" placeholder="Password" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
      </div>
      <div class="actions" style="margin-top:10px;justify-content:flex-end">
        <button id="doLogin" class="btn btn-primary">Login</button>
      </div>
    </div>
    <div id="createForm" style="display:none">
      <div class="actions" style="gap:10px;margin-bottom:8px">
        <input id="cEmail" type="email" placeholder="Email (used as username)" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
        <input id="cPass" type="password" placeholder="Password" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
      </div>
      <div class="actions" style="gap:10px;margin-bottom:8px">
        <input id="cFirst" type="text" placeholder="First name" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
        <input id="cLast" type="text" placeholder="Last name" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
      </div>
      <div class="actions" style="gap:10px;margin-bottom:8px">
        <input id="cPhone" type="tel" placeholder="Mobile number" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
      </div>
      <div class="actions" style="gap:10px;margin-bottom:8px">
        <input id="addr1" type="text" placeholder="Address line 1" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
        <input id="addr2" type="text" placeholder="Address line 2" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
      </div>
      <div class="actions" style="gap:10px;margin-bottom:8px">
        <input id="city" type="text" placeholder="City" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
        <input id="province" type="text" placeholder="Province" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
        <input id="postal" type="text" placeholder="Postal code" style="width:140px;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
      </div>
      <p class="meta">Note: Most personal details are locked after account creation. To change them later, delete and create a new account.</p>
      <div class="actions" style="margin-top:10px;justify-content:flex-end">
        <button id="doCreate" class="btn btn-primary">Create Account</button>
      </div>
    </div>
  `;
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const showLogin = ()=>{ panel.querySelector('#loginForm').style.display='block'; panel.querySelector('#createForm').style.display='none'; };
  const showCreate = ()=>{ panel.querySelector('#loginForm').style.display='none'; panel.querySelector('#createForm').style.display='block'; };
  panel.querySelector('#tabLogin').onclick = showLogin;
  panel.querySelector('#tabCreate').onclick = showCreate;

  panel.querySelector('#doLogin').onclick = ()=>{
    const email = String(panel.querySelector('#loginEmail').value||'').trim().toLowerCase();
    const pass = String(panel.querySelector('#loginPass').value||'');
    if(!email || !pass){ alert('Please enter email and password.'); return; }
    if(!users[email] || users[email].password !== pass){ alert('Invalid credentials.'); return; }
    setSessionEmail(email);
    overlay.remove();
    onSuccess && onSuccess();
  };

  panel.querySelector('#doCreate').onclick = ()=>{
    const email = String(panel.querySelector('#cEmail').value||'').trim().toLowerCase();
    const pass = String(panel.querySelector('#cPass').value||'');
    if(!email || !pass){ alert('Please enter email and password.'); return; }
    if(users[email]){ alert('An account with this email already exists.'); return; }
    const profile = {
      first: String(panel.querySelector('#cFirst').value||''),
      last: String(panel.querySelector('#cLast').value||''),
      phone: String(panel.querySelector('#cPhone').value||''),
      address: {
        line1: String(panel.querySelector('#addr1').value||''),
        line2: String(panel.querySelector('#addr2').value||''),
        city: String(panel.querySelector('#city').value||''),
        province: String(panel.querySelector('#province').value||''),
        postal: String(panel.querySelector('#postal').value||'')
      }
    };
    users[email] = { email, password: pass, profile, wallet: 0, promo: { codeUsed:false, codeActivatedAt:null } };
    saveUsers();
    setSessionEmail(email);
    overlay.remove();
    onSuccess && onSuccess();
  };
  overlay.onclick = (e)=>{ if(e.target===overlay) overlay.remove(); };
}

// Payment link placeholder (replace with your Stripe Payment Link)
const PAYMENT_LINK_URL = 'https://buy.stripe.com/test_00000000000000';

// Sticky header shadow on scroll
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 6;
  header.classList.toggle('scrolled', scrolled);
});

// Hero carousel
(function initCarousel(){
  const carousel = document.getElementById('heroCarousel');
  if(!carousel) return; // Guard for pages without hero/carousel
  const slidesEl = carousel.querySelector('.slides');
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  const indicatorsEl = document.getElementById('carouselIndicators');
  let index = 0;

  const update = () => {
    slidesEl.style.transform = `translateX(-${index*100}%)`;
    indicatorsEl.querySelectorAll('.indicator').forEach((dot,i)=>{
      dot.classList.toggle('active', i===index);
    });
  };

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'indicator';
    dot.addEventListener('click', () => { index = i; update(); });
    indicatorsEl.appendChild(dot);
  });
  update();

  document.getElementById('prevSlide').onclick = () => { index = (index-1+slides.length)%slides.length; update(); };
  document.getElementById('nextSlide').onclick = () => { index = (index+1)%slides.length; update(); };

  setInterval(()=>{ index = (index+1)%slides.length; update(); }, 6000);
})();

// iPhone products (17 → 6)
const products = [
  {id:'ip17-pro', name:'iPhone 17 Pro', sku:'IPH-17-PRO', year:2025, rating:'5.0★', price:29999, oldPrice:31999, save:6, image:'https://placehold.co/1200x800/0f172a/ffffff?text=iPhone+17+Pro', images:[
    'https://placehold.co/1200x800/0f172a/ffffff?text=17+Pro+Black',
    'https://placehold.co/1200x800/1f2937/ffffff?text=17+Pro+Blue',
    'https://placehold.co/1200x800/b58900/ffffff?text=17+Pro+Gold']},
  {id:'ip17-pro-max', name:'iPhone 17 Pro Max', sku:'IPH-17-PRO-MAX', year:2025, rating:'5.0★', price:33999, oldPrice:35999, save:6, image:'https://placehold.co/1200x800/111827/ffffff?text=iPhone+17+Pro+Max', images:[
    'https://placehold.co/1200x800/111827/ffffff?text=17+Pro+Max+Silver',
    'https://placehold.co/1200x800/0f172a/ffffff?text=17+Pro+Max+Black',
    'https://placehold.co/1200x800/1f2937/ffffff?text=17+Pro+Max+Blue']},
  {id:'ip17', name:'iPhone 17', sku:'IPH-17', year:2025, rating:'4.9★', price:26999, oldPrice:28999, save:7, image:'https://placehold.co/1200x800/1f2937/ffffff?text=iPhone+17', images:[
    'https://placehold.co/1200x800/1f2937/ffffff?text=17+Blue',
    'https://placehold.co/1200x800/0f172a/ffffff?text=17+Black',
    'https://placehold.co/1200x800/111827/ffffff?text=17+Silver']},
  {id:'ip16-pro', name:'iPhone 16 Pro', sku:'IPH-16-PRO', year:2024, rating:'4.9★', price:27999, oldPrice:29999, save:7, image:'https://placehold.co/1200x800/0b1220/ffffff?text=iPhone+16+Pro', images:[
    'https://placehold.co/1200x800/0b1220/ffffff?text=16+Pro+Graphite',
    'https://placehold.co/1200x800/1f2937/ffffff?text=16+Pro+Blue']},
  {id:'ip16-plus', name:'iPhone 16 Plus', sku:'IPH-16-PLUS', year:2024, rating:'4.8★', price:25999, oldPrice:26999, save:4, image:'https://placehold.co/1200x800/0f172a/ffffff?text=iPhone+16+Plus', images:[
    'https://placehold.co/1200x800/0f172a/ffffff?text=16+Plus+Black',
    'https://placehold.co/1200x800/111827/ffffff?text=16+Plus+Silver']},
  {id:'ip16-2tb', name:'iPhone 16 (2TB)', sku:'IPH-16-2TB', year:2024, rating:'4.9★', price:24999, oldPrice:25999, save:4, image:'https://placehold.co/1200x800/111827/ffffff?text=iPhone+16', images:[
    'https://placehold.co/1200x800/111827/ffffff?text=16+2TB+Silver',
    'https://placehold.co/1200x800/0f172a/ffffff?text=16+2TB+Black']},
  {id:'ip15-pro', name:'iPhone 15 Pro', sku:'IPH-15-PRO', year:2023, rating:'4.9★', price:23999, oldPrice:24999, save:4, image:'https://placehold.co/1200x800/1f2937/ffffff?text=iPhone+15+Pro', images:[
    'https://placehold.co/1200x800/1f2937/ffffff?text=15+Pro+Blue',
    'https://placehold.co/1200x800/0f172a/ffffff?text=15+Pro+Black']},
  {id:'ip15-1tb', name:'iPhone 15 (1TB)', sku:'IPH-15-1TB', year:2023, rating:'4.9★', price:21999, oldPrice:22999, save:4, image:'https://placehold.co/1200x800/0b1220/ffffff?text=iPhone+15', images:[
    'https://placehold.co/1200x800/0b1220/ffffff?text=15+1TB+Graphite',
    'https://placehold.co/1200x800/111827/ffffff?text=15+1TB+Silver']},
  {id:'ip14-1tb', name:'iPhone 14 (1TB)', sku:'IPH-14-1TB', year:2022, rating:'4.8★', price:18999, oldPrice:19999, save:5, image:'https://placehold.co/1200x800/1f2937/ffffff?text=iPhone+14', images:[
    'https://placehold.co/1200x800/1f2937/ffffff?text=14+1TB+Blue',
    'https://placehold.co/1200x800/0f172a/ffffff?text=14+1TB+Black']},
  {id:'ip13-512', name:'iPhone 13 (512GB)', sku:'IPH-13-512', year:2021, rating:'4.8★', price:16499, oldPrice:17499, save:6, image:'https://placehold.co/1200x800/111827/ffffff?text=iPhone+13', images:[
    'https://placehold.co/1200x800/111827/ffffff?text=13+512+Silver',
    'https://placehold.co/1200x800/1f2937/ffffff?text=13+512+Blue']},
  {id:'ip12-256', name:'iPhone 12 (256GB)', sku:'IPH-12-256', year:2020, rating:'4.7★', price:13999, oldPrice:14999, save:7, image:'https://placehold.co/1200x800/0f172a/ffffff?text=iPhone+12', images:[
    'https://placehold.co/1200x800/0f172a/ffffff?text=12+256+Black',
    'https://placehold.co/1200x800/111827/ffffff?text=12+256+Silver']},
  {id:'ip11-256', name:'iPhone 11 (256GB)', sku:'IPH-11-256', year:2019, rating:'4.6★', price:11999, oldPrice:12999, save:8, image:'https://placehold.co/1200x800/111827/ffffff?text=iPhone+11', images:[
    'https://placehold.co/1200x800/111827/ffffff?text=11+256+Silver',
    'https://placehold.co/1200x800/0f172a/ffffff?text=11+256+Black']},
  {id:'ip10-128', name:'iPhone X (128GB)', sku:'IPH-X-128', year:2018, rating:'4.6★', price:9999, oldPrice:10999, save:9, image:'https://placehold.co/1200x800/0b1220/ffffff?text=iPhone+X', images:[
    'https://placehold.co/1200x800/0b1220/ffffff?text=X+128+Graphite',
    'https://placehold.co/1200x800/111827/ffffff?text=X+128+Silver']},
  {id:'ip8-128', name:'iPhone 8 (128GB)', sku:'IPH-8-128', year:2017, rating:'4.4★', price:7999, oldPrice:8999, save:11, image:'https://placehold.co/1200x800/1f2937/ffffff?text=iPhone+8', images:[
    'https://placehold.co/1200x800/1f2937/ffffff?text=8+128+Blue',
    'https://placehold.co/1200x800/0f172a/ffffff?text=8+128+Black']},
  {id:'ip7-128', name:'iPhone 7 (128GB)', sku:'IPH-7-128', year:2016, rating:'4.3★', price:5999, oldPrice:6999, save:14, image:'https://placehold.co/1200x800/0f172a/ffffff?text=iPhone+7', images:[
    'https://placehold.co/1200x800/0f172a/ffffff?text=7+128+Black',
    'https://placehold.co/1200x800/111827/ffffff?text=7+128+Silver']},
  {id:'ip6-64', name:'iPhone 6 (64GB)', sku:'IPH-6-64', year:2015, rating:'4.2★', price:3999, oldPrice:4999, save:20, image:'https://placehold.co/1200x800/111827/ffffff?text=iPhone+6', images:[
    'https://placehold.co/1200x800/111827/ffffff?text=6+64+Silver',
    'https://placehold.co/1200x800/0f172a/ffffff?text=6+64+Black']},
  {id:'ip-se-2022', name:'iPhone SE (2022)', sku:'IPH-SE-2022', year:2022, rating:'4.3★', price:9999, oldPrice:10999, save:9, image:'https://placehold.co/1200x800/0f172a/ffffff?text=iPhone+SE+2022', images:[
    'https://placehold.co/1200x800/0f172a/ffffff?text=SE+2022+Black',
    'https://placehold.co/1200x800/111827/ffffff?text=SE+2022+Silver']},
  {id:'ip-se-2020', name:'iPhone SE (2020)', sku:'IPH-SE-2020', year:2020, rating:'4.2★', price:7999, oldPrice:8999, save:11, image:'https://placehold.co/1200x800/1f2937/ffffff?text=iPhone+SE+2020', images:[
    'https://placehold.co/1200x800/1f2937/ffffff?text=SE+2020+Blue',
    'https://placehold.co/1200x800/0f172a/ffffff?text=SE+2020+Black']}
];

const productGrid = document.getElementById('productGrid');

function formatRand(value){
  return `R ${value.toLocaleString('en-ZA')}`;
}

function renderProducts(items){
  if(!productGrid) return;
  productGrid.innerHTML = '';
  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-media"><img alt="${p.name}" src="${p.image}" onerror="this.src='https://placehold.co/1200x800/0f172a/ffffff?text=${encodeURIComponent('${p.name}')}'"/></div>
      <div class="card-body">
        <div class="meta">${p.sku} • iPhone • ${p.year}</div>
        <h3>${p.name}</h3>
        <div class="price"><span class="new">${formatRand(p.price)}</span><span class="old">${formatRand(p.oldPrice)}</span></div>
        <div class="meta"><span class="rating">${p.rating}</span> <span style="margin-left:8px;color:#f97316">Save ${p.save}%</span> ${(p.save>=12)?'<span class="tag fast" style="margin-left:8px">Selling fast</span>':''} ${(p.stock && p.stock<=3)?'<span class="tag low" style="margin-left:8px">Low stock</span>':''}</div>
        <div class="actions">
          <button class="btn" data-view="${p.id}">View</button>
          <button class="btn btn-primary" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

renderProducts(products);
// Update available phone count (iPhones page)
(function(){
  const el = document.getElementById('phoneCount');
  if(el){ el.textContent = products.length; }
})();

// Search filter
searchInput?.addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase();
  renderProducts(products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)));
  bindProductActions();
});

function getItemById(id){
  const pool = ([]).concat(products||[]).concat(macs||[]).concat(watches||[]);
  return pool.find(pp => pp.id===id);
}

function bindProductActions(){
  document.querySelectorAll('[data-add]').forEach(btn=>{
    btn.onclick = () => {
      ensureAuth(()=>{
        const id = btn.getAttribute('data-add');
        const p = getItemById(id);
        cart.push({...p, qty:1});
        localStorage.setItem('isave_cart', JSON.stringify(cart));
        updateCartBadge();
        openCart();
      });
    };
  });
  document.querySelectorAll('[data-view]').forEach(btn=>{
    btn.onclick = () => {
      const id = btn.getAttribute('data-view');
      const p = getItemById(id);
      openProductModal(p);
    };
  });
}

bindProductActions();

function updateCartBadge(){ cartCount.textContent = cart.length; }
updateCartBadge();

// Cart modal (lightweight)
let cartModal;
function openCart(){
  if(cartModal){ cartModal.remove(); }
  cartModal = document.createElement('div');
  cartModal.style.position = 'fixed';
  cartModal.style.inset = '0';
  cartModal.style.background = 'rgba(0,0,0,.35)';
  cartModal.style.backdropFilter = 'blur(2px)';
  cartModal.style.display = 'flex';
  cartModal.style.alignItems = 'center';
  cartModal.style.justifyContent = 'center';

  const panel = document.createElement('div');
  panel.style.width = 'min(560px, 92vw)';
  panel.style.background = '#fff';
  panel.style.borderRadius = '16px';
  panel.style.boxShadow = '0 20px 60px rgba(11,18,32,.15)';
  panel.style.padding = '18px';

  const subtotal = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  const u = currentUser();
  const promoActive = !!(u && u.promo && u.promo.codeActivatedAt && !u.promo.codeUsed && Date.now() < u.promo.codeActivatedAt + 3600*1000);
  const discount = promoActive ? Math.round(subtotal * 0.43) : 0;
  const total = Math.max(0, subtotal - discount);
  const list = cart.map((i,idx)=>{
    const details = [
      i.color || null,
      i.storage || null,
      (i.carePlan && i.carePlan!=='None') ? i.carePlan : null,
    ].filter(Boolean).join(' • ');
    const name = details ? `${i.name} — ${details}` : i.name;
    return `<li style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px;max-width:60%">
        <img src="${i.image}" alt="${i.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;border:1px solid #e5e7eb"/>
        <span>${name}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <button class="btn" data-dec="${idx}">−</button>
        <span class="meta">${i.qty}</span>
        <button class="btn" data-inc="${idx}">+</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <strong>${formatRand(i.price)}</strong>
        <button class="btn" data-remove="${idx}">Remove</button>
      </div>
    </li>`;
  }).join('');

  panel.innerHTML = `
    <h3 style="margin:6px 0 12px">Your Cart</h3>
    <ul style="list-style:none;padding:0;margin:0 0 12px">${list || '<li>Your cart is empty.</li>'}</ul>
    <div class="card" style="padding:10px;margin:10px 0">
      <div style="display:flex;align-items:center;gap:10px">
        <input id="promoInput" type="text" placeholder="Promo code (NEW123BEE)" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px"/>
        <button id="promoApply" class="btn">Apply</button>
        <span id="promoCountdown" class="meta" style="margin-left:auto;color:#0a66ff"></span>
      </div>
      <div class="meta">New users get 43% off for 1 hour after applying code. One use per email.</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0">
      <div>
        <div><strong>Subtotal:</strong> ${formatRand(subtotal)}</div>
        <div style="color:#f97316"><strong>Discount:</strong> ${discount ? '- '+formatRand(discount) : formatRand(0)}</div>
      </div>
      <div><strong>Total:</strong> ${formatRand(total)}</div>
    </div>
    <div style="display:flex;gap:10px;justify-content:space-between;align-items:center">
      <div class="meta">Wallet: ${u ? formatRand(u.wallet||0) : 'Sign in to use wallet'}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button id="walletPay" class="btn">Pay with Wallet</button>
        <button id="clearCart" class="btn">Clear</button>
        <button id="checkoutBtn" class="btn btn-primary">Checkout</button>
      </div>
    </div>
  `;

  cartModal.appendChild(panel);
  document.body.appendChild(cartModal);

  // Quantity and removal controls
  panel.querySelectorAll('[data-inc]').forEach(b=>{
    b.onclick = ()=>{
      const idx = Number(b.getAttribute('data-inc'));
      cart[idx].qty += 1;
      localStorage.setItem('isave_cart', JSON.stringify(cart));
      updateCartBadge();
      openCart();
    };
  });
  panel.querySelectorAll('[data-dec]').forEach(b=>{
    b.onclick = ()=>{
      const idx = Number(b.getAttribute('data-dec'));
      cart[idx].qty = Math.max(1, cart[idx].qty - 1);
      localStorage.setItem('isave_cart', JSON.stringify(cart));
      updateCartBadge();
      openCart();
    };
  });
  panel.querySelectorAll('[data-remove]').forEach(b=>{
    b.onclick = ()=>{
      const idx = Number(b.getAttribute('data-remove'));
      cart.splice(idx,1);
      localStorage.setItem('isave_cart', JSON.stringify(cart));
      updateCartBadge();
      openCart();
    };
  });

  cartModal.onclick = (e)=>{ if(e.target === cartModal) cartModal.remove(); };
  panel.querySelector('#clearCart').onclick = () => { cart = []; localStorage.setItem('isave_cart', JSON.stringify(cart)); updateCartBadge(); openCart(); };
  panel.querySelector('#promoApply').onclick = () => {
    const code = String(panel.querySelector('#promoInput').value||'').trim().toUpperCase();
    const u = currentUser();
    if(!u){ openAuthModal(()=> openCart()); return; }
    if(code === 'NEW123BEE'){
      if(u.promo && u.promo.codeUsed){ alert('This promo was already used on your account.'); return; }
      if(!u.promo) u.promo = { codeUsed:false, codeActivatedAt:null };
      u.promo.codeActivatedAt = Date.now();
      saveUsers();
      openCart();
    } else {
      alert('Invalid promo code.');
    }
  };
  if(promoActive){
    const countdownEl = panel.querySelector('#promoCountdown');
    const endAt = u.promo.codeActivatedAt + 3600*1000;
    const tick = () => {
      const remain = Math.max(0, endAt - Date.now());
      const mins = Math.floor(remain/60000), secs = Math.floor((remain%60000)/1000);
      countdownEl.textContent = `Promo active: ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')} left`;
      if(remain<=0){ openCart(); }
    };
    tick();
    const iv = setInterval(tick, 1000);
    cartModal.onremove = ()=> clearInterval(iv);
  }
  panel.querySelector('#checkoutBtn').onclick = () => {
    ensureAuth(()=>{
      if(PAYMENT_LINK_URL && PAYMENT_LINK_URL.startsWith('http')){
        const totalParam = new URLSearchParams({amount: total.toString()}).toString();
        window.open(`${PAYMENT_LINK_URL}?${totalParam}`, '_blank');
      } else {
        location.href = 'payment-response.html?status=success';
      }
    });
  };
  panel.querySelector('#walletPay').onclick = () => {
    ensureAuth(()=>{
      const u = currentUser();
      if((u.wallet||0) >= total){
        u.wallet -= total;
        if(u.promo && u.promo.codeActivatedAt) u.promo.codeUsed = true;
        saveUsers();
        cart = []; localStorage.setItem('isave_cart', JSON.stringify(cart)); updateCartBadge();
        cartModal.remove();
        location.href = 'payment-response.html?status=success';
      } else {
        alert('Insufficient wallet balance. Deposit funds on the Wallet page.');
      }
    });
  };
}

cartBtn?.addEventListener('click', openCart);

// Product detail modal with variants (color, storage, iCare)
function openProductModal(p){
  const isPhone = String(p?.sku||'').startsWith('IPH');
  const isMac = String(p?.sku||'').startsWith('MBP');
  const isWatch = String(p?.sku||'').startsWith('AW-');

  const colors = ['Black','Silver','Blue','Gold','Red'];
  const storagePhone = [
    {label:'128GB', delta:0},
    {label:'256GB', delta:1000},
    {label:'512GB', delta:2000},
    {label:'1TB', delta:4000},
    {label:'2TB', delta:8000},
  ];
  const storageMac = [
    {label:'256GB', delta:0},
    {label:'512GB', delta:2500},
    {label:'1TB', delta:5500},
    {label:'2TB', delta:9500},
  ];
  const carePlans = [
    {label:'None', delta:0},
    {label:'iCare Basic', delta:799},
    {label:'iCare Plus', delta:1499},
    {label:'iCare Elite', delta:2299},
  ];

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,.35)';
  overlay.style.backdropFilter = 'blur(2px)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  const panel = document.createElement('div');
  panel.style.width = 'min(720px, 95vw)';
  panel.style.background = '#fff';
  panel.style.borderRadius = '16px';
  panel.style.boxShadow = '0 20px 60px rgba(11,18,32,.15)';
  panel.style.padding = '18px';

  const imgs = Array.isArray(p.images) && p.images.length ? p.images : [p.image, p.image];
  panel.innerHTML = `
    <div style="display:flex;gap:18px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px">
        <div class="card-media" style="border-radius:12px;overflow:hidden"><img id="pd-main" alt="${p.name}" src="${imgs[0]}" style="width:100%;height:auto"/></div>
        <div style="display:flex;gap:8px;margin-top:8px">
          ${imgs.map((src,i)=>`<img data-thumb="${i}" src="${src}" alt="thumb" style="width:64px;height:64px;border-radius:10px;cursor:pointer;border:1px solid #e5e7eb"/>`).join('')}
        </div>
      </div>
      <div style="flex:1;min-width:260px">
        <div class="meta">${p.sku} • ${p.year}</div>
        <h3 style="margin:6px 0 10px">${p.name}</h3>
        <div id="pd-price" class="price" style="margin-bottom:12px"><span class="new">${formatRand(p.price)}</span><span class="old">${formatRand(p.oldPrice)}</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label style="display:flex;flex-direction:column;gap:6px">
            <span class="meta">Color</span>
            <select id="optColor" class="input" style="padding:10px;border:1px solid #e5e7eb;border-radius:10px">${colors.map(c=>`<option>${c}</option>`).join('')}</select>
          </label>
          ${isPhone||isMac ? `
          <label style="display:flex;flex-direction:column;gap:6px">
            <span class="meta">Storage</span>
            <select id="optStorage" class="input" style="padding:10px;border:1px solid #e5e7eb;border-radius:10px">
              ${(isPhone?storagePhone:storageMac).map(s=>`<option value="${s.delta}">${s.label}</option>`).join('')}
            </select>
          </label>` : ''}
          <label style="display:flex;flex-direction:column;gap:6px">
            <span class="meta">iCare</span>
            <select id="optCare" class="input" style="padding:10px;border:1px solid #e5e7eb;border-radius:10px">${carePlans.map(c=>`<option value="${c.delta}">${c.label}</option>`).join('')}</select>
          </label>
          <label style="display:flex;flex-direction:column;gap:6px">
            <span class="meta">Quantity</span>
            <input id="optQty" type="number" min="1" value="1" style="padding:10px;border:1px solid #e5e7eb;border-radius:10px"/>
          </label>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">
          <button id="pd-cancel" class="btn">Close</button>
          <button id="pd-add" class="btn btn-primary">Add to cart</button>
        </div>
      </div>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const mainImg = panel.querySelector('#pd-main');
  panel.querySelectorAll('[data-thumb]').forEach(t=>{
    t.onclick = ()=>{ mainImg.src = imgs[Number(t.getAttribute('data-thumb'))||0]; };
  });

  const colorHex = (label)=>{
    switch(String(label).toLowerCase()){
      case 'black': return '0f172a';
      case 'blue': return '1f2937';
      case 'gold': return 'b58900';
      case 'red': return 'dc2626';
      case 'silver':
      default: return '111827';
    }
  };
  const colorSel = panel.querySelector('#optColor');
  colorSel.addEventListener('change', ()=>{
    const color = colorSel.value;
    const bg = colorHex(color);
    const text = encodeURIComponent(`${p.name} — ${color}`);
    mainImg.src = `https://placehold.co/1200x800/${bg}/ffffff?text=${text}`;
  });

  const priceEl = panel.querySelector('#pd-price .new');
  const storageSel = panel.querySelector('#optStorage');
  const careSel = panel.querySelector('#optCare');
  const recalc = () => {
    const base = Number(p.price||0);
    const sDelta = storageSel ? Number(storageSel.value||0) : 0;
    const cDelta = Number(careSel.value||0);
    const final = base + sDelta + cDelta;
    priceEl.textContent = formatRand(final);
    return final;
  };
  storageSel?.addEventListener('change', recalc);
  careSel.addEventListener('change', recalc);
  recalc();

  panel.querySelector('#pd-cancel').onclick = ()=> overlay.remove();
  panel.querySelector('#pd-add').onclick = ()=>{
    ensureAuth(()=>{
      const color = panel.querySelector('#optColor').value;
      const storage = storageSel ? storageSel.options[storageSel.selectedIndex].text : undefined;
      const carePlan = careSel.options[careSel.selectedIndex].text;
      const qty = Math.max(1, Number(panel.querySelector('#optQty').value||1));
      const final = recalc();
      cart.push({...p, qty, price: final, color, storage, carePlan});
      localStorage.setItem('isave_cart', JSON.stringify(cart));
      updateCartBadge();
      overlay.remove();
      openCart();
    });
  };
}

// Map: Leaflet + distance/ETA
(function initMap(){
  // Store locator disabled (online-only)
  return;
  const store = { name: 'ISave — Sandton City', lat: -26.107566, lng: 28.056702 };
  const mapEl = document.getElementById('map');
  const dirLink = document.getElementById('directionsLink');
  const distanceEl = document.getElementById('distance');
  const etaEl = document.getElementById('eta');
  // Guard: if this page doesn't have map UI, skip initialization
  if(!mapEl || !dirLink || !distanceEl || !etaEl) return;

  dirLink.href = `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`;

  if(typeof window.L === 'undefined'){
    mapEl.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#6b7280">Interactive map unavailable in preview. Use the directions link.</div>';
    distanceEl.textContent = '—';
    etaEl.textContent = '—';
    return;
  }

  const map = L.map('map').setView([store.lat, store.lng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
  const marker = L.marker([store.lat, store.lng]).addTo(map);
  marker.bindPopup(`<b>${store.name}</b><br/>Premium Apple Products`).openPopup();

  if('geolocation' in navigator){
    navigator.geolocation.getCurrentPosition((pos)=>{
      const u = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const line = L.polyline([ [u.lat,u.lng], [store.lat,store.lng] ], { color: '#0a66ff' }).addTo(map);
      map.fitBounds(line.getBounds(), { padding: [20,20] });
      const dKm = haversine(u.lat, u.lng, store.lat, store.lng);
      const etaMin = Math.round((dKm/40) * 60);
      document.getElementById('distance').textContent = `${dKm.toFixed(1)} km`;
      document.getElementById('eta').textContent = `${etaMin} mins`;
    }, ()=>{
      document.getElementById('distance').textContent = '—';
      document.getElementById('eta').textContent = '—';
    });
  }
})();

function haversine(lat1, lon1, lat2, lon2){
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// Mac and Watch catalog rendering
const macGrid = document.getElementById('macGrid');
const watchGrid = document.getElementById('watchGrid');

macs = [
  {id:'mbp-2015', name:'MacBook Pro 13" (2015)', sku:'MBP-2015', year:2015, rating:'4.2★', price:10999, oldPrice:12999, save:15, image:'https://placehold.co/1200x800/0b1220/ffffff?text=MacBook+Pro+2015', images:[
    'https://placehold.co/1200x800/0b1220/ffffff?text=MBP+2015+Graphite',
    'https://placehold.co/1200x800/111827/ffffff?text=MBP+2015+Silver']},
  {id:'mbp-2019', name:'MacBook Pro 16" (2019)', sku:'MBP-2019', year:2019, rating:'4.6★', price:23999, oldPrice:25999, save:8, image:'https://placehold.co/1200x800/111827/ffffff?text=MacBook+Pro+2019', images:[
    'https://placehold.co/1200x800/111827/ffffff?text=MBP+2019+Silver',
    'https://placehold.co/1200x800/0f172a/ffffff?text=MBP+2019+Black']},
  {id:'mbp-m1', name:'MacBook Pro 14" (M1)', sku:'MBP-M1', year:2021, rating:'4.8★', price:26999, oldPrice:28999, save:7, image:'https://placehold.co/1200x800/0f172a/ffffff?text=MacBook+Pro+M1', images:[
    'https://placehold.co/1200x800/0f172a/ffffff?text=MBP+M1+Black',
    'https://placehold.co/1200x800/111827/ffffff?text=MBP+M1+Silver']},
  {id:'mbp-m3', name:'MacBook Pro 14" (M3)', sku:'MBP-M3', year:2024, rating:'4.9★', price:34999, oldPrice:36999, save:5, image:'https://placehold.co/1200x800/1f2937/ffffff?text=MacBook+Pro+M3', images:[
    'https://placehold.co/1200x800/1f2937/ffffff?text=MBP+M3+Blue',
    'https://placehold.co/1200x800/0f172a/ffffff?text=MBP+M3+Black']}
];

watches = [
  {id:'aw-s8', name:'Apple Watch Series 8 (GPS)', sku:'AW-S8', year:2022, rating:'4.7★', price:6999, oldPrice:7999, save:13, image:'https://placehold.co/1200x800/111827/ffffff?text=Watch+S8', images:[
    'https://placehold.co/1200x800/111827/ffffff?text=S8+Silver',
    'https://placehold.co/1200x800/0f172a/ffffff?text=S8+Black']},
  {id:'aw-s9', name:'Apple Watch Series 9 (GPS)', sku:'AW-S9', year:2023, rating:'4.8★', price:8999, oldPrice:9999, save:10, image:'https://placehold.co/1200x800/0f172a/ffffff?text=Watch+S9', images:[
    'https://placehold.co/1200x800/0f172a/ffffff?text=S9+Black',
    'https://placehold.co/1200x800/1f2937/ffffff?text=S9+Blue']},
  {id:'aw-ultra', name:'Apple Watch Ultra', sku:'AW-ULTRA', year:2023, rating:'4.9★', price:13999, oldPrice:14999, save:7, image:'https://placehold.co/1200x800/1f2937/ffffff?text=Watch+Ultra', images:[
    'https://placehold.co/1200x800/1f2937/ffffff?text=Ultra+Blue',
    'https://placehold.co/1200x800/0f172a/ffffff?text=Ultra+Black']}
];

function renderGrid(target, items, family){
  if(!target) return;
  target.innerHTML = '';
  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-media"><img alt="${p.name}" src="${p.image}" onerror="this.src='https://placehold.co/1200x800/0f172a/ffffff?text=${encodeURIComponent('${p.name}')}'"/></div>
      <div class="card-body">
        <div class="meta">${p.sku} • ${family} • ${p.year}</div>
        <h3>${p.name}</h3>
        <div class="price"><span class="new">${formatRand(p.price)}</span><span class="old">${formatRand(p.oldPrice)}</span></div>
        <div class="meta"><span class="rating">${p.rating}</span></div>
        <div class="actions">
          <button class="btn" data-view="${p.id}">View</button>
          <button class="btn btn-primary" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    `;
    target.appendChild(card);
  });
  bindProductActions();
}

renderGrid(macGrid, macs, 'Mac');
renderGrid(watchGrid, watches, 'Watch');

// Financing calculator (services page)
const finCalcBtn = document.getElementById('fin-calc');
if(finCalcBtn){
  finCalcBtn.onclick = () => {
    const amount = Number(document.getElementById('fin-amount').value||0);
    const months = Number(document.getElementById('fin-term').value||0);
    const rate = Number(document.getElementById('fin-rate').value||0) / 100 / 12; // monthly
    if(!amount || !months){ return; }
    const installment = rate ? (amount * rate) / (1 - Math.pow(1+rate, -months)) : amount / months;
    document.getElementById('fin-summary').textContent = `Monthly: R ${installment.toFixed(2)} for ${months} months`;
    const scheduleEl = document.getElementById('fin-schedule');
    scheduleEl.innerHTML = '';
    let start = new Date();
    for(let i=1;i<=months;i++){
      start = new Date(start.getTime() + 30*24*60*60*1000); // approx 30 days
      const item = document.createElement('div');
      item.className = 'card';
      item.style.padding = '10px';
      item.textContent = `Debit ${i}: ${start.toDateString()} — R ${installment.toFixed(2)}`;
      scheduleEl.appendChild(item);
    }
  };
}

// Payments page scheduler
const schedBtn = document.getElementById('sched-generate');
if(schedBtn){
  schedBtn.onclick = () => {
    const amount = Number(document.getElementById('sched-amount').value||0);
    const months = Number(document.getElementById('sched-months').value||0);
    const listEl = document.getElementById('sched-list');
    listEl.innerHTML = '';
    let start = new Date();
    const each = months ? (amount / months) : amount;
    const schedule = [];
    for(let i=1;i<=months;i++){
      start = new Date(start.getTime() + 30*24*60*60*1000);
      schedule.push({ index:i, date:start.toISOString(), amount:each });
      const row = document.createElement('div');
      row.className = 'card';
      row.style.padding = '10px';
      row.textContent = `Payment ${i}: ${start.toDateString()} — R ${each.toFixed(2)}`;
      listEl.appendChild(row);
    }
    localStorage.setItem('isave_schedule', JSON.stringify(schedule));
  };
}

// Payment link setup on payments page
const payLinkEl = document.getElementById('paymentLink');
if(payLinkEl){
  const items = (JSON.parse(localStorage.getItem('isave_cart')||'[]')||[]);
  const subtotal = items.reduce((s,i)=>s+i.price*i.qty,0);
  const u = currentUser();
  const promoActive = !!(u && u.promo && u.promo.codeActivatedAt && !u.promo.codeUsed && Date.now() < u.promo.codeActivatedAt + 3600*1000);
  const discount = promoActive ? Math.round(subtotal * 0.43) : 0;
  const total = Math.max(0, subtotal - discount);
  payLinkEl.textContent = total ? `Pay Now — R ${total.toLocaleString('en-ZA')}` : 'Pay Now';
  if(PAYMENT_LINK_URL && PAYMENT_LINK_URL.startsWith('http')){
    payLinkEl.href = PAYMENT_LINK_URL + '?' + new URLSearchParams({amount: total.toString()}).toString();
  } else {
    payLinkEl.href = 'payment-response.html?status=success';
  }
}

// Set nav active state by pathname (when present)
document.querySelectorAll('.nav-links a').forEach(a=>{
  if(a.getAttribute('href') && location.pathname.endsWith(a.getAttribute('href'))){
    a.classList.add('active');
  }
});
// Page loader overlay with company logo
(function initLoader(){
  if(document.readyState==='complete') return; // skip if already loaded
  const overlay = document.createElement('div');
  overlay.className = 'page-loader';
  overlay.innerHTML = `<div class="loader-content"><div class="logo">ISave</div><div class="spinner"></div></div>`;
  document.body.appendChild(overlay);
  const start = Date.now();
  function remove(){ overlay.style.opacity='0'; setTimeout(()=>overlay.remove(), 250); }
  window.addEventListener('load', ()=>{
    const elapsed = Date.now()-start;
    const minShow = 1200; // keep visible briefly for newcomers
    const wait = Math.max(0, minShow - elapsed);
    setTimeout(remove, wait);
  });
})();