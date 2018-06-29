$(document).ready(function() {
	$("#activateMessenger").on('click touchstart', function(e) {
	  $.ajax({
			url: "/api/appId",
			type: 'GET',
			'Content-Type': 'application/json',
			success: function(result) {
				Smooch.init(JSON.parse(result));
				Smooch.open();
	  }});
	});
});
