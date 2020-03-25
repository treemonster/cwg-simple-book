const simplebook=require('..')
const openurl=require('openurl')
simplebook({
  SVID_HTML: __dirname+'/svid.html',
  BOOK_DIR: __dirname+'/book',
  globals: {
    PACKAGE_SRC: __dirname+'/../',
  }
}).then(url=>{
  openurl.open(url)
})
