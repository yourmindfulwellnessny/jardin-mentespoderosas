/* ===== Brújula 2027 · configuración y comportamiento compartido =====
   Todo lo editable está en BR. Cada página de edición tiene <body data-ed="mujeres|parejas">.
   Registros de Zelle y pagos con tarjeta → Apps Script "Formularios web Mindful Wellness"
   → hoja "Solicitudes Mindful Wellness (web)", pestaña brujula-2027, con aviso por correo. */
var BR = {
  PREVIEW: false,
  ENDPOINT: "https://script.google.com/macros/s/AKfycbz141S5kd1EB4TkI7P4qvKiPAe9HOtjvEEaZGB6x2QLbV8DkBKsr475rgEBuXXHPBz-HQ/exec",
  WA: "12016799969",
  EMAIL: "info@mindfulbymonica.com",
  PRECIOS: { mujeres:{entrada:25, combo:35}, parejas:{entrada:50, combo:65} },
  // Enlaces de pago de Stripe (uno por opción). Al pegarlos, el botón "Pagar con tarjeta" queda conectado.
  STRIPE: { mujeres_entrada:"https://book.stripe.com/00w3cwe7n4O85VCd0OenS0u", mujeres_combo:"https://book.stripe.com/fZu3cw8N31BW5VCbWKenS0v", parejas_entrada:"https://book.stripe.com/5kQ6oI8N3dkEabS6CqenS0y", parejas_combo:"https://book.stripe.com/cNi7sM0gxa8sck00e2enS0A" },
  NOMBRE: { mujeres:"Edición Mujeres · viernes 11 de diciembre, 6:30 PM", parejas:"Edición Parejas · sábado 12 de diciembre, 9:00 AM" }
};

