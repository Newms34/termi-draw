# Console Drawing Program

##About:

Remember those really old-school drawing programs like KidPix1? This is even more old school. It's drawing! In the console!


##Examples:

###Coming soon!

##Instructions:
 1. `cd` into the folder where you've downloaded this repo, and run `node index.js`.
 2. Try running `node index.js true` if you're on OSX, and you'll get full-color mode!

##Issues:
 1. The full-color mode only works on OSX (POSIX?) systems. Windows command prompt only supports low-color mode. Attempting to draw in 256 or 16m color mode in Windows will just default to low-color mode. 
 2. I'm aware the refresh rate deal is rather annoying. I'm trying to look into ways to fix this.
 3. Eventually, you will be able to save the images in some format. As to whether they'll be actually saved as *images*, per se, is another question.

##Credits:
 - Written by me, [David Newman](https://github.com/Newms34).
 - Color stuff provided by the awesome peeps who made the [chalk](https://github.com/chalk/chalk) and [ansi-styles](https://github.com/chalk/ansi-styles/) modules.
