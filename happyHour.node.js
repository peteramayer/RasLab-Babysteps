var util = require('util'),
	twitter_lib = require('twitter'),
	tuwm = require('./twitterUpdateWithMedia.js'),
	request = require('request'),
	RaspiCam = require('raspicam'),
	fs = require('fs'),
	config = require('./config.js');

function RasLab () {
	process.on('unhandledException', function (err) {
		console.log(err);
	});	

	var twitter, twitterWithMedia, camera,
		panServo = 0, tiltServo = 1, 
		servoLimits = { hi_x: 250, lo_x: 50, hi_y: 220, lo_y: 80 },
		targetHashTag = 'HappyHour',
		messageBank = [
			'Hey! Look happy!'
		],
		ifxbank = ('negative,solarise,sketch,denoise,emboss,oilpaint,hatch,gpen,pastel,watercolour,film,blur,saturation,colourswap,washedout,posterise,colourpoint,colourbalance,cartoon,').split(',');

	function init () {
		camera = new RaspiCam( { 
			mode: 'photo', 
			output: 'default.png', 
			encoding: 'png', 
			width: 640, 
			height: 360, 
			vflip: true /* , hflip: true */ 
		} );
		twitter = new twitter_lib( config.twitterConfig );
		twitterWithMedia = new tuwm( config.twumConfig );
		openTwitterStream();
	}

	function onExitCommand (err) {
		console.log( "\nExit Command Recieved, err: " + err );
		process.exit();
	}

	function openTwitterStream () {
		twitter.stream('user', function( streamHandle ) {
		    streamHandle.on('data', onDataFromTwitter );
		   	streamHandle.on('error', onErrorFromTwitter );
		});
		takePicture( {} );
	}

	function onDataFromTwitter (data) {
    		console.log( "Got Data from Twitter! ", data );
		if ( !!data.entities && !!data.entities.hashtags ) {
			console.log("Hashtags: ", data.entities.hashtags);
		}
		if ( (!!data.entities && !!data.entities.hashtags && hasHashTag( targetHashTag, data.entities.hashtags ) ) ) {
			if ( !!data.user 
				&& !!data.user.screen_name 
				&& data.user.screen_name !== "RasLabPMA" ) 
			{
				moveServos( tiltServo, 170 );
				takePicture( data );
			} else {
				console.log( "Incoming tweet is malformed. Not responding." );
			}
		}
    }

	function onErrorFromTwitter (err) {
    	console.log( "Stream error! "+err );
   	}
	var nameer = '';
	var _tweetingnameer = '';
	function takePicture ( data, picdate ) {
		console.log( "Taking Picture!: " );		
		nameer = (Date.now());
		var picpath = "./pics/p"+nameer+".png";
		// var camercallback = f
		moveServos( tiltServo, 140 );
			
		camera.set('imxfx', ifxbank[ Math.floor(Math.random()*ifxbank.length) ] );
		camera.set("output", picpath );
		camera.on("read", function (err,d,c) {
			console.log("camera event read",err,d,c);
		} );
		camera.on("exit", onCameraSavesPicture )
		camera.start();
		
	}
	function onCameraSavesPicture (err,time, filename){ 
		console.log( "Camera Read event" + err, " filename: " + filename );
		camera.stop();
		if ( _tweetingnameer ) {
	    	tweetWithMedia( {}, "./pics/p"+nameer+".png");
		}
	}

	function tweetWithMedia (data, picpath) {
		console.log( "Tweeting... " );
		moveServos( tiltServo, 170 );
		twitterWithMedia.post( { 
			status: messageBank[ (Math.floor(messageBank.length*Math.random())) ]+" #HappyHour"
		}, picpath, tweetCallback );
	}

	function hasHashTag ( needle, hashtagStack ) {
		for ( var i = 0; i < hashtagStack.length; i++ ) {
			if ( hashtagStack[i].text.toLowerCase() == needle.toLowerCase() ) {
				return hashtagStack[i].text;
			}
		} 
		return false;
	}	

	function hasHasEffectHashtag ( needle, hashtagStack ) {
		for ( var i = 0; i < hashtagStack.length; i++ ) {
			if ( needle.match( hashtagStack[i].text + ',' ) ) {
				return true;
			}
		} 
		return false;
	}

	function moveServos( servo, angle ) {
		console.log( "moveServos... ", servo, angle );
		var valid = false;
		if ( servo === panServo ) {
			valid = true;
			if ( angle > servoLimits.hi_x ) angle = servoLimits.hi_x;
			if ( angle < servoLimits.lo_x ) angle = servoLimits.lo_x;
		}
		if ( servo === tiltServo ) {
			valid = true
			if ( angle > servoLimits.hi_y ) angle = servoLimits.hi_y;
			if ( angle < servoLimits.lo_y ) angle = servoLimits.lo_y;
		}
		if ( valid ) {
			console.log( servo + '=' + angle + '\n' );
			var ServoBlaster = fs.createWriteStream('/dev/servoblaster');
			ServoBlaster.end( servo + '=' + angle + '\n' );
		} else {
			console.log( 'Invalid servo movement: '+servo + '=' + angle + '\n' );
		}
	}

	function tweetCallback (data, response) {
		console.log( "Tweeted!" );
	}

	init();
}


var RL = new RasLab();

