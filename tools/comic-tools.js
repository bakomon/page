function comic_tools() {
  /* Simple querySelector https://codepen.io/pen/oKYOEK */
  function el(e,l,m) {
    var elem, parent = l != 'all' && (l || l === null) ? l : document;
    if (parent === null) {
      elem = parent;
      console.error('selector: '+ e +' => parent: '+ parent);
    } else {
      elem = (m || l == 'all') ? parent.querySelectorAll(e) : parent.querySelector(e);
    }
    return elem;
  }
  
  /* Add script to head https://codepen.io/sekedus/pen/QWKYpVR */
  function addScript(n,o,t,e,s) {
    /* data, id, info, boolean, parent */
    var js_async = e === true || t === true || o === true;
    var js_new = document.createElement('script');
    if (o && typeof o === 'string' && o.indexOf('#') != -1) js_new.id = o.replace(/#/, '');
    js_new.async = js_async;
    if (t == 'in' || o == 'in') {
      js_new.type = 'text/javascript';
      js_new.innerHTML = n;
    } else {
      js_new.src = n;
    }
    var parent = s || e || t || o;
    parent = parent && parent.tagName ? parent : document.querySelector('head');
    parent.appendChild(js_new);
  }
  
  /* loadXMLDoc (XMLHttpRequest) https://codepen.io/sekedus/pen/vYGYBNP */
  function loadXMLDoc(url, callback, info) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        if (this.status == 200) {
          var response = this.responseText;
          if (info == 'parse') {
            var resHTML = new DOMParser();
            response = resHTML.parseFromString(response, 'text/html');
          }
          callback(response);
        } else {
          callback(this.status);
        }
      }
    };
    xhr.open('GET', url, true);
    xhr.send();
  }
  
  function ls_replaceData(str, note) {
    if (note) { /* reverse */
      str = str.replace(/##x5c;##x27;/g, '\\\'').replace(/##x5c;##x22;/g, '\\\"').replace(/##x5c;##x6e;/g, '\\n').replace(/##x5c;/g, '\\').replace(/##x2f;##x2f;/g, '\/\/').replace(/##x27;/g, '\'').replace(/##x22;/g, '\"').replace(/##xa;/g, '\n');
    } else {
      str = str.replace(/\t/g, '\x20\x20').replace(/\\\'/g, '##x5c;##x27;').replace(/\\\"/g, '##x5c;##x22;').replace(/\\n/g, '##x5c;##x6e;').replace(/\\/g, '##x5c;').replace(/\/\//g, '##x2f;##x2f;').replace(/\'/g, '##x27;').replace(/\"/g, '##x22;').replace(/\n/g, '##xa;');
    }
    return str;
  }
  
  function ls_getData(data, id, type, info, date) {
    //alert(info);
    if (info == 'reverse') {
      data = ls_replaceData(data, info);
      if (type == 'json') data = 'var '+ id +' = "'+ data +'";';
    } else {
      if (type.indexOf('json/') != -1) data = type.split('/')[1] +'('+ JSON.stringify(data) +');'; /* type.split('/')[1] = callback */
      var scr_txt = '{"update":"'+ date +'","data":"'+ ls_replaceData(data.toString()) +'"}';
      localStorage.setItem(id, scr_txt);
    }
    
    var elem_tag = type == 'css' ? 'style' : 'script';
    var elem_new = document.createElement(elem_tag);
    elem_new.id = id;
    elem_new.innerHTML = data;
    document.querySelector('head').appendChild(elem_new);
  }
  
  function ls_genDate(interval) {
    var date_time, ls_date = new Date();
    var ls_add = interval.indexOf('|') != -1 ? Number(interval.split('|')[1]) : 1;
    if (interval.search(/(year|month)s?/i) != -1) {
      var year_add = interval.search(/years?/i) != -1 ? ls_add : 0;
      var month_add = interval.search(/months?/i) != -1 ? ls_add : 0;
      ls_date.setFullYear(ls_date.getFullYear() + year_add, ls_date.getMonth() + month_add);
    } else {
      var date_num = interval.search(/weeks?/i) != -1 ? (ls_add*7*24*60*60) : interval.search(/days?/i) != -1 ? (ls_add*24*60*60) : interval.search(/hours?/i) != -1 ? (ls_add*60*60) : interval.search(/minutes?/i) != -1 ? (ls_add*60) : ls_add; /* default second */
      ls_date.setTime(ls_date.getTime() + (date_num * 1000));
    }
    return ls_date.toLocaleString();
  }
  
  /* Save css, js, json to localStorage with Expiration https://codepen.io/sekedus/pen/LYbBagK */
  function ls_saveLocal(url, id, type, interval) {
    var ls_interval = interval || 'permanent';
    var ls_update = ls_interval.search(/manual\|/i) != -1 ? ls_interval.split('|')[1] : ls_genDate(ls_interval); /* default second+1 */
    console.log(`ls_data_id: ${id}`);
    console.log(`ls_interval: ${ls_interval}`);
    console.log(`ls_update: ${ls_update}`);
    
    var data_local = localStorage.getItem(id);
    if (data_local) {
      data_local = JSON.parse(data_local);
      if (data_local.update && data_local.data) {
        if (data_local.data == '0') {
          localStorage.removeItem(id);
          alert(`!! ERROR: ${id} data is "${data_local.data}" !!\n\nTry to:\n1. check console on browser\n2. check github XHR on ${window.location.hostname} in AdBlock filter.`);
          return;
        }
        var date_chk = ls_interval.search(/manual\|/i) != -1 ? new Date(ls_interval.split('|')[1]) : new Date();
        date_chk = date_chk.getTime() <= Date.parse(data_local.update); /* check time interval */
        if (date_chk || ls_interval == 'permanent') {
          console.log('ls_data: true');
          ls_getData(data_local.data, id, type, 'reverse');
        } else {
          console.log('ls_data: false time');
          localStorage.removeItem(id);
          loadXMLDoc(url, function(res) { ls_getData(res, id, type, 'change_time', ls_update); });
        }
      } else {
        console.log('ls_data: false undefined');
        localStorage.removeItem(id);
        loadXMLDoc(url, function(res) { ls_getData(res, id, type, 'undefined', ls_update); });
      }
    } else {
      console.log('ls_data: false');
      loadXMLDoc(url, function(res) { ls_getData(res, id, type, 'not_found', ls_update); });
    }
  }
  
  var wl = window.location;
  var wh = wl.hostname;
  var wp = wl.pathname;
  var is_login = true;
  var host_rgx = /(oploverz|webtoons|mangaku|mangaindo|komikstation|komikcast|westmanga|mangakita|mangashiro|mangacanblog|maid|ngomik|mangakyo|kiryuu|komikav|komiku|manhwa-san|matakomik|komikid|kombatch|mangceh|sektekomik|manhuaid|pojokmanga|sheamanga|klikmanga|bacakomik|mangayu|klankomik|boosei|comicfx|yuumanga|wordhero|gurukomik|masterkomik|kaisarkomik|softkomik|katakomik|mgkomik|kumamanga|komikru|komikindo|komiknesia|mangakane|tenseiscans|komikempus|kurutonime|nekomik|manhwaindo|wrt|mangacdn|wib|gabutscans|daveyscans|mangapark|mangadex|mangabat|zeroscans|readmanhua|readmng|hatigarmscan[sz]|funmanga|bato|leviatanscans|merakiscans|mangarawr|toonily|mangasushi|reaperscans|asurascans|secretscans|rawdevart|azoramanga|yuumanga|animesc-kun|readcmic|mangapaus|ninkomik)\.((blogspot|wordpress)\.)?((co|my|web)(m|\.id)?|net|org|me|in|tv|id|to|jp|info|xyz|pro|site)\/?(.*)/i;
  
  if (wh.search(host_rgx) != -1 && wp.indexOf('wp-content') == -1) {
      /* css control */
    var s_str = '.cbr_mod *,.cbr_mod *:before,.cbr_mod *:after{outline:0;-webkit-box-sizing:border-box;box-sizing:border-box;}.line_text{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}.flex{display:-webkit-flex;display:flex;}.flex_wrap{display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;}.flex_perfect{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);}/* Perfect Centering: parent */.flex_perfect .fp_content{margin:auto;}/* Perfect Centering: content */.f_middle{-webkit-align-items:center;align-items:center;-webkit-align-content:center;align-content:center;}.f_bottom{-webkit-align-items:flex-end;align-items:flex-end;-webkit-align-content:flex-end;align-content:flex-end;}.f_center{-webkit-justify-content:center;justify-content:center;}.f_left{-webkit-justify-content:flex-start;justify-content:flex-start;}.f_right{-webkit-justify-content:flex-end;justify-content:flex-end;}.f_grow{-webkit-flex-grow:1;flex-grow:1;}.f_between{-webkit-justify-content:space-between;justify-content:space-between;}.t_center{text-align:center;}.t_left{text-align:left;}.t_right{text-align:right;}.t_justify{text-align:justify;}[disabled]{cursor:no-drop !important;}';
      /* css main */
    s_str += '/* Custom Scrollbar */body::-webkit-scrollbar{width:15px;}body::-webkit-scrollbar-track{background:#312f40;}body::-webkit-scrollbar-thumb{background:#151515;}html,body,article{background:#151515 !important;-webkit-user-select:text;user-select:text;}body{overflow:auto !important;}.mangainfo li a:visited,.komikinfo li a:visited,.animeinfo li a:visited,.animeinfo .episodelist a:visited,.wp-manga-chapter a:visited,.bixbox li a:visited,.bxcl li a:visited,#scans a:visited h3,#latestchapters .updates a:visited,#list .chapter a:visited,.chapter-container .chapter-row a:visited,.elementor-icon-list-item a:visited,.epxs a:visited,.chapter-item a:visited,.fixyear a:visited,.fixyear a:visited .year .ytps a:visited,.chli .cli a:visited,.Manga_Chapter a:visited .viewind{color:#607d8b !important;}#reader-mod,#wrap:not(.no-css) p:not([class="logo"]){background:#151515;max-width:750px !important;min-width:inherit;height:auto !important;margin:0 auto !important;display:block;float:none !important;}#reader-mod img,#wrap:not(.no-css) p:not([class="logo"]) img{width:auto;max-width:100% !important;/*max-width:700px !important;*/height:auto;position:initial !important;display:block;margin:0 auto;}#content .carousel,.darex .carousel,.vezone .carousel{height:auto;max-height:100%;}#content .carousel-cell,.darex .carousel-cell,.vezone .carousel-cell{float:left;position:relative;}#content .carousel-cell img,.darex .carousel-cell img,.vezone .carousel-cell img{height:100%;}#menu li,#main-menu li{float:none;display:inline-block;}.episode-table tr td[width="100"]{width:100%;}body.manga-page .main-col .listing-chapters_wrap ul.version-chap{max-height:none;overflow:initial;}/* madara theme */.text-ui-light .site-header .c-sub-header-nav,.text-ui-light [class*="c-sidebar c-top"],.text-ui-light .profile-manga{background:#151515!important;border-color:#3e3949!important;}/* komikgo.com */.chapter-type-manga .c-blog-post .entry-content .entry-content_wrap .reading-content::before{position:relative;}/* manhwa-san.xyz | katakomik.site */.manhwa-san\\.xyz #outer-wrapper,.katakomik\\.site #outer-wrapper,.katakomik\\.site .header-header{background:#151515 !important;}.manhwa-san\\.xyz .blog-post.item-post h1.post-title{color:#999;}.manhwa-san\\.xyz .alphanx,.katakomik\\.site .naviarea1 .awnavi1,.funmanga\\.com .prev-next-post{display:flex;justify-content:space-between;}/* mangaku.pro */.mangaku\\.pro .owl-carousel{display:block;}/* manhuaid.com */.manhuaid\\.com#darkbody{background:#151515 !important;}.manhuaid\\.com img[alt^="Aplikasi"]{display:none;}/* mangayu.com */.mangayu\\.com .swal2-container{display:none;}/* readcmic.blogspot.com */.readcmic\\.blogspot\\.com #outer-wrapper{background:#151515 !important;}/* komikcast.com */.is-mobile .komikcast\\.com .list-update_items-wrapper{display:flex;flex-wrap:wrap;}.is-mobile .komikcast\\.com .list-update_item{flex:initial;max-width:100%;width:50%;}/* wib.my.id */.wib\\.my\\.id .preloader{display:none;}/* webtoons.com */.webtoons\\.com img{opacity:0.9 !important;}.webtoons\\.com #wrap a,.webtoons\\.com #wrap p,#wrap .main_hotnew h2,#wrap .title_area h2,#wrap .grade_num{color:#838383 !important;}#wrap #header,#wrap .snb_wrap,#wrap #container.bg,#wrap .detail_body .detail_lst,#wrap .detail_body .detail_install_app,#wrap .detail_body .detail_lst li,#wrap .detail_body .aside.detail,#wrap .detail_body .detail_paywall,#wrap .main_daily_wrap,#wrap .daily_tab_wrap,#wrap .main_hotnew_wrap,#wrap .main_genre_wrap,#wrap .main_challenge,#wrap .lst_type1 li,#wrap #footer,#wrap .notice_area,#wrap .foot_app,#wrap .discover_lst li,#wrap .ranking_tab,#wrap .ranking_tab li,#wrap .lst_type1,#wrap .daily_head,#wrap .daily_card_item,#wrap .daily_card,#wrap .daily_card li,#wrap #cbox_module,#wrap .u_cbox .u_cbox_comment_box,#wrap .u_cbox a{background-color:#151515 !important;border-color:#000 !important;color:#838383 !important;}#wrap .card_item .card_back,#wrap .daily_tab li.on .btn_daily,#wrap .main_challenge .title_area .btnarea a,#wrap .snb li.on a,#wrap .ranking_tab li.on a,#wrap .daily_section.on,#wrap .episode_area{background-color:#2f2f2f !important;color:#838383 !important;}/* display none */#footer2,noscript,#ftads,.kln:not(.blox),.kln.mlb,.c-sub-header-nav.sticky,.restrictcontainer,[class*="komik_info-alert"],.adult-content #adult_modal,.adult-content .modal-backdrop,html body [class*="iklan"],html body [rel="noopener"]:not([target="_blank"]),html body [style="z-index:2147483647;"],html body [style="background:rgb(221,221,221); z-index:9999999; opacity:1; visibility:visible;"],html body a[rel="nofollow norefferer noopener"],html body [style="z-index:999999; background:rgba(0,0,0,0.8); display:block;"],html body [style="position:fixed; top:0px; bottom:0px; left:0px; right:0px; z-index:2147483647; background:black; opacity:0.01; height:637px; width:1366px;"],center a[href*="mangatoon"],#navkanan[class*="scroll"],#bottom-banner-ads,footer.perapih.chf,#Notifikasi{display:none !important;visibility:hidden !important;opacity:0 !important;}.hidden-items{position:fixed;top:-9999px;left:-9999px;}/* exception */.judulseries .iklan{display:block !important;visibility:visible !important;opacity:1 !important;}';
    var s_elem = document.createElement('style');
    s_elem.type = 'text/css';
    s_elem.id = '_style';
    s_elem.innerHTML = s_str;
    document.body.appendChild(s_elem);
    
    var tools_interval = 'manual|7/2/2021, 9:39:01 AM';
    var chk_cf = el('h1 [data-translate="checking_browser"]') || el('h1 .cf-error-type') || el('meta[name="captcha-bypass"]'); //cloudflare
    var is_cf = chk_cf ? true : false;
    if (!is_cf) ls_saveLocal('https://bakomon.github.io/page/bookmark/comic-bookmark.js', 'comic_tools_bookmark', 'js', tools_interval);
    ls_saveLocal('https://bakomon.github.io/page/reader/comic-reader.js', 'comic_tools_reader', 'js', tools_interval);
    if (localStorage.getItem('comic_tools_js')) localStorage.removeItem('comic_tools_js');
    
    /* auto login bookmark */
    /*var elem_chk = setInterval(function() {
      if (el('.bc_login') && !el('.bc_login').classList.contains('_hidden')) {
        clearInterval(elem_chk);
        if (is_login && !el('.bc_login').classList.contains('_hidden')) {
          el('.bc_login .bc_email').value = '';
          el('.bc_login .bc_pass').value = '';
          el('.bc_login .bc_in').click();
        }
      }
    }, 100);*/
  }
}
  
/* Detect mobile device https://stackoverflow.com/a/11381730/7598333 */
function isMobile() {
  var a = navigator.userAgent || navigator.vendor || window.opera;
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
}
  
if (isMobile()) {
  /* mobile browser support custom javascript */
  document.documentElement.classList.add('is-mobile');
  window.addEventListener('DOMContentLoaded', comic_tools);
} else {
  comic_tools(); /* "DOMContentLoaded" already on extension "User JavaScript and CSS" */
  /* window.addEventListener('DOMContentLoaded', comic_tools); */
}
