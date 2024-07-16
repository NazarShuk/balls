# Balls dex identifier
Uses image hashing to find country balls in the Balls Dex discord bot.
Images are downloaded from the identification slide show. It uses the Google app script script, to get all the images and their names.

**Note: this app was only made for demonstration purposes. Please do not use this app to cheat, as it is against BallsDex terms of service.**
## Usage
To run it locally, first, clone the repository, and in the terminal run `npm install` and then `npm run dev`. After that, open `localhost:5173` in your browser.

Or you can go to `https://balls-lake.vercel.app`. It is hosted by me :)

## Appscript script
```javascript

const presentation = SlidesApp.openById("1OxK2Hfwm2RBNBzrKfny3NWDz37Ukq2UmQYoXdKl6j50")

function doGet() {
  let jsonOutput = []

  presentation.getSlides().forEach((slide, index) => {

    Logger.log(index)

    if (slide.getImages().length > 0) {
      jsonOutput.push({
        name: slide.getShapes()[0].getText().asString(),
        image: slide.getImages()[0].getContentUrl()
      })
    }
  })

  let out = JSON.stringify(jsonOutput)

  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}
```
If you send a get request to `https://script.google.com/macros/s/AKfycbxZIivOMO5f4PcFtnRU6tztU_v2Ar0fTx3G9p1lb0XbDUJfJjuvRjwMKacH6tnFXlW4Sg/exec` you will get a JSON object, that looks something like this:
```
[
  {
    "name": "Achaemenid Empire\n",
    "image": "https://lh7-us.googleusercontent.com/slidesz/AGV_vUeS4yATnGi68ttiGIQAdSApLEckWnrrx04pdiPznw8fdV9K97_8S_2wULPPeVuF1i5kijQR1m69GqIlwI7Rqlh2iB2py6HrXiOohjDs_lZjLpvus6176ROB-iXRNOfDkWvG9JoaxCFal5mjqTJqBxMgRZBr=s2048?key=3RJr88EUW4bylH97wrnxiA"
  },
  {
    "name": "African Union\n",
    "image": "https://lh7-us.googleusercontent.com/slidesz/AGV_vUfFYIs6MhhXZaZv3lyWi6fCgkXzpwL-psae-yluZC7BpCvf4S4m1_vY5RtznNbm-5cOE_qTc1SCsiAPtnEictYg9X1wan0tr2QcVODrPZJYEDsdINhM4YniQXuBjGmTGrGdLleuB6_O9ZZaKUQ-9Jwp6Nw4Eg=s2048?key=3RJr88EUW4bylH97wrnxiA"
  },
  {
    "name": "Ancient Athens\n",
    "image": "https://lh7-us.googleusercontent.com/slidesz/AGV_vUfVrb3Nbb7m8_Xv2OoO_mf8rNhcK8BBOLhHJ7PYifrxEOK8k69p7GKNv6tP0sxTi3EFH67sj0bBmRWvaH35zzZbLxV63HVF5pgpINcTG44SPvEwbhEy3u3rvLViz3mXewdjdOMeft5rMjMuyrqcn2pHxRF_5w=s2048?key=3RJr88EUW4bylH97wrnxiA"
  },
...
]
```
Note: it takes around 30 seconds or more to get a response.
## Contributing
My code has no comments or explanations on what's happening, but if you want to, you can do pull requests, I will try to review them.
