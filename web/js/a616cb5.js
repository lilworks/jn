/* globals Tone, StartAudioContext */


var Interface = {
    isMobile : false
};

/**
 *
 *
 *  INIT
 *
 */
$(function(){
    var topbar = $("<div>").attr("id", "TopBar");
    $("body").prepend(topbar);

    if (typeof Logo !== "undefined"){
        Logo({
            "container" : topbar.get(0),
            "height" : topbar.height() - 6,
            "width" : 140
        });

    }
    $("<div>")
        .attr("id", "Examples")
        .attr("title", "examples")
        .html("<a href='./index.html'>examples</a>")
        .appendTo(topbar);
    //mobile start
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        Interface.isMobile = true;
        $("body").addClass("Mobile");
        var element = $("<div>", {"id" : "MobileStart"}).appendTo("body");
        var button = $("<div>").attr("id", "Button").text("Enter").appendTo(element);
        StartAudioContext(Tone.context, button, function(){
            element.remove();
        });
    }
});

/**
 *
 *	LOADING INDICATOR
 *
 */
Interface.Loader = function(){
    this.element = $("<div>", {
        "id" : "Loading",
    }).appendTo("body");

    this.text = $("<div>", {
        "id" : "Text",
        "text" : "Loading"
    }).appendTo(this.element);

    Tone.Buffer.on("load", function(){
        this.element.addClass("Loaded");
    }.bind(this));
};

/**
 *
 *
 *  DRAGGER
 *
 */
Interface.Dragger = function(params){

    if ($("#DragContainer").length === 0){
        $("<div>", {
            "id" : "DragContainer"
        }).appendTo(params.parent || "#Content");
    }

    this.container = $("#DragContainer");

    /**
     *  the tone object
     */
    this.tone = params.tone;

    /**
     *  callbacks
     */
    this.start = params.start;

    this.end = params.end;

    this.drag = params.drag;

    /**
     *  the name
     */
    var name = params.name ? params.name : this.tone ? this.tone.toString() : "";

    /**
     *  elements
     */
    this.element = $("<div>", {
        "class" : "Dragger",
        "id" : name
    }).appendTo(this.container)
        .on("dragMove", this._ondrag.bind(this))
        .on("touchstart mousedown", this._onstart.bind(this))
        .on("dragEnd touchend mouseup", this._onend.bind(this));

    this.name = $("<div>", {
        "id" : "Name",
        "text" : name
    }).appendTo(this.element);

    this.element.draggabilly({
        "axis" : this.axis,
        "containment": this.container
    });

    /**
     *  x slider
     */
    var xParams = params.x;
    xParams.axis = "x";
    xParams.element = this.element;
    xParams.tone = this.tone;
    xParams.container = this.container;
    this.xAxis = new Interface.Slider(xParams);

    /**
     *  y slider
     */
    var yParams = params.y;
    yParams.axis = "y";
    yParams.element = this.element;
    yParams.tone = this.tone;
    yParams.container = this.container;
    this.yAxis = new Interface.Slider(yParams);

    //set the axis indicator
    var position = this.element.position();
    this.halfSize = this.xAxis.halfSize;
    this.xAxis.axisIndicator.css("top", position.top + this.halfSize);
    this.yAxis.axisIndicator.css("left", position.left + this.halfSize);
};

Interface.Dragger.prototype._ondrag = function(e, pointer){
    if (this.drag){
        this.drag();
    }
    this.xAxis._ondrag(e, pointer);
    this.yAxis._ondrag(e, pointer);
    var position = this.element.position();
    this.xAxis.axisIndicator.css("top", position.top + this.halfSize);
    this.yAxis.axisIndicator.css("left", position.left + this.halfSize);
};

Interface.Dragger.prototype._onstart = function(e){
    if (this.start){
        this.start();
    }
    this.xAxis._onstart(e);
    this.yAxis._onstart(e);
};

Interface.Dragger.prototype._onend = function(e){
    if (this.end){
        this.end();
    }
    this.xAxis._onend(e);
    this.yAxis._onend(e);
    var position = this.element.position();
    this.xAxis.axisIndicator.css("top", position.top + this.halfSize);
    this.yAxis.axisIndicator.css("left", position.left + this.halfSize);
};



/**
 *
 *
 *  SLIDER
 *
 */
Interface.Slider = function(params){

    this.tone = params.tone;

    /**
     *  the name
     */
    var name = params.name ? params.name : this.tone ? this.tone.toString() : "";

    /**
     *  callback functions
     */
    this.start = params.start;

    this.end = params.end;

    this.drag = params.drag;

    /**
     *  the axis indicator
     */
    this.axis = params.axis || "x";

    if (!params.element){

        this.container = $("<div>", {
            "class" : "Slider "+this.axis,
        }).appendTo(params.parent || "#Content");

        this.element = $("<div>", {
            "class" : "Dragger",
            "id" : name
        }).appendTo(this.container)
            .on("dragMove", this._ondrag.bind(this))
            .on("touchstart mousedown", this._onstart.bind(this))
            .on("dragEnd touchend mouseup", this._onend.bind(this));

        this.name = $("<div>", {
            "id" : "Name",
            "text" : name
        }).appendTo(this.element);

        this.element.draggabilly({
            "axis" : this.axis,
            "containment": this.container.get(0)
        });
    } else {
        this.element = params.element;

        this.container = params.container;
    }

    this.axisIndicator = $("<div>", {
        "id" : this.axis + "Axis",
        "class" : "Axis"
    }).appendTo(this.container);

    /**
     *  the initial value / position
     */
    this.parameter = params.param || false;
    //default values
    this.min = typeof params.min === "undefined" ? 0 : params.min;
    this.max = typeof params.max === "undefined" ? 1 : params.max;
    this.exp = typeof params.exp === "undefined" ? 1 : params.exp;
    if (params.options){
        this.options = params.options;
        this.min = 0;
        this.max = this.options.length - 1;
        this.exp = params.exp || 1;
    }

    /**
     *  cache some measurements for later
     */
    this.halfSize = this.element.width() / 2;

    this.maxAxis = this.axis === "x" ? "width" : "height";
    this.posAxis = this.axis === "x" ? "left" : "top";
    this.oppositeAxis = this.axis === "x" ? "top" : "left";

    /**
     *  initial value
     */
    if (this.parameter || typeof params.value !== "undefined"){

        var paramValue = typeof params.value !== "undefined" ? params.value : this.tone.get(this.parameter);

        this.value(paramValue);
    }
};

Interface.Slider.prototype.value = function(val){
    var maxSize = this.container[this.maxAxis]() - this.element[this.maxAxis]();
    //y gets inverted
    if (this.axis === "y"){
        maxSize = this.container[this.maxAxis]() - maxSize;
    }

    if (val.hasOwnProperty(this.parameter)){
        val = val[this.parameter];
    }

    if (this.options){
        val = this.options.indexOf(val);
    }

    var pos = (val - this.min) / (this.max - this.min);
    pos = Math.pow(pos, 1 / this.exp) * (maxSize );
    this.element.css(this.posAxis, pos);

    if (this.options){
        this._setParam(this.options[val]);
    }
};


Interface.Slider.prototype._ondrag = function(e, pointer){
    if (typeof this.top === "undefined"){
        this.top = this.container.offset().top;
        this.left = this.container.offset().left;
    }

    var normPos;
    if (this.axis === "x"){
        var xVal = Math.max((pointer.pageX - this.left), 0);
        normPos =  xVal / (this.container.width());
    }  else {
        var yVal = Math.max((pointer.pageY - this.top ), 0);
        normPos =  yVal / (this.container.height());
        normPos = 1 - normPos;
    }
    normPos = Math.pow(normPos, this.exp);

    var result = normPos * (this.max - this.min) + this.min;

    result = Math.max(Math.min(this.max, result), this.min);

    var value = result;

    if (this.options){
        value = this.options[Math.round(result)];
    }

    if (this.drag){
        this.drag(value);
    }

    this._setParam(value);
};

Interface.Slider.prototype._onstart = function(e){
    e.preventDefault();
    if (this.start){
        this.start();
    }
};

Interface.Slider.prototype._onend = function(){
    if (this.end){
        this.end();
    }
};

Interface.Slider.prototype._setParam = function(value){
    if (this.parameter && this.tone){
        this.tone.set(this.parameter, value);
    }
};

/**
 *
 * BUTTON
 *
 */
Interface.Button = function(params){

    this.activeText = params.activeText || false;

    this.text = params.text || "Button";

    this.type = params.type || "moment";

    this.element = $("<div>", {
        "class" : "Button",
        "text" : this.text
    }).appendTo(params.parent || "#Content")
        .on("mousedown touchstart", this._start.bind(this));

    if (this.type === "moment"){
        this.element.on("mouseup touchend", this._end.bind(this));
    } else {
        this.element.addClass("Toggle");
    }

    /**
     *  the button state
     */
    this.active = false;

    /**
     *  callbacks
     */
    this.start = params.start;
    this.end = params.end;

    /**
     *  key presses
     */
    if (params.key){
        this.key = params.key;
        $(window).on("keydown", this._keydown.bind(this));
        if (this.type === "moment"){
            $(window).on("keyup", this._keyup.bind(this));
        }
    }
};

Interface.Button.prototype._start = function(e){
    if (e){
        e.preventDefault();
    }
    if (!this.active){
        this.active = true;
        this.element.addClass("Active");
        if (this.activeText){
            this.element.text(this.activeText);
        }
        if (this.start){
            this.start();
        }
    } else if (this.type === "toggle" && this.active){
        this._end();
    }
};

Interface.Button.prototype._end = function(e){
    if (e){
        e.preventDefault();
    }
    if (this.active){
        this.active = false;
        this.element.removeClass("Active");
        this.element.text(this.text);
        if (this.end){
            this.end();
        }
    }
};

Interface.Button.prototype._keydown = function(e){
    if (e.which === this.key){
        e.preventDefault();
        this._start();
    }
};

Interface.Button.prototype._keyup = function(e){
    if (e.which === this.key){
        e.preventDefault();
        this._end();
    }
};

/**
 *
 *	TRANSPORT
 *
 */
Interface.Transport = function(){

    this.element = $("<div>", {
        "class" : "Transport",
    }).appendTo("#Content");

    this.position = $("<div>", {
        "id" : "Position"
    }).appendTo(this.element);

    this._boundLoop = this._loop.bind(this);
    this._loop();
};

Interface.Transport.prototype._loop = function(){
    setTimeout(this._boundLoop, 50);
    this.position.text(Tone.Transport.position);
};
/**
 *  StartAudioContext.js
 *  @author Yotam Mann
 *  @license http://opensource.org/licenses/MIT MIT License
 *  @copyright 2016 Yotam Mann
 */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory)
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory()
    } else {
        root.StartAudioContext = factory()
    }
}(this, function () {

    //TAP LISTENER/////////////////////////////////////////////////////////////

    /**
     * @class  Listens for non-dragging tap ends on the given element
     * @param {Element} element
     * @internal
     */
    var TapListener = function(element, context){

        this._dragged = false

        this._element = element

        this._bindedMove = this._moved.bind(this)
        this._bindedEnd = this._ended.bind(this, context)

        element.addEventListener("touchmove", this._bindedMove)
        element.addEventListener("touchend", this._bindedEnd)
        element.addEventListener("mouseup", this._bindedEnd)
    }

    /**
     * drag move event
     */
    TapListener.prototype._moved = function(e){
        this._dragged = true
    };

    /**
     * tap ended listener
     */
    TapListener.prototype._ended = function(context){
        if (!this._dragged){
            startContext(context)
        }
        this._dragged = false
    };

    /**
     * remove all the bound events
     */
    TapListener.prototype.dispose = function(){
        this._element.removeEventListener("touchmove", this._bindedMove)
        this._element.removeEventListener("touchend", this._bindedEnd)
        this._element.removeEventListener("mouseup", this._bindedEnd)
        this._bindedMove = null
        this._bindedEnd = null
        this._element = null
    };

    //END TAP LISTENER/////////////////////////////////////////////////////////

    /**
     * Plays a silent sound and also invoke the "resume" method
     * @param {AudioContext} context
     * @private
     */
    function startContext(context){
        // this accomplishes the iOS specific requirement
        var buffer = context.createBuffer(1, 1, context.sampleRate)
        var source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        source.start(0)

        // resume the audio context
        if (context.resume){
            context.resume()
        }
    }

    /**
     * Returns true if the audio context is started
     * @param  {AudioContext}  context
     * @return {Boolean}
     * @private
     */
    function isStarted(context){
        return context.state === "running"
    }

    /**
     * Invokes the callback as soon as the AudioContext
     * is started
     * @param  {AudioContext}   context
     * @param  {Function} callback
     */
    function onStarted(context, callback){

        function checkLoop(){
            if (isStarted(context)){
                callback()
            } else {
                requestAnimationFrame(checkLoop)
                if (context.resume){
                    context.resume()
                }
            }
        }

        if (isStarted(context)){
            callback()
        } else {
            checkLoop()
        }
    }

    /**
     * Add a tap listener to the audio context
     * @param  {Array|Element|String|jQuery} element
     * @param {Array} tapListeners
     */
    function bindTapListener(element, tapListeners, context){
        if (Array.isArray(element) || (NodeList && element instanceof NodeList)){
            for (var i = 0; i < element.length; i++){
                bindTapListener(element[i], tapListeners, context)
            }
        } else if (typeof element === "string"){
            bindTapListener(document.querySelectorAll(element), tapListeners, context)
        } else if (element.jquery && typeof element.toArray === "function"){
            bindTapListener(element.toArray(), tapListeners, context)
        } else if (Element && element instanceof Element){
            //if it's an element, create a TapListener
            var tap = new TapListener(element, context)
            tapListeners.push(tap)
        }
    }

    /**
     * @param {AudioContext} context The AudioContext to start.
     * @param {Array|String|Element|jQuery} elements For iOS, the list of elements
     *                                               to bind tap event listeners
     *                                               which will start the AudioContext.
     * @param {Function=} callback The callback to invoke when the AudioContext is started.
     * @return {Promise} The promise is invoked when the AudioContext
     *                       is started.
     */
    function StartAudioContext(context, elements, callback){

        //the promise is invoked when the AudioContext is started
        var promise = new Promise(function(success) {
            onStarted(context, success)
        })

        // The TapListeners bound to the elements
        var tapListeners = []

        // add all the tap listeners
        if (elements){
            bindTapListener(elements, tapListeners, context)
        }

        //dispose all these tap listeners when the context is started
        promise.then(function(){
            for (var i = 0; i < tapListeners.length; i++){
                tapListeners[i].dispose()
            }
            tapListeners = null

            if (callback){
                callback()
            }
        })

        return promise
    }

    return StartAudioContext
}))
var jnSynth = {

    chordDuration:3,
    scaleDuration:2,
    scaleVelocity:220,
    digit2tones : Array('C','C#','D','D#','E','F','F#','G','G#','A','A#','B'),
    piano : null ,
    init : function(instrumentName){
        if(!instrumentName)
            instrumentName = "piano";
        Synth instanceof AudioSynth; // true
        var testInstance = new AudioSynth;
        testInstance instanceof AudioSynth; // true
        testInstance === Synth; // true
        this.piano = Synth.createInstrument(instrumentName);
    },

    play : function(digits , mode ){
        if(!$.isArray(digits)){
            digits = digits.split(",");
        }


        if( mode == 'scale' && digits[0]<12){
            var dmem = 0;
           for (var i in digits){
               digits[i] = parseFloat(digits[i])+parseFloat(24);
               var count = 1;
               while(dmem>=digits[i]){
                   digits[i] = parseFloat(digits[i])+parseFloat(12);
                   count++;
               }

                   dmem = digits[i];
           }
        }

        digits.sort();
        $.each(digits,function(key,value){
            if(key>0){
                if(digits[key-1]>value){
                    console.log(key,value , digits[key]);
                    if(digits[key-1]-value>12){
                        digits[key]=parseInt(digits[key])+24;
                    }else{
                        digits[key]=parseInt(digits[key])+12;
                    }

                    console.log(key,value,digits[key]);
                }
            }
        });
        if(mode!="scale") {
            for (d = 0; d < digits.length; d++) {
                if (digits[d] > 0) {
                    octave = Math.floor(digits[d] / 12);
                    toneName = this.digit2tones[digits[d] % 12];

                    this.piano.play(toneName, octave, this.chordDuration);
                }
            }
        }else{
            if(this.counter)
                window.clearInterval(this.counter);
                l=0;
                this.o = Array();
                for(d=0;d<digits.length;d++){
                    if(digits[d]>0){
                        this.o[l] = Array( this.digit2tones[digits[d] % 12] , Math.floor(digits[d] / 12) );
                        l++;
                    }
                }
                this.count = 0;
                this.tot=l;
                this.counter = setInterval(this.timer, this.scaleVelocity);
            }

        },
        timer : function () {
            jnSynth.piano.play(jnSynth.o[jnSynth.count][0], jnSynth.o[jnSynth.count][1], jnSynth.scaleDuration);
            if(jnSynth.count<jnSynth.tot-1){
                jnSynth.count++;
            }else{
                window.clearInterval(jnSynth.counter);
            }
        }
}



jnPlay = function(mode,digits){



    for(d=0;d<digits.length;d++){
        if(digits[d]>0){
            jnPlayFreq(jnGetFreq(digits[d]));
        }
    }

}
/*
jnPlay = function(mode,digits){
    if(clearAllSounds()){
        if(mode == "chord")
            jnPlayChord(digits);
        else
            jnPlayScale(digits);
    }
}
*/
jnPlayTone = function(digit){
    window['s_'+digit] = new Audio("/sounds/bass/"+digit+".ogg");
    window['s_'+digit].play();
}

jnPlayChord = function(digits){
    for(d=0;d<digits.length;d++){
        if(digits[d]>0){
            window['s_'+d] = new Audio("/sounds/bass/"+digits[d]+".ogg");
            window['s_'+d].play();
        }
    }
}

jnPlayScale = function(digits){
    digits.sort();
    l=0;
    for(d=0;d<digits.length;d++){
        if(digits[d]>0){
            window['s_'+d] = new Audio("/sounds/bass/"+digits[d]+".ogg");
            l++;
        }
    }

    var count = 0;
    var tot=l;

    var counter = setInterval(timer, 150);
    function timer() {
        window['s_'+count].play();
        if(count<tot-1){
            count++;
        }else{
            window.clearInterval(counter);
        }

    }

}

clearAllSounds = function(){
    for(var s in window){
        if(s.search("s_") == 0 && window[s]){
            //window[s].currentTime = 0;
            window[s].pause();
        }
    }
    return true;
}

jnGetFreq = function(n){
    return 440*Math.pow(2,(n-49)/12);
}

jnPlayFreq = function(f){
    context = new AudioContext;
    oscillator = context.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = f;
    oscillator.connect(context.destination);
    oscillator.start(0);
}


$(document).ready(function(){
    jnSynth.init();
    console.log("DOCUMENT READY jnSynth.init()")
});

