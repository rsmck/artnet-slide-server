# artnet-slide-server

NB This is another 'works for my own use, might help someone else' type projects. It is *NOT* intended for use in a show-critical environment and hasn't been extensively tested. 

### Why?

I voluntarily help manage a small theatre which often uses projected backdrops. We don't have the budget for a proper media server like a hippo, but also don't need any of the functionality of it. All that is required is the ability to change static slides but, ideally, in sync with lighting changes (so that the stage doesn't go dark before the projection or vice versa) 

### How does it work? 

This is a very simple NodeJS script that listens for Art-Net data and uses it to control an (equally simple) web page which we display full screen on a kiosk-mode web browser (we use a Raspberry Pi for this, but anything with an HDMI output will do!), the images displayed and the intensity can then be controlled over Art-Net just like any lighting fixture. 

### Using It...

Place the slide images you want to use in the `images/` directory, named `image_XX.png` where XX is from 00-25. I recommend you keep `image_00.png` as a plain black PNG image.

Start from source with `node media_server.js`, by default it will listen on Art-Net Universe 0 on port 6454 and start a web server on `http://localhost:7600` (changing these is self-explanatory in the code) 

Access the `http://localhost:7600` service from any web browser (ideally a full-screen kiosk browser)

At present this verison uses three channels (a future version will add some effects in other channels) as follows;

| Channel | Description | DMX Values | Feature |
| ----------- | ----------- | ----------- | ----------- |
| 1 | Intensity Dimmer (0-100%) | 0-255 | Intensity from 0-100% |
| 2 | Image Selection | 0-255 | 0-4 | OFF |
||| 5-14 | image_01.png |
||| 15-14 | image_02.png |
||| 20-14 | image_03.png |
||| 25-14 | image_04.png |
||| 35-14 | image_05.png |
||| 45-14 | image_06.png |
||| ..... | image_XX.png |
||| 225-234 | image_23.png |
||| 235-244 | image_24.png |
||| 244-254 | image_25.png |
| 3 | Control Channel | 126-128 | Reload the Web Browser |



