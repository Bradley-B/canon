---
title: iPod Nano
publishDate: 2022-01-06
lastModifiedDate: 2022-01-06
isPublished: true
---

Everyone's got a junk drawer. Somewhere to dump your miscellaneous things at the end of the day when you don't
want to deal with them. Maybe it's right at the entrance to your home, or maybe you hide it shamefully in a
box under your bed. Since I was a kid, I had a junk nightstand at my parent's house. It wasn't meant to be
a junk nightstand. It was meant to be a normal nightstand. I just put junk in it.

Since, like, kindergarten, I put random stuff into it. Mail that should have gone into the trash. Birthday
cards. Baseball cards from my dad. A pack of gum. A paper mâché face mask I made in elementary school art 
class. Cases to DS cartridges long since lost or sold. Tickets to attended sports games. Change. A kazoo.
Before long, stuff like this filled the drawers. And then, I never cleaned it out. For, like, 10 years, I just
left it in there, occasionally shoving in some new junk. I left, went to college, and it sat untouched. 
Random childhood memories, contained and undisturbed, like a time capsule. Until yesterday, when I went 
in with a trash bag and threw (almost) all of it out.

It was interesting to look through. I love getting data about myself, and physical trash is, really, more 
data. In the same way historians learn about ancient societies by their trash, I can learn about my past 
self. But, at some point, it just needs to go to the landfill. It would be nice to reclaim that nightstand 
for actual use.

Along my adventures through childhood rubble, I came across my old 7th gen ipod nano - the last nano Apple 
ever made. Previously, I considered this piece of tech long-lost to the sands of time. I had actually spent 
some time looking for it, but was unsuccessful. You see, it contains information about my music
preferences from 2014-2015, before I got my first smartphone and started using streaming services. 
Surprisingly, I also planned on using it for its intended purpose, playing music. It holds up remarkably 
well to this day - enough to daily drive if you need a small and light mp3 player. It has bluetooth, and 
my recent earbuds and headphones connect and play music without much fuss, save for a few volume quirks.

Unfortunately, it doesn't have an internet connection. This means that you need to plug it into a computer
and drag-and-drop mp3 files on it like they did in caveman times. I see this as both a drawback and an 
advantage. It's inconvenient to put music on it, sure, but once the music is there, it's not going anywhere
unless you remove it (obviously flash storage degrades, but that can be mitigated). You aren't bound to an 
app, or a third-party service. Mp3 players are a timeless, cohesive package. Doing one thing and doing it 
well. That's an attractive quality.

With this in mind, I set out to make it easier to get mp3 files to put on the ipod.

## Requirements

When I originally used the ipod, I got mp3 files from YouTube. For each song I wanted, I would search for it,
plug the url into one of those YouTube to mp3 sites, wait for it to finish, download it, rename the file
if it was named weirdly, and drag and drop it onto the player. This way of doing things has a number of
drawbacks. First and foremost, it's insanely manual, which is just unacceptable to me as a programmer. 
After all, why spend two hours doing something when you could spend a week automating it?

Also, the downloaded songs don't have any metadata. This is more important than you might think for 
organizing the files on the player. Without metadata, there's no way to play all the songs you have by a 
certain artist, or in a certain album. It's annoying when using the ipod too; none of the songs have 
album art, and they all say "Unknown Artist" and "Unknown Album". So, I wanted to create a solution that
solved these two issues. A solution that required little manual effort, and that added in metadata.

Of course, now, I use a streaming service to play most of my music. When I create a playlist for my ipod, I
sort of also want it on my streaming service. This is less of a hard requirement and more of a nice-to-have.
For a streaming service, I use YouTube Music, which I am not in love with. However, it does have some 
advantages for this project that we'll see soon. 

## Reverse Engineering: mp3

