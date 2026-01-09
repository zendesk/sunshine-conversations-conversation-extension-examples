$(document).ready(function() {
	var initConfig = null;
	var $button = $("#activateMessenger");

	$button.prop('disabled', true);

	$.ajax({
		url: "/api/config",
		type: 'GET',
		contentType: 'application/json',
		success: function(result) {
			initConfig = JSON.parse(result);
			$button.prop('disabled', false);
		},
		error: function() {
			console.error('Failed to load Smooch config');
		}
	});

	$button.on('click touchstart', function(e) {
		if (!initConfig) return;
		Smooch.init(initConfig);
		Smooch.open();
	});
});
