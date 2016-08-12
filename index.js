var chalk = require('chalk'),
    fullCol = require('./colStuff.js'),
    keypress = require('keypress'),
    size = [process.stdout.columns, process.stdout.rows]
running = true,
    changingCol = false,
    os = require('os'),
    tick = 0, //for tracking time
    truCol = os.platform() != 'win32' && process.argv[2],
    cursor = [0, 1],
    lowCols = ['Black', 'White', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan'],
    currColor = ['Black'], //if trueCol mode, 3 vals (RGB). Else, 1 val (col name)
    colRow = [], //the current color row
    colArr = [], //store cols here so we can redraw them @ each tick
    redrawMe = true,
    cursCol = ['Black']; //this is used so that we don't 'forget' what color the cursor is currently over.
keypress(process.stdin);
var changePos = [0];
console.log('SIZE', size, cursor)
//first, build the initial 'board';
//TEMPORARY: THIS WILL CREATE A PROBLEM
// truCol = true;
// currColor = [0, 0, 0];
//END TEMPORARY
for (var a = 0; a < size[1]; a++) {
    var aRow = [];
    for (var b = 0; b < size[0]; b++) {
        if (truCol) {
            aRow.push([0, 0, 0]);
        } else {
            aRow.push(['Black']);
        }
    }
    colArr.push(aRow);
}


process.stdin.on('keypress', function(ch, key) {
    if (key.name == 'q') {
        //quit!
        process.exit();

        //the remaining buttons (except for enter) have two 'modes'. The first mode moves the cursor. The second mode allows us to change color.
    } else if (key.name == 'up') {
        //note that if we're not in 16M color mode, the up and down keys do nothing when in color change mode
        if (!changingCol) {
            if (cursor[1] && cursor[1] > 1) {
                cursor[1]--;
            } else {
                cursor[1] = size[1] - 3;
            }
        } else if (truCol) {
            if (currColor[changePos] < 250) {
                currColor[changePos] += 5;
            } else {
                currColor[changePos] = 0;
            }
        }
        redrawMe = true;

    } else if (key.name == 'down') {
        //note that if we're not in 16M color mode, the up and down keys do nothing when in color change mode
        if (!changingCol) {
            if (cursor[1] < size[1] - 3) {
                cursor[1]++;
            } else {
                cursor[1] = 0;
            }
        } else if (truCol) {
            if (currColor[changePos] > 0) {
                currColor[changePos] -= 5;
            } else {
                currColor[changePos] = 255;
            }
        }
        redrawMe = true;
    } else if (key.name == 'left') {
        if (!changingCol) {
            if (cursor[0] && cursor[0] > 0) {
                cursor[0]--;
            } else {
                cursor[0] = size[0] - 2;
            }
        } else if (truCol) {
            //true color mode, so switching btwn r,g, and b.
            if (changePos && changePos > 0) {
                changePos--;
            } else {
                changePos = 2;
            }
        } else {
            //not true color mode! cycle btwn avail col names
            if (changePos > 0) {
                changePos--;
                currColor = [lowCols[changePos]];
            } else {
                changePos = lowCols.length - 1;
                currColor = [lowCols[changePos]];
            }
        }
        redrawMe = true;
    } else if (key.name == 'right') {

        if (!changingCol) {
            if (cursor[0] < size[0] - 1) {
                cursor[0]++;
            } else {
                cursor[0] = 0;
            }
        } else if (truCol) {
            //true color mode, so switching btwn r,g, and b.
            if (changePos < 2) {
                changePos++;
            } else {
                changePos = 0;
            }
        } else {
            //not true color mode! cycle btwn avail col names
            if (changePos < lowCols.length - 1) {
                changePos++;
                currColor = [lowCols[changePos]];
            } else {
                changePos = 0;
                currColor = [lowCols[changePos]];
            }
        }
        redrawMe = true;
    } else if (key.name == 'c') {
        //c key switches from cursor moving mode to color change mode (or vice-versa)
        changingCol = !changingCol;
        redrawMe = true;
    } else if (key.name == 'return' && !changingCol) {
        //enter key places a color!
        console.log(colArr[115], cursor[0], cursor[1], currColor)
        colArr[cursor[1]][cursor[0]] = currColor;
        redrawMe = true;
    }
})

process.stdin.setRawMode(true);
process.stdin.resume();
var t = setInterval(function() {
    tick++;
    //each tick, we need to draw the rows BEFORE the cursor row, then the cursor row, and then the rows AFTER the cursor row, and finally the UI els (the RGB box)
    var x = 0,
        y = 0; //iterators!
    //only redraw if a key's been pressed!
    if (redrawMe) {
        //rows before cursor
        var fullStr = ''
        for (y = 0; y < cursor[1]; y++) {
            var str = '';
            colRow = colArr[y];
            //now, we build up a row of this string's color blocks
            for (x = 0; x < size[0] - 1; x++) {
                if (colRow[x]) {
                    if (colRow[x].length == 3) {
                        //true col mode
                        str += fullCol.bgColor.ansi16m.rgb(colRow[x][0], colRow[x][1], colRow[x][2]) + ' ' + fullCol.bgColor.close;
                    } else {
                        str += chalk['bg' + colRow[x][0]](' ');
                    }
                } else {
                    //this col not defined!
                    str += chalk.bgBlack(' ');
                }
            }
            fullStr += str + '\n';
        }
        //now, cursor row, before cursor
        var cursorRow = '';
        colRow = colArr[cursor[1]]
        for (x = 0; x < cursor[0]; x++) {
            if (colRow[x]) {
                if (colRow[x].length == 3) {
                    //true col mode
                    cursorRow += fullCol.bgColor.ansi16m.rgb(colRow[x][0], colRow[x][1], colRow[x][2]) + ' ' + fullCol.bgColor.close;
                } else {
                    cursorRow += chalk['bg' + colRow[x][0]](' ');
                }
            } else {
                //this col not defined!
                cursorRow += chalk.bgBlack(' ');
            }
        }
        cursorRow += chalk.bgWhite.black('*');
        //cursor row, after cursor
        if (cursor[0] < size[0] - 1) {
            for (x = cursor[0] + 1; x < size[0] - 1; x++) {
                if (colRow[x]) {
                    if (colRow[x].length == 3) {
                        //true col mode
                        cursorRow += fullCol.bgColor.ansi16m.rgb(colRow[x][0], colRow[x][1], colRow[x][2]) + ' ' + fullCol.bgColor.close;
                    } else {
                        cursorRow += chalk['bg' + colRow[x][0]](' ');
                    }
                } else {
                    //this col not defined!
                    cursorRow += chalk.bgBlack(' ');
                }
            }
        }
        fullStr += cursorRow + '\n';
        //rows after cursor
        if (cursor[1] < size[1] - 2) {
            for (y = cursor[1] + 1; y < size[1] - 1; y++) {
                //note: The last row is the UI. So we don't draw that row
                var str = '';
                colRow = colArr[y];
                //now, we build up a row of this string's color blocks
                for (x = 0; x < size[0] - 1; x++) {
                    if (colRow[x]) {
                        if (colRow[x].length == 3) {
                            //true col mode
                            str += fullCol.bgColor.ansi16m.rgb(colRow[x][0], colRow[x][1], colRow[x][2]) + ' ' + fullCol.bgColor.close;
                        } else {
                            str += chalk['bg' + colRow[x][0]](' ');
                        }
                    } else {
                        //this col not defined!
                        str += chalk.bgBlack('x');
                    }
                }
                fullStr += str + '\n';
            }
        }
        fullStr += 'Current color: ' + currColor + ' | Cursor position:' + cursor;
        console.log(fullStr);
        redrawMe = false;
    }
}, 50)

//http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion Thanks!

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, l];
}
// module.exports = { drawImg: drawImg };