var Synth, AudioSynth, AudioSynthInstrument;
!function(){

	var URL = window.URL || window.webkitURL;
	var Blob = window.Blob;

	if(!URL || !Blob) {
		throw new Error('This browser does not support AudioSynth');
	}

	var _encapsulated = false;
	var AudioSynthInstance = null;
	var pack = function(c,arg){ return [new Uint8Array([arg, arg >> 8]), new Uint8Array([arg, arg >> 8, arg >> 16, arg >> 24])][c]; };
	var setPrivateVar = function(n,v,w,e){Object.defineProperty(this,n,{value:v,writable:!!w,enumerable:!!e});};
	var setPublicVar = function(n,v,w){setPrivateVar.call(this,n,v,w,true);};
	AudioSynthInstrument = function AudioSynthInstrument(){this.__init__.apply(this,arguments);};
	var setPriv = setPrivateVar.bind(AudioSynthInstrument.prototype);
	var setPub = setPublicVar.bind(AudioSynthInstrument.prototype);
	setPriv('__init__', function(a,b,c) {
		if(!_encapsulated) { throw new Error('AudioSynthInstrument can only be instantiated from the createInstrument method of the AudioSynth object.'); }
		setPrivateVar.call(this, '_parent', a);
		setPublicVar.call(this, 'name', b);
		setPrivateVar.call(this, '_soundID', c);
	});
	setPub('play', function(note, octave, duration) {
		return this._parent.play(this._soundID, note, octave, duration);
	});
	setPub('generate', function(note, octave, duration) {
		return this._parent.generate(this._soundID, note, octave, duration);
	});
	AudioSynth = function AudioSynth(){if(AudioSynthInstance instanceof AudioSynth){return AudioSynthInstance;}else{ this.__init__(); return this; }};
	setPriv = setPrivateVar.bind(AudioSynth.prototype);
	setPub = setPublicVar.bind(AudioSynth.prototype);
	setPriv('_debug',false,true);
	setPriv('_bitsPerSample',16);
	setPriv('_channels',1);
	setPriv('_sampleRate',44100,true);
	setPub('setSampleRate', function(v) {
		this._sampleRate = Math.max(Math.min(v|0,44100), 4000);
		this._clearCache();
		return this._sampleRate;
	});
	setPub('getSampleRate', function() { return this._sampleRate; });
	setPriv('_volume',32768,true);
	setPub('setVolume', function(v) {
		v = parseFloat(v); if(isNaN(v)) { v = 0; }
		v = Math.round(v*32768);
		this._volume = Math.max(Math.min(v|0,32768), 0);
		this._clearCache();
		return this._volume;
	});
	setPub('getVolume', function() { return Math.round(this._volume/32768*10000)/10000; });
	setPriv('_notes',{'C':261.63,'C#':277.18,'D':293.66,'D#':311.13,'E':329.63,'F':346.23,'F#':369.99,'G':392.00,'G#':415.30,'A':440.00,'A#':466.16,'B':493.88});
	setPriv('_fileCache',[],true);
	setPriv('_temp',{},true);
	setPriv('_sounds',[],true);
	setPriv('_mod',[function(i,s,f,x){return Math.sin((2 * Math.PI)*(i/s)*f+x);}]);
	setPriv('_resizeCache', function() {
		var f = this._fileCache;
		var l = this._sounds.length;
		while(f.length<l) {
			var octaveList = [];
			for(var i = 0; i < 8; i++) {
				var noteList = {};
				for(var k in this._notes) {
					noteList[k] = {};
				} 
				octaveList.push(noteList);
			}
			f.push(octaveList);
		}
	});
	setPriv('_clearCache', function() {
		this._fileCache = [];
		this._resizeCache();
	});
	setPub('generate', function(sound, note, octave, duration) {
		var thisSound = this._sounds[sound];
		if(!thisSound) {
			for(var i=0;i<this._sounds.length;i++) {
				if(this._sounds[i].name==sound) {
					thisSound = this._sounds[i];
					sound = i;
					break;
				}
			}
		}
		if(!thisSound) { throw new Error('Invalid sound or sound ID: ' + sound); }
		var t = (new Date).valueOf();
		this._temp = {};
		octave |= 0;
		octave = Math.min(8, Math.max(1, octave));
		var time = !duration?2:parseFloat(duration);
		if(typeof(this._notes[note])=='undefined') { throw new Error(note + ' is not a valid note.'); }
		if(typeof(this._fileCache[sound][octave-1][note][time])!='undefined') {
			if(this._debug) { console.log((new Date).valueOf() - t, 'ms to retrieve (cached)'); }
			return this._fileCache[sound][octave-1][note][time];
		} else {
			var frequency = this._notes[note] * Math.pow(2,octave-4);
			var sampleRate = this._sampleRate;
			var volume = this._volume;
			var channels = this._channels;
			var bitsPerSample = this._bitsPerSample;
			var attack = thisSound.attack(sampleRate, frequency, volume);
			var dampen = thisSound.dampen(sampleRate, frequency, volume);
			var waveFunc = thisSound.wave;
			var waveBind = {modulate: this._mod, vars: this._temp};
			var val = 0;
			var curVol = 0;

			var data = new Uint8Array(new ArrayBuffer(Math.ceil(sampleRate * time * 2)));
			var attackLen = (sampleRate * attack) | 0;
			var decayLen = (sampleRate * time) | 0;

			for (var i = 0 | 0; i !== attackLen; i++) {
		
				val = volume * (i/(sampleRate*attack)) * waveFunc.call(waveBind, i, sampleRate, frequency, volume);

				data[i << 1] = val;
				data[(i << 1) + 1] = val >> 8;

			}

			for (; i !== decayLen; i++) {

				val = volume * Math.pow((1-((i-(sampleRate*attack))/(sampleRate*(time-attack)))),dampen) * waveFunc.call(waveBind, i, sampleRate, frequency, volume);

				data[i << 1] = val;
				data[(i << 1) + 1] = val >> 8;

			}

			var out = [
				'RIFF',
				pack(1, 4 + (8 + 24/* chunk 1 length */) + (8 + 8/* chunk 2 length */)), // Length
				'WAVE',
				// chunk 1
				'fmt ', // Sub-chunk identifier
				pack(1, 16), // Chunk length
				pack(0, 1), // Audio format (1 is linear quantization)
				pack(0, channels),
				pack(1, sampleRate),
				pack(1, sampleRate * channels * bitsPerSample / 8), // Byte rate
				pack(0, channels * bitsPerSample / 8),
				pack(0, bitsPerSample),
				// chunk 2
				'data', // Sub-chunk identifier
				pack(1, data.length * channels * bitsPerSample / 8), // Chunk length
				data
			];
			var blob = new Blob(out, {type: 'audio/wav'});
			var dataURI = URL.createObjectURL(blob);
			this._fileCache[sound][octave-1][note][time] = dataURI;
			if(this._debug) { console.log((new Date).valueOf() - t, 'ms to generate'); }
			return dataURI;
		}
	});
	setPub('play', function(sound, note, octave, duration) {
		var src = this.generate(sound, note, octave, duration);
		var audio = new Audio(src);
		audio.play();
		return true;
	});
	setPub('debug', function() { this._debug = true; });
	setPub('createInstrument', function(sound) {
		var n = 0;
		var found = false;
		if(typeof(sound)=='string') {
			for(var i=0;i<this._sounds.length;i++) {
				if(this._sounds[i].name==sound) {
					found = true;
					n = i;
					break;
				}
			}
		} else {
			if(this._sounds[sound]) {
				n = sound;
				sound = this._sounds[n].name;
				found = true;
			}
		}
		if(!found) { throw new Error('Invalid sound or sound ID: ' + sound); }
		_encapsulated = true;
		var ins = new AudioSynthInstrument(this, sound, n);
		_encapsulated = false;
		return ins;
	});
	setPub('listSounds', function() {
		var r = [];
		for(var i=0;i<this._sounds.length;i++) {
			r.push(this._sounds[i].name);
		}
		return r;
	});
	setPriv('__init__', function(){
		this._resizeCache();
	});
	setPub('loadSoundProfile', function() {
		for(var i=0,len=arguments.length;i<len;i++) {
			o = arguments[i];
			if(!(o instanceof Object)) { throw new Error('Invalid sound profile.'); }
			this._sounds.push(o);
		}
		this._resizeCache();
		return true;
	});
	setPub('loadModulationFunction', function() {
		for(var i=0,len=arguments.length;i<len;i++) {
			f = arguments[i];
			if(typeof(f)!='function') { throw new Error('Invalid modulation function.'); }
			this._mod.push(f);
		}
		return true;
	});
	AudioSynthInstance = new AudioSynth();
	Synth = AudioSynthInstance;
}();

Synth.loadModulationFunction(
	function(i, sampleRate, frequency, x) { return 1 * Math.sin(2 * Math.PI * ((i / sampleRate) * frequency) + x); },
	function(i, sampleRate, frequency, x) { return 1 * Math.sin(4 * Math.PI * ((i / sampleRate) * frequency) + x); },
	function(i, sampleRate, frequency, x) { return 1 * Math.sin(8 * Math.PI * ((i / sampleRate) * frequency) + x); },
	function(i, sampleRate, frequency, x) { return 1 * Math.sin(0.5 * Math.PI * ((i / sampleRate) * frequency) + x); },
	function(i, sampleRate, frequency, x) { return 1 * Math.sin(0.25 * Math.PI * ((i / sampleRate) * frequency) + x); },
	function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(2 * Math.PI * ((i / sampleRate) * frequency) + x); },
	function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(4 * Math.PI * ((i / sampleRate) * frequency) + x); },
	function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(8 * Math.PI * ((i / sampleRate) * frequency) + x); },
	function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(0.5 * Math.PI * ((i / sampleRate) * frequency) + x); },
	function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(0.25 * Math.PI * ((i / sampleRate) * frequency) + x); }
);

Synth.loadSoundProfile({
	name: 'piano',
	attack: function() { return 0.002; },
	dampen: function(sampleRate, frequency, volume) {
		return Math.pow(0.5*Math.log((frequency*volume)/sampleRate),2);
	},
	wave: function(i, sampleRate, frequency, volume) {
		var base = this.modulate[0];
		return this.modulate[1](
			i,
			sampleRate,
			frequency,
			Math.pow(base(i, sampleRate, frequency, 0), 2) +
				(0.75 * base(i, sampleRate, frequency, 0.25)) +
				(0.1 * base(i, sampleRate, frequency, 0.5))
		);
	}
},
{
	name: 'organ',
	attack: function() { return 0.3 },
	dampen: function(sampleRate, frequency) { return 1+(frequency * 0.01); },
	wave: function(i, sampleRate, frequency) {
		var base = this.modulate[0];
		return this.modulate[1](
			i,
			sampleRate,
			frequency,
			base(i, sampleRate, frequency, 0) +
				0.5*base(i, sampleRate, frequency, 0.25) +
				0.25*base(i, sampleRate, frequency, 0.5)
		);
	}
},
{
	name: 'acoustic',
	attack:	function() { return 0.002; },
	dampen: function() { return 1; },
	wave: function(i, sampleRate, frequency) {

		var vars = this.vars;
		vars.valueTable = !vars.valueTable?[]:vars.valueTable;
		if(typeof(vars.playVal)=='undefined') { vars.playVal = 0; }
		if(typeof(vars.periodCount)=='undefined') { vars.periodCount = 0; }
	
		var valueTable = vars.valueTable;
		var playVal = vars.playVal;
		var periodCount = vars.periodCount;

		var period = sampleRate/frequency;
		var p_hundredth = Math.floor((period-Math.floor(period))*100);

		var resetPlay = false;

		if(valueTable.length<=Math.ceil(period)) {
	
			valueTable.push(Math.round(Math.random())*2-1);
	
			return valueTable[valueTable.length-1];
	
		} else {
	
			valueTable[playVal] = (valueTable[playVal>=(valueTable.length-1)?0:playVal+1] + valueTable[playVal]) * 0.5;
	
			if(playVal>=Math.floor(period)) {
				if(playVal<Math.ceil(period)) {
					if((periodCount%100)>=p_hundredth) {
						// Reset
						resetPlay = true;
						valueTable[playVal+1] = (valueTable[0] + valueTable[playVal+1]) * 0.5;
						vars.periodCount++;	
					}
				} else {
					resetPlay = true;	
				}
			}
	
			var _return = valueTable[playVal];
			if(resetPlay) { vars.playVal = 0; } else { vars.playVal++; }
	
			return _return;
	
		}
	}
},
{
	name: 'edm',
	attack:	function() { return 0.002; },
	dampen: function() { return 1; },
	wave: function(i, sampleRate, frequency) {
		var base = this.modulate[0];
		var mod = this.modulate.slice(1);
		return mod[0](
			i,
			sampleRate,
			frequency,
			mod[9](
				i,
				sampleRate,
				frequency,
				mod[2](
					i,
					sampleRate,
					frequency,
					Math.pow(base(i, sampleRate, frequency, 0), 3) +
						Math.pow(base(i, sampleRate, frequency, 0.5), 5) +
						Math.pow(base(i, sampleRate, frequency, 1), 7)
				)
			) +
				mod[8](
					i,
					sampleRate,
					frequency,
					base(i, sampleRate, frequency, 1.75)
				)
		);
	}
});

function diagram(canvasId,datas) {


    Diagram = this;
    this.c = document.getElementById(canvasId);
    this.ctx = this.c.getContext("2d");

    this.width = this.c.width;
    this.height = this.c.height;

    this.radius = (this.width - 50) / 2;
    this.point_size = 2;
    this.center_x = this.width / 2;
    this.center_y = this.height / 2;
    this.points = [];

    this.intervales = [];
    this.datas = datas;


    this.init = function () {
        this.draw();
    }


    this.drawPoint = function (angle, distance, label, color) {
        var x = this.center_x + this.radius * Math.cos(-angle * Math.PI / 180) * distance;
        var y = this.center_y + this.radius * Math.sin(-angle * Math.PI / 180) * distance;
        var x2 = this.center_x + this.radius * Math.cos(-angle * Math.PI / 180) * distance * 1.2;
        var y2 = this.center_y + this.radius * Math.sin(-angle * Math.PI / 180) * distance * 1.2;

        this.ctx.beginPath();

        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = '#' + color;
        this.ctx.fillText(label, x2, y2);


        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.arc(x, y, this.point_size, 0, 2 * Math.PI);
        this.ctx.fill();

        return [x, y];

    }

    this.draw = function () {
        this.ctx.beginPath();
        this.ctx.arc(this.center_x, this.center_y, this.radius, 0, 2 * Math.PI);
        this.ctx.stroke();

        for (i = 0; i < 24; i++) {

            Diagram.drawPoint(360 * i / 12 + 3 * 360 / 12, 1, "");
            if (Diagram.datas[i]) {
                var p = Diagram.drawPoint(-360 * i / 12 + 3 * 360 / 12, 1, Diagram.datas[i][1], Diagram.datas[i][2]);
                Diagram.points.push([p[0], p[1]]);
            }

        }

        $.each(Diagram.points, function (index1, value1) {
            $.each(Diagram.points, function (index2, value2) {
                Diagram.ctx.beginPath();
                Diagram.ctx.moveTo(value1[0], value1[1]);
                Diagram.ctx.lineTo(value2[0], value2[1]);
                Diagram.ctx.strokeStyle = 'rgba(0,0,0,.2)';
                Diagram.ctx.stroke();
            });
        });


    }

    this.init();
}
function diagram2(canvasId,datas) {



    Diagram2 = this;

    this.c = document.getElementById(canvasId);
    this.ctx = this.c.getContext("2d");

    this.margin=5;
    this.width = this.c.height-2*this.margin;
    this.height = this.c.height-2*this.margin;

    this.radius =  (this.width-50)/2;
    this.point_size = 2;
    this.center_x = this.width/2;
    this.center_y = this.height/2;
    this.points = [];
    this.rects = [];

    this.intervales = [];
    this.datas = datas;

    this.tones = Array("C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab","A","A#/Bb","B");





    this.drawPoint = function(angle,distance,label,pseudoCase){
        var x = this.center_x + this.radius * Math.cos(-angle*Math.PI/180) * distance;
        var y = this.center_y + this.radius * Math.sin(-angle*Math.PI/180) * distance;
        var x2 = this.center_x + this.radius * Math.cos(-angle*Math.PI/180) * distance*1.1;
        var y2 = this.center_y + this.radius * Math.sin(-angle*Math.PI/180) * distance*1.1;

        this.ctx.beginPath();

        this.ctx.font = "11px Arial";

        this.ctx.fillText(label, x2  ,y2 );


        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.arc(x, y, this.point_size, 0, 2 * Math.PI);
        this.ctx.fill();


        this.rects.push({x: x, y:y , w: 30, h: 10 , case:pseudoCase,string:0});



        return [x,y];

    }

    this.draw = function(){
        this.ctx.beginPath();
        this.ctx.arc(this.center_x, this.center_y, this.radius, 0, 2 * Math.PI);
        this.ctx.stroke();

        for(i=0;i<12;i++){

            Diagram2.drawPoint(360 * i / 12 + 3*360/12,1,"");
            //if(Diagram2.datas[i]){
                var p = Diagram2.drawPoint(- 360 * i / 12 +  3*360/12,1,this.tones[i] ,i  );
                Diagram2.points.push([p[0],p[1]]);
            //}

        }
        /*
        $.each(Diagram.points,function(index1,value1){
            $.each(Diagram.points,function(index2,value2){
                Diagram2.ctx.beginPath();
                Diagram2.ctx.moveTo(value1[0],value1[1]);
                Diagram2.ctx.lineTo(value2[0],value2[1]);
                Diagram2.ctx.strokeStyle = 'rgba(0,0,0,.2)';
                Diagram2.ctx.stroke();
            });
        });
*/

    }

    Diagram2.draw();

    console.log(this);

}
/*!
 * Draggabilly PACKAGED v1.2.4
 * Make that shiz draggable
 * http://draggabilly.desandro.com
 * MIT license
 */

