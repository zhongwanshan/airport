const STREAM_PLAY_STATE_REQUESTTING = 1;//请求中
const STREAM_PLAY_STATE_REQ_STREAM_SUCCESS = 2;//请求成功
const STREAM_PLAY_STATE_PLAY_STRAM_SUCCESS = 3;//播放成功
const STREAM_PLAY_STATE_PLAY_STRAM_FAILED = 10;//请求失败
window.MediaSource = window.MediaSource || window.WebKitMediaSource;
//初始化 结构
function Player(videoctrl, frontId, channel, isPreview, isAudio) {
    this.isAudio = isAudio || false;
    this.frontId = frontId
    this.channel = channel
    this.isPreview = isPreview
    this.stream = null
    this.video = videoctrl.video;
    this.textInfo = videoctrl.text;
    this.gotInitSeg = false
    this.segments = [];
    this.frames = [];
    this.seq = 0;
    this.frameCnt = 0;
    this.timestamps = [];
    this.startTime = 0;

    this.isRecording = false;
    this.recordFilenamePrefix = '';
    this.initSeg = null;
    this.recordBuffers = [];
    this.recordFileName = '';
    this.onStreamPlayState =null;
};

var writeToFile = 0;
Player.prototype.setStreamPlayStatus = function(stateFunc){
    this.onStreamPlayState = stateFunc;
}
Player.prototype.start = function (recordEntry) {
    this.recordEntry = (recordEntry || null);
    if (!window.MediaSource && !IOS)
        return;

    this.gotInitSeg = false
    this.track = null;
    this.seq = 0;
    this.segments = [];
    this.frames = [];
    this.frameCnt = 0;
    this.timestamps = [];
    this.startTime = 0;

    var player = this;

    this.GetTrack = function (spsNalu) {
        var spsData = discardEmulationPreventionBytes(spsNalu.subarray(5));
        this.track = readSequenceParameterSet(spsData);
        this.track.id = 1;
        this.track.pixelRatio = [1, 1];
        this.track.duration = 0; //3600 * 24;
        this.track.type = 'video';
        this.track.fragmented = true;
        this.track.baseMediaDecodeTime = 0;

        this.track.sps = [spsNalu.subarray(4)];
    }

    this.getNalu = function (data) {
        if (data.length < 4) {
            return null;
        }

        var start = false;
        var startOffset = 0;
        var endOffset = data.byteLength;
        for (var i = 0; i < data.byteLength; ++i) {
            if (data[i] === 1 && i >= 3 && data[i - 1] === 0 && data[i - 2] === 0 && data[i - 3] === 0) {
                if (!start) {
                    start = true;
                    startOffset = i - 3;
                } else {
                    endOffset = i - 3;
                    break;
                }
            }
        }

        if (!start || startOffset === endOffset) {
            return null;
        }

        return data.subarray(startOffset, endOffset);
    }

    this.parseFrame = function (frame) {
        //console.log('parse frame[' + this.frameCnt +'] size = ' + frame.byteLength);

        var offset = 0;
        var iskeyframe = false;
        while (offset < frame.byteLength) {
            var data = new Uint8Array(frame, offset, frame.byteLength - offset);
            var nalu = this.getNalu(data);
            if (!nalu) {
                return iskeyframe;
            }
            var dataview = new DataView(frame, nalu.byteOffset, 4); //raplace sync bytes to nalu length,for mdat storage
            dataview.setUint32(0, nalu.byteLength - 4, false);

            var naluType = (data[4] & 0x1f);
            if (naluType == 0x05) { //I frame
                iskeyframe = true;
            }
            if ((naluType == 0x07) && !this.track) {
                this.GetTrack(nalu);
            }
            if ((naluType == 0x08) && this.track && !this.track.pps) {
                this.track.pps = [nalu.subarray(4)];
            }
            offset += nalu.byteLength;
        };

        return iskeyframe;
    }

    this.getNewSegment = function () {
        var i;
        this.track.samples = [];
        var mdatLen = 0;
        var duration1 = 90 * Math.floor((this.timestamps[this.timestamps.length - 1] - this.timestamps[0]) / (this.timestamps.length - 1));
        var delta = (this.timestamps[this.timestamps.length - 1] - this.timestamps[0]) * 90 - duration1 * (this.timestamps.length - 1);

        //console.log('avg frame duration = ' + duration1);

        for (i = 0; i < this.frames.length - 1; ++i) {
            this.track.samples.push({
                duration: ((i == 0) ? (duration1 + delta) : duration1),
                size: this.frames[i].byteLength,
                dataOffset: mdatLen,
                flags: {
                    isLeading: 0,
                    dependsOn: ((i == 0) ? 2 : 1),
                    isDependedOn: 0,
                    hasRedundancy: 0,
                    isNonSyncSample: ((i == 0) ? 0 : 1),
                    degradationPriority: 0,
                },
                compositionTimeOffset: 0,
            });
            mdatLen += this.frames[i].byteLength;
        }
        this.track.baseMediaDecodeTime = 90 * (this.timestamps[0] - this.startTime);
        this.track.duration = (this.timestamps[this.timestamps.length - 1] - this.timestamps[0]) * 90;

        var moofbox = moof(this.seq, [this.track]);
        var mdatdata = new ArrayBuffer(mdatLen);
        var dataview = new Uint8Array(mdatdata);
        var offset = 0;
        for (i = 0; i < this.frames.length - 1; ++i) {
            dataview.set(new Uint8Array(this.frames[i]), offset);
            offset += this.frames[i].byteLength;
        };

        var mdatbox = mdat(dataview);
        this.seq += 1;

        var newSeg = new Uint8Array(moofbox.byteLength + mdatbox.byteLength);
        newSeg.set(moofbox);
        newSeg.set(mdatbox, moofbox.byteLength);
        this.segments.push(newSeg.buffer);
        if (this.isRecording) {
            this.recordBuffers.push(newSeg.buffer);
            this.checkRecordBuffer();
        }

        this.frames = [this.frames[this.frames.length - 1]];
        this.lastTime = this.timestamps[this.frames.length - 2];
        this.timestamps = [this.timestamps[this.timestamps.length - 1]];
    }

    var fileCnt = 0;
    var lastCurrTime = 0;
    var lastFrameCount = 0;
    var fps = 0;
    var videoHeight = 0;
    var videoWidth = 0;
    this.processNewFrame = function () {
        //var keyframe = this.parseFrame(this.frames[this.frames.length - 1]);

        //if (!this.track) {
        //    this.frames = [];
        //    return;
        //}

        this.segments.push(this.frames[0]);
        if (this.isRecording && this.gotInitSeg) {
            this.recordBuffers.push(this.frames[0]);
            this.checkRecordBuffer();
        }
        this.frames = [];

            if (!this.gotInitSeg) {
                this.gotInitSeg = true;
                this.initSeg = this.segments[0];
                this.playNextSegment();
            }
            if (this.segments.length > 0) {
                var buf = this.video.buffered;
                var currTime = this.video.currentTime;
                videoHeight = this.video.videoHeight;
                videoWidth = this.video.videoWidth;
                var webkitDecodedFrameCount = this.video.webkitDecodedFrameCount;
                if (currTime == 0){
                    lastCurrTime = 0;
                    lastFrameCount = 0;
                }
                if(currTime !=0 ){
                   fps =  (webkitDecodedFrameCount - lastFrameCount) / (currTime - lastCurrTime);
                   lastCurrTime = currTime;
                   lastFrameCount = webkitDecodedFrameCount;
                }
                // console.log("videoHeight",videoHeight);
                // console.log("videoWidth",videoWidth);
                // console.log("fps",fps);
                if(null != this.textInfo){
                    this.textInfo.text(videoWidth+"x"+videoHeight + " "+fps.toFixed(0)+"fps");
                }
               
                if (buf && buf.length != 0 && currTime) {
                    var endTime = buf.end(buf.length - 1);
                    var maxOffset = (this.isAudio ? 1.0 : 4.0);
                    if (endTime - currTime > maxOffset) {
                        //console.log('***********skip time ' + buf.start(buf.length - 1) + ' ' + currTime + ' ' + endTime);
                        if (this.isAudio) {
                            this.video.currentTime = endTime - 0.32;                            
                        } else {
                            this.video.currentTime = endTime;
                        }
                    }
                }
                if (this.segments.length > 1) {
                //this may drop the init segment
                    console.log('drop a segment');
                    this.segments.pop();
                }
            }

        if (this.segments.length > 0) {
            this.playNextSegment();
        }
    }

    this.checkRecordBuffer = function() {
        var dataLen = 0;
        for (var i = 0; i < this.recordBuffers.length; ++i) {
            dataLen += this.recordBuffers[i].byteLength;
        }

        if (dataLen >= 16000000) {
            this.flushRecordFile();
        }
    }

    this.flushRecordFile = function() {
        if (!this.initSeg || this.recordBuffers.length === 0) {
            return;
        }

        var i;
        var dataLen = this.initSeg.byteLength;
        for (i = 0; i < this.recordBuffers.length; ++i) {
            dataLen += this.recordBuffers[i].byteLength;
        }

        var dataview = new Uint8Array(dataLen);
        dataview.set(new Uint8Array(this.initSeg), 0);
        var offset = this.initSeg.byteLength;

        for (i = 0; i < this.recordBuffers.length; ++i) {
            dataview.set(new Uint8Array(this.recordBuffers[i]), offset);
            offset += this.recordBuffers[i].byteLength;
        }

        var blob = new Blob([dataview], {
            type: "video/mp4"
        });

        if (window.navigator.msSaveBlob) { //for IE
            window.navigator.msSaveBlob(blob, this.recordFileName);
        } else {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(blob);
    
            var link = document.createElement('a');
            link.setAttribute('download', this.recordFileName);
            link.href = imageUrl;
            document.body.appendChild(link);
    
            // wait for the link to be added to the document
            window.requestAnimationFrame(function () {
                var event = new MouseEvent('click');
                link.dispatchEvent(event);
                document.body.removeChild(link);
            });
        }

        this.recordFileName = this.recordFilenamePrefix + '_' + nowTimeString() + '.mp4'
        this.recordBuffers = [];        
    }
    
    this.startPlay();
    if (this.onsocketopen) {
        this.onsocketopen();
    }
    if(!IOS){
        if (this.recordEntry) {
            this.stream = getRecordStream(this.recordEntry);
        } else {
            this.stream = getStream(this.frontId, this.channel, this.isPreview, this.isAudio)
        }
        this.stream.addStreamSink(this)
    }
}

