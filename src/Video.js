import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const VIDEO_SRC = "https://10380e91fda5e303.mediapackage.us-west-2.amazonaws.com/out/v1/3f767e030a234db8a9d7ef715d41a809/index.m3u8";

function Video () {
  const videoRef = useRef(null)
  useEffect(() => {
    const video = videoRef.current;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = VIDEO_SRC;
      //
      // If no native HLS support, check if hls.js is supported
      //
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(VIDEO_SRC);
      hls.attachMedia(video);
    } 
  }, [videoRef])
  return(
    <video id="video" ref={videoRef}></video>
  );
}

export default Video;