{
  const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const ed=document.body.dataset.ed;

  if(BR.PREVIEW && $('#previewBar')) $('#previewBar').hidden=false;
  $$('[data-p]').forEach(el=>{ const [e,o]=el.dataset.p.split('.'); el.textContent='$'+BR.PRECIOS[e][o]; });

  // aparecer al hacer scroll
  const io=('IntersectionObserver' in window)? new IntersectionObserver(es=>es.forEach(x=>{ if(x.isIntersecting){x.target.classList.add('in'); io.unobserve(x.target);} }),{threshold:.12}) : null;
  $$('.reveal').forEach(el=> io? io.observe(el) : el.classList.add('in'));

  // brújula: tocar para ver la pregunta
  $$('.pt').forEach(p=>p.addEventListener('click',()=>p.classList.toggle('flip')));

  // galería
  $$('.gwrap').forEach(w=>{ const g=$('.gallery',w);
    $$('.gnav button',w).forEach(b=>b.addEventListener('click',()=>g.scrollBy({left:(b.dataset.dir==='next'?1:-1)*Math.min(360,g.clientWidth*.8),behavior:'smooth'})));
    g.addEventListener('keydown',e=>{ if(e.key==='ArrowRight') g.scrollBy({left:340,behavior:'smooth'}); if(e.key==='ArrowLeft') g.scrollBy({left:-340,behavior:'smooth'}); });
  });

  // menú: sección activa
  const links=$$('.topbar nav a[href^="#"]');
  if(io && links.length){ const so=new IntersectionObserver(es=>es.forEach(x=>{ if(x.isIntersecting){ links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+x.target.id)); } }),{rootMargin:'-45% 0px -50% 0px'});
    links.forEach(a=>{ const t=document.getElementById(a.getAttribute('href').slice(1)); if(t) so.observe(t); }); }

  function send(p){ if(!BR.ENDPOINT) return; try{ const b=new URLSearchParams(); Object.keys(p).forEach(k=>{ if(p[k]!=null) b.append(k,p[k]); }); fetch(BR.ENDPOINT,{method:'POST',mode:'no-cors',body:b,keepalive:true}).catch(()=>{}); }catch(e){} }
  BR.send=send;



  // palabras que inspiran: abren una imagen
  const lb=$('#lb');
  if(lb){ const im=$('#lbImg'), cap=$('#lbCap'); let set=[], k=0, last=null;
    const show=()=>{ const b=set[k]; im.src=b.dataset.img; im.alt=b.dataset.cap; const t=b.dataset.cap.split(':'); cap.innerHTML='<b>'+t[0]+'</b>'+(t[1]?':'+t.slice(1).join(':'):''); };
    const close=()=>{ lb.hidden=true; document.body.style.overflow=''; if(last) last.focus(); };
    $$('button.word').forEach(b=>b.addEventListener('click',()=>{ set=$$('button.word',b.closest('.words')); k=set.indexOf(b); last=b; show(); lb.hidden=false; document.body.style.overflow='hidden'; $('.ilb-x',lb).focus(); }));
    $('.ilb-x',lb).addEventListener('click',close);
    lb.addEventListener('click',e=>{ if(e.target===lb) close(); });
    $$('.ilb-nav button',lb).forEach(b=>b.addEventListener('click',()=>{ k=(k+ +b.dataset.d+set.length)%set.length; show(); }));
    document.addEventListener('keydown',e=>{ if(lb.hidden) return; if(e.key==='Escape') close(); if(e.key==='ArrowRight'){k=(k+1)%set.length;show();} if(e.key==='ArrowLeft'){k=(k-1+set.length)%set.length;show();} });
  }

  // mapa: etiquetas con fondo a la medida y encuadre para celular
  const msvg=$('.mapsvg');
  if(msvg){ const mq=matchMedia('(max-width:760px)');
    const fit=()=>{ const m=mq.matches; msvg.setAttribute('viewBox',m?'560 60 1040 1000':'0 0 1600 1067'); msvg.setAttribute('preserveAspectRatio',m?'xMidYMid meet':'xMaxYMid slice');
      $$('.tag',msvg).forEach(g=>{ const x=+g.dataset.x, y=(+g.dataset.y)+(m?(g.classList.contains('end')?20:20):0), t1=$('.t1',g), t2=$('.t2',g); const gap=m?60:46; t1.setAttribute('y',y); t2.setAttribute('y',y+gap);
        const b1=t1.getBBox(), b2=t2.getBBox(); const w=Math.max(b1.width,b2.width)+(m?64:52), top=b1.y-(m?16:12), h=(b2.y+b2.height)-top+(m?16:12);
        const r=$('rect',g); r.setAttribute('x',x-w/2); r.setAttribute('y',top); r.setAttribute('width',w); r.setAttribute('height',h); }); };
    fit(); mq.addEventListener('change',fit); if(document.fonts) document.fonts.ready.then(fit); window.addEventListener('load',fit); window.addEventListener('hashchange',()=>setTimeout(fit,60));
  }
  // frase que cambia en la portada
  const rot=document.getElementById('rot');
  if(rot && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const F=['los lugares que quieres conocer','lo que quieres vivir','cómo te deseas sentir','los sueños que vas a lograr']; let i=0;
    setInterval(()=>{ i=(i+1)%F.length; const sp=document.createElement('span'); sp.textContent=F[i]; rot.replaceChildren(sp); },2600);
  }
  // ===== vistas: #inicio · #mujeres · #parejas · #guia (y cualquier sección dentro de ellas)
  const views=$$('.view'), navs=$$('.topbar nav[data-for]'), cta=$('#topCta');
  function route(){
    const h=decodeURIComponent(location.hash.slice(1))||'inicio';
    let v=views.find(x=>x.dataset.view===h), target=null;
    if(!v){ target=document.getElementById(h); v=target? target.closest('.view') : null; }
    if(!v) v=views[0];
    views.forEach(x=>x.hidden= x!==v);
    navs.forEach(n=>n.hidden= n.dataset.for!==v.dataset.view);
    const ed=v.dataset.ed;
    if(cta){ cta.hidden= v.dataset.view==='guia'; cta.href= ed? '#'+ed[0]+'-inscripcion' : '#mujeres'; cta.textContent= ed==='parejas'?'Inscribirnos':'Inscribirme'; }
    document.title='Brújula 2027'+(ed? ' · Edición '+(ed==='mujeres'?'Mujeres':'Parejas') : v.dataset.view==='guia'?' · Guía':'')+' · Mindful Wellness';
    $$('.reveal',v).forEach(el=> io? io.observe(el) : el.classList.add('in'));
    if(target) setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'start'}),30); else window.scrollTo({top:0,left:0,behavior:'instant'});
  }
  window.addEventListener('hashchange',route); route();

  // ===== inscripción y pago, una por edición
  function initPay(v){
    const ed=v.dataset.ed, P=ed[0]+'-', q=id=>document.getElementById(P+id);
    const ref='BR-'+(ed==='mujeres'?'M':'P')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    const opt=()=>{ const x=$('input[name=opcion]:checked',v); return x?x.value:'entrada'; };
    const total=()=>BR.PRECIOS[ed][opt()];
    const card=q('payCard'), zbtn=q('payZelle'), zbox=q('zbox'), zinfo=q('zinfo');
    const amts=()=>$$('.amt',v).forEach(a=>a.textContent='$'+total());
    function refresh(){
      const st=BR.STRIPE[ed+'_'+opt()]; amts();
      if(st){ const u=new URL(st); u.searchParams.set('client_reference_id',ref); card.href=u.toString(); card.removeAttribute('aria-disabled'); card.querySelector('small').textContent='Datos y pago en un solo paso · Stripe'; }
      else { card.removeAttribute('href'); card.setAttribute('aria-disabled','true'); card.querySelector('small').textContent='Disponible muy pronto · usa Zelle'; }
    }
    $$('input[name=opcion]',v).forEach(r=>r.addEventListener('change',()=>{ refresh(); if(!zinfo.hidden) fillZelle(); }));
    refresh();
    card.addEventListener('click',e=>{ if(card.getAttribute('aria-disabled')==='true'){ e.preventDefault(); return; }
      send({lead_id:ref,formulario:'brujula-2027',programa:'Brújula 2027 · '+(ed==='mujeres'?'Mujeres':'Parejas'),estado:'abrió pago con tarjeta',opcion:opt(),total:'$'+total(),pagina:location.href.split('#')[0]}); });
    zbtn.addEventListener('click',()=>{ const open=zbox.hidden; zbox.hidden=!open; zbtn.setAttribute('aria-expanded',open); if(open) zbox.scrollIntoView({behavior:'smooth',block:'start'}); });
    const bad=(el,c)=>{ el.closest('.f').classList.toggle('bad',!!c); return !!c; };
    let data={};
    function fillZelle(){
      q('zref').textContent=ref; q('zmemo').textContent='Brújula '+ref+' '+data.nombre; amts();
      const msg='¡Hola Mónica! Te envío mi comprobante de Zelle para Brújula 2027.\n• Código: '+ref+'\n• '+BR.NOMBRE[ed]+'\n• '+(opt()==='combo'?'Entrada + paquete de impresiones':'Entrada')+'\n• Monto: $'+total()+'\n• Nombre: '+data.nombre+(data.pareja?' y '+data.pareja:'')+'\n(Adjunto la captura del pago)';
      q('zwa').href='https://wa.me/'+BR.WA+'?text='+encodeURIComponent(msg);
      q('zmail').href='mailto:'+BR.EMAIL+'?subject='+encodeURIComponent('Comprobante Zelle · Brújula 2027 · '+ref)+'&body='+encodeURIComponent(msg);
    }
    q('zgo').addEventListener('click',()=>{
      const n=q('nombre').value.trim(), e=q('email').value.trim(), w=q('whatsapp').value.trim(), pj=q('pareja')?q('pareja').value.trim():'';
      const x=[bad(q('nombre'),n.split(/\s+/).length<2), bad(q('email'),!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)), bad(q('whatsapp'),w.replace(/\D/g,'').length<10)];
      if(q('pareja')) x.push(bad(q('pareja'),!pj));
      if(x.includes(true)) return;
      data={nombre:n,email:e,whatsapp:w,pareja:pj};
      send({lead_id:ref,formulario:'brujula-2027',programa:'Brújula 2027 · '+(ed==='mujeres'?'Mujeres':'Parejas'),edicion:BR.NOMBRE[ed],estado:'inscrita · pago Zelle por verificar',metodo_pago:'Zelle',opcion:opt()==='combo'?'Entrada + impresiones':'Entrada',total:'$'+total(),nombre:n,email:e,whatsapp:w,pareja:pj,alergias:q('alergias').value.trim(),fotos:q('fotos').checked?'Sí':'No',referencia:ref,idioma_web:'ES',pagina:location.href.split('#')[0]});
      fillZelle(); q('zform').hidden=true; zinfo.hidden=false; zinfo.scrollIntoView({behavior:'smooth',block:'start'});
    });
    q('zwa').addEventListener('click',()=>send({lead_id:ref,formulario:'brujula-2027',estado:'comprobante enviado (por verificar)',metodo_pago:'Zelle',nombre:data.nombre,whatsapp:data.whatsapp}));
    q('zedit').addEventListener('click',e=>{ e.preventDefault(); q('zform').hidden=false; zinfo.hidden=true; });
  }
  $$('.view[data-ed]').forEach(initPay);

  const copy=(t,b)=>{ if(!navigator.clipboard) return; navigator.clipboard.writeText(t).then(()=>{ const o=b.textContent; b.textContent='Copiado'; setTimeout(()=>b.textContent=o,1500); },()=>{}); };
  $$('[data-copy]').forEach(b=>b.addEventListener('click',()=>{ const t=document.querySelector(b.dataset.copy); if(t) copy(t.textContent,b); }));
  $$('[data-copytext]').forEach(b=>b.addEventListener('click',()=>copy(b.dataset.copytext,b)));
}