Let's actually think about a music streaming service. In order for the data to be displayed to you, the 
end user, it needs to get to your browser. The server sends the website code to your browser, 
and then the browser will send out more requests to load more content as it needs it. This entire process
is visible to us in the browser devtools: we can see the network requests that the webpage makes, and 
we can see the html data on the page. 

It's possible that the data is encoded in some strange format during the transfer, making it very 
difficult for us to interpret. In my experience, developers rarely bother with this as there isn't really 
a point. It needs to be plaintext at some point in order to be displayed. Sometimes it's obscured as a 
side effect of the minifying process. You might also think about what this means in terms of HTTPS. Using 
HTTPS means the data is encrypted over the network, but by the time it gets to the part of the browser we 
interact with, it's been decrypted.

Sometimes, for this type of thing, we get lucky, and the website makes a request that contains the 
location of the music file. If this is the case, then we can just download it ourselves and be on our way. 
So, let's take a look at what the page is doing when it plays a song:

<img class="more-width-70" src="/img/ipod/yt-music-interface-network-tab.jpg" alt="YouTube music interface 
with the network tab open">

Hmm. That's a lot of network requests. Let's go through some of them: 

#### Videoplayback
We actually do see a `videoplayback` request to some subdomain of `googlevideo.com`! The query parameters 
show a `mime` type of `audio/mp4`, so it looks like an audio stream. However, I couldn't immediately 
figure out how to do anything with it, so I moved on. It's possible that we could use these links to 
stream the content to a file, but I leave this as an exercise to the reader.

#### Thumbnail Images
It looks like a lot of requests are for upcoming song thumbnail images. They go to the `lh3.
googleusercontent.com` domain, which I know also stores Google Photos images. We could potentially use 
this to get album art automatically, so we'll keep that in mind. Most of them are too small to really use 
as album art, at 60x60 pixels. The big higher-resolution album art that displays on the page is also sent 
in this bunch of image requests, so keep that in mind too. 

If you look closely, you can see that there are two requests that are almost exactly the same, starting 
with `6zO9jC5`. These are for the currently playing album art. One of them is the bigger one that displays 
prominently on the page, and the other is for the small thumbnail image. Interestingly, you can actually 
get whatever size images you want from the `lh3.googleusercontent.com` domain by modifying the url. In 
fact, these are the same request, but one of them has this sort-of not-really makeshift query parameter type 
thing on it that tells the server to scale it down to 60x60. Honestly I'm not sure why they didn't use a 
real-boy query parameter for size info. Better for caching? 🤷‍♂️

#### Watchtime
There's also a `watchtime` query to `youtube.com/api/stats/watchtime`. Seeing the `youtube.com` domain 
here is interesting, as it sort of confirms that YouTube Music is using regular old YouTube for a lot of its 
backend legwork. For this request, we've got a lot of seemingly meaningless query parameters (see image).

<img style="float: right; margin-left: 10px; margin-bottom: 10px;"
src="/img/ipod/yt-music-watch-query-parameters.jpg" alt="YouTube music query parameters for
the watchtime query">

