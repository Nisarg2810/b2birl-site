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

  /* request forms: no backend yet, so each opens a pre-filled email to hello@b2birl.com.
     <form data-subject="..."> with named fields; data-label on a field sets its line label. */
  [].forEach.call(document.querySelectorAll('form[data-subject]'), function(form){
    var note = form.querySelector('.formnote');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var bad = null, lines = [];
      [].forEach.call(form.querySelectorAll('input, textarea, select'), function(f){
        var ok = f.checkValidity();
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if(!ok && !bad) bad = f;
        if(f.name && f.value.trim()) lines.push((f.dataset.label || f.name) + ': ' + f.value.trim());
      });
      if(bad){
        if(note){ note.className = 'formnote err'; note.textContent = 'A few details need a look before you send.'; }
        bad.focus(); return;
      }
      var who = form.elements.name ? ' (' + form.elements.name.value.trim() + ')' : '';
      window.location.href = 'mailto:hello@b2birl.com?subject=' + encodeURIComponent(form.dataset.subject + who) + '&body=' + encodeURIComponent(lines.join('\n'));
      if(note){ note.className = 'formnote'; note.textContent = 'Your email app should open with everything written out. Press send to submit it.'; }
    });
  });
})();