Player.prototype.onGettingStream = function() {

    // if(this.onStreamPlayState)
    //     this.onStreamPlayState(STREAM_PLAY_STATE_REQUESTTING);
}

Player.prototype.reset = function() {
    if (this.stream) {
        this.stream.removeStreamSink(this)
        this.onStreamEnd()
    }
    this.startPlay();
    this.stream = getStream(this.frontId, this.channel, this.isPreview, this.isAudio)
    this.stream.addStreamSink(this)
}


Player.prototype.onStreamError = function() {
    this.onStreamEnd()
    // if(onStreamPlayState)
    //     onStreamPlayState(STREAM_PLAY_STATE_PLAY_STRAM_FAILED);
    if (this.stream) {
        this.stream.removeStreamSink(this)
        this.stream = null
    }

    if (this.onStreamError) {
        this.onStreamError()
    }
}


Player.prototype.onStreamEnd = function() {
    if (this.afterVideoDisplaying) {
        this.afterVideoDisplaying()
    }

    if (this.isRecording) {
        this.flushRecordFile();
    }

    this.gotInitSeg = false
    this.track = null;
    this.seq = 0;
    this.segments = [];
    this.frames = [];
    this.frameCnt = 0;

    if (this.mediaSource) {
        this.mediaSource = null;
        try {
            this.video.pause();
        } catch (e) {}
        try {
            this.video.src = null;
        } catch(e) {}
    }
}