!function(t){function e(){}function n(t){function n(e){e.prototype.option||(e.prototype.option=function(e){t.isPlainObject(e)&&(this.options=t.extend(!0,this.options,e))})}function o(e,n){t.fn[e]=function(o){if("string"==typeof o){for(var s=i.call(arguments,1),a=0,p=this.length;p>a;a++){var u=this[a],d=t.data(u,e);if(d)if(t.isFunction(d[o])&&"_"!==o.charAt(0)){var c=d[o].apply(d,s);if(void 0!==c)return c}else r("no such method '"+o+"' for "+e+" instance");else r("cannot call methods on "+e+" prior to initialization; attempted to call '"+o+"'")}return this}return this.each(function(){var i=t.data(this,e);i?(i.option(o),i._init()):(i=new n(this,o),t.data(this,e,i))})}}if(t){var r="undefined"==typeof console?e:function(t){console.error(t)};return t.bridget=function(t,e){n(e),o(t,e)},t.bridget}}var i=Array.prototype.slice;"function"==typeof define&&define.amd?define("jquery-bridget/jquery.bridget",["jquery"],n):n("object"==typeof exports?require("jquery"):t.jQuery)}(window),function(t){function e(t){return new RegExp("(^|\\s+)"+t+"(\\s+|$)")}function n(t,e){var n=i(t,e)?r:o;n(t,e)}var i,o,r;"classList"in document.documentElement?(i=function(t,e){return t.classList.contains(e)},o=function(t,e){t.classList.add(e)},r=function(t,e){t.classList.remove(e)}):(i=function(t,n){return e(n).test(t.className)},o=function(t,e){i(t,e)||(t.className=t.className+" "+e)},r=function(t,n){t.className=t.className.replace(e(n)," ")});var s={hasClass:i,addClass:o,removeClass:r,toggleClass:n,has:i,add:o,remove:r,toggle:n};"function"==typeof define&&define.amd?define("classie/classie",s):"object"==typeof exports?module.exports=s:t.classie=s}(window),function(t){function e(t){if(t){if("string"==typeof i[t])return t;t=t.charAt(0).toUpperCase()+t.slice(1);for(var e,o=0,r=n.length;r>o;o++)if(e=n[o]+t,"string"==typeof i[e])return e}}var n="Webkit Moz ms Ms O".split(" "),i=document.documentElement.style;"function"==typeof define&&define.amd?define("get-style-property/get-style-property",[],function(){return e}):"object"==typeof exports?module.exports=e:t.getStyleProperty=e}(window),function(t){function e(t){var e=parseFloat(t),n=-1===t.indexOf("%")&&!isNaN(e);return n&&e}function n(){}function i(){for(var t={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},e=0,n=s.length;n>e;e++){var i=s[e];t[i]=0}return t}function o(n){function o(){if(!h){h=!0;var i=t.getComputedStyle;if(u=function(){var t=i?function(t){return i(t,null)}:function(t){return t.currentStyle};return function(e){var n=t(e);return n||r("Style returned "+n+". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"),n}}(),d=n("boxSizing")){var o=document.createElement("div");o.style.width="200px",o.style.padding="1px 2px 3px 4px",o.style.borderStyle="solid",o.style.borderWidth="1px 2px 3px 4px",o.style[d]="border-box";var s=document.body||document.documentElement;s.appendChild(o);var a=u(o);c=200===e(a.width),s.removeChild(o)}}}function a(t){if(o(),"string"==typeof t&&(t=document.querySelector(t)),t&&"object"==typeof t&&t.nodeType){var n=u(t);if("none"===n.display)return i();var r={};r.width=t.offsetWidth,r.height=t.offsetHeight;for(var a=r.isBorderBox=!(!d||!n[d]||"border-box"!==n[d]),h=0,f=s.length;f>h;h++){var l=s[h],g=n[l];g=p(t,g);var v=parseFloat(g);r[l]=isNaN(v)?0:v}var y=r.paddingLeft+r.paddingRight,m=r.paddingTop+r.paddingBottom,E=r.marginLeft+r.marginRight,b=r.marginTop+r.marginBottom,P=r.borderLeftWidth+r.borderRightWidth,x=r.borderTopWidth+r.borderBottomWidth,_=a&&c,w=e(n.width);w!==!1&&(r.width=w+(_?0:y+P));var S=e(n.height);return S!==!1&&(r.height=S+(_?0:m+x)),r.innerWidth=r.width-(y+P),r.innerHeight=r.height-(m+x),r.outerWidth=r.width+E,r.outerHeight=r.height+b,r}}function p(e,n){if(t.getComputedStyle||-1===n.indexOf("%"))return n;var i=e.style,o=i.left,r=e.runtimeStyle,s=r&&r.left;return s&&(r.left=e.currentStyle.left),i.left=n,n=i.pixelLeft,i.left=o,s&&(r.left=s),n}var u,d,c,h=!1;return a}var r="undefined"==typeof console?n:function(t){console.error(t)},s=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"];"function"==typeof define&&define.amd?define("get-size/get-size",["get-style-property/get-style-property"],o):"object"==typeof exports?module.exports=o(require("desandro-get-style-property")):t.getSize=o(t.getStyleProperty)}(window),function(t){function e(e){var n=t.event;return n.target=n.target||n.srcElement||e,n}var n=document.documentElement,i=function(){};n.addEventListener?i=function(t,e,n){t.addEventListener(e,n,!1)}:n.attachEvent&&(i=function(t,n,i){t[n+i]=i.handleEvent?function(){var n=e(t);i.handleEvent.call(i,n)}:function(){var n=e(t);i.call(t,n)},t.attachEvent("on"+n,t[n+i])});var o=function(){};n.removeEventListener?o=function(t,e,n){t.removeEventListener(e,n,!1)}:n.detachEvent&&(o=function(t,e,n){t.detachEvent("on"+e,t[e+n]);try{delete t[e+n]}catch(i){t[e+n]=void 0}});var r={bind:i,unbind:o};"function"==typeof define&&define.amd?define("eventie/eventie",r):"object"==typeof exports?module.exports=r:t.eventie=r}(window),function(){function t(){}function e(t,e){for(var n=t.length;n--;)if(t[n].listener===e)return n;return-1}function n(t){return function(){return this[t].apply(this,arguments)}}var i=t.prototype,o=this,r=o.EventEmitter;i.getListeners=function(t){var e,n,i=this._getEvents();if(t instanceof RegExp){e={};for(n in i)i.hasOwnProperty(n)&&t.test(n)&&(e[n]=i[n])}else e=i[t]||(i[t]=[]);return e},i.flattenListeners=function(t){var e,n=[];for(e=0;e<t.length;e+=1)n.push(t[e].listener);return n},i.getListenersAsObject=function(t){var e,n=this.getListeners(t);return n instanceof Array&&(e={},e[t]=n),e||n},i.addListener=function(t,n){var i,o=this.getListenersAsObject(t),r="object"==typeof n;for(i in o)o.hasOwnProperty(i)&&-1===e(o[i],n)&&o[i].push(r?n:{listener:n,once:!1});return this},i.on=n("addListener"),i.addOnceListener=function(t,e){return this.addListener(t,{listener:e,once:!0})},i.once=n("addOnceListener"),i.defineEvent=function(t){return this.getListeners(t),this},i.defineEvents=function(t){for(var e=0;e<t.length;e+=1)this.defineEvent(t[e]);return this},i.removeListener=function(t,n){var i,o,r=this.getListenersAsObject(t);for(o in r)r.hasOwnProperty(o)&&(i=e(r[o],n),-1!==i&&r[o].splice(i,1));return this},i.off=n("removeListener"),i.addListeners=function(t,e){return this.manipulateListeners(!1,t,e)},i.removeListeners=function(t,e){return this.manipulateListeners(!0,t,e)},i.manipulateListeners=function(t,e,n){var i,o,r=t?this.removeListener:this.addListener,s=t?this.removeListeners:this.addListeners;if("object"!=typeof e||e instanceof RegExp)for(i=n.length;i--;)r.call(this,e,n[i]);else for(i in e)e.hasOwnProperty(i)&&(o=e[i])&&("function"==typeof o?r.call(this,i,o):s.call(this,i,o));return this},i.removeEvent=function(t){var e,n=typeof t,i=this._getEvents();if("string"===n)delete i[t];else if(t instanceof RegExp)for(e in i)i.hasOwnProperty(e)&&t.test(e)&&delete i[e];else delete this._events;return this},i.removeAllListeners=n("removeEvent"),i.emitEvent=function(t,e){var n,i,o,r,s=this.getListenersAsObject(t);for(o in s)if(s.hasOwnProperty(o))for(i=s[o].length;i--;)n=s[o][i],n.once===!0&&this.removeListener(t,n.listener),r=n.listener.apply(this,e||[]),r===this._getOnceReturnValue()&&this.removeListener(t,n.listener);return this},i.trigger=n("emitEvent"),i.emit=function(t){var e=Array.prototype.slice.call(arguments,1);return this.emitEvent(t,e)},i.setOnceReturnValue=function(t){return this._onceReturnValue=t,this},i._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},i._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return o.EventEmitter=r,t},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return t}):"object"==typeof module&&module.exports?module.exports=t:o.EventEmitter=t}.call(this),function(t,e){"function"==typeof define&&define.amd?define("unipointer/unipointer",["eventEmitter/EventEmitter","eventie/eventie"],function(n,i){return e(t,n,i)}):"object"==typeof exports?module.exports=e(t,require("wolfy87-eventemitter"),require("eventie")):t.Unipointer=e(t,t.EventEmitter,t.eventie)}(window,function(t,e,n){function i(){}function o(){}o.prototype=new e,o.prototype.bindStartEvent=function(t){this._bindStartEvent(t,!0)},o.prototype.unbindStartEvent=function(t){this._bindStartEvent(t,!1)},o.prototype._bindStartEvent=function(e,i){i=void 0===i?!0:!!i;var o=i?"bind":"unbind";t.navigator.pointerEnabled?n[o](e,"pointerdown",this):t.navigator.msPointerEnabled?n[o](e,"MSPointerDown",this):(n[o](e,"mousedown",this),n[o](e,"touchstart",this))},o.prototype.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},o.prototype.getTouch=function(t){for(var e=0,n=t.length;n>e;e++){var i=t[e];if(i.identifier==this.pointerIdentifier)return i}},o.prototype.onmousedown=function(t){var e=t.button;e&&0!==e&&1!==e||this._pointerDown(t,t)},o.prototype.ontouchstart=function(t){this._pointerDown(t,t.changedTouches[0])},o.prototype.onMSPointerDown=o.prototype.onpointerdown=function(t){this._pointerDown(t,t)},o.prototype._pointerDown=function(t,e){this.isPointerDown||(this.isPointerDown=!0,this.pointerIdentifier=void 0!==e.pointerId?e.pointerId:e.identifier,this.pointerDown(t,e))},o.prototype.pointerDown=function(t,e){this._bindPostStartEvents(t),this.emitEvent("pointerDown",[t,e])};var r={mousedown:["mousemove","mouseup"],touchstart:["touchmove","touchend","touchcancel"],pointerdown:["pointermove","pointerup","pointercancel"],MSPointerDown:["MSPointerMove","MSPointerUp","MSPointerCancel"]};return o.prototype._bindPostStartEvents=function(e){if(e){for(var i=r[e.type],o=e.preventDefault?t:document,s=0,a=i.length;a>s;s++){var p=i[s];n.bind(o,p,this)}this._boundPointerEvents={events:i,node:o}}},o.prototype._unbindPostStartEvents=function(){var t=this._boundPointerEvents;if(t&&t.events){for(var e=0,i=t.events.length;i>e;e++){var o=t.events[e];n.unbind(t.node,o,this)}delete this._boundPointerEvents}},o.prototype.onmousemove=function(t){this._pointerMove(t,t)},o.prototype.onMSPointerMove=o.prototype.onpointermove=function(t){t.pointerId==this.pointerIdentifier&&this._pointerMove(t,t)},o.prototype.ontouchmove=function(t){var e=this.getTouch(t.changedTouches);e&&this._pointerMove(t,e)},o.prototype._pointerMove=function(t,e){this.pointerMove(t,e)},o.prototype.pointerMove=function(t,e){this.emitEvent("pointerMove",[t,e])},o.prototype.onmouseup=function(t){this._pointerUp(t,t)},o.prototype.onMSPointerUp=o.prototype.onpointerup=function(t){t.pointerId==this.pointerIdentifier&&this._pointerUp(t,t)},o.prototype.ontouchend=function(t){var e=this.getTouch(t.changedTouches);e&&this._pointerUp(t,e)},o.prototype._pointerUp=function(t,e){this._pointerDone(),this.pointerUp(t,e)},o.prototype.pointerUp=function(t,e){this.emitEvent("pointerUp",[t,e])},o.prototype._pointerDone=function(){this.isPointerDown=!1,delete this.pointerIdentifier,this._unbindPostStartEvents(),this.pointerDone()},o.prototype.pointerDone=i,o.prototype.onMSPointerCancel=o.prototype.onpointercancel=function(t){t.pointerId==this.pointerIdentifier&&this._pointerCancel(t,t)},o.prototype.ontouchcancel=function(t){var e=this.getTouch(t.changedTouches);e&&this._pointerCancel(t,e)},o.prototype._pointerCancel=function(t,e){this._pointerDone(),this.pointerCancel(t,e)},o.prototype.pointerCancel=function(t,e){this.emitEvent("pointerCancel",[t,e])},o.getPointerPoint=function(t){return{x:void 0!==t.pageX?t.pageX:t.clientX,y:void 0!==t.pageY?t.pageY:t.clientY}},o}),function(t,e){"function"==typeof define&&define.amd?define("unidragger/unidragger",["eventie/eventie","unipointer/unipointer"],function(n,i){return e(t,n,i)}):"object"==typeof exports?module.exports=e(t,require("eventie"),require("unipointer")):t.Unidragger=e(t,t.eventie,t.Unipointer)}(window,function(t,e,n){function i(){}function o(t){t.preventDefault?t.preventDefault():t.returnValue=!1}function r(t){for(;t!=document.body;)if(t=t.parentNode,"A"==t.nodeName)return t}function s(){}function a(){return!1}s.prototype=new n,s.prototype.bindHandles=function(){this._bindHandles(!0)},s.prototype.unbindHandles=function(){this._bindHandles(!1)};var p=t.navigator;s.prototype._bindHandles=function(t){t=void 0===t?!0:!!t;var n;n=p.pointerEnabled?function(e){e.style.touchAction=t?"none":""}:p.msPointerEnabled?function(e){e.style.msTouchAction=t?"none":""}:function(){t&&d(s)};for(var i=t?"bind":"unbind",o=0,r=this.handles.length;r>o;o++){var s=this.handles[o];this._bindStartEvent(s,t),n(s),e[i](s,"click",this)}};var u="attachEvent"in document.documentElement,d=u?function(t){"IMG"==t.nodeName&&(t.ondragstart=a);for(var e=t.querySelectorAll("img"),n=0,i=e.length;i>n;n++){var o=e[n];o.ondragstart=a}}:i,c=s.allowTouchstartNodes={INPUT:!0,A:!0,BUTTON:!0,SELECT:!0};return s.prototype.pointerDown=function(t,e){this._dragPointerDown(t,e);var n=document.activeElement;n&&n.blur&&n.blur(),this._bindPostStartEvents(t),this.emitEvent("pointerDown",[t,e])},s.prototype._dragPointerDown=function(t,e){this.pointerDownPoint=n.getPointerPoint(e);var i=t.target.nodeName,s="touchstart"==t.type&&(c[i]||r(t.target));s||"SELECT"==i||o(t)},s.prototype.pointerMove=function(t,e){var n=this._dragPointerMove(t,e);this.emitEvent("pointerMove",[t,e,n]),this._dragMove(t,e,n)},s.prototype._dragPointerMove=function(t,e){var i=n.getPointerPoint(e),o={x:i.x-this.pointerDownPoint.x,y:i.y-this.pointerDownPoint.y};return!this.isDragging&&this.hasDragStarted(o)&&this._dragStart(t,e),o},s.prototype.hasDragStarted=function(t){return Math.abs(t.x)>3||Math.abs(t.y)>3},s.prototype.pointerUp=function(t,e){this.emitEvent("pointerUp",[t,e]),this._dragPointerUp(t,e)},s.prototype._dragPointerUp=function(t,e){this.isDragging?this._dragEnd(t,e):this._staticClick(t,e)},s.prototype._dragStart=function(t,e){this.isDragging=!0,this.dragStartPoint=s.getPointerPoint(e),this.isPreventingClicks=!0,this.dragStart(t,e)},s.prototype.dragStart=function(t,e){this.emitEvent("dragStart",[t,e])},s.prototype._dragMove=function(t,e,n){this.isDragging&&this.dragMove(t,e,n)},s.prototype.dragMove=function(t,e,n){this.emitEvent("dragMove",[t,e,n])},s.prototype._dragEnd=function(t,e){this.isDragging=!1;var n=this;setTimeout(function(){delete n.isPreventingClicks}),this.dragEnd(t,e)},s.prototype.dragEnd=function(t,e){this.emitEvent("dragEnd",[t,e])},s.prototype.onclick=function(t){this.isPreventingClicks&&o(t)},s.prototype._staticClick=function(t,e){"INPUT"==t.target.nodeName&&"text"==t.target.type&&t.target.focus(),this.staticClick(t,e)},s.prototype.staticClick=function(t,e){this.emitEvent("staticClick",[t,e])},s.getPointerPoint=function(t){return{x:void 0!==t.pageX?t.pageX:t.clientX,y:void 0!==t.pageY?t.pageY:t.clientY}},s.getPointerPoint=n.getPointerPoint,s}),function(t,e){"function"==typeof define&&define.amd?define(["classie/classie","get-style-property/get-style-property","get-size/get-size","unidragger/unidragger"],function(n,i,o,r){return e(t,n,i,o,r)}):"object"==typeof exports?module.exports=e(t,require("desandro-classie"),require("desandro-get-style-property"),require("get-size"),require("unidragger")):t.Draggabilly=e(t,t.classie,t.getStyleProperty,t.getSize,t.Unidragger)}(window,function(t,e,n,i,o){function r(){}function s(t,e){for(var n in e)t[n]=e[n];return t}function a(t,e){this.element="string"==typeof t?d.querySelector(t):t,P&&(this.$element=P(this.element)),this.options=s({},this.constructor.defaults),this.option(e),this._create()}function p(t,e,n){return n=n||"round",e?Math[n](t/e)*e:t}for(var u,d=t.document,c=d.defaultView,h=c&&c.getComputedStyle?function(t){return c.getComputedStyle(t,null)}:function(t){return t.currentStyle},f="object"==typeof HTMLElement?function(t){return t instanceof HTMLElement}:function(t){return t&&"object"==typeof t&&1==t.nodeType&&"string"==typeof t.nodeName},l=0,g="webkit moz ms o".split(" "),v=t.requestAnimationFrame,y=t.cancelAnimationFrame,m=0;m<g.length&&(!v||!y);m++)u=g[m],v=v||t[u+"RequestAnimationFrame"],y=y||t[u+"CancelAnimationFrame"]||t[u+"CancelRequestAnimationFrame"];v&&y||(v=function(e){var n=(new Date).getTime(),i=Math.max(0,16-(n-l)),o=t.setTimeout(function(){e(n+i)},i);return l=n+i,o},y=function(e){t.clearTimeout(e)});var E=n("transform"),b=!!n("perspective"),P=t.jQuery;s(a.prototype,o.prototype),a.defaults={},a.prototype.option=function(t){s(this.options,t)},a.prototype._create=function(){this.position={},this._getPosition(),this.startPoint={x:0,y:0},this.dragPoint={x:0,y:0},this.startPosition=s({},this.position);var t=h(this.element);"relative"!=t.position&&"absolute"!=t.position&&(this.element.style.position="relative"),this.enable(),this.setHandles()},a.prototype.setHandles=function(){this.handles=this.options.handle?this.element.querySelectorAll(this.options.handle):[this.element],this.bindHandles()},a.prototype.dispatchEvent=function(e,n,i){var o=[n].concat(i);this.emitEvent(e,o);var r=t.jQuery;if(r&&this.$element)if(n){var s=r.Event(n);s.type=e,this.$element.trigger(s,i)}else this.$element.trigger(e,i)},a.prototype._getPosition=function(){var t=h(this.element),e=parseInt(t.left,10),n=parseInt(t.top,10);this.position.x=isNaN(e)?0:e,this.position.y=isNaN(n)?0:n,this._addTransformPosition(t)},a.prototype._addTransformPosition=function(t){if(E){var e=t[E];if(0===e.indexOf("matrix")){var n=e.split(","),i=0===e.indexOf("matrix3d")?12:4,o=parseInt(n[i],10),r=parseInt(n[i+1],10);this.position.x+=o,this.position.y+=r}}},a.prototype.pointerDown=function(t,n){this._dragPointerDown(t,n);var i=d.activeElement;i&&i.blur&&i.blur(),this._bindPostStartEvents(t),e.add(this.element,"is-pointer-down"),this.dispatchEvent("pointerDown",t,[n])},a.prototype.pointerMove=function(t,e){var n=this._dragPointerMove(t,e);this.dispatchEvent("pointerMove",t,[e,n]),this._dragMove(t,e,n)},a.prototype.dragStart=function(t,n){this.isEnabled&&(this._getPosition(),this.measureContainment(),this.startPosition.x=this.position.x,this.startPosition.y=this.position.y,this.setLeftTop(),this.dragPoint.x=0,this.dragPoint.y=0,this.isDragging=!0,e.add(this.element,"is-dragging"),this.dispatchEvent("dragStart",t,[n]),this.animate())},a.prototype.measureContainment=function(){var t=this.options.containment;if(t){this.size=i(this.element);var e=this.element.getBoundingClientRect(),n=f(t)?t:"string"==typeof t?d.querySelector(t):this.element.parentNode;this.containerSize=i(n);var o=n.getBoundingClientRect();this.relativeStartPosition={x:e.left-o.left,y:e.top-o.top}}},a.prototype.dragMove=function(t,e,n){if(this.isEnabled){var i=n.x,o=n.y,r=this.options.grid,s=r&&r[0],a=r&&r[1];i=p(i,s),o=p(o,a),i=this.containDrag("x",i,s),o=this.containDrag("y",o,a),i="y"==this.options.axis?0:i,o="x"==this.options.axis?0:o,this.position.x=this.startPosition.x+i,this.position.y=this.startPosition.y+o,this.dragPoint.x=i,this.dragPoint.y=o,this.dispatchEvent("dragMove",t,[e,n])}},a.prototype.containDrag=function(t,e,n){if(!this.options.containment)return e;var i="x"==t?"width":"height",o=this.relativeStartPosition[t],r=p(-o,n,"ceil"),s=this.containerSize[i]-o-this.size[i];return s=p(s,n,"floor"),Math.min(s,Math.max(r,e))},a.prototype.pointerUp=function(t,n){e.remove(this.element,"is-pointer-down"),this.dispatchEvent("pointerUp",t,[n]),this._dragPointerUp(t,n)},a.prototype.dragEnd=function(t,n){this.isEnabled&&(this.isDragging=!1,E&&(this.element.style[E]="",this.setLeftTop()),e.remove(this.element,"is-dragging"),this.dispatchEvent("dragEnd",t,[n]))},a.prototype.animate=function(){if(this.isDragging){this.positionDrag();var t=this;v(function(){t.animate()})}};var x=b?function(t,e){return"translate3d( "+t+"px, "+e+"px, 0)"}:function(t,e){return"translate( "+t+"px, "+e+"px)"};return a.prototype.setLeftTop=function(){this.element.style.left=this.position.x+"px",this.element.style.top=this.position.y+"px"},a.prototype.positionDrag=E?function(){this.element.style[E]=x(this.dragPoint.x,this.dragPoint.y)}:a.prototype.setLeftTop,a.prototype.staticClick=function(t,e){this.dispatchEvent("staticClick",t,[e])},a.prototype.enable=function(){this.isEnabled=!0},a.prototype.disable=function(){this.isEnabled=!1,this.isDragging&&this.dragEnd()},a.prototype.destroy=function(){this.disable(),E&&(this.element.style[E]=""),this.element.style.left="",this.element.style.top="",this.element.style.position="",this.unbindHandles(),this.$element&&this.$element.removeData("draggabilly")},a.prototype._init=r,P&&P.bridget&&P.bridget("draggabilly",a),a});
var fingering = {

    init:function(canvasId,datas,instrumentDatas){


        Fingering = this;

        this.datas = $.parseJSON(datas.replace(/&quot;/g, '\"'));
        this.instrumentDatas = $.parseJSON(instrumentDatas.replace(/&quot;/g, '\"'));


        this.canvasId = canvasId;
        this.c = document.getElementById(canvasId);
        this.width = this.c.width;
        this.height = this.c.height;
        this.ctx = this.c.getContext("2d");
        this.formatedMatrice = [];
        this.minX = 0;

        $.each($.parseJSON(instrumentDatas.replace(/&quot;/g, '\"')), function (index, value) {
            if(!Fingering.formatedMatrice[value.currentString]){
                Fingering.formatedMatrice[value.currentString] = [];
            }
            if(!Fingering.formatedMatrice[value.currentString][value.currentCase]){
                Fingering.formatedMatrice[value.currentString][value.currentCase] = [];
            }
            Fingering.formatedMatrice[value.currentString][value.currentCase]["case"] = value.currentCase;
            Fingering.formatedMatrice[value.currentString][value.currentCase]["string"] = value.currentString;
            Fingering.formatedMatrice[value.currentString][value.currentCase]["digitA"] = value.currentDigitA;
            Fingering.formatedMatrice[value.currentString][value.currentCase]["digit"] = value.currentDigit;
            Fingering.formatedMatrice[value.currentString][value.currentCase]["intervale"] = {};
            Fingering.formatedMatrice[value.currentString][value.currentCase]["octave"] = value.currentOctave;
        });



        Fingering.aXList = this.datas.xList.split(",");
        Fingering.aXListOs = this.datas.xList.split(",");
        Fingering.aYList = this.datas.yList.split(",");
        var os = $.inArray("0", Fingering.aXList )

        if( os == 0  ){
            Fingering.isAnOpenString = "yes";
            Fingering.aXListOs.splice(os,1);
        }else{
            Fingering.isAnOpenString = "no";
        }

        console.log(os,Fingering.canvasId,Fingering.aXList,Fingering.isAnOpenString );
        var aIntervaleList = this.datas.intervaleList.split(",");
        var aDigitAList = this.datas.digitAList.split(",");
        var aWsNameList = this.datas.wsNameList.split(",");



        var recipientsArray = Fingering.aYList.sort();
        var reportRecipientsDuplicate = [];
        for (var i = 0; i < recipientsArray.length - 1; i++) {
            if (recipientsArray[i + 1] == recipientsArray[i]) {
                reportRecipientsDuplicate.push(recipientsArray[i]);
            }
        }
        if(reportRecipientsDuplicate.length>0){
            this.mode = "scale";
        }

        $.each(Fingering.aYList, function (index, value) {
            Fingering.formatedMatrice[value][Fingering.aXList[index]]["intervale"]={intervale:aIntervaleList[index],wsname:aWsNameList[index]}
        });


        if(this.isAnOpenString){
            this.maxX=Math.max.apply(Math,Fingering.aXListOs);
            this.minX=Math.min.apply(Math,Fingering.aXListOs);

        }else{
            this.maxX=Math.max.apply(Math,Fingering.aXList);
            this.minX=Math.min.apply(Math,Fingering.aXList);
        }

        if(this.maxX-this.minX+1 > this.deltaMin){
            this.deltaX = this.maxX-this.minX+1;
        }else{
            this.deltaX = this.deltaMin;
        }
        console.log(this.deltaX);



        this.nbrString = Fingering.formatedMatrice.length;


        this.draw();


        $("#"+canvasId).click(function () {
            jnSynth.play(aDigitAList, Fingering.mode);
        });

        return this;

    },
    draw:function(){


        this.ctx.clearRect(0, 0, this.width, this.height);


        for(i=0;i<this.nbrString;i++){


            this.dotSize = 4;

            this.osH =  20;
            this.nMX = 5;
            this.nMY = 5;
            this.nW  =this.width - 2*this.nMX;
            this.nH = (this.height - 2*this.nMY)-this.osH;
            this.nX0 =  this.nMX;
            this.nY0 = this.osH+this.nMY;
            this.iX =  this.nW/this.nbrString;
            this.iY =  this.nH/this.deltaX;


            this.ctx.beginPath();


            this.ctx.strokeStyle='gold';

            this.ctx.lineWidth=1;

            this.ctx.moveTo( this.nX0 + i * this.iX + this.iX/2, this.nY0);
            this.ctx.lineTo( this.nX0 + i * this.iX + this.iX/2, this.nY0+this.nH )  ;
            this.ctx.stroke();

            // caseloop
            for(j=0;j<this.deltaX+1;j++){

                // if begin of neck
                if(this.minX == 0 || this.minX == 1){
                    this.ctx.beginPath();
                    this.ctx.strokeStyle='#CCC';
                    this.ctx.lineWidth=0.1;
                    this.ctx.moveTo(this.nX0 ,this.nY0 - 3  );
                    this.ctx.lineTo(this.nX0 + this.nW  ,this.nY0 - 3)  ;
                    this.ctx.stroke();
                }

                console.log(this.canvasId,this.minX);

                if(this.minX > 0){
                    this.ctx.beginPath();
                    this.ctx.fillStyle = "black";
                    this.ctx.font="9px Arial";
                    this.ctx.fillText(this.roman[this.minX],   0 , this.nY0+9);

                    this.ctx.beginPath();
                    this.ctx.strokeStyle='#444';
                    this.ctx.lineWidth=.1;
                    this.ctx.moveTo(this.nX0 ,this.nY0 + j * this.iY  );
                    this.ctx.lineTo(this.nX0 + this.nW ,this.nY0 + j * this.iY)  ;
                    this.ctx.stroke();



                    if(this.formatedMatrice[i][j+this.minX]["intervale"].wsname){

                        Fingering.ctx.fillStyle = "black";
                        Fingering.ctx.fillRect(
                            Fingering.nX0 + i * Fingering.iX + Fingering.iX/2 - Fingering.dotSize/2,
                            Fingering.nY0 + j * Fingering.iY + Fingering.iY/2 - Fingering.dotSize/2
                            ,Fingering.dotSize,Fingering.dotSize);


                        Fingering.ctx.font="10px Georgia";
                        Fingering.ctx.fillText(
                            Translator.trans(this.formatedMatrice[i][j+this.minX]["intervale"].wsname),
                            Fingering.nX0 + i * Fingering.iX + Fingering.iX/2 - 4,
                            Fingering.nY0 + j * Fingering.iY + Fingering.iY/2 - 4
                            );
                        Fingering.ctx.fillText(
                            this.formatedMatrice[i][j+this.minX]["intervale"].intervale,
                            Fingering.nX0 + i * Fingering.iX + Fingering.iX/2 - 4,
                            Fingering.nY0 + j * Fingering.iY + Fingering.iY/2 + 11
                        );
                    }
                }else{
                    this.ctx.beginPath();
                    this.ctx.fillStyle = "black";
                    this.ctx.font="9px Arial";
                    this.ctx.fillText(this.roman[1],   0 , this.nY0+9);

                    this.ctx.beginPath();
                    this.ctx.strokeStyle='#444';
                    this.ctx.lineWidth=.1;
                    this.ctx.moveTo(this.nX0 ,this.nY0 + j * this.iY  );
                    this.ctx.lineTo(this.nX0 + this.nW ,this.nY0 + j * this.iY)  ;
                    this.ctx.stroke();


                    if(this.formatedMatrice[i][j+this.minX]["intervale"].wsname){

                        Fingering.ctx.fillStyle = "black";
                        Fingering.ctx.fillRect(
                            Fingering.nX0 + i * Fingering.iX + Fingering.iX/2 - Fingering.dotSize/2,
                            Fingering.nY0 + (j-1) * Fingering.iY + Fingering.iY/2 - Fingering.dotSize/2
                            ,Fingering.dotSize,Fingering.dotSize);
                        Fingering.ctx.font="10px Georgia";
                        Fingering.ctx.fillText(
                            this.formatedMatrice[i][j+this.minX]["intervale"].wsname,
                            Fingering.nX0 + i * Fingering.iX + Fingering.iX/2 - 4,
                            Fingering.nY0 + (j-1) * Fingering.iY + Fingering.iY/2 - 4
                        );
                        Fingering.ctx.fillText(
                            this.formatedMatrice[i][j+this.minX]["intervale"].intervale,
                            Fingering.nX0 + i * Fingering.iX + Fingering.iX/2 - 4,
                            Fingering.nY0 + (j-1) * Fingering.iY + Fingering.iY/2 +11
                        );
                    }
                }
            }





        }





    },
    isAnOpenString:null,
    mode:"chord",
    formatedMatrice:null,
    nbrString:0,
    minX:0,
    minY:0,
    deltaMin:3,
    deltaX:5,
    roman:['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVII','XIX','XX','XXI','XXII','XXIII','XXIV'],


};
var fingering2 = {


    init:function(canvasId,datas,instrumentDatas){


        F = this;

        this.datas = $.parseJSON(datas.replace(/&quot;/g, '\"'));
        this.instrumentDatas = $.parseJSON(instrumentDatas.replace(/&quot;/g, '\"'));


        this.canvasId = canvasId;
        this.c = document.getElementById(canvasId);
        this.width = this.c.width;
        this.height = this.c.height;
        this.ctx = this.c.getContext("2d");


        this.aXList = this.datas.xList.split(",").map(function(item) {return parseInt(item);});
        this.aYList = this.datas.yList.split(",").map(function(item) {return parseInt(item);});
        this.aIntervaleList = this.datas.intervaleList.split(",");
        var aIntervaleColorList = this.datas.intervaleColorList.split(",");
        var aDigitAList = this.datas.digitAList.split(",").map(function(item) {return parseInt(item);});
        this.aWsNameList = this.datas.wsNameList.split(",");


        console.log(F.aDigitAList);
        /*
         * Set formatedMatrice
         */
        this.FM = [];

        $.each(this.instrumentDatas, function (index, value) {
            if(!F.FM[value.currentString]){
                F.FM[value.currentString] = [];
            }
            if(!F.FM[value.currentString][value.currentCase]){
                F.FM[value.currentString][value.currentCase] = [];
            }
            F.FM[value.currentString][value.currentCase]["case"] = value.currentCase;
            F.FM[value.currentString][value.currentCase]["string"] = value.currentString;
            F.FM[value.currentString][value.currentCase]["digitA"] = value.currentDigitA;
            F.FM[value.currentString][value.currentCase]["digit"] = value.currentDigit;
            F.FM[value.currentString][value.currentCase]["intervale"] = {};
            F.FM[value.currentString][value.currentCase]["octave"] = value.currentOctave;
        });

        $.each(this.aYList, function (index, value) {
            F.FM[value][F.aXList[index]]["intervale"]={
                color:  aIntervaleColorList[index],
                intervale: F.aIntervaleList[index],
                wsname: F.aWsNameList[index]
            }
        });




        this.nbrString = this.FM.length;

        this.isAnOs = "no";
        if(!jQuery.inArray(0, this.aXList)){
            this.aXListNoOs = [];
            this.isAnOs = "yes";
            $.each(this.aXList,function(index,value){
                if(value>0){
                    F.aXListNoOs.push(value);
                }
            });
        }
        if(this.isAnOs == "yes"){
            this.maxX = Math.max.apply(Math,this.aXListNoOs);
            this.minX = Math.min.apply(Math,this.aXListNoOs);

        }else{
            this.maxX = Math.max.apply(Math,this.aXList);
            this.minX = Math.min.apply(Math,this.aXList);
        }

        if(this.maxX-this.minX+1 > this.deltaMin){
            this.deltaX = this.maxX - this.minX + 1;
        }else{
            this.deltaX = this.deltaMin;
        }

        this.draw();


        var recipientsArray = F.aYList.sort();
        var reportRecipientsDuplicate = [];
        for (var i = 0; i < recipientsArray.length - 1; i++) {
            if (recipientsArray[i + 1] == recipientsArray[i]) {
                reportRecipientsDuplicate.push(recipientsArray[i]);
            }
        }
        if(reportRecipientsDuplicate.length>0){
            var mode = "scale";
        }else{
            var mode = "chord";
        }

        $("#"+canvasId).bind( "click", function( e ) {

            console.log(this,aDigitAList);
            jnSynth.play(aDigitAList,mode);
        });
    },
    draw:function(){
        this.ctx.clearRect(0, 0, this.width, this.height);



            this.firstCase = this.minX;







        if(this.firstCase == 1){
            this.ctx.beginPath();
            this.ctx.strokeStyle='#000';
            this.ctx.lineWidth=1;
            this.ctx.moveTo(this.nX0 ,this.nY0    );
            this.ctx.lineTo(this.nX0 + this.nW ,this.nY0 )  ;
            this.ctx.stroke();

        }else{
            this.ctx.beginPath();
            this.ctx.fillStyle = "black";
            this.ctx.font="10px Arial";
            this.ctx.fillText(this.roman[this.firstCase],   0 , this.nY0+9);
        }

        for(i=0;i<this.nbrString;i++){
            this.dotSize = 4;
            this.osH =  20;
            this.nMX = 5;
            this.nMY = 5;
            this.nW  =this.width - 2*this.nMX;
            this.nH = (this.height - 2*this.nMY)-this.osH;
            this.nX0 =  this.nMX;
            this.nY0 = this.osH+this.nMY;
            this.iX =  this.nW/this.nbrString;
            this.iY =  this.nH/this.deltaX;
            this.ctx.beginPath();
            this.ctx.strokeStyle='gold';
            this.ctx.lineWidth=1;
            this.ctx.moveTo( this.nX0 + i * this.iX + this.iX/2, this.nY0);
            this.ctx.lineTo( this.nX0 + i * this.iX + this.iX/2, this.nY0+this.nH )  ;
            this.ctx.stroke();




            if(this.FM[i][0]["intervale"].wsname){
                this.ctx.fillStyle = "#"+this.FM[i][0]["intervale"].color;
                this.ctx.fillRect(
                    this.nX0 + i * this.iX + this.iX/2 - this.dotSize/2,
                    this.nY0 - 16
                    ,this.dotSize,this.dotSize);

                this.ctx.font="10px Georgia";
                this.ctx.fillText(
                    this.FM[i][0]["intervale"].wsname,
                    this.nX0 + i * this.iX + this.iX/2 - this.dotSize/2,
                    this.nY0 - 17
                );
                this.ctx.fillText(
                    this.FM[i][0]["intervale"].intervale,
                    this.nX0 + i * this.iX + this.iX/2 - this.dotSize/2,
                    this.nY0 -4
                );
            }

            for(j=0;j<this.deltaX;j++){


                this.ctx.beginPath();
                this.ctx.strokeStyle='#444';
                this.ctx.lineWidth=.1;
                this.ctx.moveTo(this.nX0 ,this.nY0 + j * this.iY  );
                this.ctx.lineTo(this.nX0 + this.nW ,this.nY0 + j * this.iY)  ;
                this.ctx.stroke();


                if(this.FM[i][j+this.minX]["intervale"].wsname){

                    this.ctx.fillStyle = "#"+this.FM[i][j+this.minX]["intervale"].color;
                    this.ctx.fillRect(
                        this.nX0 + i * this.iX + this.iX/2 - this.dotSize/2,
                        this.nY0 + (j) * this.iY + this.iY/2 - this.dotSize/2
                        ,this.dotSize,this.dotSize);
                    this.ctx.font="10px Georgia";
                    this.ctx.fillText(
                        this.FM[i][j+this.minX]["intervale"].wsname,
                        this.nX0 + i * this.iX + this.iX/2 - 4,
                        this.nY0 + (j) * this.iY + this.iY/2 - 4
                    );
                    this.ctx.fillText(
                        this.FM[i][j+this.minX]["intervale"].intervale,
                        this.nX0 + i * this.iX + this.iX/2 - 4,
                        this.nY0 + (j) * this.iY + this.iY/2 +11
                    );
                }

            }
        }


    },


    roman:['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVII','XIX','XX','XXI','XXII','XXIII','XXIV'],
    deltaMin:3

}
function collides(rects, x, y) {
    var isCollision = false;
    for (var i = 0, len = rects.length; i < len; i++) {
        var left = rects[i].x, right = rects[i].x + rects[i].w;
        var top = rects[i].y, bottom = rects[i].y + rects[i].h;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = rects[i];
        }
    }
    return isCollision;
}