This is just a small subset of them. However, they're only *seemingly* meaningless. As in, they do, in 
fact, have meaning. In particular, the `docid` parameter stands out to me. What if that's an ID for a 
YouTube video? If playing a song from YouTube Music triggers a request that contains a video ID, then we 
could automatically intercept the request and download the video at that ID. So, is that the case? Let's 
plug in that video ID to YouTube and see:
[https://www.youtube.com/watch?v=FW8U0blsesA](https://www.youtube.com/watch?v=FW8U0blsesA)

It's a real video! But, not the one for the song we just started playing. It's actually the previous 
song, the one that just ended! The endpoint is called `watchtime`, so it must be recording our watch 
time (or, rather, listen time) of the previous song. This request isn't *quite* what we're looking for, but 
we've gained valuable insight into the way that the site works. If we needed to, we could still use this 
to grab video IDs, but let's keep looking for something more convenient.

#### Player / Next
We also see a `player` request to `music.youtube.com/youtubei/v1/player`, as well as a `next` request to
`music.youtube.com/youtubei/v1/next`. The query parameters are uninteresting, containing only a `key`, but
these are POST requests instead of GET requests. This means they probably have a request body with some more 
content. Sure enough, there's some good info in there!

![youtube music request bodies for the player and next queries](/img/ipod/yt-music-player-and-next.jpg)

Both request bodies have the attributes `videoId` and `playlistId`. Checking the video at
[https://www. youtube.com/watch?v=G3XdVEDBXJI](https://www.youtube.com/watch?v=G3XdVEDBXJI), It looks like 
the `videoId` is the video ID of the song that just started playing! Woot! That's exactly what we're
looking for!

Now, we can follow through with our plan to download the song that just started playing. The first step in
this plan is to automatically detect the `player` or `next` queries. I'll use the `next` query, since I found
the `player` one to sometimes track the previous song.

I've mentioned a few times that we can intercept queries and read information on the page, but I haven't 
specified how. The answer, simply, is Chrome Extensions. In what I assume is an effort to increase 
adoption of chrome, Google built a system to extend chrome's functionality however you want. The Chrome 
Extension APIs provide access to tons of features, from CPU info to desktop capture. We can use a Chrome
Extension to intercept and read the request body of the `next` query.

However, I want to quickly discuss how we'll get the metadata for the song, since that's a big requirement
for the project.

## Reverse Engineering: Metadata

Obviously, the metadata for each playing song is somehow sent to your browser and displayed on the page.
So, it should be possible to grab it and use it for our own purposes. We can use the video ID query as a 
trigger, and then grab the metadata from the page. I'll go into the code for this later, but it's fairly 
trivial using some CSS selectors inside a content script. Background scripts don't have DOM access, but 
content scripts do.

I commented earlier that we could get the album art from a network request. While this is true, it's more 
difficult than simply grabbing the link off the page. We would need to match up the request for the video 
ID and the request for the artwork. Maybe you could track it by time, and have logic that pairs artwork 
with videoids that are requested within a second of each other. You would also need to filter out the tiny 
thumbnail images, which would be annoying. In my opinion, doing it that way introduces unnecessary 
complexity. As they say, the best code is no code.

Getting the mp3 data was the harder part, and we got very lucky that we have access to the video ID in a 
few different places. Similarly, it's "easy" from a code perspective to download an mp3 if you have the 
YouTube link for it. Again, I'll go into the code for this later on.

## Building: Video ID Capture

#### Extension Setup
Before we do anything, we need to set up our chrome extension. The step is to define a manifest. This 
tells chrome about our extension.

```json
// manifest.json
{
  "name": "YT Music Helper",
  "description": "do stuff with yt music",
  "version": "1.0",
  "manifest_version": 2,
  "permissions": [
    "tabs",
    "webRequest",
    "*://music.youtube.com/*",
    "http://localhost:30500/*"
  ],
  "content_scripts": [
    {
      "matches": ["*://music.youtube.com/*"],
      "js": ["app/content-script.js"]
    }
  ],
  "background": {
    "scripts": ["app/background.js"]
  }
}
```

We request the `tabs` permission, which is needed to pass messages from the background script to the content 
script on the page. We'll also need the `webRequest` permission to intercept network requests, and 
we'll need permissions for localhost and the YouTube Music page.

Next, we register the content script onto the YouTube Music page, and register our background script. Now, 
we can finally start writing code. 🙂

#### Network Requests
The first order of business is intercepting that network request that contains the `videoId` we want. We 
add a listener that responds to the `next` query, and define an immediately invoked `async` function that 
will execute the rest of the extension's code. We use an immediately invoked `async` function because we 
need to `await` some results... more on that later.

We also want access to the request body, since that's where the video ID is. Chrome won't give it to us 
by default, so we add the string `requestBody` to the options array of 
`addListener()` to get it. The code for doing that looks like this:

```javascript
// background.js
chrome.webRequest.onBeforeRequest.addListener(({ requestBody }) => {
  (async () => {
    const videoId = parseRequestBodyToObject(requestBody).videoId;
    await sleep(300);
    const metadata = { ...await getCurrentSongMetadataFromDom(), id: videoId };
    sendSongInfoHome(metadata);
  })();
}, { urls: ['*://music.youtube.com/youtubei/v1/next?key=*'] }, ['requestBody']);
```

So now we have the request body, but it's sort of in a weird format, and we want it as a plain old 
javascript object that we can read the `videoId` from. That's what the mess inside 
`parseRequestBodyToObject` is doing here:

```javascript
// background.js
const parseRequestBodyToObject = requestBody => 
        JSON.parse(decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(requestBody.raw[0].bytes))));
```

Now that we have the video ID, let's go back to the immediately invoked `async` function. As I talked about, 
the reason that we invoke an `async` function is that we want to use the `await` keyword, which is only 
doable in an `async` function. The `await` keyword allows us to wait until a promise resolves before 
continuing execution. We could do that anyway with `.then()` chaining, but this avoids the need to return 
new promises every step of the way - the `async` function does that for us.

This ability to execute asynchronous code, and then collapse it to synchronous when you need to, is one of 
javascript's strong points. Executing code like this is actually really efficient, thanks to the [js event 
loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop). 

Note that right now, we are not handling the case where any of these promises reject. To do this, we would 
wrap them in `try`/`catch` blocks and handle the exception. You might want this if your code needs to be 
reliable. Personally, I don't really care.

Looking back at the listener, the next thing we do is sleep for 300ms. Sleeping gives time for the 
metadata content to load onto the page, in case the `next` request was sent before the content loaded. I 
use a function here called `sleep()`. This isn't built in, I usually need to define this in my javascript 
projects. It's an easy one-liner, which you can use to wait however long you need:

```javascript
const sleep = ms => new Promise(r => setTimeout(r, ms));
```

This returns a promise that resolves after `ms` milliseconds, which you can either `await` or chain 
`.then()` to.

After sleeping, we wait for the results from `getCurrentSongMetadataFromDom()`, add the video id to it, 
and send all this info "home". I'll talk about where we send this, and why, later on. But, first:

## Building: Metadata Capture

#### Background Script
It's time to get the metadata from the DOM! This is one of my favorite parts. Our background script 
doesn't have access to any pages, so we send a message from the background script to the first YouTube 
Music tab open:

```javascript
// background.js
const getCurrentSongMetadataFromDom = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ url: '*://music.youtube.com/*' }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'song_metadata_request' }, response => {
        if (response) resolve(response); else reject();
      });
    });
  });
}
```

`chrome.tabs.query()` will give us a list of tabs that match the url scheme. We pick the first one, and 
then send it the message `{ action: 'song_metadata_request' }`. When we get a response, we resolve a 
promise. Using the Promise constructor like this lets us `await` the response to the message, instead of 
diving even deeper into callback hell. I wish the chrome apis supported promises - as it is, we need to 
wrap our api requests in promise constructors. Oh well, can't have everything.

#### Content Script
In the content script, we listen for a message from the background script:

```javascript
// content-script.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.hasOwnProperty('action') && request.action === 'song_metadata_request') {
    sendResponse(getSongMetadataFromDom());
  } else {
    sendResponse('unknown action');
  }
});
```

If it has the `song_metadata_request` action, then we run `getSongMetadataFromDom()`:

```javascript
// content-script.js
const getSongMetadataFromDom = () => {
  const title = document.querySelector(titleSelector).innerText;
  const artworkUrl = document.querySelector(artworkUrlSelector).src;

  const moreMetadataElements = document.querySelector(moreMetadataSelector);
  const metadataSplit = moreMetadataElements.title.split(' • ');
  const artist = metadataSplit[0], album = metadataSplit[1], date = metadataSplit[2];

  return { title, artist, album, date, artworkUrl };
}
```

We use the `document.querySelector()` call to get the elements on the page using their CSS selectors, and 
then pull information out of them as we need it. The `moreMetadataElements` element is actually a [custom 
html element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) (you don't
see those every day) called `yt-formatted-string`. This has a property called `title` which is split by
the "•" character. We separate that out to get the artist, album, and date, before putting everything 
together and sending it as a response to the message.

I used these selectors to grab the elements:

```javascript
// content-script.js
const titleSelector = '.title.style-scope.ytmusic-player-bar';
const artworkUrlSelector = 'div#song-image > yt-img-shadow#thumbnail > img#img';
const moreMetadataSelector = 'yt-formatted-string.byline.style-scope.ytmusic-player-bar.complex-string';
```

You can devise these yourself using good ol' inspect element and a
[CSS selector reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). These might 
change if the YouTube Music devs change the page layout, so be prepared to adjust them if they don't 
appear to be working. You can test if your selectors are working by using the browser console. That whole 
`getSongMetadataFromDom()` function (and the selectors) can be copy-pasted into the console and run. If it 
works, it'll give you a js object with all the fields filled out correctly. If it doesn't work, you'll get 
an exception.

## Building: Back End

Alright, cool! Now we've got all our info, and we just need to download the video to our computer. 
Just, like, draw the rest of the owl, right? Unfortunately, as cool as chrome extensions are, I don't 
think you can use them to arbitrarily create files and run code on the host computer. That's sort of a 
huge, giant, colossal security risk. Chrome Apps could apparently do this, but they've been deprecated. So 
we'll need a back end that communicates with chrome and does the actual video downloading and metadata
application.

Chrome extensions *do* have the ability to download files, but that doesn't really help us here. We have a 
video ID, not a link to a complete mp3. Even if we did have a link to an mp3 file, we can't apply metadata 
to it since we still don't have filesystem access. We *could* use the downloads api to download the 
artwork, but I chose to do the downloading on the back end instead, where we can choose exactly where to 
put the file.

This back end that we need to make... is probably the most complicated part. We have the YouTube video ID, 
and a bunch of metadata, but how do we turn that into an mp3 file? Our saving grace is that these are already
relatively solved problems. As a result, some libraries and external tools exist to help us on our journey.
The most important tools we'll use are [yt-dlp](https://github.com/yt-dlp/yt-dlp) and
[ffmetadata](https://www.npmjs.com/package/ffmetadata). yt-dlp is a fork of the more well known youtube-dl,
since youtube-dl is no longer maintained. It's used to download videos or songs from YouTube. ffmetadata 
is used to add metadata to songs.

#### Front End -> Back End Communication
The first hurdle to jump over is the communication between the front end, and the back end. Some Google 
searches reveal the [chrome native messaging api](https://developer.chrome.com/docs/apps/nativeMessaging/),
which you can use to exchange messages with native applications. This seems interesting, but I looked at 
it, and I was like, 'that's a lot of work'. The setup is different depending on platform - for Windows, 
you need to have an installer that adds registry keys to a predefined location. The example repository 
has like ten files just for a proof of concept. Gross.

I moved on to thinking about the possible outlets that a chrome extension has. As discussed, The native 
messaging api is right out. It looks like we've got the
[google cloud messaging service](https://developer.chrome.com/docs/extensions/reference/gcm/). This 
doesn't really help us much. I guess we could host our back end in the cloud, and then get the downloaded mp3 
files through hosting a ftp server. I'm not really in the mood to set up a GCP app and then pay for it, 
and there's not much point. I don't need any uptime, it only runs once in a while when I need to download 
some mp3s.

That seems to be it from the chrome apis perspective. I guess, we're in a web browser, right? So we could 
just use the network, and a simple REST api that will communicate over localhost. Yeah, I like that. You 
could even run the server on a separate computer if you wanted the mp3s to go to a media server or something.
[Express](https://expressjs.com/) is nice and easy to set up, and we can use node apis to do whatever we 
want on the host computer.

#### Finishing The Front End
Let's go back and define that `sendSongInfoHome` function we used earlier. It's a simple fetch request, and 
it looks like this:

```javascript
// background.js
const sendSongInfoHome = metadata => {
  return fetch('http://localhost:30500/', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json'},
    body: JSON.stringify(metadata)
  });
}
```

That should be the only missing piece, now our chrome extension is done!

#### Server Side: server.js

Welcome to the back end, baby! This code will run on the host computer. You could program the back end in 
any language, but we'll use javascript ([node.js](https://nodejs.org/en/)), because I like javascript. 

In a new js file, we define some basic Express code that listens for a POST request at root: 

```javascript
// server.js
const express = require('express');
const { sleep, downloadSong, downloadArtwork, applyMetadata } = require('./downloader');
const port = 30500;
const app = express();

app.use(express.json());
const downloadQueue = [];

app.post('/',(req, res) => {
  downloadQueue.push(req.body);
  console.log(`added queue item: ${req.body.artist} - ${req.body.title}. New queue size:`, downloadQueue.length);
  res.send('got it');
});

app.listen(port, () => console.log(`app listening at http://localhost:${port}`));

```

Each POST request contains the information from one song. When we receive the request, we add the body to a download
queue. I chose to use a download queue here to make sure we are only downloading one song at a time. You
could conceivably have multiple downloads running at once, but I didn't set up the code that way.

So far, the extension gathers song metadata and submits it in a POST request to our back end, which adds 
the info to a download queue. The next step is to read that download queue and execute the downloads:

```javascript
// server.js
const run = async () => {
  while (true) {
    if (downloadQueue.length > 0) {
      await downloadSongFromQueue();
    }
    await sleep(5000);
  }
};

run().then(() => console.log('done?')).catch(e => console.log(e));
```

This is the 'main loop' of our program. If there are entries in the queue download,
[do it](https://www.youtube.com/watch?v=BkIJsnLBA4c). The `await` here is they key that makes sure we do the 
downloads one at a time, instead of as soon as a new song enters the queue. We never really want to stop 
checking the queue, so we use a while true loop. After downloading a song, we chill for a few seconds to 
avoid overwhelming YouTube. We probably don't need to do this, but I would rather not take any chances.

At the bottom of this snippet is the code that is run when you execute the file. It starts the main loop. 
However, since `run()` returns a promise, we should do something with it. This promise should never settle,
but just in case it does, we handle the resolve case in `.then()` and the reject case in `.catch()`.

Now, we need to define the code for actually downloading a song from the queue:

```javascript
// server.js
const downloadSongFromQueue = async () => {
  const songItem = downloadQueue[0];
  try {
    await downloadArtwork(songItem);
    const filename = await downloadSong(songItem);
    await applyMetadata(filename, songItem);
    console.log(`finished download for '${songItem.artist} - ${songItem.title}'. New queue size:`, downloadQueue.length);
  } catch (e) {
    console.error(`encountered an error for '${songItem.artist} - ${songItem.title}': `, e);
    await sleep(30000);
  } finally {
    downloadQueue.shift();
  }
}
```

This function isn't terribly interesting. It calls three `async` functions for downloading the artwork, 
downloading the song, and applying the metadata. It has some error handling. `async`/`await` is great, but 
you lose the nicer error handling of promise call chaining to the ugliness of `try`/`catch`. It's 
possible to write some middleware to handle those errors, but I didn't bother.

Often, I found that the errors encountered were 403 errors from YouTube. This means that our 
access to the resource is "Forbidden". My theory is that they detected that this was a video download, 
and sent this response as, like, an
"[ah, please do not do that](https://www.youtube.com/watch?v=RfiQYRn7fBg)" response. In this case, we 
don't want to be too bothersome, so we wait 30 seconds before trying again. I also remove the download 
from the queue anyway, just in case there was something wrong with that video specifically that means it 
couldn't be downloaded. A more complete system would identify exactly what went wrong and take different 
actions. Network error? Retry the same download. Private video? skip it and print out an error message. 
That sort of thing.

It's actually really important that the `downloadArtwork`, `downloadSong`, and `applyMetadata` calls 
return promises and are asynchronous. If these operations (particularly the downloading, which can take 
some time) ran synchronously, they would block the entire program execution while they ran. This means that 
our web server would be unable to process incoming requests, which could cause it to miss some songs.

#### Server Side: downloader.js
It's dangerous to go alone, take these imports:

```javascript
// downloader.js
const fs = require('fs');
const ffmetadata = require("ffmetadata");

const { pipeline } = require('stream');
const { promisify } = require('util');
const fetch = require('node-fetch');

const exec = promisify(require("child_process").exec);
const streamPipeline = promisify(pipeline);
```

We're using a lot of libraries here, mostly because it's impractical to do these things yourself. 
Except `promisify`; we could use the `new Promise()` constructor, as we did with the 
chrome apis for the front end, instead of using `promisify`. `fs` is built in to node,
it's how to access the filesystem. We use it to read a directory, rename a file, that sort of thing. 
`util`, `stream`, and `child_process` are also built in to node, we grab some functions from those.
`ffmetadata` and `node-fetch` are external dependencies, which need to be installed with `npm`. You need
[ffmpeg](http://www.ffmpeg.org/) for `ffmetadata` to work, but you need it for yt-dlp anyway. 

On that note, make sure to download and add yt-dlp to your PATH, if you didn't already. We'll need it for 
the next snippet, where we download the song: 

```javascript
// downloader.js
const downloadSong = async ({ id }) => {
  await exec(`yt-dlp -x --audio-format mp3 -o "./new_songs/temp/%(channel)s-%(title)s.%(ext)s" https://www.youtube.com/watch?v=${id}`);
  return fs.readdirSync('./new_songs/temp/')[0];
}
```

With yt-dlp, this is a simple system call. The video is downloaded to a temp folder, and converted to mp3. 
The source is usually a webm by default, which is useless to an ipod. By downloading the video to a temp 
folder, the system knows which file to apply the metadata to - it's the one in the temp folder. We'll move 
it out of the temp folder when we're done applying metadata to it.

When constructing system calls from user input (like we're doing here), make sure you've sanitised it. I
skipped that step here, because this is running on localhost and I trust the input. However, exposing this
code without sanitizing the `id` field could lead to arbitrary code execution by an attacker. Don't do it.
Friends don't let friends introduce major security vulnerabilities into their applications.

You might notice that the yt-dlp will name the file based on the channel and the title. Wait, hold on. If 
yt-dlp knows about the video metadata, why can't it just add it for us? Why do we need to do all the work 
to grab it from the YouTube Music page? In fact, yt-dlp *can* enrich the file with title and artist metadata 
like this. However, it doesn't always work as desired, and it's not a complete solution. There's no 
guarantee that the video title is the name of the song, and there's no guarantee that the channel name is 
the name of the artist. Additionally, there's no reliable way of getting the album name from yt-dlp. You 
can sometimes find it in the video description, but not always in the same place. You might remember 
that having correct metadata was a big requirement for me for this project, so I decided that this was not 
a viable solution.

Similarly, it's an option to take the thumbnail from the video and apply it as album artwork. Again, it's 
much easier and more reliable to get the artwork with the url we got from the page, like this:

```javascript
// downloader.js
const downloadArtwork = async ({ artworkUrl, id }) => {
  const response = await fetch(artworkUrl);
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(response.body, fs.createWriteStream(`./new_songs/artwork/${id}.jpg`));
}
```

Node doesn't have `fetch` built in, that's a
[browser thing](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). We get it back with 
`node-fetch`, which we use in order to download the artwork. You could use `axios` for this. A common 
solution used to be using the `request` library, but that's deprecated now. Anyway, we use `pipeline` to 
stream the data to a jpg file.

Now we have the mp3 file, we have the metadata, and we have the artwork. All we need to do is apply it, 
and we can retire to a life of sweet, sweet complete music files. `ffmetadata`, it's your time to shine:

```javascript
// downloader.js
const applyMetadata = async (filename, entry) => {
  const { artist, title, date, album, id } = entry;
  return new Promise((resolve, reject) => {
    ffmetadata.write(
      `./new_songs/temp/${filename}`,
      { artist, title, album, date },
      { 'id3v1': true, 'id3v2.3': true, attachments: [`./new_songs/artwork/${id}.jpg`] },
      (err) => {
        fs.renameSync(`./new_songs/temp/${filename}`, `./new_songs/${artist} - ${title}.mp3`);
        if (err) reject(err); else resolve();
      }
    );
  });
}
```

Boom! We turn the callback-based `ffmetadata.write()` call into a promise (because you know how I feel 
about those), giving it the filename to write to, the metadata, and some options. In the options, we give 
it the artwork as an attachment. We also set the `id3v2.3` and `id3v1` options to true, which is needed 
for compatibility with Windows Explorer. When the data write is done, we move the file out of the temp 
directory, and the file is ready.

## Limitations / Future Work

Probably the biggest limitation with this system is fragility. If the YouTube Music developers decide to 
change the page structure, we would need to update our Chrome Extension. We will likely need to update 
yt-dlp over time, as well. The biggest risk to the project's continued success is if YouTube Music changes 
to no longer use YouTube as a back-end. In that case, there won't be video ids associated with songs 
anymore, and we won't be able to easily download them with yt-dlp. I think this has a low probability of 
happening. With Google's reputation, it's more likely that they simply kill YouTube Music and make 
something else than overhaul the entire app. If they do re-architect it, then we'll need to  go back to 
the drawing board with how to get the audio. Look at network requests again, the works. If nothing else, 
it'll be a good excuse for another blog post.

A usability limitation with our system is that you can only download songs by first adding them to a 
YouTube Music playlist. This is not a big deal to me, because I want those playlists in YouTube Music anyway. 
Being able to get the songs they contain as mp3 files is exactly the use case that I want.

Another big limitation with this system is that you need to play every song in the playlist one by one
in order to download them. This isn't really a big deal to me either. You don't need to spend any time
actually listening to the song, you can immediately skip to the next one as soon as the metadata loads. If 
it takes you two seconds per song, then you can download a hundred-song playlist in just a few minutes. 
You could mediate this limitation by just letting the songs play while afk, or by setting up an 
auto-clicker to click the skip button every few seconds. It's presumably possible to use some browser 
automation tool like
[mechanicalsoup](https://mechanicalsoup.readthedocs.io/en/stable/) or
[zombie.js](https://zombie.js.org/) to go through every song, but this is almost certainly 
not worth the effort. Even I need to draw the line somewhere.

It's also probably possible to close the loop by programmatically clicking the skip button. However, I 
don't like this approach, because it doesn't give you the ability to easily stop the extension if 
something goes wrong. You could always disable it, but in the time it took to do that you've added ten 
faulty entries to the download queue.

The setup is sort of a limitation of this system. You need a Chrome Extension and then a back end that 
downloads the songs. Then again, the person using this system is me, and I've already set it up, so the 
total setup time for other people is precisely zero. Zero people multiplied by any amount of setup time is 
still zero. Sounds right to me.

---

Uh, let me know if you have any questions, or if you want to hire me. You can email me at
[brad.boxer1@gmail.com](mailto:brad.boxer1@gmail.com).