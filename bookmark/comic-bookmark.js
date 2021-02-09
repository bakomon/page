(function() {
  // Simple querySelector https://codepen.io/pen/oKYOEK
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
  
  // Add script to head. data, info, boolean, element. https://codepen.io/sekedus/pen/QWKYpVR
  function addScript(i,n,f,o) {
    var dJS = document.createElement('script');
    dJS.type = 'text/javascript';
    if (n == 'in') dJS.async = (n || f) === true ? true : false;
    n == 'in' ? dJS.innerHTML = i : dJS.src = i;
    var elm = n && n.tagName ? n : f && f.tagName ? f : o && o.tagName ? o : document.querySelector('head');
    elm.appendChild(dJS);
  }
  
  // https://stackoverflow.com/a/32589289
  function firstCase(str, sep) {
    var separate = sep ? sep : ' ';
    var splitStr = str.toLowerCase().split(separate);
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
  }
  
  function bc_checkData(id) {
    return firebase.database().ref(`bookmark/comic/${id}`).once('value').then(function(snapshot) {
        return snapshot.exists() ? true : false;
    });
  }
  
  function bc_deleteData(id) {
    firebase.database().ref('bookmark/comic/' + id).remove()
      .then(function() {
        //console.log('Remove succeeded.');
      })
      .catch(function(error) {
        alert('Remove failed: ' + error.message);
      });
    
    if (is_search) el('.bc_search button').click();
    bc_mainData('remove');
    is_comic = false;
    el('.bc_comic').classList.add('bc_hidden');
  }
  
  // Firebase update vs set https://stackoverflow.com/a/38924648
  function bc_updateData(id, mangadex, title, alternative, chapter, note, type, host, url, read, image, update, similar) {
    firebase.database().ref('bookmark/comic/' + id).update({
      id: id.toLowerCase(),
      mangadex: mangadex,
      title: title,
      alternative: alternative,
      chapter: chapter.toLowerCase(),
      note: note.toLowerCase(),
      type: type.toLowerCase(),
      host: host.toLowerCase(),
      url: url.toLowerCase(),
      read: read.toLowerCase(),
      image: image,
      update: new Date(update).getTime(),
      similar: similar.toLowerCase()
    }, (error) => {
      if (error) {
        el('.mn_notif').innerHTML = 'Error!!';
        console.log(error);
      } else {
        el('.mn_notif').innerHTML = 'Done';
      }
      setTimeout(function() { el('.mn_notif').classList.add('bc_hidden'); }, 1000);
    });
    
    if (is_search) el('.bc_search button').click();
    bc_mainData('update');
  }
  
  // Firebase update vs set https://stackoverflow.com/a/38924648
  function bc_setData(id, mangadex, title, alternative, chapter, note, type, host, url, read, image, update, similar) {
    firebase.database().ref('bookmark/comic/' + id).set({
      id: id.toLowerCase(),
      mangadex: mangadex,
      title: title,
      alternative: alternative,
      chapter: chapter.toLowerCase(),
      note: note.toLowerCase(),
      type: type.toLowerCase(),
      host: host.toLowerCase(),
      url: url.toLowerCase(),
      read: read.toLowerCase(),
      image: image,
      update: new Date(update).getTime(),
      similar: similar.toLowerCase()
    }, (error) => {
      if (error) {
        el('.mn_notif').innerHTML = 'Error!!';
        console.log(error);
      } else {
        el('.mn_notif').innerHTML = 'Done';
      }
      setTimeout(function() { el('.mn_notif').classList.add('bc_hidden'); }, 1000);
    });
    
    bc_mainData('set');
  }
  
  function bc_searchResult(arr) {
    var s_txt = '<div class="cs_list" style="margin-bottom:10px;"><ul>';
    if (arr.length != 0) {
      for (var i = 0; i < arr.length; i++) {
        s_txt += '<li class="_cl';
        if (i+1 < arr.length) s_txt += ' bc_line';
        s_txt += ' flex_wrap" data-id="'+ arr[i].id +'">';
        s_txt += '<a class="_bc bc_100" href="'+ arr[i].url +'" target="_blank">'+ arr[i].title;
        if (arr[i].alternative != '') s_txt += ', '+ arr[i].alternative;
        s_txt += '</a>';
        s_txt += '<input class="cs_ch bc_input _bc bc_50" type="text" value="'+ arr[i].chapter + (arr[i].note ? ' ('+ arr[i].note +')' : '') +'" disabled>';
        s_txt += '<button class="cs_edit _bc">Edit</button>';
        s_txt += '<button class="cs_delete _bc" title="Delete">X</button>';
        s_txt += '<span class="cs_num _bc bc_selected">'+ (i+1) +'</span>';
        s_txt += '</li>';
      }
    } else {
      s_txt += '<li>Oops! Comic not found</li>';
    }
    s_txt += '</ul></div>';
    s_txt += '<div class="cs_text flex"><span class="bc_text">Search Result</span><span class="f_grow"></span><button class="cs_close _bc">Close</button></div>';
    
    el('.bc_result').innerHTML = s_txt;
    el('.bc_result').classList.remove('bc_hidden');
    el('.bc_result ul').style.height = (window.innerHeight - (el('.bc_tr1').offsetHeight + el('.cs_text').offsetHeight + 90)) + 'px';
    el('.bmark_db').classList.remove('s_shide');
    el('.mn_notif').classList.add('bc_hidden');
      
    el('.cs_close').onclick = function() {
      is_search = false;
      el('.bc_result').classList.add('bc_hidden');
      el('.bmark_db').classList.add('s_shide');
    };
    
    el('.cs_edit', 'all').forEach(function(item) {
      item.addEventListener('click', function() {
        bc_editData('search', main_data[item.parentNode.dataset.id]);
      });
    });
    
    el('.cs_delete', 'all').forEach(function(item) {
      item.addEventListener('click', function() {
        if (confirm('Delete '+ item.parentNode.dataset.id +' ?')) {
          bc_deleteData(item.parentNode.dataset.id);
        }
      });
    });
  }
  
  function bc_resetData() {
    el('.bc_id').value = '';
    el('.bc_mangadex').value = '';
    el('.bc_title').value = '';
    el('.bc_alt').value = '';
    el('.bc_ch').value = '';
    el('.bc_note').value = '';
    el('.bc_type').value = '';
    el('.bc_host').value = '';
    el('.bc_url').value = '';
    el('.bc_read').value = '';
    el('.bc_image').value = '';
    el('.bc_last').value = '';
    el('.bc_similar').value = '';
    el('.mn_notif').innerHTML = '';
    el('.mn_notif').classList.add('bc_hidden');
    el('.mn_notif').classList.remove('bc_danger');
    el('.bc_mgdx_search').classList.add('bc_hidden');
    el('.bc_date_before').classList.add('bc_hidden');
  }
  
  function bc_editData(note, data) {
    el('.bc_comic').classList.add('bc_hidden');
    if (is_search) el('.bmark_db').classList.add('s_shide');
    el('.bc_form').classList.remove('bc_hidden');
    el('.bc_set').classList.add('bc_hidden');
    el('.bc_update').classList.remove('bc_hidden');
    is_edit = true;
    
    el('.bc_id').value = data.id;
    el('.bc_mangadex').value = data.mangadex;
    el('.bc_title').value = data.title;
    el('.bc_alt').value = data.alternative;
    el('.bc_ch').value = data.chapter;
    el('.bc_note').value = data.note;
    el('.bc_type option[value="'+ data.type +'"]').selected = true;
    el('.bc_host').value = data.host;
    el('.bc_url').value = data.url;
    el('.bc_read').value = data.read;
    el('.bc_image').value = data.image;
    el('.bc_last').valueAsDate = new Date(local_date);
    el('.bc_similar').value = data.similar;
    el('.bc_ch').select();
    el('.bc_date_before').setAttribute('data-date', data.update);
    el('.bc_date_before').classList.remove('bc_hidden');
    if (el('.bc_mangadex').value == 'none') {
      el('.bc_mgdx_search').href = '//mangadex.org/search?title='+ data.id.replace(/\-/g, ' ');
      el('.bc_mgdx_search').classList.remove('bc_hidden');
    }
  }
  
  function bc_showHtml(data, note) {
    var chk = data.host.search(not_support) != -1 || wh.indexOf(data.host) != -1;
    var s_txt = '<ul>';
    s_txt += '<li class="_cm';
    if (data.similar != '' && note) s_txt += ' cm_similar';
    s_txt += ' flex_wrap" data-id="'+ data.id +'">';
    s_txt += '<a class="_bc bc_100'+ (data.similar != '' && !note ? ' cm_main' : '') +'" '+ (chk && el('title').innerHTML.search(chapter_title_rgx) == -1 ? 'href="javascript:void(0)"' : 'href="'+ data.url +'" target="_blank"') +'>'+ data.title;
    if (data.alternative != '') s_txt += ', '+ data.alternative;
    s_txt += '</a>';
    s_txt += '<input class="cm_ch bc_input _bc bc_100" type="text" value="'+ data.chapter + (data.note ? ' ('+ data.note +')' : '') +'" disabled>';
    if (data.read != '') s_txt += '<a class="_bc bc_selected'+ (chk ? '' : ' bc_hidden') +'" href="'+ data.read +'" target="_blank">Read</a>';
    s_txt += '<button class="cm_edit _bc'+ (chk ? '' : ' bc_hidden') +'">Edit</button>';
    s_txt += '<button class="cm_delete _bc'+ (chk ? '' : ' bc_hidden') +'" title="Delete">X</button>';
    s_txt += '</li>';
    s_txt += '</ul>';
    
    if (note) {
      el('.bc_comic').innerHTML += s_txt;
    } else {
      el('.bc_comic').innerHTML = s_txt;
    }
    if (data.type != '') {
      //if (!localStorage.getItem(data.id)) localStorage.setItem(data.id, 'is_'+ data.type);
      //document.body.classList.add('is-'+ data.type);
    }
  }
  
  function bc_showComic(arr, chk) {
    var cm_data, id_chk = false;
    var comic_id = wp.match(id_rgx)[1].replace(/-bahasa-indonesia(-online-terbaru)?/i, '').replace(/\.html/i, '');
    var title_id = el('title').innerHTML.replace(/&#{0,1}[a-z0-9]+;/ig, '').replace(/\([^\)]+\)/g, '').replace(/\s+/g, ' ').replace(/\s(bahasa\s)?indonesia/i, '').replace(/(man(ga|hwa|hua)|[kc]omi[kc])\s/i, '').match(/^([^\-|\||–]+)(?:\s[\-|\||–])?/)[1].replace(/\s$/, '');
    var title_rgx = new RegExp(title_id, 'i');
    for (var i = 0; i < arr.length; i++) {
      if (comic_id == arr[i].id || title_id.toLowerCase().replace(/[^\s\w]/g, '').replace(/\s/g, '-') == arr[i].id) {
        cm_data = arr[i];
        id_chk = true;
        break;
      }
      if (chk == 2 && (wp.indexOf(arr[i].id) != -1 || arr[i].id.replace(/\-/g, ' ').search(title_rgx) != -1 || arr[i].title.search(title_rgx) != -1 || arr[i].alternative.search(title_rgx) != -1)) {
        cm_data = arr[i];
        id_chk = true;
      }
    }
    
    if (!id_chk && chk != 2) bc_showComic(arr, 2); //double check if title not same as id
    if (cm_data) {
      is_comic = true;
      bc_showHtml(cm_data);
      
      if (cm_data.similar != '') {
        if (cm_data.similar.indexOf(',') == -1 && main_data[cm_data.similar]) {
          bc_showHtml(main_data[cm_data.similar], 'similar');
        } else if (cm_data.similar.indexOf(',') != -1) {
          var smlr_list = cm_data.similar.replace(/\s/g, '').split(',');
          for (var j = 0; j < smlr_list.length; j++) {
            bc_showHtml(main_data[smlr_list[j]], 'similar');
          }
        }
      }
      
      el('.bc_comic').classList.remove('bc_hidden');
      if (el('.bmark_db').classList.contains('bc_shide') && wp.search(chapter_wp_rgx) == -1 && el('title').innerHTML.search(chapter_title_rgx) == -1) {
        el('.bc_toggle').click();
      }  
      
      el('.cm_edit', 'all').forEach(function(item) {
        item.addEventListener('click', function() {
          bc_editData('comic', main_data[item.parentNode.dataset.id]);
        });
      });
      
      el('.cm_delete', 'all').forEach(function(item) {
        item.addEventListener('click', function() {
          if (confirm('Delete '+ item.parentNode.dataset.id +' ?')) {
            bc_deleteData(item.parentNode.dataset.id);
          }
        });
      });
    }
  }
  
  function bc_genData(json, query) {
    var arr = [];
    for (var key in json) {
      arr.push(json[key]);
    }
    
    // search
    if (query) {
      var key_rgx = new RegExp(query, 'ig');
      return arr.filter(item => (item.id.search(key_rgx) != -1 || item.title.search(key_rgx) != -1 || item.alternative.search(key_rgx) != -1 || item.note.search(key_rgx) != -1 || item.type.search(key_rgx) != -1 || item.host.search(key_rgx) != -1));
    } else {
      return arr;
    }
  }
  
  function bc_mainData(note, query) {
    firebase.database().ref('bookmark/comic').once('value', function(snapshot) {
      main_data = snapshot.val();
      if (query) {
        bc_searchResult(bc_genData(snapshot.val(), query));
      } else {
        arr_data = bc_genData(snapshot.val());
        if (wp != '/') bc_showComic(arr_data); //check if comic data exist and show bookmark
      }
    });
    
    if (note) {
      bc_resetData();
      is_edit = false;
      el('.bc_form').classList.add('bc_hidden');
    }
  }
  
  function startBookmark() {
    var b_txt = '';
    // css control already in css tools
    // css bookmark
    b_txt += '<style>.bc_100{width:100%;}.bc_50{width:50%;}._bmark a,._bmark a:hover,._bmark a:visited{color:#ddd;text-shadow:none;}._bmark select{-webkit-appearance:menulist-button;color:#ddd;}._bmark select:invalid{color:#757575;}._bmark select option{color:#ddd;}.bmark_db{position:fixed;top:0;bottom:0;left:0;width:350px;padding:10px;background:#17151b;border-right:1px solid #333;}.bmark_db.bc_shide{left:-350px;}.bmark_db ul{padding:0;margin:0;}.bc_line:not(.cm_similar){margin-bottom:10px;padding-bottom:10px;border-bottom:5px solid #333;}._bc{background:#252428;color:#ddd;padding:4px 8px;margin:4px;font:14px Arial;cursor:pointer;outline:0 !important;border:1px solid #3e3949;}._bc a{font-size:14px;text-decoration:none;}.bc_text{padding:4px 8px;margin:4px;}.bc_selected,._bmark button:not(.bc_no_hover):hover{background:#4267b2;border-color:#4267b2;}.bc_active{background:#238636;border-color:#238636;}.bc_danger{background:#ea4335;border-color:#ea4335;}input._bc{padding:4px;display:initial;cursor:text;height:auto;background:#252428 !important;color:#ddd !important;border:1px solid #3e3949;}input._bc:hover{border-color:#3e3949;}.bc_comic a.cm_main{background:#4267b2;padding:8px 10px;border:0;}.bc_comic .cm_ch{max-width:130px;}.bc_comic .cm_similar{margin-top:10px;padding-top:10px;border-top:1px solid #333;}.bc_result .cs_list{height:100%;overflow-y:auto;}.bc_result li,.bc_comic li{border-width:1px;}.bc_toggle{position:absolute;bottom:0;right:-40px;align-items:center;width:40px;height:40px;font-size:30px !important;padding:0;margin:0;line-height:0;}.bc_bg{position:fixed;top:0;bottom:0;left:0;right:0;background:rgba(0,0,0,.5);}.bmark_db.s_shide .bc_result,.bc_hidden{display:none;}</style>';
    // css mobile
    b_txt += '<style>.bc_mobile .bmark_db{width:80%;}.bc_mobile .bmark_db.bc_shide{left:-80%;}.bc_mobile ._bc{font-size:16px;}.bc_mobile .bc_toggle{right:-70px;width:70px;height:70px;background:transparent;color:#fff;border:0;}</style>';
    // html
    b_txt += '<div class="bc_bg bc_hidden"></div>';
    b_txt += '<div class="bmark_db s_shide bc_shide flex_wrap f_bottom">';
    b_txt += '<div class="bc_login flex_wrap bc_hidden">';
    b_txt += '<input class="bc_email bc_input _bc bc_100" type="email" placeholder="Email">';
    b_txt += '<input class="bc_pass bc_input _bc bc_100" type="password" placeholder="Password">';
    b_txt += '<div class="flex"><button class="bc_in _bc">Login</button><span class="lg_notif _bc bc_selected bc_hidden"></span></div>';
    b_txt += '</div>';// .bc_login
    b_txt += '<div class="bc_data bc_100 bc_hidden">';
    b_txt += '<div class="bc_form bc_line flex_wrap bc_hidden">';
    b_txt += '<input class="bc_id bc_input _bc bc_100" type="text" placeholder="ID">';
    b_txt += '<div class="flex bc_100"><input class="bc_mangadex bc_input _bc bc_100" type="text" placeholder="Mangadex ID"><a class="bc_mgdx_search _bc bc_selected bc_hidden" href="#" target="_blank">Search</a></div>';
    b_txt += '<input class="bc_title bc_input _bc bc_100" type="text" placeholder="Title">';
    b_txt += '<input class="bc_alt bc_input _bc bc_100" type="text" placeholder="Alternative Title">';
    b_txt += '<input class="bc_ch bc_input _bc bc_100" type="text" placeholder="Chapter" onclick="this.select()">';
    b_txt += '<input class="bc_note bc_input _bc bc_100" type="text" placeholder="Note">';
    b_txt += '<select class="bc_type bc_input _bc bc_100" required><option value="" selected disabled hidden>Type</option><option value="manga">manga</option><option value="manhua">manhua</option><option value="manhwa">manhwa</option></select>';
    b_txt += '<input class="bc_host bc_input _bc bc_100" type="text" placeholder="hostname">';
    b_txt += '<input class="bc_url bc_input _bc bc_100" type="text" placeholder="URL">';
    b_txt += '<input class="bc_read bc_input _bc bc_100" type="text" placeholder="Link to read (if web to read is different)">';
    b_txt += '<input class="bc_image bc_input _bc bc_100" type="text" placeholder="Image">';
    b_txt += '<div class="flex bc_100"><input class="bc_last bc_input _bc bc_100" type="date" title="Last Update"><button class="bc_date_before _bc bc_selected bc_hidden" onclick="document.querySelector(\'.bc_last\').valueAsDate = new Date(Number(this.dataset.date))">Before</button></div>';
    b_txt += '<input class="bc_similar bc_input _bc bc_100" type="text" placeholder="Similar">';
    b_txt += '<div class="bc_upnew bc_100 flex"><button class="bc_gen _bc">Generate</button><span class="f_grow"></span><button class="bc_close _bc">Close</button><button class="bc_set _bc bc_active bc_no_hover bc_hidden">Set</button><button class="bc_update _bc bc_active bc_no_hover bc_hidden">Update</button></div>';
    b_txt += '</div>';// .bc_form
    b_txt += '<div class="bc_result bc_line bc_hidden"></div>';
    b_txt += '<div class="bc_tr1">';
    b_txt += '<div class="bc_comic bc_line bc_hidden"></div>';
    b_txt += '<div class="bc_search bc_line flex"><input class="bc_input _bc bc_100" type="text" placeholder="Search..."><button class="_bc">GO</button></div>';
    b_txt += '<div class="bc_menu flex"><button class="bc_add _bc">Add</button><button class="bc_out _bc">Logout</button><span class="mn_notif _bc bc_selected bc_hidden"></span></div>';
    b_txt += '</div>';// .bc_tr1
    b_txt += '</div>';// .bc_data
    b_txt += '<div class="bc_toggle _bc bc_100 flex f_center">&#9733;</div>';
    b_txt += '</div>';// .bmark_db
    
    var b_html = document.createElement('div');
    b_html.style.cssText = 'position:relative;z-index:2147483647;';
    b_html.className = '_bmark cbr_mod' + (is_mobile ? ' bc_mobile' : '');
    b_html.innerHTML = b_txt;
    document.body.appendChild(b_html);
    if (is_mobile) el('.bc_toggle').classList.add('bc_no_hover');
    
    // Check login source: https://youtube.com/watch?v=iKlWaUszxB4&t=102
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) { //User is signed in.
        is_login = true;
        bc_mainData(); //Start firebase data
        el('.bc_login').classList.add('bc_hidden');
        el('.bc_data').classList.remove('bc_hidden');
      } else {
        is_login = false;
        el('.bc_login').classList.remove('bc_hidden');
        el('.bc_data').classList.add('bc_hidden');
      }
    });
    
    document.onkeyup = function(e) {
      if (el('.bc_search input') === document.activeElement && e.keyCode == 13) {
        el('.bc_search button').click(); //enter to search
      }
      // enter to set/update
      if (!el('.bc_form').classList.contains('bc_hidden') && e.keyCode == 13) {
        if (el('.bc_set').classList.contains('bc_hidden')) el('.bc_update').click();
        if (el('.bc_update').classList.contains('bc_hidden')) el('.bc_set').click();
      }
    };
    
    el('.bc_toggle').onclick = function() {
      this.classList.toggle('bc_selected');
      el('.bmark_db').classList.toggle('bc_shide');
      el('.bc_bg').classList.toggle('bc_hidden');
      if (is_mobile) document.body.style.overflow = el('.bmark_db').classList.contains('bc_shide') ? 'initial' : 'hidden';
    };
    
    el('.bc_bg').onclick = function() {
      el('.bc_toggle').click();
    };
    
    el('.bc_login .bc_in').onclick = function() {
      var userEmail = el('.bc_email').value;
      var userPass = el('.bc_pass').value;
      el('.lg_notif').innerHTML = 'Loading..';
      el('.lg_notif').classList.remove('bc_hidden');
      
      firebase.auth().signInWithEmailAndPassword(userEmail, userPass).then((user) => {
        el('.lg_notif').classList.add('bc_hidden');
      }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        el('.lg_notif').innerHTML = 'Error!!';
      });
    };
    
    el('.bc_menu .bc_out').onclick = function() {
      firebase.auth().signOut();
    };
    
    el('.bc_menu .bc_add').onclick = function() {
      bc_resetData();
      if (is_edit) {
        is_edit = false;
      } else {
        is_edit = true;
        el('.bc_form').classList.remove('bc_hidden');
      }
      el('.bc_set').classList.remove('bc_hidden');
      el('.bc_update').classList.add('bc_hidden');
      if (is_comic) el('.bc_comic').classList.add('bc_hidden');
      if (is_search) el('.bmark_db').classList.add('s_shide');
    };
    
    el('.bc_search button').onclick = function() {
      if (el('.bc_search input').value == '') return;
      if (is_edit) el('.bc_form .bc_close').click();
      bc_mainData('search', el('.bc_search input').value);
      is_search = true;
      el('.mn_notif').innerHTML = 'Loading..';
      el('.mn_notif').classList.remove('bc_hidden');
    };
    
    // klik "Generate" harus pada halaman komik project
    el('.bc_gen').onclick = function() {
      var comic_id = wp.match(id_rgx)[1].replace(/-bahasa-indonesia(-online-terbaru)?/i, '').replace(/\.html/i, '');
      el('.bc_id').value = comic_id;
      el('.bc_title').value = wh.indexOf('mangacanblog') != -1 ? firstCase(comic_id, '_') : firstCase(comic_id, '-');
      el('.bc_host').value = wh.replace(/(w{3}|m)\./, '');
      el('.bc_url').value = '//'+ wh.replace(/(w{3}|m)\./, '') + wp + (wh.indexOf('webtoons') != -1 ? wl.search : '');
      el('.bc_mgdx_search').href = '//mangadex.org/search?title='+ comic_id.replace(/[-_\.]/g, ' ');
      el('.bc_mgdx_search').classList.remove('bc_hidden');
      // for .bc_image if mangadex id exists then leave it blank, if none then it must be filled
      el('.bc_last').valueAsDate = new Date();
      
      /* Mangadex image format, example: 
      - https://mangadex.org/images/manga/58050.jpg
      - https://mangadex.org/images/manga/58050.large.jpg
      */
    };
    
    el('.bc_form .bc_close').onclick = function() {
      bc_resetData();
      is_edit = false;
      el('.bc_form').classList.add('bc_hidden');
      if (is_comic) el('.bc_comic').classList.remove('bc_hidden');
      if (is_search) el('.bmark_db').classList.remove('s_shide');
    };
    
    el('.bc_set').onclick = function() {
      el('.bc_mangadex').value = el('.bc_mangadex').value.toLowerCase();
      
      if (el('.bc_id').value == '' || el('.bc_ch').value == '') {
        alert('id or chapter is empty');
        return;
      }
      if (el('.bc_mangadex').value == '') {
        alert('mangadex id is empty or fill with "none"');
        return;
      } else {
        if (el('.bc_mangadex').value == 'none' && el('.bc_image').value == '') {
          alert('cover image is empty');
          return;
        }
        if (el('.bc_mangadex').value != 'none' && el('.bc_image').value != '') {
          alert('delete image, image is included in mangadex id');
          return;
        }
      }
      
      bc_checkData(el('.bc_id').value).then(function(res) {
        el('.mn_notif').classList.remove('bc_hidden','bc_danger');
        if (!res) {
          el('.mn_notif').innerHTML = 'Loading..';
          bc_setData(el('.bc_id').value, el('.bc_mangadex').value, el('.bc_title').value, el('.bc_alt').value, el('.bc_ch').value, el('.bc_note').value, el('.bc_type').value, el('.bc_host').value, el('.bc_url').value, el('.bc_read').value, el('.bc_image').value, el('.bc_last').value, el('.bc_similar').value);
        } else {
          el('.mn_notif').innerHTML = 'Comic already exist';
          el('.mn_notif').classList.add('bc_danger');
        }
      });
    };
    
    el('.bc_update').onclick = function() {
      if (el('.bc_id').value == '' || el('.bc_ch').value == '') {
        alert('id or chapter is empty');
        return;
      }
      if (el('.bc_mangadex').value == '') {
        alert('mangadex id is empty or fill with "none"');
        return;
      } else {
        if (el('.bc_mangadex').value == 'none' && el('.bc_image').value == '') {
          alert('cover image is empty');
          return;
        }
        if (el('.bc_mangadex').value != 'none' && el('.bc_image').value != '') {
          alert('delete image, image is included in mangadex id');
          return;
        }
      }
      
      el('.mn_notif').innerHTML = 'Loading..';
      bc_updateData(el('.bc_id').value, el('.bc_mangadex').value, el('.bc_title').value, el('.bc_alt').value, el('.bc_ch').value, el('.bc_note').value, el('.bc_type').value, el('.bc_host').value, el('.bc_url').value, el('.bc_read').value, el('.bc_image').value, el('.bc_last').value, el('.bc_similar').value);
    };
  }
  
  var main_data, arr_data;
  var wl = window.location;
  var wh = wl.hostname;
  var wp = wl.pathname;
  var is_login = false;
  var is_comic = false;
  var is_search = false;
  var is_edit = false;
  var is_mobile = document.documentElement.classList.contains('is-mobile') ? true : false; //from comic tools
  var local_date = new Date().toISOString().split('T')[0];
  var chapter_title_rgx = /\sch\.?(ap(ter)?)?\s/i;
  var chapter_wp_rgx = /(\/|\-|\_|\d+)((ch|\/c)(ap(ter)?)?|ep(isode)?)(\/|\-|\_|\d+)/i;
  var id_rgx = /\/(?:(?:baca-)?(?:komik|manga|read|[a-z]{2}\/[^\/]+|(?:title|series|comics?)(?:\/\d+)?|(?:\d{4}\/\d{2})|p)[\/\-])?([^\/\n]+)\/?(?:list)?/i;
  var not_support = /mangaku|mangacanblog|mangayu|klankomik|softkomik|sektekomik|bacakomik.co|komikindo.web.id|mangaindo.web.id|readmng|(zero|hatigarm|reaper|secret)scan[sz]/;
  
  addScript('https://www.gstatic.com/firebasejs/8.2.3/firebase-app.js');
  
  // Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyBma6cWOGzwSE4sv8SsSewIbCjTPhm7qi0",
    authDomain: "bakomon99.firebaseapp.com",
    databaseURL: "https://bakomon99.firebaseio.com",
    projectId: "bakomon99",
    storageBucket: "bakomon99.appspot.com",
    messagingSenderId: "894358128479",
    appId: "1:894358128479:web:6fbf2d52cf76da755918ea",
    measurementId: "G-Z4YQS31CXM"
  };
  
  var db_chk = setInterval(function() {
    if (typeof firebase !== 'undefined') {
      clearInterval(db_chk);
      firebase.initializeApp(firebaseConfig);
      addScript('https://www.gstatic.com/firebasejs/8.2.3/firebase-database.js');
      var db2_chk = setInterval(function() {
        if (typeof firebase.database !== 'undefined') {
          clearInterval(db2_chk);
          addScript('https://www.gstatic.com/firebasejs/8.2.3/firebase-auth.js');
          var db3_chk = setInterval(function() {
            if (typeof firebase.auth !== 'undefined') {
              clearInterval(db3_chk);
              startBookmark();
            }
          }, 100);
        }
      }, 100);
    }
  }, 100);
})();