var fingeringPicker = {


    init:function(canvasId){

        $('form[name="fingering"]').hide();

        FP = this;

        this.canvasId = canvasId;
        this.c = document.getElementById(canvasId);
        this.width = this.c.width;
        this.height = this.c.height;
        this.ctx = this.c.getContext("2d");

        this.strings = 10;
        this.cases = 10;
        this.selection = [];

        this.ctx = this.c.getContext("2d");


        this.draw();
        this.controls();
    },
    controls:function(){

        $("#myFP_clearSelection").hide();
        $("#myFP_addFingering").hide();

        $("#myFPControls").append($("#fingering label[for='fingering_description']").clone());
        $("#myFPControls").append($("#fingering_description").clone().prop('class', 'form-control' ));
        $("#myFPControls").append($("#fingering label[for='fingering_difficulty']").clone());
        $("#myFPControls").append($("#fingering_difficulty").clone().prop('class', 'form-control' ));
        $("#myFPControls").append($("#fingering label[for='fingering_arpeggio']").clone());
        $("#myFPControls").append($("#fingering_arpeggio").clone());


        $( "#myFPControls #fingering_description" ).change(function() {
            $( "#fingering #fingering_description").val($(this).val());
        });

        $( "#myFPControls #fingering_difficulty" ).change(function() {
            $( "#fingering #fingering_difficulty").val($(this).val());
        });

        $( "#myFPControls #fingering_arpeggio" ).change(function() {
            $( "#fingering #fingering_arpeggio").val($(this).val());
        });


        FP.map = [];
        FP.rmap = [];
        $("#fingering_fingers").children("div").each(
            function(){
                $(this).children("div").each(
                    function(){
                        var aid = this.id.split("fingering_fingers_");
                        if(aid[1]){
                            FP.map[aid[1]] =  $("#fingering_fingers_"+aid[1]+"_y").val() + "_" + $("#fingering_fingers_"+aid[1]+"_x").val();
                            FP.rmap[$("#fingering_fingers_"+aid[1]+"_y").val() + "_" + $("#fingering_fingers_"+aid[1]+"_x").val()] =  aid[1];
                        }
                    }
                );
            }
        );



    },
    draw:function(){
        this.ctx.clearRect(0, 0, this.width, this.height);

        var caseW = this.width/this.cases;
        var caseH = this.height/this.strings;


        FP.rects = [];
        for(s = 0 ; s < this.strings ; s++ ){

            for(c = 0 ; c < this.cases ; c++ ){
                FP.rects.push({x: c*caseW, y:(this.height-caseH) - s*caseH, w: caseW, h: caseH , case:c,string:s});
                this.ctx.beginPath();
                this.ctx.strokeStyle='grey';
                this.ctx.lineWidth=1;
                this.ctx.moveTo( caseW * c , 0);
                this.ctx.lineTo( caseW * c, this.height)  ;
                this.ctx.stroke();
            }

            this.ctx.beginPath();
            this.ctx.strokeStyle='gold';
            this.ctx.lineWidth=2;
            this.ctx.moveTo( caseW, this.height - s*caseH - caseH/2);
            this.ctx.lineTo(this.width, this.height - s*caseH - caseH/2)  ;
            this.ctx.stroke();
        }

        $("#myFPControls .sub_finger").remove();
        if(this.selection.length >= FP.minSelection){
            $("#myFP_clearSelection").show();
            $("#myFP_addFingering").show();
        }else{
            $("#myFP_clearSelection").hide();
            $("#myFP_addFingering").hide();
        }

        $.each(this.selection, function( index, value ) {
            var splitedValue = value.split("_");
            var s =  splitedValue[0];
            var c =  splitedValue[1];
            FP.ctx.fillStyle = "rgba(10, 10, 10, 1)";
            FP.ctx.fillRect( caseW/2 + c*caseW,FP.height-s*caseH -caseH/2 - 3,6,6);

            $("#myFPControls").append('<div class="sub_finger" id="sub_'+index+'"><h3>'+s+'_'+c+'</h3></div>');
            $("#sub_"+index).append($("label [for='fingering_fingers_"+FP.rmap[s+"_"+c]+"_rh']").clone());
            $("#sub_"+index).append($("#fingering_fingers_"+FP.rmap[s+"_"+c]+"_rh").clone());
            $("#sub_"+index).append($("label [for='fingering_fingers_"+FP.rmap[s+"_"+c]+"_lh']").clone());
            $("#sub_"+index).append($("#fingering_fingers_"+FP.rmap[s+"_"+c]+"_lh").clone());




            $("#fingering_fingers_"+FP.rmap[s+"_"+c]+"_played").attr('checked' , true);
            $( "#fingering_fingers_"+FP.rmap[s+"_"+c]+"_rh" ).change(function() {
                $("#fingering_fingers #fingering_fingers_"+FP.rmap[s+"_"+c]+"_rh").val($(this).val());
            });
            $( "#fingering_fingers_"+FP.rmap[s+"_"+c]+"_lh" ).change(function() {
                $("#fingering_fingers #fingering_fingers_"+FP.rmap[s+"_"+c]+"_lh").val($(this).val());
            });


            $("#myFP_addFingering").click(function(){
                console.log($("form"));
                $("form").submit();
            });
        });

        $("#"+FP.canvasId).unbind();
        $("#"+FP.canvasId).bind( "click", function( e ) {

            var rect = collides(FP.rects, e.offsetX, e.offsetY);

            if (rect) {
                var i = $.inArray( rect.string+"_"+rect.case , FP.selection );
                if(i>=0) {
                    FP.selection.splice(i, 1);
                    $("#fingering_fingers_"+FP.rmap[rect.string+"_"+ rect.case]+"_played").attr('checked' , false);
                }else {
                    FP.selection.push(rect.string + "_" + rect.case);
                }






                FP.draw();



            }

        });
    },

    minSelection:1


}
/*
 data = {

 instrument: {
 strings:[
 ["E2"],["A2"],["D3"],["G3"],["B3"],["E4"]
 ],
 fret:24
 },
 fingerings:[
 {
 difficulty:3,
 fingers:[
 {s: 5, c: 7, lh: 0, rh: 1 ,i:"7" ,t:"B4",color:"#CC4466"},
 {s: 4, c: 8, lh: 1, rh: 1 ,i:"5"  ,t:"G4",color:"#543212"},
 {s: 3, c: 9, lh: 5, rh: 1, i:"3" ,t:"E4" },
 {s: 2, c: 10, lh: 5, rh: 1, i:"1" ,t:"C4" },
 ]
 }
 ],
 options:{
 format:"auto", // portrait,landscape,auto
 autoSize:true, // Set fret num automaticaly
 showInterval:true,
 showTone:true
 }
 }
 */

var FTB = {};

/**
 * Initialize the fretboard
 *
 */
FTB.init = function(datas,jsonList){
    FTB = this;
    FTB.datas = datas;


    FTB.datas.instrument.strings = $.parseJSON(datas.instrument.strings.replace(/&quot;/g, '\"'));


    if(jsonList){
        var jsonDatas = $.parseJSON(jsonList.replace(/&quot;/g, '\"'));
        var aXList = jsonDatas.xList.split(",").map(function(item) {return parseInt(item);});
        var aYList = jsonDatas.yList.split(",").map(function(item) {return parseInt(item);});
        var aIntervaleList = jsonDatas.intervaleList.split(",");
        var aIntervaleColorList = jsonDatas.intervaleColorList.split(",");
        var aDigitAList =jsonDatas.digitAList.split(",").map(function(item) {return parseInt(item);});
        var aWsNameList = jsonDatas.wsNameList.split(",");
        var newFingering = [];
        newFingering[0] =
        {
            difficulty:0,

        }
        newFingering[0].fingers = [];
        $.each(aXList,function(k,v){

            var finger = {
                s:  aYList[k],
                c:  aXList[k],
                i:  aIntervaleList[k],
                t:  aWsNameList[k] + FTB.getOctaveFromDigit(aDigitAList[k]) ,
                color:"#" + aIntervaleColorList[k]
            };
            newFingering[0].fingers.push(finger);
        });

        FTB.datas.fingerings = newFingering;
    }


    /*
     * Need to know if some fingering have openstring
     */
    FTB.haveOpenstring = false;
    FTB.min = 99;
    FTB.max = 0;
    $.each(FTB.datas.fingerings,function(k1,v1){
        $.each(v1.fingers,function(k2,v2){
            if(v2.c == 0){
                FTB.haveOpenstring = true;
            }else{
                if(v2.c<FTB.min){FTB.min = v2.c;}
                if(v2.c>FTB.max){FTB.max = v2.c;}
            }
        });
    });


    FTB.datas.options.currentFrets = 1 + FTB.max - FTB.min;
    if(FTB.datas.options.currentFrets<3){
        FTB.datas.options.currentFrets = 3;
    }

    (FTB.min<3 && FTB.max - FTB.min < 2)?
        FTB.datas.options.currentFret0 = 1:
        FTB.datas.options.currentFret0 = FTB.min;

    FTB.datas.options.roman = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVII','XIX','XX','XXI','XXII','XXIII','XXIV'];


    return FTB;
};
FTB.getOctaveFromDigit = function(d){
    return parseInt(d / 12);
};
/*
 * Set the format of the fretboard
 */
FTB.setFormat = function(){
    if(FTB.datas.options.format !== "landscape" && FTB.datas.options.format !== "portrait"){
        if(FTB.width > FTB.height){
            FTB.datas.options.format = "landscape";
        }else{
            FTB.datas.options.format = "portrait";
        }
    }
};

