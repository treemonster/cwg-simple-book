let {datas, editfn, NO_CONTENT}=window.DATAS
let _editfn=editfn
function updatebtns() {
  $('em').each(function(){
    const em=$(this), text=em.html()
    const r=/^call\:([a-z\d]+):(.+)$/
    if(!text.match(r)) return
    em.replaceWith(text.replace(r, `<span data-svid="$1" class="call-btn">$2</span>`))
  })
}
function xhr(method, url, postbody) {
  return new Promise(cb=>{
    const xhr=new XMLHttpRequest
    xhr.open(method, url, !0)
    method==='POST' && xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(postbody)
    xhr.onreadystatechange=_=>{
      if(xhr.readyState!==4) return;
      cb(xhr.responseText)
    }
  })
}
function save(fn, content) {
  return xhr('POST', '?act=write&fetch='+encodeURIComponent(fn), encodeURIComponent(content))
}
function updatebigtitle(){
  const h=$('.bigtitle').height()
  $('.titles,.content').css({top: h})
}
function showpanel(title, md, cls, fn) {
  $('.edit').addClass('show')
  $('.pad-div').addClass(cls)
  $('.tit').html(title)
  $('.pad-text').val(md).change()
  if(!window.FormData) $('.upfile').html('当前浏览器不支持FormData上传文件')
  editfn=fn
}
function hidepanel() {
  $('.edit').removeClass('show')
  $('.pad-div')[0].className='pad-div'
}
const pos={}
function calc_where(key, str) {
  const old=pos[key]||''
  pos[key]=str
  if(str===old) return;
  const len=Math.min(old.length, str.length)
  let cur=0
  for(; cur<len && old.charAt(cur)===str.charAt(cur); cur++);
  const lstr=str.substr(Math.max(cur-20, 0), cur)
  cur-=lstr.match(/<[a-z\d]+$|$/i)[0].length
  const rstr=str.substr(cur-1, Math.min(str.length-cur, 20))
  cur+=rstr.match(/^<\/[a-z\d]+>|$/i)[0].length
  return str.substr(0, cur)+'<i data-cur></i>'+str.substr(cur, str.length)
}
function updatescroll(set) {
  try{
    if(set) {
      localStorage.setItem('lt', $('.titles')[0].scrollTop)
    }else{
      $('.titles')[0].scrollTop=localStorage.getItem('lt')-0
    }
  }catch(e) {}
}
$(document).on('click', [1,2,3,4,5,6].map(a=>'.titles h'+a).join(','), function() {
  updatescroll(1)
  location='?view='+encodeURIComponent($(this).html())
  return false
})
$(document).on('click', '[data-svid]', async function() {
  const svid=$(this).attr('data-svid')
  try{
    const res=JSON.parse(await xhr('GET', '?act=call_svid&svid='+svid))
    // {ok, msg}
    alert(res.msg)
  }catch(e) {
    alert('网络错误')
  }
})



function uploadImage(file, progressCallback) {
  let _tout=5e3, _t, refleshTout=_=>{
    clearTimeout(_t)
    _t=setTimeout(_=>res.reject(new Error('当前网络不佳，请稍后再试')), _tout)
  }

  try{
    if(!file || !file.size) throw new Error('图片为空')
    if(file.size>5*1024*1024-5) throw new Error('图片太大，请上传小于5兆的图片')

    const fd=new FormData
    fd.append('file', file)

    refleshTout()
    const b=new XMLHttpRequest
    b.open('POST','?act=upfile', !0)
    b.upload.addEventListener('progress', e=> {
      refleshTout()
      e.lengthComputable && progressCallback(e.loaded/e.total*.99)
    }, false)
    b.onreadystatechange=_=>{
      refleshTout()
      if(b.readyState!==4) return
      clearTimeout(_t)
      try{
        progressCallback(1, JSON.parse(b.responseText))
      }catch(e) {
        progressCallback(1, new Error('上传失败'))
      }
    }
    b.send(fd)
  }catch(e) {
    progressCallback(1, new Error('上传失败'))
  }
}


$(document).on('change', '#upfile', function() {
  uploadImage($('#upfile')[0].files[0], (p, d)=>{
    if(!d || !d.src) return;
    const {fn_raw, src}=d
    const srcdata=fn_raw.match(/\.(jpg|png|gif)$/i)? `![${fn_raw}](${src})`: `[${fn_raw}](${src})`
    const pt=$('.pad-text')
    const s='\r\n'+srcdata+'\r\n'
    const pv=pt.val()
    const ib=pt[0].selectionStart, ie=pt[0].selectionEnd
    pt.val((ib===undefined||ie===undefined)? pv+s: pv.slice(0, ib)+s+pv.slice(ie, pv.length))
    pt.change()
  })
})
$(document).on('click', '.title:not(.ro)', function() {
  showpanel('大标题', datas.bigtitle, 'bigtitle', 'bigtitle')
})
$(document).on('click', '.edit-title-btn', function() {
  showpanel('目录', datas.titles, 'titles titles-list', 'titles')
  return false
})
$(document).on('click', '.edit-content-btn', function() {
  showpanel(_editfn, datas.subs[_editfn], '', _editfn)
})
$(document).on('click', '.cancel', _=>hidepanel())
$(document).on('click', '.save', async _=>{
  const data=await save(editfn, $('.pad-text').val())
  if(editfn==='bigtitle') {
    datas.bigtitle=$('.pad-text').val()
    $('.title').html(data)
    updatebigtitle()
  }else if(editfn==='titles') {
    datas.titles=$('.pad-text').val()
    $('.titles-list').html(data)
  }else{
    datas.subs[editfn]=$('.pad-text').val()
    $('.content-panel').html(data||NO_CONTENT)
    hl_code($('.content-panel code'))
  }
  updatebtns()
  hidepanel()
})

; ['change', 'keyup'].map(c=>$(document).on(c, '.pad-text', function() {
  const str=marked.parse($(this).val())
  const fixstr=calc_where('pad-text', str)
  if(!fixstr) return;
  $('.pad-div').html(fixstr)
  try{
    const dc=$('[data-cur]')
    $('.pad-div')[0].scrollTop+=dc.offset().top-$('.pad-div').offset().top-$('.pad-div').height()/2
    const p=dc.parent()
    if(!p.hasClass('focusit') && !p.is('code')) {
      p.addClass('focusit')
      setTimeout(_=>p.removeClass('focusit'), 1e3)
    }
    dc.remove()
  }catch(e) {}
  hl_code($('.pad-div code'))
  updatebtns()
}))

function hl_code(codes) {
  codes.map(function() {
    (this.className+'').replace(/^language-([a-z\d]+)/, (_, lan)=>{
      let hls=this.innerText
      try{
        hls=hljs.highlight(lan, this.innerText).value
      }catch(e) {}
      $(this).html(hls).addClass('hljs')
    })
  })
}
$(_=>{
  updatebigtitle()
  updatebtns()
  for(let r=$('.titles-list *'), i=r.length; i--; ) {
    const ri=$(r[i])
    if(ri.html()!=editfn) continue
    ri.addClass('active')
    break
  }
  updatescroll()
})
$(window).on('resize', _=>updatebigtitle())
hljs.initHighlightingOnLoad()