Player.prototype.isPlaying = function() {
    return this.gotInitSeg
}

Player.prototype.onNewSegment = function(newSeg) {
    if (!this.mediaSource) {
        return
    }

    if (this.frameCnt === 0) {
        if (this.beforeVideoDisplaying) {
            this.beforeVideoDisplaying()
        }
    }
    this.frameCnt += 1;
    this.frames.push(newSeg);
    this.processNewFrame();
}

Player.prototype.stop = function () {
    if (this.stream) {
        this.stream.removeStreamSink(this)
        this.stream = null
    }

    if (this.isRecording) {
        this.stopRecording();
    }

    if (this.mediaSource) {
        this.mediaSource = null;
        this.video.pause();
        try {
           this.video.src = '';
        } catch(e) {
        }
    }

    this.gotInitSeg = false
    this.segments = [];
    this.frames = [];
    this.frameCnt = 0;  
    
    if (IOS && this.streamID) {
        this.video.pause();
        try {
           this.video.src = '';
        } catch(e) {
        }
    	var msg = {
    		command: "stop_hls_stream",
			stream_id: this.streamID
        };
        console.log(msg);
        
		vsclientSession.sendMsg(msg);
		
		var msgID = "start_hls_stream_" + msg.sn;
		if (sMsgSnToPlayer[msgID]) {
			delete sMsgSnToPlayer[msgID];
		}
		
		this.streamID = 0;
    }
}

