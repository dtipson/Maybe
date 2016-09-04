const {Maybe, Nothing, Just} = require('../../src/Maybe.js');

const createVideo = videoURL => {

  console.log('creating video w/',videoURL);

  var video = document.createElement('video');

  video.addEventListener('error', e => {
    console.log('video play error', e, video.error);
    Maybe.fromNullable(video.parentNode).map(x => x.removeChild(video));
  }, true);

  video.controls = false;
  video.className = 'grid-video';
  video.autoplay = false;
  video.muted = true;
  video.loop = true;
  video.width = 320;
  video.height = 240;

  video.src = videoURL;

  video.onloadedmetadata = function(e) {
    video.play();
  }

  return video;
};

const appendToBody = el => {
  document.body.appendChild(el);
}

const createMediaRecorder = stream => {
  let mediaRecorder;
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options.mimeType= 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options.mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options.mimeType= '';
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    console.error('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }

  mediaRecorder.onwarning = e => console.log('mr warning', e);

  return mediaRecorder;
};


const mrDataToBlobUrl = event => {
    return window.URL.createObjectURL(event.data);
};


const recorder = mediaRecorder => recordForMS => {

  let time = performance.now();

  console.log('preparing to record for', recordForMS);

  return new Promise((resolve, reject)=>{

    const startRecording = _ => setTimeout(()=>{

      mediaRecorder.ondataavailable = event => {
        console.log('got data',mediaRecorder.state);
        if(event && event.data && event.data.size > 1){
          console.log('record time',performance.now()-time);
          if(mediaRecorder.state === "recording") {
            mediaRecorder.onpause = e => resolve(event);
            mediaRecorder.pause();
          }else{
            resolve(event);
          }
        }
      };

      mediaRecorder.requestData();

    }, recordForMS);

    mediaRecorder.onerror = e => !console.log('mr error', e) && reject(e);

    if(mediaRecorder.state === "paused") {

      mediaRecorder.onresume = e => startRecording();

      mediaRecorder.resume();
    }else{
      startRecording();
    }


  });

};

const handleError = e => console.error('fatal error in chain',e);

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const recordClips = number => stream => {
  const mr = createRecorder(stream);
  const recordFor = time => recorder(mr)(time).then(url=> !console.log(url) && url).then(mrDataToBlobUrl).then(createVideo).then(appendToBody);

  const startMR = _ => new Promise(resolve => {
    mr.onstart = e => !console.log('starting, state is', e.currentTarget.state) && resolve(e);
    mr.start();
  });
  
  return Array.from({length:number}).reduce(
    P => P.then(_=>console.log('rec')).then(_ => recordFor(2000)), 
    delay(1400).then(startMR)
  ).then(_ => {
      mr.stop();
      closeStream(stream);
  }).catch(handleError);

};

//closeStream :: Stream -> undefined
const closeStream = stream => {
  console.log('closing stream',stream);
  stream.getAudioTracks().forEach(track => track.stop());
  stream.getVideoTracks().forEach(track => track.stop());
}

//requestRecord :: Object (optional) -> Promise Stream
const requestRecord = (config={video:true, audio:true}) => {
  return navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? 
    navigator.mediaDevices.getUserMedia(config) :
    Promise.reject('no support for getUserMedia');
};


// var muted = true;

// $('button').on('click',function(e){
//   $('video').get().forEach(function(v){
//     v.muted = !muted;
//   });
//   $(this).toggleClass('unmuted',muted);
//   muted = !muted;
// });


module.exports = {
  appendToBody,
  createVideo,
  createMediaRecorder,
  requestRecord
};