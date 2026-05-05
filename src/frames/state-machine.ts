export function getStateMachineScript(): string {
  return `<script>
(function(){'use strict';
var S={theme:localStorage.getItem('bwvi-theme')||'light',toast:null};
function q(s){return document.querySelectorAll(s)}
function r(id){return document.getElementById(id)}
function t(el){return el.getAttribute('data-bwvi-toggle')}
function g(el){return el.getAttribute('data-bwvi-group')}
function tar(el){return el.getAttribute('data-bwvi-target')}
function val(el){return el.getAttribute('data-bwvi-value')}

document.addEventListener('click',function(e){
  var el=e.target.closest('[data-bwvi-toggle]');
  if(!el) return;
  var type=t(el),target=tar(el),group=g(el),value=val(el);

  if(type==='modal'||type==='dialog'){
    var m=target?r(target):el.nextElementSibling;
    if(m&&m.classList.contains('bwvi-modal')){
      m.style.display=m.style.display==='none'?'flex':'none';
      m.classList.toggle('bwvi-open');
    }
    return;
  }

  if(type==='tab'&&group){
    q('[data-bwvi-group="'+group+'"]').forEach(function(x){x.classList.remove('bwvi-active')});
    el.classList.add('bwvi-active');
    q('[data-bwvi-panel="'+group+'"]').forEach(function(p){p.style.display='none'});
    var panel=target?r(target):null;
    if(panel){panel.style.display='block';panel.classList.add('bwvi-active')}
    return;
  }

  if(type==='accordion'){
    var body=target?r(target):el.nextElementSibling;
    if(body){
      var isOpen=body.style.maxHeight&&body.style.maxHeight!=='0px';
      body.style.maxHeight=isOpen?'0px':body.scrollHeight+'px';
      el.classList.toggle('bwvi-open');
    }
    return;
  }

  if(type==='darkmode'){
    S.theme=S.theme==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',S.theme);
    localStorage.setItem('bwvi-theme',S.theme);
    return;
  }

  if(type==='toast'){
    var msg=target||'Done!';
    var toast=document.createElement('div');
    toast.textContent=msg;
    toast.className='bwvi-toast';
    document.body.appendChild(toast);
    setTimeout(function(){toast.classList.add('bwvi-toast-show')},10);
    setTimeout(function(){toast.classList.remove('bwvi-toast-show');setTimeout(function(){toast.remove()},300)},2000);
    return;
  }
});

// Carousel
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-bwvi-carousel]');
  if(!el) return;
  var id=el.getAttribute('data-bwvi-carousel');
  var dir=el.getAttribute('data-bwvi-dir')||'next';
  var c=r(id);
  if(!c) return;
  var items=c.querySelectorAll('.bwvi-carousel-item');
  if(!items.length) return;
  var current=c.querySelector('.bwvi-carousel-active')||items[0];
  var idx=Array.from(items).indexOf(current);
  if(dir==='next') idx=(idx+1)%items.length;
  else idx=(idx-1+items.length)%items.length;
  items.forEach(function(it){it.classList.remove('bwvi-carousel-active')});
  items[idx].classList.add('bwvi-carousel-active');
  var dots=c.querySelectorAll('.bwvi-carousel-dot');
  dots.forEach(function(d){d.classList.remove('bwvi-active')});
  if(dots[idx]) dots[idx].classList.add('bwvi-active');
});

// Form submit
document.addEventListener('submit',function(e){
  var form=e.target.closest('[data-bwvi-form]');
  if(!form) return;
  e.preventDefault();
  var msg=form.getAttribute('data-bwvi-form')||'Submitted!';
  var toast=document.createElement('div');
  toast.textContent=msg;
  toast.className='bwvi-toast';
  document.body.appendChild(toast);
  setTimeout(function(){toast.classList.add('bwvi-toast-show')},10);
  setTimeout(function(){toast.classList.remove('bwvi-toast-show');setTimeout(function(){toast.remove()},300)},2000);
});

// Toast styles
var style=document.createElement('style');
style.textContent='.bwvi-modal{display:none;position:fixed;inset:0;z-index:999;align-items:center;justify-content:center;background:rgba(0,0,0,0.5)}.bwvi-modal.bwvi-open{display:flex}.bwvi-modal-content{background:#fff;border-radius:12px;padding:24px;max-width:480px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2)}.bwvi-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#333;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;opacity:0;transition:all 0.3s;z-index:9999;pointer-events:none}.bwvi-toast.bwvi-toast-show{opacity:1;transform:translateX(-50%) translateY(0)}.bwvi-carousel-item{display:none}.bwvi-carousel-active{display:block}.bwvi-accordion-body{overflow:hidden;max-height:0;transition:max-height 0.3s ease}';
document.head.appendChild(style);

// Init: restore theme
if(S.theme==='dark') document.documentElement.setAttribute('data-theme','dark');
})();
</script>`;
}
