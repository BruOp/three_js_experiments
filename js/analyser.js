
// Based on http://www.airtightinteractive.com/demos/js/uberviz/audioanalysis/js/AudioHandler.js
var SoundAnalyser = function() {
  // 'use strict'

  var that = this, soundAnalyser = {};

  soundAnalyser.levelsCount = 8; //should be factor of 512
  soundAnalyser.waveCount = 32; //should be factor of 512
  soundAnalyser.waveDataRaw = [];
  soundAnalyser.waveData = [];
  soundAnalyser.levelsData = [];
  soundAnalyser.level = 0;


  var isPlaying = false, isUsingMic = false, isMicCreated = false;
  var audioContext, audioElement, analyser, microphone, volumeNode, volumeGainNode;

  var freqByteData; // bars - bar data is from 0 - 256 in 512 bins. no sound is 0;
  var timeByteData; // waveform - waveform data is from 0-256 for 512 bins. no sound is 128.

  var beatCutOff = 0, beatTime, beatLevel = 0;
  var beatHoldTime = 15; // num of frames to hold a beat
  var beatDecayRate = 0.97;
  var beatMinVol = 0.25; // a volume less than this is no beat
  var beatLevelUp = 1.05;

  var initContext = function() {

    audioContext = new window.AudioContext();

    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 1.0;//0.8; // 0<->1 // 0 is no time smoothing
    analyser.fftSize = 1024;
    
    volumeNode = audioContext.createGain();
    volumeGainNode = audioContext.createGain();

    volumeNode.connect(audioContext.destination);
    analyser.connect(volumeNode);
    volumeGainNode.connect(analyser);
    
    soundAnalyser.binCount = analyser.frequencyBinCount;
    soundAnalyser.waveBins = Math.floor(soundAnalyser.binCount / soundAnalyser.waveCount);
    soundAnalyser.levelBins = Math.floor(soundAnalyser.binCount / soundAnalyser.levelsCount);

    freqByteData = new Uint8Array(soundAnalyser.binCount); 
    timeByteData = new Uint8Array(soundAnalyser.binCount);

  }

  soundAnalyser.setVolume = function(value) {
    volumeNode.gain.value = value;
  }

  soundAnalyser.setSesitivity = function(value) {
    volumeGainNode.gain.value = value;
  }

  soundAnalyser.connectTrack = function(path) {

    if(isPlaying) return;

    if(isUsingMic) {
      microphone.disconnect(volumeGainNode);
    }

    isUsingMic = false;
    
    if(!isPlaying) {
      audioElement = document.createElement('audio');
      audioElement.src = path;
      audioElement.loop = true;
      source = audioContext.createMediaElementSource(audioElement);
    }

    source.connect(volumeGainNode);
    audioElement.play();

    isPlaying = true;
  }

  soundAnalyser.update = function() {
    analyser.getByteFrequencyData(freqByteData); //<-- bar chart
    analyser.getByteTimeDomainData(timeByteData); // <-- waveform

    for(var i = 0; i < soundAnalyser.binCount; i++) {
      soundAnalyser.waveDataRaw[i] = (timeByteData[i] - 128) / 128;
    }

    for(var i = 0; i < soundAnalyser.waveCount; i++) {
      var totalForBin = 0;

      for(var j = 0; j < soundAnalyser.waveBins; j++) {
        totalForBin += soundAnalyser.waveDataRaw[(i * soundAnalyser.waveBins) + j];
      }

      var t = totalForBin / soundAnalyser.waveBins;
      soundAnalyser.waveData[i] = t;
    }

    var total = 0;
    for(var i = 0; i < soundAnalyser.levelsCount; i++) {
      var totalForBin = 0;

      for(var j = 0; j < soundAnalyser.levelBins; j++) {
        totalForBin += freqByteData[(i * soundAnalyser.levelBins) + j];
      }

      var t = totalForBin / soundAnalyser.levelBins / 256;
      // soundAnalyser.levelsData[i] *= 1 + (i / soundAnalyser.levelsCount) / 2;

      soundAnalyser.levelsData[i] = t;
      total += t;
    }
    
    soundAnalyser.level = total / soundAnalyser.levelsCount;
    beatLevel = soundAnalyser.level;

    if (beatLevel > beatCutOff){
      if(soundAnalyser.onBeat) soundAnalyser.onBeat();
      beatCutOff = beatLevel * beatLevelUp;
      beatTime = 0;
    } else {
      if (beatTime <= beatHoldTime){
        beatTime++;
      }else{
        beatCutOff *= beatDecayRate;
        beatCutOff = Math.max(beatCutOff, beatMinVol);
      }
    }
  }

  soundAnalyser.getFreqData = function() {
    var dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }


  soundAnalyser.getTimeData = function() {
    var dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  soundAnalyser.getData = function() {
    var freqData = soundAnalyser.getFreqData();
    var timeData = soundAnalyser.getTimeData();
    // for (var i = 0; i < 512; i++) {
    //   freqData[i] = freqData[i] / 512;
    //   timeData[i] = (timeData[i] - 128) / 128;
    // }
    var dataColor = new Uint8Array(3 * freqData.length + 3 * timeData.length);
    for (var i = 0; i < freqData.length; i++) {
      var freqDataPoint = timeData[i]
      dataColor[ i * 3 ]     = freqDataPoint;
      dataColor[ i * 3 + 1 ] = freqDataPoint;
      dataColor[ i * 3 + 2 ] = freqDataPoint;
    }
    for (var j = freqData.length; j < freqData.length + timeData.length; j++) {
      var timeDataPoint = freqData[j-512]
      dataColor[ j * 3 ]     = timeDataPoint;
      dataColor[ j * 3 + 1 ] = timeDataPoint;
      dataColor[ j * 3 + 2 ] = timeDataPoint;
    }
    return dataColor;
  }

  initContext();

  return soundAnalyser;
}

















