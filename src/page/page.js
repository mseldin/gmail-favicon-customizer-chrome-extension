"use strict";

window.GMAIL_FAVICON_CUSTOMIZER = (function(){

    var _user_email = null,
        MSG_RELAY = null;

    function _get_user_email(){
        if(typeof GLOBALS !== 'undefined' && GLOBALS[10]) return GLOBALS[10];
        if(typeof window.opener !== 'undefined' && window.opener && window.opener.GLOBALS && window.opener.GLOBALS[10]) return window.opener.GLOBALS[10];
        var acct = document.querySelector('a[aria-label*="Google Account"]');
        if(acct){
            var match = acct.getAttribute('aria-label').match(/([\w.+-]+@[\w.-]+)/);
            if(match) return match[1];
        }
        var mailto = document.querySelector('a[href^="mailto:"]');
        if(mailto) return mailto.getAttribute('href').replace('mailto:','');
        return null;
    }

    function _init(){
        MSG_RELAY = chrome_extension_message_relay( "gmail.favicon", "page", true );
        _user_email = _get_user_email();
        if(_user_email) MSG_RELAY.send( 'check_email_address', MSG_RELAY.levels.content, {email:_user_email} );
    }

    return{
        init:_init
    }
})();


function wait_for_gfc_resources(){
    if( typeof(chrome_extension_message_relay) === 'undefined' ) return setTimeout(wait_for_gfc_resources,300);
    GMAIL_FAVICON_CUSTOMIZER.init();
    console.log("*GMAIL_FAVICON_CUSTOMIZER has been initialized")
}
wait_for_gfc_resources();