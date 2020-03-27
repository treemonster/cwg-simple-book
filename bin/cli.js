#!/usr/bin/env node

const simplebook=require('..')
const openurl=require('openurl')
const fs=require('fs')

const args={}
process.argv.slice(2).map(arg=>{
  arg.replace(/^--(.+?)(?:=(.+))*$/,(_, k, v)=>{
    args[k.toUpperCase()]=v||true
  })
})

const mkdir=dir=>{
  try{fs.mkdirSync(dir)}catch(e) {
    if(!fs.existsSync(dir)) throw new Error('目录生成失败: '+dir)
  }
}
const mkfile=(fn, str)=>{
  try{
    if(fs.existsSync(fn)) return;
    fs.writeFileSync(fn, str)
  }catch(e) {
    if(!fs.existsSync(fn)) throw new Error('写入文件失败: '+dir)
  }
}
const SVID_STR=`<?js
const apis={}

apis.helo=async _=>{
  return {
    msg: 'helo',
    ok: !0,
  }
}

module.exports=async svid=> {
  return JSON.stringify(apis[svid]? await apis[svid](): {msg: svid+' 不存在', ok: !1})
}`

try{
  const {DIR, PORT, OPEN, READWRITE}=args
  if(!DIR) throw new Error('没有填写文件目录')
  mkdir(DIR)
  mkdir(DIR+'/md')
  mkfile(DIR+'/svid.html', SVID_STR)

  simplebook({
    SVID_HTML: DIR+'/svid.html',
    BOOK_DIR: DIR+'/md',
    READWRITE,
    port: PORT,
  }).then(url=>{
    if(OPEN) openurl.open(url)
    console.log('可在浏览器查看: '+url)
  })
}catch(e) {}
