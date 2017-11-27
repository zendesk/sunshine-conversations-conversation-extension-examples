'use strict';
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const Smooch = require('smooch-core');
const jwt = require('jsonwebtoken');


const token = jwt.sign({
	scope: 'appUser',
	userId: 'default'
}, process.env.APP_SECRET, {
	header: {
		alg: 'HS256',
		typ: 'JWT',
		kid: process.env.APP_KEY_ID
	}
});

const PORT = process.env.PORT || 8999;

const intentHandlers = {
	'book_room': function(appId, userId) {
		return smooch.appUsers.sendMessage(appId, userId, {
		    role: 'appMaker',
		    type: 'text',
		    text: 'We have the following suites available with connecting rooms for 2 nights arriving on Tuesday 12th December.',
		    actions: [{
		        type: 'webview',
		        text: 'Choose your room',
		        uri: `${process.env.SERVICE_URL}/examples/hotel-booking?userId=${userId}&appId=${appId}`,
		        fallback: process.env.SERVICE_URL
		    }]
		});
	},
	'room_booked': function(appId, userId) {
		return smooch.appUsers.sendMessage(appId, userId, {
		    role: 'appMaker',
		    type: 'text',
		    text: 'What time may we expect you on Tuesday? Is there anything we can assist or prepare for your stay?'
		});
	}
};

const smooch = new Smooch({
	keyId: process.env.KEY_ID,
	secret: process.env.SECRET,
	scope: 'account'
});

express()
	.use(express.static('public'))
	.get('/sdk/smooch.js', smoochWebSdkScriptHandler)
	.use(bodyParser.json())
	.post('/api/response', responseHandler)
	.post('/api/webhooks', webhookHandler)
	.listen(PORT, () => console.log('listening on port ' + PORT));

function responseHandler(req, res) {
	res.end();
	console.log(req.body);
	smooch.appUsers.sendMessage(req.body.appId, req.body.userId, {
		metadata: { intent: req.body.intent},
		mediaUrl: process.env.SERVICE_URL + req.body.imagePath,
	    text: req.body.text,
	    role: 'appUser',
	    type: 'image',
	});
}

function webhookHandler(req, res) {
	res.end();
	try {
		if (req.body.trigger !== 'message:appUser') {
			return res.end();
		}

		let intentHandler, data;

		for (const message of req.body.messages) {
			if (message.metadata && message.metadata.intent) {
				intentHandler = intentHandlers[message.metadata.intent];
				data = message.metadata;
			}
		}

		if (intentHandler) {
			intentHandler(req.body.app._id, req.body.appUser._id, data).catch(err => console.log('err in p', err));
		}
	} catch(err) {
		console.log('err in r', err);
	}
}

function smoochWebSdkScriptHandler(req, res) {
	var script = `
	    !function(e,n,t,r){
	        function o(){try{var e;if((e="string"==typeof this.response?JSON.parse(this.response):this.response).url){
	        var t=n.getElementsByTagName("script")[0],r=n.createElement("script");r.async=!0,r.src=e.url,t.parentNode.insertBefore(r,t)}}catch(e){}}
	        var s,p,a,i=[],c=[];e[t]={init:function(){s=arguments;var e={then:function(n){return c.push({type:"t",next:n}),e},catch:function(n){
	        return c.push({type:"c",next:n}),e}};return e},on:function(){i.push(arguments)},render:function(){p=arguments},destroy:function(){a=arguments}},
	        e.__onWebMessengerHostReady__=function(n){if(delete e.__onWebMessengerHostReady__,e[t]=n,s)for(var r=n.init.apply(n,s),o=0;o<c.length;o++){
	        var u=c[o];r="t"===u.type?r.then(u.next):r.catch(u.next)}p&&n.render.apply(n,p),a&&n.destroy.apply(n,a);for(o=0;o<i.length;o++)n.on.apply(n,i[o])};
	        var u=new XMLHttpRequest;u.addEventListener("load",o),u.open("GET","https://"+r+".webloader.smooch.io/",!0),u.responseType="json",u.send()
	    }(window,document,"Smooch","${process.env.APP_ID}");

	    Smooch.init({ appId: "${process.env.APP_ID}", userId: "default", jwt: "${token}" })
	    	.then(function() {
	    		Smooch.logout();
	    		Smooch.open();
	    	});
	`;

	res.send(script);
}