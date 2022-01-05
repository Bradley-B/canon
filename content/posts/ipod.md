---
title: iPod Nano
publishDate: 2022-01-04
lastModifiedDate: 2022-01-04
isPublished: false
---

Everyone's got a junk drawer. Somewhere to dump your miscellaneous things at the end of the day when you don't
want to deal with them. Maybe it's right at the entrance to your home, or maybe you hide it shamefully in a
box under your bed. Since I was a kid, I had a junk nightstand at my parent's house. It wasn't meant to be
a junk nightstand. It was meant to be a normal nightstand. I just put junk in it.

Since, like, kindergarten, I put random stuff into it. Mail that should have gone into the trash. Birthday
cards. Baseball cards from my dad. A pack of gum. A paper mache face mask I made in first grade art class.
Cases to DS cartridges long since lost or sold. Tickets to attended sports games. Change. A kazoo. Before 
long, stuff like this filled the drawers. And then, I never cleaned it out. For like 10 years, I just left 
it in there, occasionally adding some new junk. I left, went to college, and it sat untouched. Random 
childhood memories, contained and undisturbed, like a time capsule. Until yesterday, when I went in with a 
trash bag and threw (almost) all of it out.

It was interesting to look through. I love getting data about myself, and physical trash is, really, more 
data. In the same way historians learn about ancient societies by their trash, I can learn about my past 
self. But, at some point, it just needs to go to the landfill. It would be nice to reclaim that nightstand 
for actual use.

Along my adventures through childhood rubble, I came across my old 7th gen ipod nano - the last nano Apple 
ever made. Previously, I considered this piece of tech long-lost to the sands of time. I had actually spent 
some time looking for it, but was unsuccessful. You see, it contains information about my music
preferences from 2014-2015, before I got my first smartphone and started using streaming services. 
Additionally, I planned to really use it. It holds up remarkably well to this day - enough to daily 
drive if you need a small and light mp3 player. It has bluetooth, and my recent earbuds and headphones 
connect and play music without much fuss, save for a few volume quirks.

Unfortunately, it doesn't have an internet connection. This means that you need to plug it into a computer
and drag-and-drop mp3 files on it like they did in caveman times. I see this as both a drawback and a 
benefit. It's inconvenient to put music on it, sure, but once the music is there, it's not going anywhere
unless you remove it (obviously flash storage degrades, but that can be mitigated). You aren't bound to an 
app, or a third-party service. Mp3 players are a timeless, cohesive package. Doing one thing and doing it 
well. That's an attractive quality.

With this in mind, I set out to make it easier to get mp3 files to put on the ipod.

*~~~ the rest of this post is a technical discussion about that process. If that sort of thing
        isn't up your alley, this is a good spot to stop reading ~~~*

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

It's possible that the data is encoded in some strange format during 
the transfer, making it very difficult for us to interpret. In my experience, developers rarely bother 
with this as there isn't really a point. It needs to be plaintext at some point in order to be displayed.
Using HTTPS means the data is encrypted over the network, but by the time it gets to the part of the 
browser we interact with, it's been decrypted.

Sometimes, for this type of thing, we get lucky, and the website makes a request that contains the 
location of the music file. If this is the case, then we can just download it ourselves and be on our way. 
So, let's take a look at what the page is doing when it plays a song:

<img class="more-width-70" src="/img/ipod/yt-music-interface-network-tab.jpg" alt="YouTube music interface 
with the network tab open">

Hmm. That's a lot of network requests. Let's go through some of them: 

#### Videoplayback
We actually do see a `videoplayback` request to some subdomain of `googlevideo.com`. The query parameters 
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
real-boy query parameter for size info. 🤷‍♂️

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
Before we do anything, we need to set up our chrome extension. The first thing we need is a manifest. This 
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
    "*://music.youtube.com/*"
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
we'll need permissions for the YouTube Music page.

Next, we register the content script onto the YouTube Music page, and register our background script. Now, 
we can finally start writing code. 🙂

#### Network Requests
The first order of business is intercepting that network request that contains the `videoId` we want. We 
add a listener that responds to the `next` query, and call a function that will gather other metadata and 
do all the other things we need. We also need access to the request body, since that's where the video ID 
is. Chrome won't give it to us by default, so we add the string `requestBody` to the options array of 
`addListener()` to get it. The code for doing that looks like this:

```javascript
// background.js
chrome.webRequest.onBeforeRequest.addListener(details => {
  parseRequestBodyToSongInfo(details.requestBody);
}, { urls: ['*://music.youtube.com/youtubei/v1/next?key=*'] }, ['requestBody']);
```

#### Request Handler 
So now we have the request body, but it's sort of in a weird format, and we want it as a plain old 
javascript object that we can read the `videoId` from. That's what the mess with `JSON.parse` and 
`decodeURIComponent` is doing here: 

```javascript
// background.js
const parseRequestBodyToSongInfo = async requestBody => {
  const requestBodyContent = JSON.parse(decodeURIComponent(String.fromCharCode.apply(null, 
      new Uint8Array(requestBody.raw[0].bytes))));

  await sleep(300);
  const metadata = await getCurrentSongMetadataFromDom();
  metadata.id = requestBodyContent.videoId;
  await sendSongInfoHome(metadata);
}
```

Now we can get the videoId, and I'm also going to run the functions to get the current song metadata and 
then send it to the host computer. I'll talk about why we need to send the info somewhere instead of just 
downloading the mp3 file later on.

Then, we sleep for 300ms. Sleeping gives time for the metadata content to load onto the page, in case the
`next` request was sent before the content loaded. I use a function here called `sleep()`. This isn't built 
in, I usually need to define this in my javascript projects. It's an easy one-liner, which you can use to 
wait however long you need:

```javascript
const sleep = ms => new Promise(r => setTimeout(r, ms));
```

This returns a promise that resolves after `ms` milliseconds, which you can either `await` or chain 
`.then()` to.


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
then pull information out of them as we need it. The `moreMetadataElements` element is [actually a custom 
html element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) (you don't
see those every day) called `yt-formatted-string`. This has a property called `title` which is split by
the "•" character. We separate that out to get the artist, album, and date, before putting everything 
together and sending it as a response to the message.

I use these selectors to grab the elements:

```javascript
// content-script.js
const titleSelector = '.title.style-scope.ytmusic-player-bar';
const artworkUrlSelector = 'div#song-image > yt-img-shadow#thumbnail > img#img';
const moreMetadataSelector = 'yt-formatted-string.byline.style-scope.ytmusic-player-bar.complex-string';
```

You can devise these using good ol' inspect element and a
[CSS selector reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). These might 
change if the YouTube Music devs change the page layout, so be prepared to adjust them if they don't 
appear to be working.

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
[ffmetadata](https://www.npmjs.com/package/ffmetadata).

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

#### Client Side
Let's go back and define that `sendSongInfoHome` function I used earlier. It's a simple fetch request, and 
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

## Limitations / Future Work

One big limitation with this system is that you can only download songs by first adding them to a YouTube 
Music playlist. This is not a big deal to me, because I want those playlists in YouTube Music anyway. 
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

The setup is sort of a limitation of this system. You need a Chrome Extension and then a back end that 
downloads the songs. Then again, the person using this system is me, and I've already set it up, so the 
total setup time for other people is precisely zero. Zero people multiplied by any amount of setup time is 
still zero. Sounds right to me.

---

Uh, let me know if you have any questions, or if you want to hire me. You can email me at
[brad.boxer1@gmail.com](mailto:brad.boxer1@gmail.com).