!function (t) { function e(a) { if (i[a]) return i[a].exports; var o = i[a] = { i: a, l: !1, exports: {} }; return t[a].call(o.exports, o, o.exports, e), o.l = !0, o.exports } var i = {}; e.m = t, e.c = i, e.d = function (t, i, a) { e.o(t, i) || Object.defineProperty(t, i, { configurable: !1, enumerable: !0, get: a }) }, e.n = function (t) { var i = t && t.__esModule ? function () { return t.default } : function () { return t }; return e.d(i, "a", i), i }, e.o = function (t, e) { return Object.prototype.hasOwnProperty.call(t, e) }, e.p = "", e(e.s = 0) }([function (t, e) {
	function i(t) { return "/" === t[t.length - 1] ? t : t + "/" }
	
	var VpaidVideoPlayer = function () {

    // Ad Choices Constants
    var adChoicesDE = {};
    adChoicesDE.domain = 'www.amazon.de';
    adChoicesDE.iconSprite = 'https://images-na.ssl-images-amazon.com/images/G/03/cstone/adchoices/topright/germany_opa.png';
    adChoicesDE.spriteWidth = 112;

    var adChoicesES = {};
    adChoicesES.domain = 'www.amazon.es';
    adChoicesES.iconSprite = 'https://images-na.ssl-images-amazon.com/images/G/03/cstone/adchoices/topright/spain_opa.png';
    adChoicesES.spriteWidth = 118;

    var adChoicesFR = {};
    adChoicesFR.domain = 'www.amazon.fr';
    adChoicesFR.iconSprite = 'https://images-na.ssl-images-amazon.com/images/G/03/cstone/adchoices/topright/france_opa.png';
    adChoicesFR.spriteWidth = 105;

    var adChoicesIT = {};
    adChoicesIT.domain = 'www.amazon.it';
    adChoicesIT.iconSprite = 'https://images-na.ssl-images-amazon.com/images/G/03/cstone/adchoices/topright/italy_opa.png';
    adChoicesIT.spriteWidth = 81;

    var adChoicesUK = {};
    adChoicesUK.domain = 'www.amazon.co.uk';
    adChoicesUK.iconSprite = 'https://images-na.ssl-images-amazon.com/images/G/03/cstone/adchoices/topright/uk_opa.png';
    adChoicesUK.spriteWidth = 91;

    var adChoicesUS = {};
    adChoicesUS.domain = 'www.amazon.com';
    adChoicesUS.iconSprite = 'https://images-na.ssl-images-amazon.com/images/G/03/cstone/adchoices/topright/default_opa.png';
    adChoicesUS.spriteWidth = 91;

    var adChoicesCA = {};
    adChoicesCA.domain = 'www.amazon.ca';
    adChoicesCA.iconSprite = 'https://images-na.ssl-images-amazon.com/images/G/03/cstone/adchoices/topright/default_opa.png';
    adChoicesCA.spriteWidth = 91;

    var adChoicesJP = {};
    adChoicesJP.domain = 'www.amazon.co.jp';
    adChoicesJP.iconSprite = 'https://images-fe.ssl-images-amazon.com/images/G/03/cstone/adchoices/topright/default_opa.png';
    adChoicesJP.spriteWidth = 91;

    this.adChoicesIconWidth_ = 19;
    this.adChoices_ = {
        "uk" : adChoicesUK,
        "germany" : adChoicesDE,
        "de": adChoicesDE,
        "france" : adChoicesFR,
        "fr": adChoicesFR,
        "spain" : adChoicesES,
        "es": adChoicesES,
        "italy" : adChoicesIT,
        "it": adChoicesIT,
        "us" : adChoicesUS,
        "ca" : adChoicesCA,
        "jp" : adChoicesJP,
        "default" : adChoicesUS
    };

    this.slot_ = null;
    this.videoSlot_ = null;

    /*
     * Event listeners
     * @type Object.<string (event type),{callback: function, context: ?object}>
     * Stores listeners as specified by subscribe and unsubscribe.
     */
    this.eventListeners_ = {};

    this.attributes_ = {
        /* Constants */
        'linear' : true,
        'companions' : '',
        'icons' : '',

        /* Attributes passed from VPAID player */
        'width' : 0,
        'height' : 0,
        'viewMode' : 'normal',
        'desiredBitrate' : 256,

        /* Attributes sent in from VAST as creative metadata */
        'duration' : 30,
        'skippableState' : false,

        /* State of the Ad while playing */
        'remainingTime' : 0,
        'volume' : 1.0,
        'expanded' : false
    };

    this.quartileEvents_ = [
        {event: 'AdVideoStart', value: 0},
        {event: 'AdVideoFirstQuartile', value: 25},
        {event: 'AdVideoMidpoint', value: 50},
        {event: 'AdVideoThirdQuartile', value: 75},
        {event: 'AdVideoComplete', value: 100}
    ];

    this.lastQuartileIndex_ = 0;

    /**
     * Map of Ad Parameters in VAST XML which are sent by the player.
     *
     * videos = Array of maps, each map contains "url" and "mimetype" keys
     * duration = Video duration in seconds
     * skippableState = Boolean flag for whether the Ad is skippable
     * clickThruUrl = Video Ad Click through URL
     * adCfid = Ad CFID (Long)
     * creativeCfid = Creative CFID (Long)
     * vpaidVersion = "1.0", "1.1" or "2.0" (to determine whether skip event is supported)
     * showAdChoices = Boolean flag for whether to show Ad Choices Icon
     * adChoicesLocale =  One of "us", "uk", "germany", "france", "italy" or "spain"
     */
    this.parameters_ = {};
};

VpaidVideoPlayer.prototype.createAdChoicesOverlay_ = function() {
    var adChoicesLocale = this.parameters_.adChoicesLocale || "default";
    adChoicesLocale = adChoicesLocale.toLowerCase();
    var adChoices = this.adChoices_[adChoicesLocale] || this.adChoices_["default"]; // https://tt.amazon.com/0145015386
    var adCfid = this.parameters_.adCfid || 0;
    var creativeCfid = this.parameters_.creativeCfid || 0;
    var adChoicesLandingUrl = "https://" + adChoices.domain + '/adprefs/ref=cs_aap_' + creativeCfid + '/?pn=1&pg=daae';

    this.slot_.innerHTML = '<style type="text/css">#adChoicesDiv' + adCfid + ' .invisible { display: none !important; }</style>';

    var adChoicesDiv = document.createElement('div');
    adChoicesDiv.setAttribute("id", "adChoicesDiv" + adCfid);

    // Ad Choices Link
    var adChoicesLink = document.createElement('a');
    adChoicesLink.setAttribute("target", "_blank");
    adChoicesLink.setAttribute("href", adChoicesLandingUrl);
    adChoicesLink.setAttribute("border", "0");
    adChoicesLink.setAttribute("style", "display:block; margin:0; padding: 0; border: 0; text-decoration: none; cursor: pointer");
    adChoicesDiv.appendChild(adChoicesLink);

    // Container for expanded AdChoices icon
    var adChoicesIcon = document.createElement('span');
    adChoicesIcon.setAttribute("id", "adChoicesIconText" + adCfid);
    adChoicesIcon.setAttribute("style", 'margin:0; padding:0; position: absolute; height: 15px; overflow: hidden; top: 0; right: 0;');
    adChoicesLink.appendChild(adChoicesIcon);

    // Expanded Ad Choices icon (shown upon mouse hover)
    var adChoicesExpanded = document.createElement('span');
    var width = adChoices.spriteWidth - this.adChoicesIconWidth_;
    adChoicesExpanded.setAttribute("id", "adMarkerFull" + adCfid);
    adChoicesExpanded.setAttribute("style", 'width: ' + width + 'px; height: 15px;'
            + 'display:inline-block;'
            + 'background-color:transparent;'
            + 'background-position: -' + this.adChoicesIconWidth_ + 'px 0;'
            + '-ms-background-position-x: -' + (this.adChoicesIconWidth_ - 1) + 'px; -ms-background-position-y: 1px;'
            + 'background-image:url("' + adChoices.iconSprite + '");'
            + 'background-repeat: no-repeat;');
    adChoicesExpanded.innerHTML = '&nbsp;'
    adChoicesIcon.appendChild(adChoicesExpanded);

    // Collapsed Ad Choices Icon
    var adChoicesCollapsed = document.createElement('span');
    adChoicesCollapsed.setAttribute("id", "adChoicesIcon" + adCfid);
    adChoicesCollapsed.setAttribute("style", 'margin: 0; padding: 0;'
            + 'height: 15px; width: ' + this.adChoicesIconWidth_ + 'px; border: none;'
            + 'display:inline-block;'
            + 'position: absolute; overflow: hidden;'
            + 'background: transparent url("' + adChoices.iconSprite + '") no-repeat 0 0;'
            + 'top: 0; right: 0;');
    adChoicesCollapsed.innerHTML = '&nbsp;'
    adChoicesLink.appendChild(adChoicesCollapsed);

    this.slot_.appendChild(adChoicesDiv);
};

/**
 * Extracts parameters from JsParameters in AdParameters block.
 *
 * @param rawAdParameters Raw string extracted from the AdParameters block
 * @return Extracted parameters for Vpaid JS
 */
var extractParams = function(rawAdParameters) {
    var regex = /<JsParameters>([\s\S]*)<\/JsParameters>/g;
    var match = regex.exec(rawAdParameters);
    var adParametersJson = match[1];
    var adParameters = JSON.parse(adParametersJson);
    return adParameters;
};

function ensureTrailingSlash(pixelUrl) {
    return pixelUrl[pixelUrl.length - 1] === "/" ? pixelUrl : pixelUrl + "/";
}

var getSanitizedInstrUrl = function(pixelUrl) {
    if (pixelUrl) {
        pixelUrl = pixelUrl.replace(/^https?:/, document.location.protocol);
        pixelUrl = ensureTrailingSlash(pixelUrl);
    }
    return pixelUrl;
};

/**
 * VPAID defined init ad, initializes all attributes in the ad. The ad will
 * not start until startAd is called.
 *
 * @param {number} width The ad width.
 * @param {number} height The ad heigth.
 * @param {string} viewMode The ad view mode.
 * @param {number} desiredBitrate The desired bitrate.
 * @param {Object} creativeData Data associated with the creative.
 * @param {Object} environmentVars Variables associated with the creative like
 *       the slot and video slot.
 */
VpaidVideoPlayer.prototype.initAd = function(
        width,
        height,
        viewMode,
        desiredBitrate,
        creativeData,
        environmentVars) {

    this.attributes_['width'] = width;
    this.attributes_['height'] = height;
    this.attributes_['viewMode'] = viewMode;
    this.attributes_['desiredBitrate'] = desiredBitrate;

    // Parse the incoming parameters.
    this.parameters_ = extractParams(creativeData['AdParameters']);

    this.attributes_['duration'] = this.parameters_.duration;
    this.attributes_['skippableState'] = this.parameters_.skippableState;

    // Set remaining time as duration
    this.attributes_['remainingTime'] = this.parameters_.duration;

    this.slot_ = environmentVars.slot;
    this.videoSlot_ = environmentVars.videoSlot;

    this.log('initAd ' + width + 'x' + height + ' ' + viewMode + ' ' + desiredBitrate);

    this.updateVideoSlot_();

    this.videoSlot_.addEventListener('timeupdate', this.timeUpdateHandler_.bind(this), false);
    this.videoSlot_.addEventListener('ended', this.stopAd.bind(this), false);
    this.callEvent_('AdLoaded');

    if (this.parameters_ && this.parameters_.vu && this.parameters_.vuInstr) {

        var instrURL = getSanitizedInstrUrl(this.parameters_.vuInstr);
        var csmJsUrl = this.parameters_.vu;
        var csmParams = this.parameters_.vuParams;
        var vpObj = this;

        var reportViewabilityError = function(errorMsg) {
            var payload = {
                adViewability: [{
                    error: {
                        m: errorMsg
                    }
                }],
                c: "viewability",
                api: "VDO",
                error: 1
            };

            (new Image()).src = instrURL + encodeURI(JSON.stringify(payload)) + "?cb=" + Math.floor(Math.random() * 10000000);
        };

        var vScript = document.createElement("script");
        vScript.type = "text/javascript";
        vScript.onload = function() {
            if (typeof amzncsm !== 'undefined' && typeof amzncsm.rmVP === "function") {
                amzncsm.rmVP(instrURL, vpObj, csmParams);
            } else {
                reportViewabilityError("amzncsm.rmVP is not a function");
            }
        };
        vScript.onerror = function() {
            reportViewabilityError("CSM JS loading failed");
        };

        vScript.src = csmJsUrl;
        document.head.appendChild(vScript);
    }
};

/**
 * Called by the video element. Calls events as the video reaches times.
 */
VpaidVideoPlayer.prototype.timeUpdateHandler_ = function() {
    if (this.lastQuartileIndex_ >= this.quartileEvents_.length) {
        return;
    }
    var percentPlayed = this.videoSlot_.currentTime * 100.0 / this.videoSlot_.duration;

    if (percentPlayed >= this.quartileEvents_[this.lastQuartileIndex_].value) {
        var lastQuartileEvent = this.quartileEvents_[this.lastQuartileIndex_].event;
        this.callEvent_(lastQuartileEvent);
        this.lastQuartileIndex_ += 1;
    }
};

VpaidVideoPlayer.prototype.updateVideoSlot_ = function() {
    var slotExists = this.slot_ && this.slot_.tagName && this.slot_.tagName.toUpperCase() === 'DIV';
    if (!slotExists) {
        this.slot_ = document.createElement('div');
        if (!document.body) {
            document.body = /**@type {HTMLDocument}*/ document.createElement('body');
        }
        document.body.appendChild(this.slot_);
    }

    if (this.parameters_.showAdChoices) {
        this.createAdChoicesOverlay_();
        adCfid = this.parameters_.adCfid;
        adChoicesDiv = this.getElement_("adChoicesDiv" + adCfid);
        adChoicesText = this.getElement_("adChoicesIconText" + adCfid);
        adChoicesImage = this.getElement_("adChoicesIcon" + adCfid);
        adChoicesText.className = "invisible";
        adChoicesImage.className = "";
        adChoicesDiv.onmouseover = function() {
            adChoicesImage.className = "invisible";
            adChoicesText.className = "";
        };
        adChoicesDiv.onmouseout = function() {
            adChoicesText.className = "invisible";
            adChoicesImage.className = "";
        };
        adChoicesDiv.addEventListener('click', function(e) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        });
    }

    if (this.videoSlot_ == null) {
     this.videoSlot_ = document.createElement('video');
     this.log('Warning: No video element passed to ad, creating element.');
     this.slot_.appendChild(this.videoSlot_);
    }

    var foundSource = false;
    var videos = this.parameters_.videos || [];
    for (var i = 0; i < videos.length; i++) {
        if (this.videoSlot_.canPlayType(videos[i].mimetype) != '') {
        this.videoSlot_.setAttribute('src', videos[i].url);
        foundSource = true;
        break;
        }
    }
    if (!foundSource) {
        this.callEvent_('AdError');
    }
};


/**
 * Helper function to update the size of the video player.
 */
VpaidVideoPlayer.prototype.updateVideoPlayerSize_ = function() {
    try {
        this.videoSlot_.setAttribute('width', this.attributes_['width']);
        this.videoSlot_.setAttribute('height', this.attributes_['height']);
        this.videoSlot_.style.width = this.attributes_['width'] + 'px';
        this.videoSlot_.style.height = this.attributes_['height'] + 'px';
    } catch (e) { /* no op*/}
};


/**
 * Returns the versions of VPAID ad supported.
 * @param {string} version
 * @return {string}
 */
VpaidVideoPlayer.prototype.handshakeVersion = function(version) {
    return this.parameters_.vpaidVersion || '2.0';
};

/**
 * Called by the wrapper to start the ad.
 */
VpaidVideoPlayer.prototype.startAd = function() {
    this.log('Starting ad');
    this.callEvent_('AdImpression');
    this.videoSlot_.play();

    var callback = this.callEvent_.bind(this);
    this.slot_.addEventListener('click', function (e) {
        callback('AdClickThru');
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    });
    this.callEvent_('AdStarted');
};


/**
 * Called by the wrapper to stop the ad.
 */
VpaidVideoPlayer.prototype.stopAd = function() {
    this.log('Stopping ad');

    /* Setting a timeout allows events to go through. */
    var callback = this.callEvent_.bind(this);
    setTimeout(callback, 75, ['AdStopped']);
};


/**
 * @param {number} value The volume in percentage.
 */
VpaidVideoPlayer.prototype.setAdVolume = function(value) {
    this.attributes_['volume'] = value;
    this.log('setAdVolume ' + value);

    this.updateVideoPlayerVolume();
    this.callEvent_('AdVolumeChanged');
};


/**
 * @return {number} The volume of the ad.
 */
VpaidVideoPlayer.prototype.getAdVolume = function() {
    this.log('getAdVolume');
    return this.attributes_['volume'];
};

/**
  * Helper function to update the volume of the video player.
  */
 VpaidVideoPlayer.prototype.updateVideoPlayerVolume = function() {
     this.videoSlot_.setAttribute('volume', this.attributes_['volume']);
};

/**
 * @param {number} width The new width.
 * @param {number} height A new height.
 * @param {string} viewMode A new view mode.
 */
VpaidVideoPlayer.prototype.resizeAd = function(width, height, viewMode) {
    this.log('resizeAd ' + width + 'x' + height + ' ' + viewMode);
    this.attributes_['width'] = width;
    this.attributes_['height'] = height;
    this.attributes_['viewMode'] = viewMode;
    this.updateVideoPlayerSize_();
    this.callEvent_('AdSizeChange');
};


/**
 * Pauses the ad.
 */
VpaidVideoPlayer.prototype.pauseAd = function() {
    this.log('pauseAd');
    this.videoSlot_.pause();
    this.callEvent_('AdPaused');
};


/**
 * Resumes the ad.
 */
VpaidVideoPlayer.prototype.resumeAd = function() {
    this.log('resumeAd');
    this.videoSlot_.play();
    this.callEvent_('AdPlaying');
};


/**
 * Expands the ad.
 */
VpaidVideoPlayer.prototype.expandAd = function() {
    this.log('expandAd');
    // The ad does not have an expanded state.
};


/**
 * Returns true if the ad is expanded.
 * @return {boolean}
 */
VpaidVideoPlayer.prototype.getAdExpanded = function() {
    this.log('getAdExpanded');
    return this.attributes_['expanded'];
};


/**
 * Returns the skippable state of the ad.
 * @return {boolean}
 */
VpaidVideoPlayer.prototype.getAdSkippableState = function() {
    this.log('getAdSkippableState');
    return this.attributes_['skippableState'];
};


/**
 * Collapses the ad.
 */
VpaidVideoPlayer.prototype.collapseAd = function() {
    this.log('collapseAd');
    // The ad does not have an expanded state.
};


/**
 * Skips the ad.
 */
VpaidVideoPlayer.prototype.skipAd = function() {
    this.log('skipAd');
    var skippableState = this.attributes_['skippableState'];
    if (skippableState) {
        this.callEvent_('AdSkipped');
    }
};

/**
 * Registers a callback for an event.
 * @param {Function} fn - the callback function
 * @param {string} event  - the event type
 * @param {?Object} listenerScope - is a reference to the object in which the function is defined
 */
VpaidVideoPlayer.prototype.subscribe = function(fn, event, listenerScope) {
    this.log('Subscribe ' + fn.name + ' to event ' + event);
    this.eventListeners_[event] = (this.eventListeners_[event] || []).concat({
        callback: fn,
        context: listenerScope
    });
};


// Worth noting that the example provided in the IAB VPAID 2.0 link below that this was previously copy and pasted from
// doesn't match section 8.1.1 of the VPAID 2.0 spec where the unsubscribe method is described.
// See: https://www.iab.com/wp-content/uploads/2015/06/VPAID_2_0_Final_04-10-2012.pdf
// This is a breaking change.
/**
 * Removes a callback based on the callback function and the eventName
 *
 * @param {function} fn - a reference to the callback to be removed
 * @param {string} event - event the callback is associated with
 */
VpaidVideoPlayer.prototype.unsubscribe = function(fn, event) {
    if (this.eventListeners_[event]) {
        this.log('Unsubscribe ' + fn.name + ' from event ' + event);
        this.eventListeners_[event] = this.eventListeners_[event].filter(function(listener) {
            return listener.callback !== fn;
        });
    }
};

/**
 * @return {number} The ad width.
 */
VpaidVideoPlayer.prototype.getAdWidth = function() {
    return this.attributes_['width'];
};


/**
 * @return {number} The ad height.
 */
VpaidVideoPlayer.prototype.getAdHeight = function() {
    return this.attributes_['height'];
};


/**
 * @return {number} The time remaining in the ad.
 */
VpaidVideoPlayer.prototype.getAdRemainingTime = function() {
    return this.attributes_['remainingTime'];
};


/**
 * @return {number} The duration of the ad.
 */
VpaidVideoPlayer.prototype.getAdDuration = function() {
    return this.attributes_['duration'];
};


/**
 * @return {boolean} whether the Ad is linear. Always returns true
 */
VpaidVideoPlayer.prototype.getAdLinear = function() {
    return this.attributes_['linear'];
};

/**
 * @return HTML for companion ads
 */
VpaidVideoPlayer.prototype.getAdCompanions = function() {
    return this.attributes_['companions'];
};

/**
 * @return HTML for ad icons
 */
VpaidVideoPlayer.prototype.getAdIcons = function() {
    return this.attributes_['icons'];
};

/**
 * Logs events and messages.
 */
VpaidVideoPlayer.prototype.log = console.log.bind(console);

VpaidVideoPlayer.prototype.getElement_ = function(key) {
    var element = document.getElementById(key);
    if (element != null) {
        return element;
    }
    try {
        var element = parent.document.getElementById(key);
    } catch(e) {
        return null;
    }
    return element;
};

VpaidVideoPlayer.prototype.callEvent_ = function(eventType) {
    if (this.eventListeners_[eventType]) {
        this.eventListeners_[eventType].forEach(function(listener) {
            // Providing `this` Vpaid object as the context is non-standard. We only do it if no listenerScope was specified by the subscriber.
            var context = listener.context || this;
            var callbackArguments = [];
            if (eventType === 'AdClickThru') {
                // Providing arguments to listener callbacks is non-standard. These are specially added to AdClickThru for CSM JS as a subscriber.
                callbackArguments = [this.parameters_ && this.parameters_.clickThruUrl, this.parameters_ && this.parameters_.adCfid, true];
            }
            try {
                listener.callback.apply(context, callbackArguments);
            } catch (error) {
                this.log('Event callback "' + eventType + '" encountered an error.', error);
            }
        }.bind(this));
    }
};

window.getVPAIDAd = function() {
    return new VpaidVideoPlayer();
};
}]);