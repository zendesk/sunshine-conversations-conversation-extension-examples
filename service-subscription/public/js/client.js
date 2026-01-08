$(document).ready(function() {
	var initConfig = null;

	$.ajax({
		url: "/api/config",
		type: 'GET',
		'Content-Type': 'application/json',
		success: function(result) {
			initConfig = JSON.parse(result);
		}
	});

	$("#activateMessenger").on('click touchstart', function(e) {
		Smooch.init(initConfig);
		Smooch.open();
	});
});
