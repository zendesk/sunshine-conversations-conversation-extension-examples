'use strict';

(function(d, s, id) {
    var js,
        fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://cdn.smooch.io/webview-sdk.min.js';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'WebviewSdkScript'));

window.utils = {
	getParameterByName: function(name) {
	    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	},
	postResponse: function(data) {
        $.ajax({
			url: '/api/response/',
			type: 'POST',
			data: JSON.stringify(Object.assign({
				appId: utils.getParameterByName('appId'),
				userId: utils.getParameterByName('userId')
			}, data)),
			contentType: 'application/json',
			success: WebviewSdk.close.bind(WebviewSdk)
        });
	}
};

window.app = {
	state: { },
	init: function(onStateChange, onComplete) {
		var app = this;
		$(function () {
  			window.webviewSdkInit = function(WebviewSdk) {
  				var docWidth = $('body').width();
  				var $screen = $('.screen');
  				var $actionBtns = $('.action-next, .action-back, .action-full, .list-item-next');

     			if (docWidth < 770) {
					$screen.hide().eq (0).css({ display: 'flex' })
					$actionBtns.on('click', function(e) {
						var $this = $(this);
						var $parent = $this.parents('.screen');
						var direction = $this.data('direction');
						var $next = (direction == 'next') ? $parent.next('.screen') : (direction == 'back') ? $parent.prev('.screen') : $('#' + direction);
						
						if ($next.length == 0) {
							onComplete(app, $this);
							WebviewSdk.close();
							return;
						}

						onStateChange(app, $this);
						$parent.css({ display: 'none' });
						$next.css({ display: 'flex' });
						$next.find('.body').scrollTop (0);
					});
    			}

    			$('.collapse').on('shown.bs.collapse', function () {
      				this.scrollIntoView();
    			});
  			};
  		});
	}
};
