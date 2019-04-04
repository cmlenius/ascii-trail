let output = document.querySelector("output") || document.body.appendChild(document.createElement("output"));
let canvas = document.createElement("canvas").getContext("2d");

let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%/|\\()#?!\"'“”‘’;:***+•—-_..... ";
let chars = {
        list: Array.from(characters),
        map: new Map(Array.from(characters).map(function (a, b) {
            return [a, b]
        })),
        length: characters.length
    },
    ctx = {
        char_width: 9.6,
        line_height: 18,
        aspect_ratio: 9.6 / 18
    };

let SPACE = chars.map.get(" ");

let ascii_grid = [],
    max_rows = 0,
    max_cols = 0,
    rad = 0;


let cursor = {
    x: 0,
    y: 0,
    px: -1,
    py: -1,
};

function circle(grid, cursor_row, cursor_col, radius, value) {
    let start_row = Math.max(cursor_col - radius, 0),
        start_col = Math.max(cursor_row - radius, 0),
        end_row = Math.min(cursor_col + radius + 1, grid.length),
        end_col = Math.min(cursor_row + radius + 1, grid[0].length);

    for (let row = start_row; row < end_row; row++) {
        for (let col = start_col; col < end_col; col++) {
            // Checking if the point is within the radius
            if (Math.pow(col - cursor_row, 2) + Math.pow((row - cursor_col) / ctx.aspect_ratio, 2) < radius * radius && (col + row % 2) % 2 === 0) {
                grid[row][col] = value;
            }
        }
    }
}

function resizeGrid(grid, rows, cols, value) {
    grid.length = Math.min(rows, grid.length);

    for (let row = 0; row < grid.length; row++) {
        if (grid[row].length > cols) {
            grid[row].length = cols;
        } else {
            for (let col = grid[row].length; col < cols; col++)
                grid[row][col] = value;
        }
    }

    for (; grid.length < rows;)
        grid.push(new Array(cols).fill(value))
}

function resize(c, r) {
    max_cols = c;
    max_rows = r;
    resizeGrid(ascii_grid, max_rows, max_cols, SPACE);
    canvas.canvas.width = max_cols;
    canvas.canvas.height = Math.ceil(max_rows / ctx.aspect_ratio);

    // Remove or Add rows
    for (; output.childNodes.length > max_rows;)
        output.removeChild(output.lastChild);

    for (; output.childNodes.length < max_rows;)
        output.appendChild(document.createElement("span"));
}


function main() {

    // Check if window has been resized
    let c = Math.ceil(window.innerWidth / ctx.char_width),
        r = Math.ceil(window.innerHeight / ctx.line_height);
    if (c !== max_cols || r !== max_rows) resize(c, r);

    // Cursor Trail
    let cur_col = Math.floor(cursor.x / ctx.char_width),
        cur_row = Math.floor(cursor.y / ctx.line_height),
        distance_moved = Math.sqrt(Math.pow(cursor.px - cursor.x, 2) + Math.pow(cursor.py - cursor.y, 2));
    rad += 0.03 * (0.5 * distance_moved - rad);
    rad = Math.min(rad, 15);
    if (rad > 0) circle(ascii_grid, cur_col, cur_row, Math.floor(rad), chars.map.get("0"));


    // Fill spans with values
    for (let row = 0; row < max_rows; row++) {
        let cur_span = output.childNodes[row],
            len = ascii_grid[row].length,
            str = "";
        for (let col = 0; col < len; col++) {
            str += chars.list[ascii_grid[row][col]] || " ";
        }
        if (cur_span.innerHTML !== str) cur_span.innerHTML = str;
    }

    // Update values for animation
    for (let row = 0; row < max_rows; row++) {
        for (let col = 0; col < max_cols; col++) {
            if (ascii_grid[row][col] !== SPACE) {
                ascii_grid[row][col] = ++ascii_grid[row][col];
            }
        }
    }

    // Reset prev cursor position
    cursor.px = cursor.x;
    cursor.py = cursor.y;

    requestAnimationFrame(main);
}


function setup() {
    let tmp = document.createElement("div");
    tmp.style.cssText = "display:block;white-space:pre;position:absolute;";
    tmp.innerHTML = "X".repeat(100) + "\n";
    tmp.innerHTML += "X\n".repeat(99);
    document.body.appendChild(tmp);

    ctx.char_width = tmp.offsetWidth / 100;
    ctx.line_height = tmp.offsetHeight / 100;
    ctx.aspect_ratio = ctx.char_width / ctx.line_height;
    document.body.removeChild(tmp);

    output.classList.add("disable-scroll");

    for (; output.childNodes.length < Math.ceil(window.innerHeight / ctx.line_height);) {
        output.appendChild(document.createElement("span"));
    }
    requestAnimationFrame(main);
}

document.addEventListener("mousemove", function (e) {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
});


document.addEventListener("click", function (e) {

});

setup();
