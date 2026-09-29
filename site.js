(function(){
  var s = 128;
  var c = document.createElement('canvas');
  c.width = s; c.height = s;
  var ctx = c.getContext('2d');
  if(!ctx) return;
  var img = ctx.createImageData(s, s);
  for(var i = 0; i < img.data.length; i += 4){
    var v = Math.random() * 255;
    img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  var grain = document.querySelector('.grain');
  if(grain) grain.style.backgroundImage = 'url(' + c.toDataURL() + ')';
})();

var navToggle = document.getElementById('navToggle');
if(navToggle){
  navToggle.addEventListener('click', function(){
    var open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-links a').forEach(function(link){
    link.addEventListener('click', function(){ document.body.classList.remove('nav-open'); });
  });
}

var form = document.getElementById('signupForm');
if(form){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var email = document.getElementById('signupEmail');
    if(!email.checkValidity()){ email.focus(); return; }
    form.classList.add('sent');
    var confirm = document.getElementById('signupConfirm');
    if(confirm) confirm.classList.add('show');
  });
}

var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ticker: each page sets window.TICKER_ITEMS before loading this script;
   falls back to a default set if a page doesn't define one */
(function(){
  var track = document.getElementById('tickerTrack');
  if(!track) return;
  var items = window.TICKER_ITEMS || [
    'Nisarg\u2019s Newsletter · issue 01 in draft',
    'The B2B IRL Room · opening soon',
    'Homecoming · Toronto, 28 October',
    'B2B IRL: Toronto · next meetup TBA',
    'The Almanack · first print run coming'
  ];
  var html = '';
  for(var pass = 0; pass < 2; pass++){
    items.forEach(function(t){
      html += '<span class="ticker-item">' + t + '<span class="dim">/</span></span>';
    });
  }
  track.innerHTML = html;
})();

(function(){
  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if(!els.length) return;
  if(!('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in-view'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  els.forEach(function(el){ io.observe(el); });
  setTimeout(function(){
    els.forEach(function(el){ el.classList.add('in-view'); });
  }, 4000);
})();

(function(){
  var header = document.querySelector('header');
  var watermark = document.querySelector('.watermark');
  var ticking = false;
  function update(){
    var y = window.scrollY || window.pageYOffset;
    if(header) header.classList.toggle('scrolled', y > 24);
    if(watermark && !reduceMotion) watermark.style.transform = 'translateY(' + Math.min(y * 0.06, 60) + 'px)';
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

(function(){
  var ticket = document.querySelector('.ticket');
  var wrap = document.querySelector('.ticket-wrap');
  if(!ticket || !wrap || reduceMotion) return;
  ticket.addEventListener('animationend', function(e){
    if(e.animationName !== 'stamp-press') return;
    ticket.style.animation = 'none';
    wrap.addEventListener('mousemove', function(ev){
      var r = wrap.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width - 0.5;
      var py = (ev.clientY - r.top) / r.height - 0.5;
      ticket.style.setProperty('--tilt-y', (px * 10).toFixed(2) + 'deg');
      ticket.style.setProperty('--tilt-x', (py * -10).toFixed(2) + 'deg');
    });
    wrap.addEventListener('mouseleave', function(){
      ticket.style.setProperty('--tilt-x', '0deg');
      ticket.style.setProperty('--tilt-y', '0deg');
    });
  });
})();