FTB.getMousePos = function(canvas,evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};
FTB.playTone = function(tone){
    if(!FTB.synth)
        FTB.synth = new Tone.Synth().toMaster();
    if(!FTB.polySynth)
        FTB.polySynth = new Tone.PolySynth(4, Tone.Synth).toMaster();

    FTB.synth.triggerAttackRelease(tone, "4n");
}
FTB.playTones = function(tones,arpeggio){

    if(arpeggio){

        var myJNSYNTH = JNSYNTH.setSynth("triangle");
        //var piano = new Tone.Synth().toMaster();
        var piano = myJNSYNTH.synth;

        var pianoPart = new Tone.Sequence(function(time, note){
            var n = DIGIT.toneForTone(note);
            piano.triggerAttackRelease(n, "16n", time);
        }, tones,"16n").start();

        pianoPart.loop = false;
        pianoPart.loopEnd = "1m";
        pianoPart.humanize = false;

        Tone.Transport.bpm.value = 100;

        Tone.Transport.start("+0.1");

    }else{
        var myJNSYNTH = JNSYNTH.setSynth("triangle","poly");


        var d = [];

        $.each(tones,function(k,v){
            tones[k] = DIGIT.toneForTone(v);
            d.push("4n");
        });

        myJNSYNTH.synth.triggerAttackRelease(tones, d);
    }



}
FTB.manageMouse = function(canvas,datas,format){


    FTB.canvas.addEventListener('mousedown', function(evt) {
        var mousePos = FTB.getMousePos(canvas,evt);
        var playAll = true;
        $.each(datas.fingerings,function(k1,v1){
            $.each(v1.fingers,function(k2,v2){
                if(
                    mousePos.x >= v2.x0 && mousePos.x <= v2.x1 &&
                    mousePos.y >= v2.y0 && mousePos.y <= v2.y1
                )  {
                    //playAll = false;
                    //FTB.playTone(v2.t);
                }
            });
        });
        if(playAll == true){

        }
    }, false);

    /*
     * Detect when click over string
     */
    FTB.canvas.addEventListener('click', function(evt) {
        var mousePos = FTB.getMousePos(canvas,evt);

        var d = [];
        $.each(datas.fingerings,function(k1,v1){
            $.each(v1.fingers,function(k2,v2){
                d.push(v2.t);
            });
        });

        if(
            mousePos.x >=FTB.mW &&
            mousePos.x <=FTB.width-FTB.mW &&
            mousePos.y >=FTB.mH &&
            mousePos.y <=FTB.height-FTB.mH &&

            mousePos.x >=FTB.width/2
        )  {
            FTB.playTones(d,"arpeggio");
        }else{
            FTB.playTones(d);
        }
    }, false);

};

/*
 * Draw fretboard in canvas
 */
