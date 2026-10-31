/* B2B IRL · house behaviour: video, masthead, reveal, request forms */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var big = window.innerWidth > 1400;

  /* videos: each <video data-src-lg data-src-sm>. The hero plays at once; others load when scrolled near. */
  function load(v){
    if(!v || v.getAttribute('src')) return;
    v.src = big ? v.dataset.srcLg : v.dataset.srcSm;
    v.addEventListener('playing', function(){
      var p = v.parentNode.querySelector('.poster'); if(p) p.style.opacity = 0;
    }, { once:true });
  }
  function play(v){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }

  var vids = [].slice.call(document.querySelectorAll('video[data-src-lg]'));
  if(!reduce){
    vids.forEach(function(v){
      if(v.hasAttribute('data-hero')){ load(v); play(v); return; }
      if('IntersectionObserver' in window){
        new IntersectionObserver(function(es){
          es.forEach(function(e){
            if(e.isIntersecting){ load(e.target); play(e.target); }
            else if(e.target.getAttribute('src')){ e.target.pause(); }
          });
        }, { rootMargin:'200px 0px' }).observe(v);
      }
    });
  }

  [].forEach.call(document.querySelectorAll('.pause'), function(btn){
    var v = btn.parentNode.querySelector('video');
    if(reduce || !v){ btn.hidden = true; return; }
    btn.addEventListener('click', function(){
      if(v.paused){ play(v); btn.textContent = 'Pause'; btn.setAttribute('aria-pressed','false'); }
      else { v.pause(); btn.textContent = 'Play'; btn.setAttribute('aria-pressed','true'); }
    });
  });

  /* masthead hairline once scrolled */
  var mast = document.querySelector('.masthead');
  if(mast){
    var on = function(){ mast.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', on, { passive:true }); on();
  }

  /* reveal on scroll */
  var els = [].slice.call(document.querySelectorAll('.rv'));
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin:'0px 0px -8% 0px' });
    els.forEach(function(el){ io.observe(el); });
  }
  setTimeout(function(){ els.forEach(function(el){ el.classList.add('in'); }); }, 3500);

  /* request forms. With ENDPOINT set, each form posts to the Google Sheet backend (site-build/backend/Code.gs);
     without it, or if the post fails, it opens a pre-filled email to hello@b2birl.com instead.
     <form data-subject="..."> with named fields; data-label on a field sets its column / line label. */
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbz-6SAfbWjh4po3-Gd80Ka3ALycPFfIvZvvF9TqJAkCBX3iYmBMFF3TZ6RmPIwsmv6F/exec';

  function mailto(form, lines){
    var who = form.elements.name ? ' (' + form.elements.name.value.trim() + ')' : '';
    window.location.href = 'mailto:hello@b2birl.com?subject=' + encodeURIComponent(form.dataset.subject + who) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  [].forEach.call(document.querySelectorAll('form[data-subject]'), function(form){
    var note = form.querySelector('.formnote');
    var btn = form.querySelector('button[type="submit"]');
    var inline = form.classList.contains('inline');
    if(ENDPOINT){
      var trap = document.createElement('input');   /* spam trap: people never see it, bots fill it */
      trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off'; trap.setAttribute('aria-hidden', 'true');
      trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
      form.appendChild(trap);
      if(note) note.textContent = inline ? '' : 'Every request is read personally.';
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var bad = null, lines = [], data = new URLSearchParams();
      [].forEach.call(form.querySelectorAll('input, textarea, select'), function(f){
        if(f.name === 'website') return;
        var ok = f.checkValidity();
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if(!ok && !bad) bad = f;
        var v = f.value.trim(), k = f.dataset.label || f.name;
        if(f.name && v){ lines.push(k + ': ' + v); data.append(k, v); }
      });
      if(bad){
        if(note){ note.className = 'formnote err'; note.textContent = 'A few details need a look before you send.'; }
        bad.focus(); return;
      }
      if(!ENDPOINT){
        mailto(form, lines);
        if(note){ note.className = 'formnote'; note.textContent = 'Your email app should open with everything written out. Press send to submit it.'; }
        return;
      }
      data.append('form', form.dataset.subject);
      data.append('page', location.pathname);
      if(form.elements.website) data.append('website', form.elements.website.value);
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending';
      fetch(ENDPOINT, { method:'POST', mode:'no-cors', body:data }).then(function(){
        form.reset();
        if(note){ note.className = 'formnote ok'; note.textContent = inline ? "Thank you. You're on the list." : "Thank you. It's with us, and every request is read personally. We'll be in touch."; }
        btn.textContent = 'Sent';
      }).catch(function(){
        btn.disabled = false; btn.textContent = label;
        if(note){ note.className = 'formnote'; note.textContent = 'Something went wrong, so your email app will open with everything written out instead.'; }
        mailto(form, lines);
      });
    });
  });
})();
