
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

There are two versions in this repository, `media_server.js` is a simple three channel version that uses simple HTML/CSS, `media_server_extended.js` is a new (early alpha) version that uses 20 channels and provides keystoning and some image manipulation using the excellent glfx.js [https://github.com/evanw/glfx.js/] by @evanw

At present this simple version uses three channels as follows;

| Channel | Description | DMX Values | Feature |
| ----------- | ----------- | ----------- | ----------- |
| 1 | Intensity Dimmer (0-100%) | 0-255 | Intensity from 0-100% |
| 2 | Image Selection | 0-4 | image_00.png |
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

The extended version uses the following channels;

| Channel | Description | DMX Values | Feature |
| ----------- | ----------- | ----------- | ----------- |
| 1 | Intensity Dimmer (0-100%) | 0-255 | Intensity from 0-100% |
| 2 | Image Selection | 0-255 | As Above |
| 3 | Vibrance | 0-5 | No Effect |
||| 6-126 | -1 to 0 |
||| 127 | No Effect |
||| 128-255 | 0 to +1 |
| 4 | Contrast | 0-5 | No Effect |
||| 6-126 | -1 to 0 |
||| 127 | No Effect |
||| 128-255 | 0 to +1 |
| 5 | Hue | 0-5 | No Effect (0) |
||| 6-126 | -180 to 0 |
||| 127 | No Effect (0) |
||| 128-255 | 0 to +180 |
| 6 | Saturation | 0-5 | No Effect (0) |
||| 6-126 | Desaturate -1 to 0 |
||| 127 | No Effect (0) |
||| 128-255 | Increase Saturation 0 to 1 |
| 7 | Sepia Filter | 0-255 | Sepia Filter 0-100% |
| 10 | Blur (Normal) | 0-255 | Blur |
| 11 | Blur (Lens Effect) | 0-255 | Lens Blur |
| 12 | Keystone Adjustment | 0-255 | Top Left Horizontal Offset (0-960px) |
| 13 | Keystone Adjustment | 0-255 | Top Right Horizontal Offset (0-960px) |
| 14 | Keystone Adjustment | 0-255 | Bottom Left Horizontal Offset (0-960px) |
| 15 | Keystone Adjustment | 0-255 | Bottom Right Horizontal Offset (0-960px) |
| 16 | Keystone Adjustment | 0-255 | Top Left Vertical Offset (0-540px) |
| 17 | Keystone Adjustment | 0-255 | Top Right Vertical Offset (0-540px) |
| 18 | Keystone Adjustment | 0-255 | Bottom Left Vertical Offset (0-540px) |
| 19 | Keystone Adjustment | 0-255 | Bottom Right Vertical Offset (0-540px) |
| 20 | Control Channel | 126-128 | Reload the Web Browser |
