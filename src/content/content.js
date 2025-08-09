"use strict";

var GFC = (function(){

    var _img_data_uri = null, //base image
        _num_unread = null, //number of unread messages
        _active = false, //is this tab active
        _check_update_frequency = 1000, //how often (in ms) to set/verify favicon
        MSG_RELAY = null;


    function _init(){
        MSG_RELAY = chrome_extension_message_relay( "gmail.favicon", "content", true );
        MSG_RELAY.on('check_email_address', _check_email_address);
        _insert_page_resources();
    }

    function _update_favicon(){
        var link = document.querySelector("link[rel~='icon']");
		if (!link) {
			link = document.createElement('link');
			link.rel = 'icon';
			document.head.appendChild(link);
		}
		link.href = _img_data_uri;
		//console.log("*updating favicon, uri is "+link.href)
        
    }

    function _setup_favicon_and_watcher(){
        setInterval( _update_favicon, _check_update_frequency );
        _update_favicon();
    }

    function _check_email_address( data ){
    	console.log("checking email address: "+data.email)
        chrome.storage.local.get('gmail_accounts',function(items){
            var accts = 'gmail_accounts' in items ? items.gmail_accounts :[];
            for( var i=0; i<accts.length; i++) {
            	//accts[i].favicon = accts[i].favicon.replace(/[\n\r\t]/gm, "");
                if(accts[i].email==data.email){
                    _active = true;
                    _img_data_uri = accts[i].favicon;
                    console.log("	found uri: "+_img_data_uri)
                    break;
                }
            }
            if(_active) _setup_favicon_and_watcher();
        });
    }

    function _insert_page_resources(){
        var elems = [
            chrome.runtime.getURL( '/src/shared/message-relay/message_relay.js' ),
            chrome.runtime.getURL( '/src/page/page.js' )
        ]
        for(var i=0; i<elems.length; i++) {
            var s = document.createElement('script');
            s.src = elems[i];
            document.head.appendChild(s);
        }
    }

    return{
        init:_init
    };
})();

function wait_for_resources(){
    var needed = [
        typeof(window.chrome_extension_message_relay),
        typeof(window.Favico)
    ];
    if(needed.indexOf('undefined')!==-1) return setTimeout(wait_for_resources,300);
    GFC.init();
    console.log("*GFC Initted.")
}
wait_for_resources();