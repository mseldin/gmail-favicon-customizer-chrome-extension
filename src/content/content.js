"use strict";

var GFC = (function () {

  var _img_data_uri = null, // base image
      _num_unread = null, // number of unread messages
      _check_update_frequency = 1000, // how often (ms) to update favicon
      _favicon = null;

  function _init() {
    _wait_for_email();
  }

  function _wait_for_email() {
    var email = _get_user_email();
    if (email) {
      _load_settings(email.toLowerCase());
    } else {
      setTimeout(_wait_for_email, 1000);
    }
  }

  function _get_user_email() {
    var acct = document.querySelector('a[aria-label*="Google Account"]');
    if (acct) {
      var match = acct.getAttribute('aria-label').match(/([\w.+-]+@[\w.-]+)/);
      if (match) return match[1];
    }
    var mailto = document.querySelector('a[href^="mailto:"]');
    if (mailto) return mailto.getAttribute('href').replace('mailto:', '');
    return null;
  }

  function _load_settings(email) {
    chrome.storage.local.get('gmail_accounts', function (items) {
      var accts = items.gmail_accounts || [];
      for (var i = 0; i < accts.length; i++) {
        if (accts[i].email === email) {
          _img_data_uri = accts[i].favicon;
          _setup_favicon_and_watcher();
          break;
        }
      }
    });
  }

  function _update_favicon_and_num_messages() {
    var match = document.title.match(/\((\d+)\)/),
        num_unread = match ? parseInt(match[1], 10) : 0,
        display_num = num_unread > 99 ? '99+' : num_unread;
    if (_num_unread !== num_unread) {
      var anim = num_unread > _num_unread ? 'pop' : 'none';
      _favicon.badge(display_num, {animation: anim});
      _num_unread = num_unread;
    }
  }

  function _setup_favicon_and_watcher() {
    _favicon = new Favico();
    var img = document.createElement('img');
    img.addEventListener('load', function () {
      _favicon.image(img);
      setInterval(_update_favicon_and_num_messages, _check_update_frequency);
      _update_favicon_and_num_messages();
    });
    img.src = _img_data_uri;
  }

  return {
    init: _init
  };
})();

function wait_for_resources() {
  if (typeof window.Favico === 'undefined') return setTimeout(wait_for_resources, 300);
  GFC.init();
}
wait_for_resources();