FTB.draw = function(canvas){

    FTB.canvasId = canvas;
    FTB.canvas = document.getElementById(canvas);
    FTB.width = FTB.canvas.width;
    FTB.height = FTB.canvas.height;
    FTB.ctx = FTB.canvas.getContext("2d");
    // Clear draw
    FTB.ctx.clearRect(0, 0, FTB.width, FTB.height);

    // set margins
    FTB.mW = FTB.mH = 20 ;
    // space set for openstring
    FTB.openstringSpace = 22 ;

    FTB.currentFrets = FTB.datas.options.currentFrets;
    FTB.currentFret0 = FTB.datas.options.currentFret0;

    FTB.setFormat();


    FTB.fretboardBackgroundStyle = 'rgba(150, 111, 51,.9)';
    FTB.fretColor = 'silver';
    FTB.fretThickness = 1;
    FTB.stringColor = 'gold';
    FTB.stringThickness = 1;
    FTB.fretboardBorderColor = 'black';
    FTB.fretboardBorderThickness = 1;
    FTB.fretNumFillStyle = 'black';
    FTB.fretNumFontSize = 12;
    FTB.fretNumFont = 'Arial';
    FTB.openstringSpaceColor = 'black';
    FTB.openstringFillStyle = 'black';
    FTB.openstringFontSize = 10;
    FTB.openstringNumFont = 'Arial';
    FTB.tFillStyle = 'black';
    FTB.tFontSize = 13;
    FTB.tFont = 'Courier New';
    FTB.iFillStyle = 'black';
    FTB.iFontSize = 13;
    FTB.iFont = 'Courier New';

    /*
     * Borders and Backgrounds
     */
    //FTB.ctx.fillStyle="#CCCCCC";
    //FTB.ctx.rect(0,0,FTB.width, FTB.height );
    //FTB.ctx.stroke();
    FTB.ctx.fillStyle=FTB.fretboardBackgroundStyle;
    FTB.ctx.fillRect(FTB.mW,FTB.mH,FTB.width-2*FTB.mW, FTB.height -2*FTB.mH);

    /*
     * Fret Loop
     */
    if(FTB.haveOpenstring == true){
        FTB.ctx.fillStyle=FTB.openstringSpaceColor;
        if(FTB.datas.options.format == "landscape") {
            FTB.ctx.fillRect(FTB.mW,FTB.mH,FTB.openstringSpace, FTB.height - 2*FTB.mH);
        }else if(FTB.datas.options.format == "portrait"){
            FTB.ctx.fillRect(FTB.mW,FTB.mH, FTB.width - 2*FTB.mW,FTB.openstringSpace);
        }
    }
    for( var f=0 ; f <= FTB.currentFrets ; f++ ){

        FTB.ctx.beginPath();
        FTB.ctx.strokeStyle = FTB.fretColor ;
        FTB.ctx.lineWidth= FTB.fretThickness ;

        if(FTB.datas.options.format == "landscape"){
            FTB.ctx.moveTo(  FTB.mW + FTB.openstringSpace + f * (( FTB.width - FTB.openstringSpace - 2 *  FTB.mW) / FTB.datas.options.currentFrets  ) -FTB.fretThickness , FTB.mH  );
            FTB.ctx.lineTo(  FTB.mW + FTB.openstringSpace + f * (( FTB.width - FTB.openstringSpace - 2 *  FTB.mW) / FTB.datas.options.currentFrets  )  - FTB.fretThickness, FTB.height - FTB.mH  )  ;
        }else if(FTB.datas.options.format == "portrait"){
            FTB.ctx.moveTo( FTB.mW  , FTB.mH + FTB.openstringSpace + f * (( FTB.height - FTB.openstringSpace - 2 *  FTB.mH) / FTB.datas.options.currentFrets  ) -FTB.fretThickness );
            FTB.ctx.lineTo( FTB.width - FTB.mW , FTB.mH + FTB.openstringSpace + f * (( FTB.height - FTB.openstringSpace - 2 *  FTB.mH) / FTB.datas.options.currentFrets  ) -FTB.fretThickness );
        }
        FTB.ctx.stroke();
    }

    /*
     * Draw freatboard border
     */
    FTB.ctx.beginPath();
    FTB.ctx.strokeStyle = FTB.fretboardBorderColor ;
    FTB.ctx.lineWidth= FTB.fretboardBorderThickness ;
    if(FTB.datas.options.format == "landscape"){
        FTB.ctx.moveTo( FTB.mW  , FTB.mH  );
        FTB.ctx.lineTo( FTB.width -  FTB.mW  , FTB.mH  )  ;
        FTB.ctx.moveTo( FTB.mW  , FTB.height - FTB.mH  );
        FTB.ctx.lineTo( FTB.width -  FTB.mW  , FTB.height - FTB.mH   )  ;
    }else if(FTB.datas.options.format == "portrait"){
        FTB.ctx.moveTo( FTB.mW  , FTB.mH  );
        FTB.ctx.lineTo( FTB.mW  , FTB.height - FTB.mH  )  ;
        FTB.ctx.moveTo( FTB.width -  FTB.mW , FTB.mH  );
        FTB.ctx.lineTo( FTB.width -  FTB.mW , FTB.height - FTB.mH  )  ;
    }
    FTB.ctx.stroke();

    /*
     * String Loop
     */
    for( var s=0 ; s < FTB.datas.instrument.strings.length ; s++ ){
        FTB.ctx.beginPath();
        FTB.ctx.strokeStyle = FTB.stringColor ;
        FTB.ctx.lineWidth= FTB.stringThickness ;

        if(FTB.datas.options.format == "landscape"){
            FTB.ctx.moveTo( FTB.mW , FTB.mH  + s * (( FTB.height -  2 *  FTB.mH) / FTB.datas.instrument.strings.length  ) +(( FTB.height -  2 *  FTB.mH) / FTB.datas.instrument.strings.length  )/2 );
            FTB.ctx.lineTo( FTB.width - FTB.mW , FTB.mH  + s * (( FTB.height -  2 *  FTB.mH) / FTB.datas.instrument.strings.length  ) +(( FTB.height -  2 *  FTB.mH) / FTB.datas.instrument.strings.length  )/2 );
        }else if(FTB.datas.options.format == "portrait"){
            FTB.ctx.moveTo(  FTB.mW  + s * (( FTB.width -  2 *  FTB.mW) / FTB.datas.instrument.strings.length  ) +(( FTB.width -  2 *  FTB.mW) / FTB.datas.instrument.strings.length  )/2   , FTB.mH  );
            FTB.ctx.lineTo(  FTB.mW  + s * (( FTB.width -  2 *  FTB.mW) / FTB.datas.instrument.strings.length  ) +(( FTB.width -  2 *  FTB.mW) / FTB.datas.instrument.strings.length  )/2, FTB.height - FTB.mH  )  ;
        }

        FTB.ctx.stroke();
    }

    /*
     * OpenString names
     */
    $.each(FTB.datas.instrument.strings,function(k,v){
        (FTB.datas.options.format == "landscape") ?
            FTB.ctx.fillText(v, 4 , FTB.height-FTB.mH  - (k+1) * (( FTB.height -  2 *  FTB.mH) / FTB.datas.instrument.strings.length  ) +(( FTB.height -  2 *  FTB.mH) / FTB.datas.instrument.strings.length  )/2 + FTB.openstringFontSize/2 - 2 ):
            FTB.ctx.fillText(v,  FTB.mW - FTB.openstringFontSize/2  + k * (( FTB.width -  2 *  FTB.mW) / FTB.datas.instrument.strings.length  ) +(( FTB.width -  2 *  FTB.mW) / FTB.datas.instrument.strings.length  )/2   , FTB.openstringFontSize );
    });
    /*
     * first fret num
     */
    FTB.ctx.fillStyle = FTB.fretNumFillStyle;
    FTB.ctx.font= FTB.fretNumFontSize + "px " + FTB.fretNumFont;
    (FTB.datas.options.format == "landscape") ?
        FTB.ctx.fillText(FTB.datas.options.roman[FTB.datas.options.currentFret0],  FTB.mW + FTB.openstringSpace , FTB.height - 2  ):
        FTB.ctx.fillText(FTB.datas.options.roman[FTB.datas.options.currentFret0],  2 , FTB.fretNumFontSize + FTB.mH + FTB.openstringSpace );


    /*
     * fingering
     */
    $.each(FTB.datas.fingerings,function(k1,v1){
        $.each(v1.fingers,function(k2,v2){
            if(FTB.datas.options.format == "landscape"){
                if(v2.c > 0){
                    var centerX = FTB.mW + FTB.openstringSpace + ((FTB.width - FTB.openstringSpace - 2 * FTB.mW)/(2*FTB.datas.options.currentFrets)) + (v2.c-FTB.datas.options.currentFret0)*((FTB.width - FTB.openstringSpace - 2 * FTB.mW)/(FTB.datas.options.currentFrets)) ;
                }else if(v2.c == 0){
                    var centerX = FTB.mW + FTB.openstringSpace / 2 ;
                }
                var centerY = FTB.height-FTB.mH - (v2.s  * (( FTB.height  - 2 *  FTB.mH) / FTB.datas.instrument.strings.length  ) +  (( FTB.height  - 2 *  FTB.mH) / FTB.datas.instrument.strings.length  )/2 );
            }else if(FTB.datas.options.format == "portrait"){
                if(v2.c > 0){
                    var centerY = FTB.mH + FTB.openstringSpace + ((FTB.height - FTB.openstringSpace - 2 * FTB.mH)/(2*FTB.datas.options.currentFrets)) + (v2.c-FTB.datas.options.currentFret0)*((FTB.height - FTB.openstringSpace - 2 * FTB.mH)/(FTB.datas.options.currentFrets)) ;
                }else if(v2.c == 0){
                    var centerY = FTB.mH + FTB.openstringSpace / 2 ;
                }
                var centerX  = FTB.mW + (v2.s  * (( FTB.width  - 2 *  FTB.mW) / FTB.datas.instrument.strings.length  ) +  (( FTB.width  - 2 *  FTB.mW) / FTB.datas.instrument.strings.length  )/2 );
            }
            var radius = FTB.openstringSpace/3;

            FTB.ctx.beginPath();
            if(v2.c>0){
                FTB.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                FTB.ctx.fillStyle = (v2.color)?v2.color:"#cccccc";
                FTB.ctx.fill();
                FTB.ctx.lineWidth = 1;
                FTB.ctx.strokeStyle = (v2.color)?v2.color:"#cccccc";
                FTB.ctx.stroke();
            }else{
                FTB.ctx.arc(centerX, centerY, radius - 2, 0, 2 * Math.PI, false);
                FTB.ctx.fillStyle = "#000";
                FTB.ctx.fill();
                FTB.ctx.lineWidth = 4;
                FTB.ctx.strokeStyle = v2.color;
                FTB.ctx.stroke();
            }
            v2.x0 = centerX - radius;
            v2.x1 = centerX + radius;
            v2.y0 = centerY - radius;
            v2.y1 = centerY + radius;
            v2.sx0 = centerX-1 ;
            v2.sx1 = centerX+1 ;
            v2.sy0 = centerY-1 ;
            v2.sy1 = centerY+1 ;
            /*
             * Show intervalName
             */
            if(FTB.datas.options.showInterval == true){
                FTB.ctx.beginPath();
                if(v2.i){
                    FTB.ctx.font= "bold " + FTB.iFontSize + "px " + FTB.iFont;
                    FTB.ctx.fillStyle = (v2.color)?v2.color:"#cccccc";
                    (FTB.datas.options.format == "landscape") ?
                        FTB.ctx.fillText(v2.i,  centerX + (v2.i.length*FTB.tFontSize)  , centerY + 1 + radius + FTB.iFontSize  ):
                        FTB.ctx.fillText(v2.i,  centerX - (v2.i.length*FTB.tFontSize/2)  , centerY + 1 + radius + FTB.iFontSize  );
                }
            }
            /*
             * Show toneName
             */
            if(FTB.datas.options.showTone == true){
                FTB.ctx.beginPath();
                if(v2.t){
                    FTB.ctx.font= "bold " + FTB.tFontSize + "px " + FTB.tFont;
                    FTB.ctx.fillStyle = (v2.color)?v2.color:"#cccccc";
                    (FTB.datas.options.format == "landscape") ?
                        FTB.ctx.fillText(v2.t,  centerX - (v2.t.length*FTB.tFontSize)  , centerY - 4 - radius   ):
                        FTB.ctx.fillText(v2.t,  centerX - (v2.t.length*FTB.tFontSize/2)  , centerY - 4 - radius   );
                }
            }
        });
    });


    FTB.manageMouse(FTB.canvas,FTB.datas);
};
/*! jQuery v2.2.2 | (c) jQuery Foundation | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=a.document,e=c.slice,f=c.concat,g=c.push,h=c.indexOf,i={},j=i.toString,k=i.hasOwnProperty,l={},m="2.2.2",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return e.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:e.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a){return n.each(this,a)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(e.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:g,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=a&&a.toString();return!n.isArray(a)&&b-parseFloat(b)+1>=0},isPlainObject:function(a){var b;if("object"!==n.type(a)||a.nodeType||n.isWindow(a))return!1;if(a.constructor&&!k.call(a,"constructor")&&!k.call(a.constructor.prototype||{},"isPrototypeOf"))return!1;for(b in a);return void 0===b||k.call(a,b)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?i[j.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=d.createElement("script"),b.text=a,d.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b){var c,d=0;if(s(a)){for(c=a.length;c>d;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):g.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:h.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,g=0,h=[];if(s(a))for(d=a.length;d>g;g++)e=b(a[g],g,c),null!=e&&h.push(e);else for(g in a)e=b(a[g],g,c),null!=e&&h.push(e);return f.apply([],h)},guid:1,proxy:function(a,b){var c,d,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(d=e.call(arguments,2),f=function(){return a.apply(b||this,d.concat(e.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:l}),"function"==typeof Symbol&&(n.fn[Symbol.iterator]=c[Symbol.iterator]),n.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){i["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=!!a&&"length"in a&&a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ga(),z=ga(),A=ga(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+L+"*\\]",O=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+N+")*)|.*)\\)|)",P=new RegExp(L+"+","g"),Q=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),R=new RegExp("^"+L+"*,"+L+"*"),S=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),T=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),U=new RegExp(O),V=new RegExp("^"+M+"$"),W={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},X=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,$=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,_=/[+~]/,aa=/'|\\/g,ba=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),ca=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},da=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(ea){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fa(a,b,d,e){var f,h,j,k,l,o,r,s,w=b&&b.ownerDocument,x=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==x&&9!==x&&11!==x)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==x&&(o=$.exec(a)))if(f=o[1]){if(9===x){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(w&&(j=w.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(o[2])return H.apply(d,b.getElementsByTagName(a)),d;if((f=o[3])&&c.getElementsByClassName&&b.getElementsByClassName)return H.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==x)w=b,s=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(aa,"\\$&"):b.setAttribute("id",k=u),r=g(a),h=r.length,l=V.test(k)?"#"+k:"[id='"+k+"']";while(h--)r[h]=l+" "+qa(r[h]);s=r.join(","),w=_.test(a)&&oa(b.parentNode)||b}if(s)try{return H.apply(d,w.querySelectorAll(s)),d}catch(y){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(Q,"$1"),b,d,e)}function ga(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ha(a){return a[u]=!0,a}function ia(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ja(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function ka(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function la(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function na(a){return ha(function(b){return b=+b,ha(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function oa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=fa.support={},f=fa.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fa.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ia(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ia(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Z.test(n.getElementsByClassName),c.getById=ia(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return"undefined"!=typeof b.getElementsByClassName&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=Z.test(n.querySelectorAll))&&(ia(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ia(function(a){var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Z.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ia(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",O)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Z.test(o.compareDocumentPosition),t=b||Z.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return ka(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?ka(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},fa.matches=function(a,b){return fa(a,null,null,b)},fa.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(T,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fa(b,n,null,[a]).length>0},fa.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fa.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fa.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fa.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fa.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fa.selectors={cacheLength:50,createPseudo:ha,match:W,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ba,ca),a[3]=(a[3]||a[4]||a[5]||"").replace(ba,ca),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fa.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fa.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return W.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&U.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ba,ca).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fa.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(P," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fa.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ha(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ha(function(a){var b=[],c=[],d=h(a.replace(Q,"$1"));return d[u]?ha(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ha(function(a){return function(b){return fa(a,b).length>0}}),contains:ha(function(a){return a=a.replace(ba,ca),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ha(function(a){return V.test(a||"")||fa.error("unsupported lang: "+a),a=a.replace(ba,ca).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Y.test(a.nodeName)},input:function(a){return X.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:na(function(){return[0]}),last:na(function(a,b){return[b-1]}),eq:na(function(a,b,c){return[0>c?c+b:c]}),even:na(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:na(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:na(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:na(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=la(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=ma(b);function pa(){}pa.prototype=d.filters=d.pseudos,d.setFilters=new pa,g=fa.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=R.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=S.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(Q," ")}),h=h.slice(c.length));for(g in d.filter)!(e=W[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fa.error(a):z(a,i).slice(0)};function qa(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function ra(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j,k=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(j=b[u]||(b[u]={}),i=j[b.uniqueID]||(j[b.uniqueID]={}),(h=i[d])&&h[0]===w&&h[1]===f)return k[2]=h[2];if(i[d]=k,k[2]=a(b,c,g))return!0}}}function sa(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ta(a,b,c){for(var d=0,e=b.length;e>d;d++)fa(a,b[d],c);return c}function ua(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function va(a,b,c,d,e,f){return d&&!d[u]&&(d=va(d)),e&&!e[u]&&(e=va(e,f)),ha(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ta(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ua(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ua(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ua(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function wa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ra(function(a){return a===b},h,!0),l=ra(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[ra(sa(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return va(i>1&&sa(m),i>1&&qa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(Q,"$1"),c,e>i&&wa(a.slice(i,e)),f>e&&wa(a=a.slice(e)),f>e&&qa(a))}m.push(c)}return sa(m)}function xa(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=F.call(i));u=ua(u)}H.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&fa.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ha(f):f}return h=fa.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xa(e,d)),f.selector=a}return f},i=fa.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ba,ca),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=W.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ba,ca),_.test(j[0].type)&&oa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qa(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,!b||_.test(a)&&oa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ia(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ia(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ja("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ia(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ja("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ia(function(a){return null==a.getAttribute("disabled")})||ja(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fa}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.uniqueSort=n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},v=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},w=n.expr.match.needsContext,x=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,y=/^.[^:#\[\.,]*$/;function z(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(y.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return h.call(b,a)>-1!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(z(this,a||[],!1))},not:function(a){return this.pushStack(z(this,a||[],!0))},is:function(a){return!!z(this,"string"==typeof a&&w.test(a)?n(a):a||[],!1).length}});var A,B=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=n.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||A,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:B.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),x.test(e[1])&&n.isPlainObject(b))for(e in b)n.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&f.parentNode&&(this.length=1,this[0]=f),this.context=d,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?void 0!==c.ready?c.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};C.prototype=n.fn,A=n(d);var D=/^(?:parents|prev(?:Until|All))/,E={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=w.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?h.call(n(a),this[0]):h.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function F(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return u(a,"parentNode")},parentsUntil:function(a,b,c){return u(a,"parentNode",c)},next:function(a){return F(a,"nextSibling")},prev:function(a){return F(a,"previousSibling")},nextAll:function(a){return u(a,"nextSibling")},prevAll:function(a){return u(a,"previousSibling")},nextUntil:function(a,b,c){return u(a,"nextSibling",c)},prevUntil:function(a,b,c){return u(a,"previousSibling",c)},siblings:function(a){return v((a.parentNode||{}).firstChild,a)},children:function(a){return v(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(E[a]||n.uniqueSort(e),D.test(a)&&e.reverse()),this.pushStack(e)}});var G=/\S+/g;function H(a){var b={};return n.each(a.match(G)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?H(a):n.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){n.each(b,function(b,c){n.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==n.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return n.each(arguments,function(a,b){var c;while((c=n.inArray(b,f,c))>-1)f.splice(c,1),h>=c&&h--}),this},has:function(a){return a?n.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().progress(c.notify).done(c.resolve).fail(c.reject):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=e.call(arguments),d=c.length,f=1!==d||a&&n.isFunction(a.promise)?d:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?e.call(arguments):d,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(d>1)for(i=new Array(d),j=new Array(d),k=new Array(d);d>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().progress(h(b,j,i)).done(h(b,k,c)).fail(g.reject):--f;return f||g.resolveWith(k,c),g.promise()}});var I;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(I.resolveWith(d,[n]),n.fn.triggerHandler&&(n(d).triggerHandler("ready"),n(d).off("ready"))))}});function J(){d.removeEventListener("DOMContentLoaded",J),a.removeEventListener("load",J),n.ready()}n.ready.promise=function(b){return I||(I=n.Deferred(),"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(n.ready):(d.addEventListener("DOMContentLoaded",J),a.addEventListener("load",J))),I.promise(b)},n.ready.promise();var K=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)K(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},L=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function M(){this.expando=n.expando+M.uid++}M.uid=1,M.prototype={register:function(a,b){var c=b||{};return a.nodeType?a[this.expando]=c:Object.defineProperty(a,this.expando,{value:c,writable:!0,configurable:!0}),a[this.expando]},cache:function(a){if(!L(a))return{};var b=a[this.expando];return b||(b={},L(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[b]=c;else for(d in b)e[d]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=a[this.expando];if(void 0!==f){if(void 0===b)this.register(a);else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in f?d=[b,e]:(d=e,d=d in f?[d]:d.match(G)||[])),c=d.length;while(c--)delete f[d[c]]}(void 0===b||n.isEmptyObject(f))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!n.isEmptyObject(b)}};var N=new M,O=new M,P=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Q=/[A-Z]/g;function R(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Q,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:P.test(c)?n.parseJSON(c):c;
}catch(e){}O.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return O.hasData(a)||N.hasData(a)},data:function(a,b,c){return O.access(a,b,c)},removeData:function(a,b){O.remove(a,b)},_data:function(a,b,c){return N.access(a,b,c)},_removeData:function(a,b){N.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=O.get(f),1===f.nodeType&&!N.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),R(f,d,e[d])));N.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){O.set(this,a)}):K(this,function(b){var c,d;if(f&&void 0===b){if(c=O.get(f,a)||O.get(f,a.replace(Q,"-$&").toLowerCase()),void 0!==c)return c;if(d=n.camelCase(a),c=O.get(f,d),void 0!==c)return c;if(c=R(f,d,void 0),void 0!==c)return c}else d=n.camelCase(a),this.each(function(){var c=O.get(this,d);O.set(this,d,b),a.indexOf("-")>-1&&void 0!==c&&O.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){O.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=N.get(a,b),c&&(!d||n.isArray(c)?d=N.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return N.get(a,c)||N.access(a,c,{empty:n.Callbacks("once memory").add(function(){N.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=N.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),U=["Top","Right","Bottom","Left"],V=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)};function W(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return n.css(a,b,"")},i=h(),j=c&&c[3]||(n.cssNumber[b]?"":"px"),k=(n.cssNumber[b]||"px"!==j&&+i)&&T.exec(n.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,n.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var X=/^(?:checkbox|radio)$/i,Y=/<([\w:-]+)/,Z=/^$|\/(?:java|ecma)script/i,$={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};$.optgroup=$.option,$.tbody=$.tfoot=$.colgroup=$.caption=$.thead,$.th=$.td;function _(a,b){var c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function aa(a,b){for(var c=0,d=a.length;d>c;c++)N.set(a[c],"globalEval",!b||N.get(b[c],"globalEval"))}var ba=/<|&#?\w+;/;function ca(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],o=0,p=a.length;p>o;o++)if(f=a[o],f||0===f)if("object"===n.type(f))n.merge(m,f.nodeType?[f]:f);else if(ba.test(f)){g=g||l.appendChild(b.createElement("div")),h=(Y.exec(f)||["",""])[1].toLowerCase(),i=$[h]||$._default,g.innerHTML=i[1]+n.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;n.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",o=0;while(f=m[o++])if(d&&n.inArray(f,d)>-1)e&&e.push(f);else if(j=n.contains(f.ownerDocument,f),g=_(l.appendChild(f),"script"),j&&aa(g),c){k=0;while(f=g[k++])Z.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),l.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",l.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var da=/^key/,ea=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,fa=/^([^.]*)(?:\.(.+)|)/;function ga(){return!0}function ha(){return!1}function ia(){try{return d.activeElement}catch(a){}}function ja(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)ja(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=ha;else if(!e)return a;return 1===f&&(g=e,e=function(a){return n().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=n.guid++)),a.each(function(){n.event.add(this,b,e,d,c)})}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return"undefined"!=typeof n&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(G)||[""],j=b.length;while(j--)h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.hasData(a)&&N.get(a);if(r&&(i=r.events)){b=(b||"").match(G)||[""],j=b.length;while(j--)if(h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&N.remove(a,"handle events")}},dispatch:function(a){a=n.event.fix(a);var b,c,d,f,g,h=[],i=e.call(arguments),j=(N.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())a.rnamespace&&!a.rnamespace.test(g.namespace)||(a.handleObj=g,a.data=g.data,d=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==d&&(a.result=d)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&("click"!==a.type||isNaN(a.button)||a.button<1))for(;i!==this;i=i.parentNode||this)if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>-1:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,e,f,g=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||d,e=c.documentElement,f=c.body,a.pageX=b.clientX+(e&&e.scrollLeft||f&&f.scrollLeft||0)-(e&&e.clientLeft||f&&f.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||f&&f.scrollTop||0)-(e&&e.clientTop||f&&f.clientTop||0)),a.which||void 0===g||(a.which=1&g?1:2&g?3:4&g?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,e,f=a.type,g=a,h=this.fixHooks[f];h||(this.fixHooks[f]=h=ea.test(f)?this.mouseHooks:da.test(f)?this.keyHooks:{}),e=h.props?this.props.concat(h.props):this.props,a=new n.Event(g),b=e.length;while(b--)c=e[b],a[c]=g[c];return a.target||(a.target=d),3===a.target.nodeType&&(a.target=a.target.parentNode),h.filter?h.filter(a,g):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==ia()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===ia()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ga:ha):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={constructor:n.Event,isDefaultPrevented:ha,isPropagationStopped:ha,isImmediatePropagationStopped:ha,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ga,a&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ga,a&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ga,a&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||n.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),n.fn.extend({on:function(a,b,c,d){return ja(this,a,b,c,d)},one:function(a,b,c,d){return ja(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=ha),this.each(function(){n.event.remove(this,a,c,b)})}});var ka=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,la=/<script|<style|<link/i,ma=/checked\s*(?:[^=]|=\s*.checked.)/i,na=/^true\/(.*)/,oa=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function pa(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function qa(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function ra(a){var b=na.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function sa(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(N.hasData(a)&&(f=N.access(a),g=N.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}O.hasData(a)&&(h=O.access(a),i=n.extend({},h),O.set(b,i))}}function ta(a,b){var c=b.nodeName.toLowerCase();"input"===c&&X.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function ua(a,b,c,d){b=f.apply([],b);var e,g,h,i,j,k,m=0,o=a.length,p=o-1,q=b[0],r=n.isFunction(q);if(r||o>1&&"string"==typeof q&&!l.checkClone&&ma.test(q))return a.each(function(e){var f=a.eq(e);r&&(b[0]=q.call(this,e,f.html())),ua(f,b,c,d)});if(o&&(e=ca(b,a[0].ownerDocument,!1,a,d),g=e.firstChild,1===e.childNodes.length&&(e=g),g||d)){for(h=n.map(_(e,"script"),qa),i=h.length;o>m;m++)j=e,m!==p&&(j=n.clone(j,!0,!0),i&&n.merge(h,_(j,"script"))),c.call(a[m],j,m);if(i)for(k=h[h.length-1].ownerDocument,n.map(h,ra),m=0;i>m;m++)j=h[m],Z.test(j.type||"")&&!N.access(j,"globalEval")&&n.contains(k,j)&&(j.src?n._evalUrl&&n._evalUrl(j.src):n.globalEval(j.textContent.replace(oa,"")))}return a}function va(a,b,c){for(var d,e=b?n.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||n.cleanData(_(d)),d.parentNode&&(c&&n.contains(d.ownerDocument,d)&&aa(_(d,"script")),d.parentNode.removeChild(d));return a}n.extend({htmlPrefilter:function(a){return a.replace(ka,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(l.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=_(h),f=_(a),d=0,e=f.length;e>d;d++)ta(f[d],g[d]);if(b)if(c)for(f=f||_(a),g=g||_(h),d=0,e=f.length;e>d;d++)sa(f[d],g[d]);else sa(a,h);return g=_(h,"script"),g.length>0&&aa(g,!i&&_(a,"script")),h},cleanData:function(a){for(var b,c,d,e=n.event.special,f=0;void 0!==(c=a[f]);f++)if(L(c)){if(b=c[N.expando]){if(b.events)for(d in b.events)e[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);c[N.expando]=void 0}c[O.expando]&&(c[O.expando]=void 0)}}}),n.fn.extend({domManip:ua,detach:function(a){return va(this,a,!0)},remove:function(a){return va(this,a)},text:function(a){return K(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.appendChild(a)}})},prepend:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(_(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return K(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!la.test(a)&&!$[(Y.exec(a)||["",""])[1].toLowerCase()]){a=n.htmlPrefilter(a);try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(_(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return ua(this,arguments,function(b){var c=this.parentNode;n.inArray(this,a)<0&&(n.cleanData(_(this)),c&&c.replaceChild(b,this))},a)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),f=e.length-1,h=0;f>=h;h++)c=h===f?this:this.clone(!0),n(e[h])[b](c),g.apply(d,c.get());return this.pushStack(d)}});var wa,xa={HTML:"block",BODY:"block"};function ya(a,b){var c=n(b.createElement(a)).appendTo(b.body),d=n.css(c[0],"display");return c.detach(),d}function za(a){var b=d,c=xa[a];return c||(c=ya(a,b),"none"!==c&&c||(wa=(wa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=wa[0].contentDocument,b.write(),b.close(),c=ya(a,b),wa.detach()),xa[a]=c),c}var Aa=/^margin/,Ba=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ca=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)},Da=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e},Ea=d.documentElement;!function(){var b,c,e,f,g=d.createElement("div"),h=d.createElement("div");if(h.style){h.style.backgroundClip="content-box",h.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle="content-box"===h.style.backgroundClip,g.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",g.appendChild(h);function i(){h.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",h.innerHTML="",Ea.appendChild(g);var d=a.getComputedStyle(h);b="1%"!==d.top,f="2px"===d.marginLeft,c="4px"===d.width,h.style.marginRight="50%",e="4px"===d.marginRight,Ea.removeChild(g)}n.extend(l,{pixelPosition:function(){return i(),b},boxSizingReliable:function(){return null==c&&i(),c},pixelMarginRight:function(){return null==c&&i(),e},reliableMarginLeft:function(){return null==c&&i(),f},reliableMarginRight:function(){var b,c=h.appendChild(d.createElement("div"));return c.style.cssText=h.style.cssText="-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",h.style.width="1px",Ea.appendChild(g),b=!parseFloat(a.getComputedStyle(c).marginRight),Ea.removeChild(g),h.removeChild(c),b}})}}();function Fa(a,b,c){var d,e,f,g,h=a.style;return c=c||Ca(a),g=c?c.getPropertyValue(b)||c[b]:void 0,""!==g&&void 0!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),c&&!l.pixelMarginRight()&&Ba.test(g)&&Aa.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f),void 0!==g?g+"":g}function Ga(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Ha=/^(none|table(?!-c[ea]).+)/,Ia={position:"absolute",visibility:"hidden",display:"block"},Ja={letterSpacing:"0",fontWeight:"400"},Ka=["Webkit","O","Moz","ms"],La=d.createElement("div").style;function Ma(a){if(a in La)return a;var b=a[0].toUpperCase()+a.slice(1),c=Ka.length;while(c--)if(a=Ka[c]+b,a in La)return a}function Na(a,b,c){var d=T.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Oa(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+U[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+U[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+U[f]+"Width",!0,e))):(g+=n.css(a,"padding"+U[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+U[f]+"Width",!0,e)));return g}function Pa(b,c,e){var f=!0,g="width"===c?b.offsetWidth:b.offsetHeight,h=Ca(b),i="border-box"===n.css(b,"boxSizing",!1,h);if(d.msFullscreenElement&&a.top!==a&&b.getClientRects().length&&(g=Math.round(100*b.getBoundingClientRect()[c])),0>=g||null==g){if(g=Fa(b,c,h),(0>g||null==g)&&(g=b.style[c]),Ba.test(g))return g;f=i&&(l.boxSizingReliable()||g===b.style[c]),g=parseFloat(g)||0}return g+Oa(b,c,e||(i?"border":"content"),f,h)+"px"}function Qa(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=N.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&V(d)&&(f[g]=N.access(d,"olddisplay",za(d.nodeName)))):(e=V(d),"none"===c&&e||N.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Fa(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=T.exec(c))&&e[1]&&(c=W(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(n.cssNumber[h]?"":"px")),l.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Fa(a,b,d)),"normal"===e&&b in Ja&&(e=Ja[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?Ha.test(n.css(a,"display"))&&0===a.offsetWidth?Da(a,Ia,function(){return Pa(a,b,d)}):Pa(a,b,d):void 0},set:function(a,c,d){var e,f=d&&Ca(a),g=d&&Oa(a,b,d,"border-box"===n.css(a,"boxSizing",!1,f),f);return g&&(e=T.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=n.css(a,b)),Na(a,c,g)}}}),n.cssHooks.marginLeft=Ga(l.reliableMarginLeft,function(a,b){return b?(parseFloat(Fa(a,"marginLeft"))||a.getBoundingClientRect().left-Da(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px":void 0}),n.cssHooks.marginRight=Ga(l.reliableMarginRight,function(a,b){return b?Da(a,{display:"inline-block"},Fa,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+U[d]+b]=f[d]||f[d-2]||f[0];return e}},Aa.test(a)||(n.cssHooks[a+b].set=Na)}),n.fn.extend({css:function(a,b){return K(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=Ca(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Qa(this,!0)},hide:function(){return Qa(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){V(this)?n(this).show():n(this).hide()})}});function Ra(a,b,c,d,e){return new Ra.prototype.init(a,b,c,d,e)}n.Tween=Ra,Ra.prototype={constructor:Ra,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||n.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ra.propHooks[this.prop];return a&&a.get?a.get(this):Ra.propHooks._default.get(this)},run:function(a){var b,c=Ra.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ra.propHooks._default.set(this),this}},Ra.prototype.init.prototype=Ra.prototype,Ra.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[n.cssProps[a.prop]]&&!n.cssHooks[a.prop]?a.elem[a.prop]=a.now:n.style(a.elem,a.prop,a.now+a.unit)}}},Ra.propHooks.scrollTop=Ra.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},n.fx=Ra.prototype.init,n.fx.step={};var Sa,Ta,Ua=/^(?:toggle|show|hide)$/,Va=/queueHooks$/;function Wa(){return a.setTimeout(function(){Sa=void 0}),Sa=n.now()}function Xa(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=U[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ya(a,b,c){for(var d,e=(_a.tweeners[b]||[]).concat(_a.tweeners["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Za(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&V(a),q=N.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?N.get(a,"olddisplay")||za(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Ua.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?za(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=N.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;N.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ya(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function $a(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function _a(a,b,c){var d,e,f=0,g=_a.prefilters.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Sa||Wa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},c),originalProperties:b,originalOptions:c,startTime:Sa||Wa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for($a(k,j.opts.specialEasing);g>f;f++)if(d=_a.prefilters[f].call(j,a,k,j.opts))return n.isFunction(d.stop)&&(n._queueHooks(j.elem,j.opts.queue).stop=n.proxy(d.stop,d)),d;return n.map(k,Ya,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(_a,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return W(c.elem,a,T.exec(b),c),c}]},tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.match(G);for(var c,d=0,e=a.length;e>d;d++)c=a[d],_a.tweeners[c]=_a.tweeners[c]||[],_a.tweeners[c].unshift(b)},prefilters:[Za],prefilter:function(a,b){b?_a.prefilters.unshift(a):_a.prefilters.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(V).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=_a(this,n.extend({},a),f);(e||N.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=N.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Va.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=N.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Xa(b,!0),a,d,e)}}),n.each({slideDown:Xa("show"),slideUp:Xa("hide"),slideToggle:Xa("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Sa=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Sa=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ta||(Ta=a.setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){a.clearInterval(Ta),Ta=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(b,c){return b=n.fx?n.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",l.checkOn=""!==a.value,l.optSelected=c.selected,b.disabled=!0,l.optDisabled=!c.disabled,a=d.createElement("input"),a.value="t",a.type="radio",l.radioValue="t"===a.value}();var ab,bb=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return K(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),e=n.attrHooks[b]||(n.expr.match.bool.test(b)?ab:void 0)),void 0!==c?null===c?void n.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=n.find.attr(a,b),null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!l.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(G);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)}}),ab={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=bb[b]||n.find.attr;bb[b]=function(a,b,d){var e,f;return d||(f=bb[b],bb[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,bb[b]=f),e}});var cb=/^(?:input|select|textarea|button)$/i,db=/^(?:a|area)$/i;n.fn.extend({prop:function(a,b){return K(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&n.isXMLDoc(a)||(b=n.propFix[b]||b,
    e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=n.find.attr(a,"tabindex");return b?parseInt(b,10):cb.test(a.nodeName)||db.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),l.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var eb=/[\t\r\n\f]/g;function fb(a){return a.getAttribute&&a.getAttribute("class")||""}n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,fb(this)))});if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,fb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):n.isFunction(a)?this.each(function(c){n(this).toggleClass(a.call(this,c,fb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=n(this),f=a.match(G)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=fb(this),b&&N.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":N.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+fb(c)+" ").replace(eb," ").indexOf(b)>-1)return!0;return!1}});var gb=/\r/g,hb=/[\x20\t\r\n\f]+/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(gb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a)).replace(hb," ")}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],(c.selected||i===e)&&(l.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentNode.disabled||!n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(n.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>-1:void 0}},l.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var ib=/^(?:focusinfocus|focusoutblur)$/;n.extend(n.event,{trigger:function(b,c,e,f){var g,h,i,j,l,m,o,p=[e||d],q=k.call(b,"type")?b.type:b,r=k.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!ib.test(q+n.event.triggered)&&(q.indexOf(".")>-1&&(r=q.split("."),q=r.shift(),r.sort()),l=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=r.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},f||!o.trigger||o.trigger.apply(e,c)!==!1)){if(!f&&!o.noBubble&&!n.isWindow(e)){for(j=o.delegateType||q,ib.test(j+q)||(h=h.parentNode);h;h=h.parentNode)p.push(h),i=h;i===(e.ownerDocument||d)&&p.push(i.defaultView||i.parentWindow||a)}g=0;while((h=p[g++])&&!b.isPropagationStopped())b.type=g>1?j:o.bindType||q,m=(N.get(h,"events")||{})[b.type]&&N.get(h,"handle"),m&&m.apply(h,c),m=l&&h[l],m&&m.apply&&L(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=q,f||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!L(e)||l&&n.isFunction(e[q])&&!n.isWindow(e)&&(i=e[l],i&&(e[l]=null),n.event.triggered=q,e[q](),n.event.triggered=void 0,i&&(e[l]=i)),b.result}},simulate:function(a,b,c){var d=n.extend(new n.Event,c,{type:a,isSimulated:!0});n.event.trigger(d,null,b),d.isDefaultPrevented()&&c.preventDefault()}}),n.fn.extend({trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),l.focusin="onfocusin"in a,l.focusin||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a))};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=N.access(d,b);e||d.addEventListener(a,c,!0),N.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=N.access(d,b)-1;e?N.access(d,b,e):(d.removeEventListener(a,c,!0),N.remove(d,b))}}});var jb=a.location,kb=n.now(),lb=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||n.error("Invalid XML: "+b),c};var mb=/#.*$/,nb=/([?&])_=[^&]*/,ob=/^(.*?):[ \t]*([^\r\n]*)$/gm,pb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,qb=/^(?:GET|HEAD)$/,rb=/^\/\//,sb={},tb={},ub="*/".concat("*"),vb=d.createElement("a");vb.href=jb.href;function wb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(G)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function xb(a,b,c,d){var e={},f=a===tb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function yb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function zb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function Ab(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:jb.href,type:"GET",isLocal:pb.test(jb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":ub,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?yb(yb(a,n.ajaxSettings),b):yb(n.ajaxSettings,a)},ajaxPrefilter:wb(sb),ajaxTransport:wb(tb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m=n.ajaxSetup({},c),o=m.context||m,p=m.context&&(o.nodeType||o.jquery)?n(o):n.event,q=n.Deferred(),r=n.Callbacks("once memory"),s=m.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,getResponseHeader:function(a){var b;if(2===v){if(!h){h={};while(b=ob.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===v?g:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return v||(a=u[c]=u[c]||a,t[a]=b),this},overrideMimeType:function(a){return v||(m.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>v)for(b in a)s[b]=[s[b],a[b]];else x.always(a[x.status]);return this},abort:function(a){var b=a||w;return e&&e.abort(b),z(0,b),this}};if(q.promise(x).complete=r.add,x.success=x.done,x.error=x.fail,m.url=((b||m.url||jb.href)+"").replace(mb,"").replace(rb,jb.protocol+"//"),m.type=c.method||c.type||m.method||m.type,m.dataTypes=n.trim(m.dataType||"*").toLowerCase().match(G)||[""],null==m.crossDomain){j=d.createElement("a");try{j.href=m.url,j.href=j.href,m.crossDomain=vb.protocol+"//"+vb.host!=j.protocol+"//"+j.host}catch(y){m.crossDomain=!0}}if(m.data&&m.processData&&"string"!=typeof m.data&&(m.data=n.param(m.data,m.traditional)),xb(sb,m,c,x),2===v)return x;k=n.event&&m.global,k&&0===n.active++&&n.event.trigger("ajaxStart"),m.type=m.type.toUpperCase(),m.hasContent=!qb.test(m.type),f=m.url,m.hasContent||(m.data&&(f=m.url+=(lb.test(f)?"&":"?")+m.data,delete m.data),m.cache===!1&&(m.url=nb.test(f)?f.replace(nb,"$1_="+kb++):f+(lb.test(f)?"&":"?")+"_="+kb++)),m.ifModified&&(n.lastModified[f]&&x.setRequestHeader("If-Modified-Since",n.lastModified[f]),n.etag[f]&&x.setRequestHeader("If-None-Match",n.etag[f])),(m.data&&m.hasContent&&m.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",m.contentType),x.setRequestHeader("Accept",m.dataTypes[0]&&m.accepts[m.dataTypes[0]]?m.accepts[m.dataTypes[0]]+("*"!==m.dataTypes[0]?", "+ub+"; q=0.01":""):m.accepts["*"]);for(l in m.headers)x.setRequestHeader(l,m.headers[l]);if(m.beforeSend&&(m.beforeSend.call(o,x,m)===!1||2===v))return x.abort();w="abort";for(l in{success:1,error:1,complete:1})x[l](m[l]);if(e=xb(tb,m,c,x)){if(x.readyState=1,k&&p.trigger("ajaxSend",[x,m]),2===v)return x;m.async&&m.timeout>0&&(i=a.setTimeout(function(){x.abort("timeout")},m.timeout));try{v=1,e.send(t,z)}catch(y){if(!(2>v))throw y;z(-1,y)}}else z(-1,"No Transport");function z(b,c,d,h){var j,l,t,u,w,y=c;2!==v&&(v=2,i&&a.clearTimeout(i),e=void 0,g=h||"",x.readyState=b>0?4:0,j=b>=200&&300>b||304===b,d&&(u=zb(m,x,d)),u=Ab(m,u,x,j),j?(m.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(n.lastModified[f]=w),w=x.getResponseHeader("etag"),w&&(n.etag[f]=w)),204===b||"HEAD"===m.type?y="nocontent":304===b?y="notmodified":(y=u.state,l=u.data,t=u.error,j=!t)):(t=y,!b&&y||(y="error",0>b&&(b=0))),x.status=b,x.statusText=(c||y)+"",j?q.resolveWith(o,[l,y,x]):q.rejectWith(o,[x,y,t]),x.statusCode(s),s=void 0,k&&p.trigger(j?"ajaxSuccess":"ajaxError",[x,m,j?l:t]),r.fireWith(o,[x,y]),k&&(p.trigger("ajaxComplete",[x,m]),--n.active||n.event.trigger("ajaxStop")))}return x},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax(n.extend({url:a,type:b,dataType:e,data:c,success:d},n.isPlainObject(a)&&a))}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return n.isFunction(a)?this.each(function(b){n(this).wrapInner(a.call(this,b))}):this.each(function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return!n.expr.filters.visible(a)},n.expr.filters.visible=function(a){return a.offsetWidth>0||a.offsetHeight>0||a.getClientRects().length>0};var Bb=/%20/g,Cb=/\[\]$/,Db=/\r?\n/g,Eb=/^(?:submit|button|image|reset|file)$/i,Fb=/^(?:input|select|textarea|keygen)/i;function Gb(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||Cb.test(a)?d(a,e):Gb(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Gb(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Gb(c,a[c],b,e);return d.join("&").replace(Bb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Fb.test(this.nodeName)&&!Eb.test(a)&&(this.checked||!X.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(Db,"\r\n")}}):{name:b.name,value:c.replace(Db,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Hb={0:200,1223:204},Ib=n.ajaxSettings.xhr();l.cors=!!Ib&&"withCredentials"in Ib,l.ajax=Ib=!!Ib,n.ajaxTransport(function(b){var c,d;return l.cors||Ib&&!b.crossDomain?{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Hb[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=n("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Jb=[],Kb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Jb.pop()||n.expando+"_"+kb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Kb.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Kb.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Kb,"$1"+e):b.jsonp!==!1&&(b.url+=(lb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?n(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Jb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||d;var e=x.exec(a),f=!c&&[];return e?[b.createElement(e[1])]:(e=ca([a],b,f),f&&f.length&&n(f).remove(),n.merge([],e.childNodes))};var Lb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Lb)return Lb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(g,f||[a.responseText,b,a])})}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};function Mb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,n.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(e=d.getBoundingClientRect(),c=Mb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ea})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;n.fn[a]=function(d){return K(this,function(a,d,e){var f=Mb(a);return void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=Ga(l.pixelPosition,function(a,c){return c?(c=Fa(a,b),Ba.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return K(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)},size:function(){return this.length}}),n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Nb=a.jQuery,Ob=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Ob),b&&a.jQuery===n&&(a.jQuery=Nb),n},b||(a.jQuery=a.$=n),n});