Player.prototype.playNextSegment = function () {
    if (!this.mediaSource) {
        return;
    }
    
    var srcBuf = this.mediaSource.videoSrcBuf;
    if (!srcBuf) {
        return;
    }

    if (srcBuf.updating || this.segments.length == 0) {
        return;
    }

    try {
        var bufRanges = srcBuf.buffered;
        if (bufRanges && bufRanges.length > 0) {
            var bufNum = bufRanges.length;
            if (bufNum > 1) {
                console.log("buffered ranges number " + bufNum);
            }
            var rangeStart = bufRanges.start(bufNum - 1);
            var rangeEnd = bufRanges.end(bufNum - 1);
            if (rangeEnd - rangeStart > 16.0) {
                srcBuf.remove(rangeStart, rangeEnd - 4.0);            
                return;
            } 
        }
    } catch (e) {
        console.log(e);
    }

    try {
        srcBuf.appendBuffer(this.segments.shift());
    } catch (e) {
        console.log(e);
        this.reset()
    }
}

Player.prototype.startPlay = function () {
    if(!IOS){
        this.mediaSource = new window.MediaSource();
        this.video.src = window.URL.createObjectURL(this.mediaSource);
        this.video.autoplay = true;
        this.video.play();

        var player = this;

        this.mediaSource.addEventListener('sourceopen', function (event) {
            if (this.videoSrcBuf) {
                return;
            }

            if (player.isAudio) {
                this.videoSrcBuf = this.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');
            } else {
                this.videoSrcBuf = this.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
            }
            this.videoSrcBuf.mode = 'sequence';
            this.duration = Infinity;
            this.videoSrcBuf.addEventListener('updateend', function (event) {
                if (!writeToFile)
                    player.playNextSegment();
            });
        });
    }else{
        var msg = {
			command: "start_hls_stream",
     	    sn: GetNextMsgSn(),
			front: this.frontId,
			channel: this.channel,
			is_history: (this.recordEntry != null),
			is_audio: this.isAudio,
			is_talk: false,
			is_preview: this.isPreview,
			begin_time: (this.recordEntry != null) ? this.recordEntry.begin_time : 0,
			end_time: (this.recordEntry != null) ? this.recordEntry.end_time : 0,
			data_type: (this.recordEntry != null) ? this.recordEntry.data_type : 0,
			stream_type: (this.recordEntry != null) ? this.recordEntry.stream_type : 0,
			storage_type: (this.recordEntry != null) ? this.recordEntry.storage_type : 0,
        };
        console.log(msg);
        
		vsclientSession.sendMsg(msg);
		
		var msgID = "start_hls_stream_" + msg.sn;
		sMsgSnToPlayer[msgID] = this;
    }
    
}
Player.prototype.tryGetHLSURL = function(url) {
    console.log('url'+url);
    
	$.ajax({
        crossDomain: true,
		cache: false,
        async: true,
        dataType: 'json',
        url: url,
   	}).done(function() {
		this.video.src = url;
	    this.video.autoplay = true;
        this.video.playsinline = true;
        this.video.loop = true;
        this.video.muted = true;
	    this.video.play();
		this.gotInitSeg = true;
        if (this.beforeVideoDisplaying) {
            this.beforeVideoDisplaying()
        }
  	}.bind(this)).fail(function(xhr, status, error) {
		if(xhr.status==200) {
			this.video.src = url;
		    this.video.autoplay = true;
		    this.video.play();
			this.gotInitSeg = true;
	        if (this.beforeVideoDisplaying) {
	            this.beforeVideoDisplaying()
	        }
		} else {
 			setTimeout(function(){
				if (this.streamID !== 0) {
    				this.tryGetHLSURL(url);
				}
			}.bind(this), 500);
		}
	}.bind(this)).always(function(xhr, status, error){
		
	});
}


Player.prototype.onStartHLSStreamReply = function(reply) {
	if (reply.result === "success") {
		this.streamID = reply.stream_id;
		this.HLSURL = reply.url;
		console.log(reply.url);
		vsclientSession.callback.onStreamPlayStatus(STREAM_PLAY_STATE_PLAY_STRAM_SUCCESS)
		this.tryGetHLSURL(reply.url);	    
	} else {
		console.log("start HLS stream failed");
		vsclientSession.callback.onStreamPlayStatus(STREAM_PLAY_STATE_PLAY_STRAM_FAILED)
		this.onStreamError();
	}
}


var sMsgSnToPlayer = {};

function OnStartHLSStreamReply(reply) {
	var msgID = "start_hls_stream_" + reply.sn;
	var player = sMsgSnToPlayer[msgID];
	if (player) {
		player.onStartHLSStreamReply(reply);
	}
}


function OnHLSStreamClosed(msg) {
	var msgID = "start_hls_stream_" + reply.sn;
	var player = sMsgSnToPlayer[msgID];
	if (player) {
		player.onStreamError();
		delete sMsgSnToPlayer[msgID];
    }
    
}











