INST.AUDIO = function(){
	//API
	return {
		initialize : function(){
			console.log("using web audio");
			INST.initialize();
		},
		//xhr management
		createXHR : function(url, callback){
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';
			// Decode asynchronously
			request.onload = function() {
				INST.AUDIO.context.decodeAudioData(request.response, function(buffer) {
					callback(buffer);
					INST.loadResolved();
				}, function(){
					throw Error("Audio couldn't load!");
				});
			}
			request.send();
		},
		//the audio context
		context : window.AudioContext ? new window.AudioContext() : new window.webkitAudioContext(),
		canPlayMP3 : function(){
			var audio  = document.createElement("audio");
			return audio.canPlayType && audio.canPlayType("audio/mpeg") !== "";
		},
		canPlayOGG : function(){
			var audio  = document.createElement("audio");
			return audio.canPlayType && audio.canPlayType("audio/ogg") !== "";
		}
	}
}();


/*
 plays the audio
 */
INST.PLAYER = function(key){
	this.buffer = null;
	this.key = key;
	var audioFile = KEYMAP[key.id].audio;
	if (INST.AUDIO.canPlayMP3()) {
		var url = 'sounds/'+audioFile+".mp3";
	} else if (INST.AUDIO.canPlayOGG()){
		var url = 'sounds/'+audioFile+".ogg";
	} else {
		var url = 'sounds/'+audioFile+".wav";
	}
	INST.AUDIO.createXHR(url, $.proxy(this.bufferLoaded, this));
}


//called when teh buffer is loaded
INST.PLAYER.prototype.bufferLoaded = function(buffer){
	this.buffer = buffer;
}

var level = 0;
var levels = ["G", "D", "C", "G", "D"];
//play the note
INST.PLAYER.prototype.startNote = function(){
	console.log(this.key.id);
	if (this.key.id == levels[level]){
		if (level == levels.length-1) {
			console.log('win');
			setTimeout(function() {
				window.location = "http://localhost";
			}, 700);
		}
		else level++;
	}
	else level=0;
	var source = INST.AUDIO.context.createBufferSource();
	source.buffer = this.buffer;
	source.connect(INST.AUDIO.context.destination);
	if ($.type(source.start) === "function"){
		source.start(0);
	} else {
		source.noteOn(0);
	}
	//invoke the callback at the end of the buffer
	var duration = this.buffer.duration;
	var that = this;
	setTimeout(function(){
		that.key.endNote();
		that = null;
	}, duration*1000);
}