var lineCreator = {
    init:function(){


        Tone.Transport.timeSignature = [4, 4];
        Tone.Transport.bpm.value = 180;

        //L/R channel merging
        var merge = new Tone.Merge();

        //a little reverb
        var reverb = new Tone.Freeverb({
            "roomSize" : 0.2,
            "wet" : 0.3
        });

        merge.chain(reverb, Tone.Master);

        //the synth settings
        var synthSettings = {
            "oscillator": {
                "detune": 0,
                "type": "custom",
                "partials" : [2, 1, 2, 2],
                "phase": 0,
                "volume": 0
            },
            "envelope": {
                "attack": 0.005,
                "decay": 0.3,
                "sustain": 0.2,
                "release": 1,
            },
            "portamento": 0.01,
            "volume": 1
        };

        //left and right synthesizers
        var synthL = new Tone.Synth(synthSettings).connect(merge.left);
        var synthR = new Tone.Synth(synthSettings).connect(merge.right);





        var intervals = [
            0,
            -1,1,
            -2,2,
           -3,3, // -3
            -4,4, // 3
          -5,5, //4
            -6,6, //#4 b5
            -7,7 // 5
            -8,8 // b6
            -9,9 // 6
            -10,10 // b7
            -11,11 // 7
            -12,12 //octave
            -13,13 //b9
            -14,14 //9


        ];
        var steps = 4;
        var toneEvents = [];


        console.log(
            this.digitToToneOctave(40),
            this.digitToToneOctave(41)
        );

        toneEvents.push([40]);
        toneEvents.push([32]);
        toneEvents.push([48]);
        toneEvents.push([41]);

        toneEvents.push([40]);
        toneEvents.push([32]);
        toneEvents.push([48]);
        toneEvents.push([41]);

        toneEvents.push([40]);
        toneEvents.push([32]);
        toneEvents.push([48]);
        toneEvents.push([41]);

        toneEvents.push([40]);
        toneEvents.push([32]);
        toneEvents.push([48]);
        toneEvents.push([41]);

        toneEvents.push([40]);
        toneEvents.push([32]);
        toneEvents.push([48]);
        toneEvents.push([41]);

        toneEvents.push([40]);
        toneEvents.push([32]);
        toneEvents.push([39]);
        toneEvents.push([41]);
        toneEvents.push([40]);
        toneEvents.push([32]);
        toneEvents.push([43]);
        toneEvents.push([41]);
        toneEvents.push([40]);
        toneEvents.push([32]);
        toneEvents.push([51]);
        toneEvents.push([41]);







        var pathToFind = [];

        for(i=0;i<toneEvents.length;i++){
            if(i<toneEvents.length - 1){
                   pathToFind.push([ toneEvents[i]  ,toneEvents[i+1] ]);
            }
        }

        var fromTo = [];
        for(i=0;i<pathToFind.length;i++){
            fromTo[i] = [];
            var combs = this.createFromToCombination( pathToFind[i][0],pathToFind[i][1])
            for(j=0;j<combs.length;j++) {
                var delta = combs[j][1] - combs[j][0];
                fromTo[i].push( [combs[j] , delta]);
            }
        }





        var intervalCombinations = this.getIntervalCombinations(steps,intervals);

        var matchingSequence = [];
        for( var i = 0 ; i<intervalCombinations.length;i++){
            var tot = 0;
            $.each(intervalCombinations[i],function(k,v){
                tot+=parseInt(v);

            });

            for(j=0;j<fromTo.length;j++){
                if(!matchingSequence[j])
                    matchingSequence[j] = [];
                for(k=0;k<fromTo[j].length;k++){
                    if(fromTo[j][k][1] == tot){
                        var seqTone = this.getSequenceTones(fromTo[j][k][0][0],intervalCombinations[i]);

                        matchingSequence[j].push(seqTone);




                    }

                }
            }

        }

        //$("#stop").click(function(){Tone.Transport.stop();});

        console.log(matchingSequence);



    },
    setButton:function(element,seqTone,synthL,synthR){
        $('#'+element).click(function(){
            //the two Tone.Sequences
            var partL = new Tone.Sequence(function(time, note){
                synthL.triggerAttackRelease(note, "8n", time);
            }, seqTone, "8n").start();

            var partR = new Tone.Sequence(function(time, note){
                synthR.triggerAttackRelease(note, "8n", time);
            }, seqTone, "8n").start("1m");

            //set the playback rate of the right part to be slightly slower
           // partR.playbackRate = 0.985;

            Tone.Transport.start("+0.1");
            console.log(seqTone)
        });
    },
    getSequenceTones:function(startTone,intervalCombination){
        var current = startTone;
        var o = [];
        o.push(this.digitToToneOctave(startTone));
        for(l=0;l<intervalCombination.length;l++){

            o.push(this.digitToToneOctave(current+intervalCombination[l]));
            current+=intervalCombination[l];
        }
        return o;
    },
    getIntervalCombinations:function(steps,intervals){

        var arraysToCombine = [];
        for (var i = 0; i < steps; i++) {
            arraysToCombine[i]=intervals;
        }

        return this.getAllCombinations(arraysToCombine);
    },
    getAllCombinations:function(arraysToCombine) {
        var divisors = [];
        for (var i = arraysToCombine.length - 1; i >= 0; i--) {
            divisors[i] = divisors[i + 1] ? divisors[i + 1] * arraysToCombine[i + 1].length : 1;
        }

        function getPermutation(n, arraysToCombine) {
            var result = [],
                curArray;
            for (var i = 0; i < arraysToCombine.length; i++) {
                curArray = arraysToCombine[i];
                result.push(curArray[Math.floor(n / divisors[i]) % curArray.length]);
            }
            return result;
        }

        var numPerms = arraysToCombine[0].length;
        for(var i = 1; i < arraysToCombine.length; i++) {
            numPerms *= arraysToCombine[i].length;
        }

        var combinations = [];
        for(var i = 0; i < numPerms; i++) {
            combinations.push(getPermutation(i, arraysToCombine));
        }
        return combinations;
    },

    createFromToCombination:function(from,to){
        var o =[];
        $.each(from, function( iFrom, vFrom ) {
            $.each(to, function( iTo, vTo ) {
                o.push([vFrom,vTo]);
            });
        });
        return o;
    },

    digitToToneOctave:function(digit){
        var octave = parseInt(digit /12) ;
        var tones = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
        return tones[digit%12] + octave;
    }

};
var neck = {

    init:function(canvasId,instrument){
        console.log("NECK INIT");
        Neck = this;

        //this.getSession();

        this.canvasId = canvasId;
        this.c = document.getElementById(canvasId);
        this.width = this.c.width;
        this.height = this.c.height;
        this.ctx = this.c.getContext("2d");


        this.instrument = instrument;
        this.instrumentId = instrument.id;


        this.sound=this.session["sound"];


        if(!this.instrumentId)
            this.instrumentId = 0;



        this.setControls();
        this.getInstrument( this.instrumentId );

        return this;
    },

    insertAllRootScale:function(){
        $.each(Neck.rsBasket,function(index,value){
            var splited =  value.split("_");
            Neck.insertRootScale(splited[0],splited[1]);
        });

    },
    insertRootScale:function(r,s){

        var ajax_neck_rootScale = Routing.generate('ajax_neck_rootScale');
        Neck.rsBasket[0] = r+"_"+s;

        var request = $.ajax({
            url: ajax_neck_rootScale,
            method: "POST",
            data: {i: Neck.instrumentId, r: r, s: s},
            dataType: "html",
            async: false
        });


        request.done(function (msg) {
            $.each($.parseJSON(msg.replace(/&quot;/g, '\"')), function (index, value) {
                Neck.formatedMatrice[value.currentString][value.currentCase].intervale[r + "_" + s] = {intervaleName:value.currentIntervale,toneName:value.wsName};
            });


            Neck.draw();

        });

    },
    insertFingerings:function(jsonobj){
        this.fBasket = $.parseJSON(jsonobj.replace(/&quot;/g, '\"'));

    },

    getInstrument:function(instrument_id){
        if(instrument_id == 0){
            formatedMatrice = [];
            formatedMatrice[0] = [];
            for(i=0;i<=12;i++) {

                var octave = 2;
                if(i == 12)
                    var octave = 3;

                formatedMatrice[0][i] = {
                    "case": i,
                    "string": 0,
                    "digit": i,
                    "digitA": i+24,
                    "infoTone": this.tones[i],
                    "intervale": {},
                    "octave": octave
                };
            }
            Neck.formatedMatrice = formatedMatrice;

            Neck.draw();
            return;
        }

        var ajax_neck_instrument = Routing.generate('ajax_neck_instrument');
        this.cleanSelection();
        var request = $.ajax({
            url: ajax_neck_instrument,
            method: "POST",
            data: { instrument_id : instrument_id },
            dataType: "html",
            async: false
        });

        request.done(function( msg ) {

            JSONNodes = msg;
            this.matrice = $.parseJSON(JSONNodes.replace(/&quot;/g, '\"'));
            formatedMatrice = [];
            Neck.formatedMatrice = [];
            for(i=0;i<this.matrice.length;i++){
                if(!formatedMatrice[this.matrice[i].currentString]){ formatedMatrice[this.matrice[i].currentString] = [];}
                if(!formatedMatrice[this.matrice[i].currentString][this.matrice[i].currentCase]){formatedMatrice[this.matrice[i].currentString][this.matrice[i].currentCase] = [];}
                formatedMatrice[this.matrice[i].currentString][this.matrice[i].currentCase] = {
                    "case": this.matrice[i].currentCase,
                    "string": this.matrice[i].currentString,
                    "digit": this.matrice[i].currentDigit,
                    "digitA": this.matrice[i].currentDigitA,
                    "infoTone": this.matrice[i].currentInfoTone,
                    "intervale": {},
                    "octave": this.matrice[i].currentOctave
                };
            }
            Neck.matrice = msg;
            Neck.formatedMatrice = formatedMatrice;

            Neck.draw();
        });


        request.fail(function( jqXHR, textStatus ) {
            alert( "Request failed: " + textStatus );
        });

    },
    cleanIntervalesInFormatedMatrice:function(index){
        /*
         * r_s
         * 21_1
         */
        if(!index){
            $.each(Neck.formatedMatrice,function(k1,v1){
                $.each(Neck.formatedMatrice[k1],function(k2,v2){
                    $.each(Neck.formatedMatrice[k1][k2].intervale,function(k3,v3){
                        delete Neck.formatedMatrice[k1][k2].intervale[k3];
                    });
                });
            });
        }else{
            $.each(Neck.formatedMatrice,function(k1,v1){
                $.each(Neck.formatedMatrice[k1],function(k2,v2){
                    if(Neck.formatedMatrice[k1][k2].intervale[index])
                        delete Neck.formatedMatrice[k1][k2].intervale[index];
                });
            });
        }
        $( "#clearRootScaleSelection").hide();
    },
    setControls:function(){


        $( "#inlaysSelector" ).change(function() {
            if(this.checked){
                Neck.showInlays = true;
            }else{
                Neck.showInlays = false;
            }
            Neck.draw();
        });
        $( "#fretNumSelector" ).change(function() {
            if(this.checked){
                Neck.showFretNum = true;
            }else{
                Neck.showFretNum = false;
            }
            Neck.draw();
        });
        this.fillInstrumentSelector();
        $( "#instrumentSelector" ).change(function() {
            //Neck.getInstrument(this.value);
            Neck.instrumentId =this.value;
            //Neck.storeSession();
            location.reload();

            //Neck.insertAllRootScale();
        });



        $( "#nbrCasesMax" ).click(function() {
            Neck.displayedCase = Neck.displayedCaseMax
            Neck.draw();
        });
        $( "#nbrCasesReset" ).click(function() {
            Neck.displayedCase = Neck.displayedCaseMin
            Neck.draw();
        });
        $( "#nbrCasesAdd" ).click(function() {
            if(Neck.displayedCase<Neck.displayedCaseMax)
                Neck.displayedCase++;
            Neck.draw();
        });
        $( "#nbrCasesRemove" ).click(function() {
            if(Neck.displayedCase>Neck.displayedCaseMin)
                Neck.displayedCase--;
            Neck.draw();
        });

        $( "#clearRootScaleSelection").hide();
        $( "#clearRootScaleSelection" ).click(function() {
            Neck.cleanIntervalesInFormatedMatrice();
            Neck.rsBasket = [];
            $( "#clearRootScaleSelection").hide();
            Neck.draw();
        });


        if(Neck.rsBasket.length>1){
            $( "#rootScaleSelection").show();
            $( "#rootScaleSelection" ).click(function() {
                $( "#rootScaleSelection").hide();
                Neck.draw();
            });
        }else{
            $( "#rootScaleSelection").hide();
        }




        if(Neck.scBasket.length>0){
            $( "#clearSelection").show();
            $( "#fingeringSelection").show();
        }else{
            $( "#clearSelection").hide();
            $( "#fingeringSelection").hide();
        }

        $( "#clearSelection" ).click(function() {
            Neck.scBasket = [];
            Neck.draw();
        });
        $( "#fingeringSelection" ).click(function() {
            Neck.fingeringAction();
        });


        $( "#searchScaleFromSelection" ).click(function() {

            Neck.createFingerprint();

            $('#loading').show();

            var ajax_neck_searchRootScaleByDigits = Routing.generate('ajax_neck_searchRootScaleByDigits');

            var digits = [];
            $.each(Neck.scBasket, function(key,value){
                var splited = value.split("_");
                if($.inArray(Neck.formatedMatrice[splited[0]][splited[1]].digit,digits) < 0)
                    digits.push(Neck.formatedMatrice[splited[0]][splited[1]].digit);

            });
            var request = $.ajax({
                url: ajax_neck_searchRootScaleByDigits,
                method: "POST",
                data: { digits:digits },
                dataType: "html",
                async: false
            });


            request.done(function (msg) {


                $('#loading').hide();

                $("#neckResults").empty();

                var html="<h2>Results</h2><ul <ul class=\"list-inline\" id=\"neckResultsList\"></ul>";
                $("#neckResults").append(html);
                $.each($.parseJSON(msg.replace(/&quot;/g, '\"')), function (index, value) {

                    var x = [];
                    var y = [];
                    var d = [];
                    var i = [];
                    var w = [];

                    var datas = [];
                    var nameList = value.intervaleNameList.split(",");
                    var digitList = value.dList.split(",").map(function(item) {return parseInt(item);});
                    var wsList = value.wsList.split(",");
                    var deltaList = value.intervaleDeltaList.split(",");
                    var colorList = value.intervaleColorList.split(",");

                    $.each(Neck.scBasket,function(k,v){
                        var splited = v.split("_");
                        x.push(splited[1]);
                        y.push(splited[0]);

                        var ak = $.inArray(Neck.formatedMatrice[splited[0]][splited[1]].digitA%12,digitList);

                        if(ak != -1 ){
                            d.push(Neck.formatedMatrice[splited[0]][splited[1]].digitA);
                            i.push(nameList[ak]);
                            w.push(wsList[ak]);
                        }
                    });

                    var basket_fingering_add = Routing.generate('basket_fingering_add',{
                        instrumentId: Neck.instrument.id ,
                        instrumentName:Neck.instrument.name,
                        westernSystemId:value.wsId,
                        scaleId:value.scaleId,
                        fingeringId:(!Neck.isFingering)?0:Neck.isFingering,
                        xList: x.join(","),
                        yList: y.join(","),
                        dList: d.join(","),
                        wList: w.join(","),
                        iList: i.join(",")
                    });


                    for(i=0;i<nameList.length;i++){
                        datas[deltaList[i]] = ["C",nameList[i],colorList[i]];
                    }


                    var site_rootscale_index = Routing.generate('site_rootscale_instrumented_index',{
                        instrumentId:Neck.instrument.id,
                        instrumentName:Neck.instrument.name,
                        scaleName:value.scaleName,
                        scaleId:value.scaleId,
                        rootName:value.wsName,
                        rootId:value.wsId
                    });

                    var htmlBasket = '<a class="btn btn-default btn-xs" href="'+basket_fingering_add+'"><i class="glyphicon glyphicon-record"></i>add in basket</a>';
                    html="<li><div class=\"titleInVignette\"><a href=\""+site_rootscale_index+"\">"+value.rootInfoTone+" "+value.scaleName+"</a></div><div><canvas id=\"root_"+value.rootInfoTone+"_scale_"+value.scaleId+"\" width=\"180\" height=\"180\"></canvas>"+htmlBasket+"</div></li>";
                    $("#neckResultsList").append(html);

                    new diagram("root_"+value.rootInfoTone+"_scale_"+value.scaleId,datas);
                });




            });


            request.fail(function (jqXHR, textStatus) {
                alert("Request failed: " + textStatus);
            });


        });

        this.fillRootScaleSelector();

        $( "#addRootScale" ).click(function() {
            Neck.rsAction();
        });

    },

        fingeringAction:function(){
            var ajax_neck_fingering = Routing.generate('ajax_neck_fingering');
            var request = $.ajax({
                url: ajax_neck_fingering,
                method: "POST",
                data: {i: Neck.scBasket},
                dataType: "html",
                async: false
            });


            request.done(function (msg) {

            });


            request.fail(function (jqXHR, textStatus) {
                alert("Request failed: " + textStatus);
            });

        },
        rsAction:function(){

            var ajax_neck_rootScale = Routing.generate('ajax_neck_rootScale');
            var r = $("#rootSelector").attr('option','selected').val();
            var s = $("#scaleSelector").attr('option','selected').val();

            var i = $.inArray(r+"_"+s, Neck.rsBasket )
            if(i>=0){
                return false;
            }else{
                Neck.rsBasket.push(r+"_"+s);
            }

            $.each(Neck.rsBasket, function( index, value ) {

                var splitedValue = value.split("_");
                var r =  splitedValue[0];
                var s =  splitedValue[1];
                var newRs = true;

                for(i=0;i<Neck.formatedMatrice.length;i++){
                    for(j=0;j<Neck.formatedMatrice[i].length;j++){
                        if(Neck.formatedMatrice[i][j].intervale[r+"_"+s])
                            newRs = false;
                        break;
                    }
                }
                if(newRs) {
                    $('#loading').show();
                    var request = $.ajax({
                        url: ajax_neck_rootScale,
                        method: "POST",
                        data: {i: Neck.instrumentId, r: r, s: s},
                        dataType: "html",
                        async: false
                    });


                    request.done(function (msg) {
                        $('#loading').hide();
                        $.each($.parseJSON(msg.replace(/&quot;/g, '\"')), function (index, value) {
                            Neck.formatedMatrice[value.currentString][value.currentCase].intervale[r + "_" + s] = { intervaleName:value.currentIntervale , toneName:value.wsName };
                        });

                    });


                    request.fail(function (jqXHR, textStatus) {
                        alert("Request failed: " + textStatus);
                    });
                }
            });
            Neck.draw();
        },
    fillRootScaleSelector:function(){
        var ajax_neck_scale = Routing.generate('ajax_neck_scale');
        var request = $.ajax({
            url: ajax_neck_scale,
            method: "POST",
            data: { },
            dataType: "html",
            async: false
        });
        request.done(function( msg ) {
            $.each($.parseJSON(msg.replace(/&quot;/g, '\"')), function( index, value ) {
                $('#scaleSelector').append($('<option>', {
                    value: value.id,
                    text: value.name
                }));
            });
        });


        request.fail(function( jqXHR, textStatus ) {
            alert( "Request failed: " + textStatus );
        });

        var ajax_neck_root = Routing.generate('ajax_neck_root');
        var request = $.ajax({
            url: ajax_neck_root,
            method: "POST",
            data: { },
            dataType: "html",
            async: false
        });
        request.done(function( msg ) {
            $.each($.parseJSON(msg.replace(/&quot;/g, '\"')), function( index, value ) {
                $('#rootSelector').append($('<option>', {
                    value: value.id,
                    text: value.name
                }));
            });
        });


        request.fail(function( jqXHR, textStatus ) {
            alert( "Request failed: " + textStatus );
        });

        return true;
    },

    fillInstrumentSelector:function(){
        var ajax_neck_instruments = Routing.generate('ajax_neck_instruments');
        var request = $.ajax({
            url: ajax_neck_instruments,
            method: "POST",
            data: { },
            dataType: "html",
            async: false
        });

        request.done(function( msg ) {

            $.each($.parseJSON(msg.replace(/&quot;/g, '\"')), function( index, value ) {
                $('#instrumentSelector').append($('<option>', {
                    value: value.id ,
                    text: value.name
                }));

            });

            $('#instrumentSelector').val(Neck.instrumentId);

        });


        request.fail(function( jqXHR, textStatus ) {
            alert( "Request failed: " + textStatus );
        });

        return true;
    },

    draw:function(){


        this.ctx.clearRect(0, 0, this.width, this.height);

        if(this.instrument.id > 0 ){
            this.drawNeck();
        }else{
            this.drawDiagram();
        }

        // RS SELECTION
        $("#currentRootScaleSelectionUl").empty();
        if(this.rsBasket.length > 0){
            $("#clearRootScaleSelection").show();
        }
        $.each(this.rsBasket, function( index, value ) {
            var rsBasketKey = $.inArray(value, Neck.rsBasket);

            var splitedValue = value.split("_");
            var rootName = $("#rootSelector option[value="+splitedValue[0]+"]").text()
            var scaleName = $("#scaleSelector option[value="+splitedValue[1]+"]").text()
            $("#currentRootScaleSelectionUl").append('<li  id="rootScale-'+value+'" ><button style="background-color: '+ Neck.rsColors[rsBasketKey]+';" class="btn btn-default btn-xs"><i class="glyphicon glyphicon-remove"></i> '+rootName+' '+scaleName+'</button></li>');
            $("#rootScale-" + value).click(function () {
                Neck.cleanIntervalesInFormatedMatrice(value);
                Neck.rsBasket.splice(rsBasketKey, 1);
                Neck.draw();
            });
        });

        if(Neck.rsBasket.length>1){
            $( "#rootScaleSelection").show();
            $( "#rootScaleSelection" ).click(function() {
                var site_rootscale_instrumented_against = Routing.generate('site_rootscale_instrumented_against',{
                    instrumentId: Neck.instrument.id ,
                    instrumentName:Neck.instrument.name,
                    rootScaleList: Neck.rsBasket.join(",")
                });

                window.location.href = site_rootscale_instrumented_against;

            });
        }else{
            $( "#rootScaleSelection").hide();
        }


    },
    drawPoint:function(angle,distance,label,pseudoCase){

        var x = this.center_x + this.radius * Math.cos(-angle*Math.PI/180) * distance ;
        var y = this.center_y + this.radius * Math.sin(-angle*Math.PI/180) * distance;
        var x2 = this.center_x + this.radius * Math.cos(-angle*Math.PI/180) * distance *.7 - 10;
        var y2 = this.center_y + this.radius * Math.sin(-angle*Math.PI/180) * distance *.7;

        this.ctx.beginPath();
        this.ctx.font = "11px Arial";
        this.ctx.fillText(label, x2  ,y2 );
        this.ctx.fillStyle = 'black';
        this.ctx.arc(x, y, this.point_size, 0, 2 * Math.PI);
        this.ctx.fill();

        this.rectsC.push({x: x-20, y:y-20 , w: 40, h: 40 , case:pseudoCase,string:0});
        this.rectsCPoint.push({x: x, y:y , w: 1, h: 1 , case:pseudoCase,string:0});

        return [x,y];
    },
    drawDiagram:function(){

        this.marginC=5;
        this.marginB=5;
        this.widthC = this.c.height-2*this.marginC;
        this.heightC = this.c.height-2*this.marginC;
        this.x0B = this.widthC +  this.marginB /2;
        this.widthD = this.c.width - this.widthC - 2*this.marginB ;
        this.heightD = this.c.height-2*this.marginC;

        this.radius =  (this.widthC-50)/2;
        this.point_size = 2;
        this.center_x = this.widthC/2;
        this.center_y = this.heightC/2;
        this.points = [];

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.beginPath();
        this.ctx.arc(this.center_x, this.center_y, this.radius, 0, 2 * Math.PI);
        this.ctx.stroke();

        this.ctx.lineWidth=1;
        this.ctx.moveTo(  this.x0B , this.height/2);
        this.ctx.lineTo(  this.x0B+this.widthD, this.height /2)  ;
        this.ctx.stroke();

        for(i=0;i<=12;i++){

            if(i<12)
            var p = this.drawPoint(- 360 * i / 12 +  3*360/12,1,this.tones[i] , i  );


            this.ctx.lineWidth=1;
            this.ctx.moveTo( this.x0B+this.widthD * i/12 , this.height/2 - 3);
            this.ctx.lineTo( this.x0B+this.widthD * i/12 , this.height/2 + 3)  ;
            this.ctx.stroke();
            this.ctx.font = "11px Arial";
            if( this.tones[i%12].indexOf("#")>=0) {
                this.ctx.fillText(this.tones[i%12], this.x0B+this.widthD * i/12 - 5  , this.height/2 + 17);
            }else{
                this.ctx.fillText(this.tones[i%12], this.x0B+this.widthD * i/12 - 5  , this.height/2 - 7);
            }

            this.rects.push({x:  this.x0B+this.widthD * i/12 -20, y:this.height/2-20 , w: 40, h: 40 , case:i,string:0});

        }

        // SC SELECTION
        $("#currentSelectionUl").empty();
        $.each(this.scBasket, function( index, value ) {
            var splitedValue = value.split("_");
            var s =  splitedValue[0];
            var c =  splitedValue[1];

            Neck.ctx.fillStyle = "rgba(120, 65, 65, .6)";

            if(c == 0){
                Neck.ctx.fillRect( Neck.x0B+Neck.widthD  - 3 ,Neck.height/2 - 3 ,6,6);
            }

            Neck.ctx.fillRect( Neck.x0B+Neck.widthD * c/12 - 3 ,Neck.height/2 - 3 ,6,6);
            Neck.ctx.fillRect( Neck.rectsCPoint[c].x - 3 ,Neck.rectsCPoint[c].y - 3 ,6,6);

                $.each(Neck.scBasket, function( index2, value2 ) {
                    var splitedValue2 = value2.split("_");
                    var s2 =  splitedValue2[0];
                    var c2 =  splitedValue2[1];
                    Neck.ctx.beginPath();
                    Neck.ctx.moveTo(Neck.rectsCPoint[c].x, Neck.rectsCPoint[c].y);
                    Neck.ctx.lineTo(Neck.rectsCPoint[c2].x, Neck.rectsCPoint[c2].y);
                    Neck.ctx.strokeStyle = 'rgba(0,0,0,.1)';
                    Neck.ctx.stroke();
                });



            $("#currentSelectionUl").append("<li>[ "+s+"-"+c+" ]"+Neck.formatedMatrice[s][c].infoTone+Neck.formatedMatrice[s][c].octave+"</li>");
        });

        $.each(Neck.points, function (index1, value1) {
            $.each(Neck.points, function (index2, value2) {
                Neck.ctx.beginPath();
                Neck.ctx.moveTo(value1[0], value1[1]);
                Neck.ctx.lineTo(value2[0], value2[1]);
                Neck.ctx.strokeStyle = 'rgba(0,0,0,.1)';
                Neck.ctx.stroke();
            });
        });


        $("#"+this.canvasId).unbind();

        $("#"+this.canvasId).bind( "click", function( e ) {

            var rect = Neck.collides(Neck.rects, e.offsetX, e.offsetY);
            var rectC = Neck.collides(Neck.rectsC, e.offsetX, e.offsetY);

            if (rect) {

                Neck.selectStringCase(rect.string , rect.case );


                jnSynth.play(Array(
                    Neck.formatedMatrice[rect.string][rect.case].digitA,
                    Neck.formatedMatrice[rect.string][rect.case].digitA
                ), 'chord');
            }
            if (rectC) {
                Neck.selectStringCase(rectC.string , rectC.case );

                jnSynth.play(Array(
                    Neck.formatedMatrice[rectC.string][rectC.case].digitA,
                    Neck.formatedMatrice[rectC.string][rectC.case].digitA
                ), 'chord');
            }
        });

    },
    drawNeck:function(){


        var caseW = this.width/(this.displayedCase);
        var caseH = this.height/this.formatedMatrice.length;


        Neck.rectsInNeck = [];

        for(i=0;i<this.formatedMatrice.length;i++){

            this.ctx.beginPath();
            this.ctx.strokeStyle='gold';
            this.ctx.lineWidth=100/this.formatedMatrice[i][0].digitA;
            this.ctx.moveTo( caseW, this.height - i*caseH - caseH/2);
            this.ctx.lineTo(this.width, this.height - i*caseH - caseH/2)  ;
            this.ctx.stroke();

            this.ctx.fillStyle = "#666";
            this.ctx.font="9px Georgia black";

            this.ctx.fillText(Translator.trans(this.formatedMatrice[i][0].infoTone)+this.formatedMatrice[i][0].octave,   3, Neck.height-i*caseH -caseH/2 +2 );

            for(j=0;j<this.displayedCase+1;j++){
                Neck.rectsInNeck.push({x: j*caseW, y:(this.height-caseH) - i*caseH, w: caseW, h: caseH , case:j,string:i});

                // dont draw in case 0
                if(j>0){
                    this.ctx.beginPath();
                    this.ctx.strokeStyle='silver';
                    this.ctx.lineWidth=1;
                    this.ctx.moveTo( j*(caseW), (caseH/2)-5);
                    this.ctx.lineTo(j*(caseW), 5 + this.height - caseH/2)  ;
                    this.ctx.stroke();
                    this.ctx.rect(j*caseW-2,i*caseH-2,caseW-2,caseH-2);
                    if(i==0 && Neck.showFretNum){
                        Neck.ctx.fillStyle = "#666";
                        Neck.ctx.font="10px Georgia";
                        Neck.ctx.fillText(this.roman[j],   j*caseW , Neck.height-i*caseH  -5);
                    }
                }


                var len = $.map(this.formatedMatrice[i][j].intervale, function(n, i) { return i; }).length;
                k=1;
                $.each(this.formatedMatrice[i][j].intervale, function(key, value)
                {
                    var rsBasketKey = $.inArray(key,Neck.rsBasket);
                    Neck.ctx.fillStyle = Neck.rsColors[rsBasketKey];
                    Neck.ctx.fillRect(   j*caseW + caseW*k*1/(1+len)  ,Neck.height-i*caseH -caseH/2 ,5,5);
                    Neck.ctx.font="12px Georgia";
                    Neck.ctx.fillText(value.intervaleName,   j*caseW + caseW*k*1/(1+len), Neck.height-i*caseH -caseH/2 -5);
                    Neck.ctx.font="10px Georgia";
                    Neck.ctx.fillText(Translator.trans(value.toneName),   j*caseW + caseW*k*1/(1+len), Neck.height-i*caseH -caseH/2 +15);

                    k++;
                });

            }

        }


        $.each(this.fBasket, function(key, value)
        {
                var yvalues = value.yList.split(",");
                var xvalues = value.xList.split(",");
                var wsname = value.wsNameList.split(",");
                var intervals= value.intervaleList.split(",");

            $.each(yvalues, function(yk, vk)
            {
                Neck.ctx.beginPath();
                Neck.ctx.arc(xvalues[yk]*caseW + caseW/2, Neck.height-yvalues[yk]*caseH -caseH/2, (caseW/2)-8, 0, 2 * Math.PI, false);
                Neck.ctx.fillStyle = Neck.fColors[key];
                Neck.ctx.fill();
            })


        });


        this.ctx.beginPath();
        this.ctx.strokeStyle='#000';
        this.ctx.lineWidth=1;
        this.ctx.moveTo( caseW-3, (caseH/2));
        this.ctx.lineTo(caseW-3, this.height - caseH/2)  ;
        this.ctx.stroke();

        if(this.showInlays){
            $.each(this.inlays, function(key, value)
            {
                var centerX = value*caseW + caseW/2;
                var centerY = Neck.height/2;
                var radius = caseW/10;
                if(value == 12){
                    var radius = caseW/12;
                    Neck.ctx.beginPath();
                    Neck.ctx.arc(centerX, centerY-caseH, radius, 0, 2 * Math.PI, false);
                    Neck.ctx.fillStyle = "rgba(88, 163, 127,.2)";
                    Neck.ctx.fill();
                    Neck.ctx.beginPath();
                    Neck.ctx.arc(centerX, centerY+caseH, radius, 0, 2 * Math.PI, false);
                    Neck.ctx.fill();
                }else{
                    Neck.ctx.beginPath();
                    Neck.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                    Neck.ctx.fillStyle = "rgba(88, 163, 127,.2)";
                    Neck.ctx.fill();
                }

            });
        }

        $("#"+this.canvasId).unbind();
        $("#"+this.canvasId).bind( "click", function( e ) {
            var rect = Neck.collides(Neck.rectsInNeck, e.offsetX, e.offsetY);
            if (rect) {
                Neck.selectStringCase(rect.string , rect.case );

                Neck.playTones(
                    Array(
                        Neck.formatedMatrice[rect.string][rect.case].infoTone +
                        Neck.formatedMatrice[rect.string][rect.case].octave  ),"arpeggio");
            }
        });

        // SC SELECTION
        $("#currentSelectionUl").empty();
        $.each(this.scBasket, function( index, value ) {
            var splitedValue = value.split("_");
            var s =  splitedValue[0];
            var c =  splitedValue[1];

            Neck.ctx.fillStyle = "rgba(10, 10, 10, 1)";
            Neck.ctx.fillRect( caseW/2 + c*caseW,Neck.height-s*caseH -caseH/2 - 3,6,6);

            $("#currentSelectionUl").append("<li>[ "+s+"-"+c+" ]"+Neck.formatedMatrice[s][c].infoTone+Neck.formatedMatrice[s][c].octave+"</li>");
        });

        if(Neck.scBasket.length>0){
            $( "#clearSelection").show();
            $( "#searchScaleFromSelection").show();
            $( "#fingeringSelection").show();
        }else{
            $( "#clearSelection").hide();
            $( "#searchScaleFromSelection").hide();
            $( "#fingeringSelection").hide();
        }
    },
    cleanSelection:function () {
        $("#currentSelectionUl").empty();
        this.scBasket = [];
    },
    selectStringCase:function (s,c) {
        var i = $.inArray(s+"_"+c, this.scBasket )
        if(i>=0)
            this.scBasket.splice(i,1);
        else
            this.scBasket.push(s+"_"+c);

        this.draw();
    },

    collides:function (rects, x, y) {
        var isCollision = false;
        for (var i = 0, len = rects.length; i < len; i++) {
            var left = rects[i].x, right = rects[i].x+rects[i].w;
            var top = rects[i].y, bottom = rects[i].y+rects[i].h;
            if (right >= x
                && left <= x
                && bottom >= y
                && top <= y) {
                isCollision = rects[i];
            }
        }
        return isCollision;
    },
    createFingerprint:function(){
        var memString = [];
        var xList = [];
        var xListNoOs = [];
        var yList = [];
        Neck.fingerprint = [];
        Neck.fingerprintIncremented = [];
        Neck.isArpeggio = false;
        Neck.isFingering = 0;


        $.each(Neck.scBasket,
            function(k,v){
            var splited = v.split('_');
            if($.inArray( splited[0],memString ) != -1 || Neck.scBasket.length>Neck.formatedMatrice.length){
                Neck.isArpeggio = true;
            }
            memString.push(splited[0]);

                if(splited[1] > 0){
                    xListNoOs.push(parseInt(splited[1]));
                }
                xList.push(parseInt(splited[1]));
                yList.push(parseInt(splited[0]));


        });

        var minY = Math.min.apply(Math,yList);
        var minX = Math.min.apply(Math,xList);

        if(minY>0){
            $.each(yList,function(k,v){yList[k]=v-minY;});
        }
        if(minX == 0){
            var minXNoOs = Math.min.apply(Math, xListNoOs);
            $.each(xList,function(k,v){if(xList[k]>0){xList[k]=v-minXNoOs+1;}});
        }else if(minX > 1){
            $.each(xList,function(k,v){xList[k]=v-minX+1;});
        }

        $.each(yList,function(k,v){
            if(minX == 0){
                if( xList[k] != 0){
                    var newX = xList[k]+minXNoOs;
                }else{
                    var newX = 1    ;
                }
                Neck.fingerprintIncremented.push(v+"_"+newX);

            }
            Neck.fingerprint.push(v+"_"+xList[k]);
        });




        var ajax_neck_searchFingering = Routing.generate('ajax_neck_searchFingering');
        var request = $.ajax({
            url: ajax_neck_searchFingering,
            method: "POST",
            data: {
                fingerprint:Neck.fingerprint ,
                fingerprintIncremented:Neck.fingerprintIncremented ,
                isArpeggio:Neck.isArpeggio
            },
            dataType: "html",
            async: false
        });

        request.done(function( msg ) {
            $.each($.parseJSON(msg.replace(/&quot;/g, '\"')), function (index, value) {
                Neck.isFingering = value.fId;
            });

        });


        request.fail(function( jqXHR, textStatus ) {
            alert( "Request failed: " + textStatus );
        });




    },
    playTones:function(tones,arpeggio){

        if(arpeggio){
            var myJNSYNTH = JNSYNTH.setSynth("triangle");
            //var piano = new Tone.Synth().toMaster();
            var piano = myJNSYNTH.synth;

            var pianoPart = new Tone.Sequence(function(time, note){
                var n = DIGIT.toneForTone(note);
                piano.triggerAttackRelease(n, "4n", time);
            }, tones,"4n").start();

            pianoPart.loop = false;
            pianoPart.loopEnd = "1m";
            pianoPart.humanize = false;

            Tone.Transport.bpm.value = 120;

            Tone.Transport.start("+0.1");

        }else{
            var myJNSYNTH = JNSYNTH.setSynth("triangle","poly");


            var d = [];

            $.each(tones,function(k,v){
                tones[k] = DIGIT.toneForTone(v);
                d.push("4n");
            });

            myJNSYNTH.synth.triggerAttackRelease(tones, d);
        }



    },
    tones:Array("C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab","A","A#/Bb","B","C"),
    rects:[],
    rectsC:[],
    rectsCPoint:[],
    points:[],
    session:Array,
    instrument:null,
    instrumentId:null,
    instrument:null,
    formatedMatrice:null,
    matrice:null,
    scBasket:[],
    rsBasket:[],
    showInlays:true,
    fingerprint:[],
    isArpeggio:false,
    inlays:[3,5,7,9,12,15,17,19,21,24],
    showFretNum:true,
    roman:['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVII','XIX','XX','XXI','XXII','XXIII','XXIV'],
    rsColors:["hsl(265, 33%, 67%)", "hsl(344, 95%, 77%)","hsl(159, 96%, 63%)","hsl(27, 76%, 73%)","hsl(359, 96%, 90%)"],
    fColors:["rgba(100,30,20,.1)", "rgba(87,120,20,.1)", "rgba(30,100,20,.1)","rgba(20,30,100,.1)","rgba(100,30,100,.1)","rgba(100,100,20,.1)"],
    firstCase:1,
    displayedCase:5,
    displayedCaseMin:5,
    displayedCaseMax:17
};
/**
 * Created by lil-works on 01/11/16.
 */
sessionManager = function(action,target){
    var ajax_session_removeParam = Routing.generate('ajax_session_removeParam');

    if (action == "remove"){
        var request = $.ajax({
            url: ajax_session_removeParam,
            method: "POST",
            data: { target:target },
            dataType: "html",
            async: false
        });


        request.done(function (msg) {
            window.location.reload();
        });
    }

}
/**
 * Created by lil-works on 14/09/16.
 */

function collides (rects, x, y) {
    var isCollision = false;
    for (var i = 0, len = rects.length; i < len; i++) {
        var left = rects[i].x, right = rects[i].x+rects[i].w;
        var top = rects[i].y, bottom = rects[i].y+rects[i].h;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = rects[i];
        }
    }
    return isCollision;
}