var sAllStreams = {}

function streamId(frontId, channel, isPreview, isAudio,isHistory) {
    return "" + frontId + ":" + channel + ":" + isPreview + ":" + isAudio+":"+isHistory;
}
function getRecordStream(recordEntry) {
    var id = streamId(recordEntry.front, recordEntry.channel, true, false, true)
    console.log("getStream re:",id);
    var stream = sAllStreams[id]
    if (!stream) {
        var url = vsclientSession.webSocketHost() + '/video?session=' + vsclientSession.context.session + '&front=' + recordEntry.front + '&channel=' + recordEntry.channel + '&is_preview=true&is_history=true' +
                '&begin_time=' + recordEntry.begin_time + '&end_time=' + recordEntry.end_time + 
                '&data_type=' + recordEntry.data_type + '&stream_type=' + recordEntry.stream_type + '&storage_type=' + recordEntry.storage_type;
        stream = new VideoStream(url, id)
        sAllStreams[id] = stream
        stream.start()
    }

    return stream
}

function getStream(frontId, channel, isPreview, isAudio) {
    var id = streamId(frontId, channel, isPreview, isAudio,false)
    console.log("getStream:",id);
    var stream = sAllStreams[id]
    if (!stream) {
        var url = null
        if (isAudio) {
            url = vsclientSession.webSocketHost() + '/audio?session=' + vsclientSession.context.session + '&front=' + frontId + '&channel=' + channel
        } else {
            url = vsclientSession.webSocketHost() + '/video?session=' + vsclientSession.context.session + '&front=' + frontId + '&channel=' + channel + '&is_preview=' + isPreview
        } 
        stream = new VideoStream(url, id,vsclientSession.callback.onStreamPlayStatus)
        sAllStreams[id] = stream
        stream.start()
    }

    return stream
}

function VideoStream(url, streamId,callback) {
    this.streamId = streamId
    this.url = url
    this.sinks = []
    this.stopped = true
    this.initSeg = null
    this.segCnt = 0
    this.callback = callback;
}

VideoStream.prototype.start = function() {
    this.stopped = false
    this.initSeg = null
    this.currSeg = null
    this.segCnt = 0
    this.error = false
    this.websockt = new WebSocket(this.url);
    this.websockt.binaryType = "arraybuffer";
    
    var self = this
    this.sinks.forEach(function() {
        this.onGettingStream()
    })

    this.websockt.onopen = function () {
        if(self.callback)
            self.callback(STREAM_PLAY_STATE_REQ_STREAM_SUCCESS);
    };

    this.websockt.onclose = function () {
        self.sinks.forEach(function(sink) {
            if (this.error) {
                sink.onStreamError()
            } else {
                sink.onStreamEnd()
            }
        })

        self.initSeg = null
        self.currSeg = null
        self.websockt = null

        console.log("websocket closed ");
     };

    this.websockt.onerror = function () {
        console.log("websocket error " + this.readyState);

        this.error = true
    }

    this.websockt.onmessage = function (event) {
        if (!(event.data instanceof ArrayBuffer)) {
            return
        }         

        if (!self.initSeg) {
             if(self.callback)
                self.callback(STREAM_PLAY_STATE_PLAY_STRAM_SUCCESS);

            self.initSeg = event.data
        } else {
            self.segCnt += 1
            self.currSeg = event.data
        }

        self.sinks.forEach(function(sink) {
            console.log(sink.gotInitSeg);
            console.log(self.initSeg);
            if (!sink.gotInitSeg) {
                sink.onNewSegment(self.initSeg)
            }
            if (self.currSeg) {
                sink.onNewSegment(self.currSeg)
            }
        })
    };
}

VideoStream.prototype.stop = function() {
    this.stopped = true

    if (this.websockt) {
        this.websockt.close();
        delete this.websockt;
    }
}

VideoStream.prototype.addStreamSink = function(sink) {
    if (this.sinks.indexOf(sink) === -1) {
        this.sinks.push(sink)
        if (!this.stopped) {
            if (this.initSeg) {
                sink.onNewSegment(this.initSeg)
                if (this.currSeg) {
                    sink.onNewSegment(this.currSeg)
                }
            } else {
                sink.onGettingStream()
            }
        }
    }
}

VideoStream.prototype.removeStreamSink = function(sink) {
    var index = this.sinks.indexOf(sink)
    if (index === -1) {
        return
    }

    this.sinks.splice(index, 1)
    if (this.sinks.length === 0) {
        this.stop()
        delete sAllStreams[this.streamId]
    }
}
