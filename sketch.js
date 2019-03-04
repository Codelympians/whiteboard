let nodes = [null]
let textboxes = []
let isErasorOn = false
const erasorRadius = 32

/* TODO:
 * - turn vertex mode into line mode
 */

class VertexNode {
    /**
     * Creates a new VertexNode
     * @param {Number} x 
     * @param {Number} y 
     * @param {Boolean} isCurveVertex 
     */
    constructor(x, y, isCurveVertex) {
        this.x = x
        this.y = y
        this.isCurveVertex = isCurveVertex
    }
}

class Textbox {
    /**
     * Creates a new Textbox
     * @param {String} initialText 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(initialText, x, y) {
        this.x = x
        this.y = y
        this.text = initialText
    }
}

/**
 * Test if the current node corresponds to an endShape()
 * (no side effects)
 * @param {*} node 
 */
function isEnded(node) {
    if (node === null) {
        return true
    }
    return false
}

/**
 * Test if the array is empty
 * (no side effects)
 * @param {Array} array 
 */
function isArrayEmpty(array) {
    if (array.length === 0) {
        return true
    }
    return false
}

/**
 * Add a new VertexNode to the nodes array with mouse position
 * 
 * @param {Boolean} isCurveVertex 
 */
function addNewVertexAtCursor(isCurveVertex) {
    nodes.push(new VertexNode(mouseX, mouseY, isCurveVertex))
}

function addEndShape() {
    nodes.push(null)
}

/**
 * Determine if the given key is pressed
 * (no side effects)
 * @param {String} key 
 */
function isThisKeyPressed(testKey) {
    return keyIsPressed && key === testKey
}

/**
 * Erase
 */
function eraseAtCursor() {
    for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i] === null) {
            continue
        }

        const deltaX = nodes[i].x - mouseX
        const deltaY = nodes[i].y - mouseY

        // Use the Pythagorean Theorem to detect circle collision
        if (sqrt(deltaX * deltaX + deltaY * deltaY) <= erasorRadius) {
            nodes[i] = null
        }
    }

    for (let i = textboxes.length - 1; i >= 0; i--) {
        const deltaX = textboxes[i].x - mouseX
        const deltaY = textboxes[i].y - mouseY

        // Use the Pythagorean Theorem to detect circle collision
        if (sqrt(deltaX * deltaX + deltaY * deltaY) <= erasorRadius) {
            textboxes.splice(i, 1)
        }
    }
}

function nullPurge(array) {
    let isOnStreak = false
    for (let i = nodes.length - 1; i >= 0; i--) {
        if (isOnStreak) {
            if (nodes[i] === null) {
                array.splice(i, 1)
            } else {
                isOnStreak = false
            }
        } else if (nodes[i] === null) {
            isOnStreak = true
        }
    }
}

/**
 * If the input string is null, 
 * @param {String} input 
 */
function sanitizeString(input) {
    return input ? input : ""
}

// MARK: User Events

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function draw() {
    background(240)
    stroke(0)
    strokeWeight(8)
    noFill()

    beginShape()
    endShape()

    /* Draw whiteboard content */

    nullPurge(nodes)

    for (let nodeIndex in nodes) {
        const node = nodes[nodeIndex]

        if (node === null) {
            endShape()
        } else {
            // Test whether beginShape is required

            let doesRequireBegin = false
            if (nodeIndex === 0) {
                doesRequireBegin = true
            } else if (isEnded(nodes[nodeIndex - 1])) {
                doesRequireBegin = true
            }

            if (doesRequireBegin) {
                // Draw a point at the beginning
                beginShape(POINTS)
                vertex(node.x, node.y)
                endShape()
                
                // Begin drawing vectors
                beginShape()
            }

            // Draw the vertex

            if (node.isCurveVertex) {
                //curveVertex(node.x, node.y)
                vertex(node.x, node.y)
            } else {
                vertex(node.x, node.y)
            }
        }
    }

    endShape()

    /* Draw current edit */

    if (isErasorOn) {

        stroke(255, 128, 255)
        strokeWeight(4)
        ellipse(mouseX, mouseY, erasorRadius * 2, erasorRadius * 2)

    } else {

        const finalNode = nodes[nodes.length - 1]
        stroke(0, 0, 255)

        if (nodes.length === 0 || isEnded(finalNode)) {
            beginShape(POINTS)
        } else {
            beginShape()
            vertex(finalNode.x, finalNode.y)
        }

        vertex(mouseX, mouseY)
        endShape()

    }

    noStroke()

    /* Render text boxes */

    for (let textbox of textboxes) {
        fill(0)
        textSize(32)

        textAlign(CENTER, TOP)
        text(`Δ`, textbox.x, textbox.y)

        textAlign(CENTER, BOTTOM)
        text(textbox.text, textbox.x, textbox.y)
    }

    /* Title text */

    fill(100)
    textAlign(LEFT, TOP)
    textSize(24)
    text(`WhiteboardJS`, 16, 16)

    /* Update and show FPS */

    fpsEngine.updateFPS()
    fpsEngine.showFPS(100, 100, 100)

    /* UI */

    fill(40, 200)
    rectMode(RADIUS)
    rect(windowWidth / 2, 0, 240, 64)
    rectMode(CORNER)

    fill(255)
    textAlign(CENTER, TOP)
    textSize(20)

    function keyFlashGray(testKey) {
        fill(isThisKeyPressed(testKey) ? 128 : 255)
    }

    keyFlashGray(`1`)
    text(`1`, windowWidth / 2 - 200, 12)
    keyFlashGray(`2`)
    text(`2`, windowWidth / 2 - 120, 12)
    //keyFlashGray(`3`)
    text(`3`, windowWidth / 2 - 40, 12)
    keyFlashGray(` `)
    text(`space`, windowWidth / 2 + 180, 12)

    fill(255)
    textAlign(CENTER, CENTER)
    textSize(12)

    keyFlashGray(`1`)
    text(`Vertex`, windowWidth / 2 - 200, 48)
    keyFlashGray(`2`)
    text(`End Shape`, windowWidth / 2 - 120, 48)
    //keyFlashGray(`3`)
    text(`Text`, windowWidth / 2 - 40, 48)

    textAlign(RIGHT, CENTER)
    const markerRG = isErasorOn ? 255 : 128
    fill(markerRG, markerRG, 255)
    text(`Marker `, windowWidth / 2 + 180, 48)

    textAlign(CENTER, CENTER)
    fill(200)
    text(`|`, windowWidth / 2 + 180, 48)

    textAlign(LEFT, CENTER)
    const erasorG = isErasorOn ? 128 : 255
    fill(255, erasorG, 255)
    text(` Erasor`, windowWidth / 2 + 180, 48)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function keyPressed() {
    switch (key) {
        case ("1"): // vertex
            addNewVertexAtCursor(false)
            break
        case ("2"): // endShape
            addEndShape()
            break
        case ("3"): // textbox
            textboxes.push(new Textbox(sanitizeString(prompt("Please enter text for the textbox")), mouseX, mouseY))
            break
        case (" "): // toggle erasor
            isErasorOn = !isErasorOn
            addEndShape()
            break
    }
}

function mousePressed() {
    isErasorOn ? eraseAtCursor() : addNewVertexAtCursor(true)
}

function mouseDragged() {
    isErasorOn ? eraseAtCursor() : addNewVertexAtCursor(true)
}

function mouseReleased() {
    isErasorOn ? eraseAtCursor() : addNewVertexAtCursor(true)
    addEndShape()
}