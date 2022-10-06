const fs = require('fs');
const path = require('path');
const gl = require('gl');
const { createOrthographicMatrix } = require('./util.js');

const defaultVertexShaderSource = fs.readFileSync(path.join(__dirname, './shaders/vertex.vsh'), 'utf8');
const defaultFragmentShaderSource = fs.readFileSync(path.join(__dirname, './shaders/fragment.fsh'), 'utf8');

class Stage {
    constructor(options) {
        options = {
            vshSource: defaultVertexShaderSource,
            fshSource: defaultFragmentShaderSource,
            ...options,
        };
        this.xMin = 0;
        this.xMax = 1;
        this.yMin = 0;
        this.yMax = 1;
        this.glContext = gl(this.getWidth(), this.getHeight(), options.contextAttributes);
        const vertexShader = this.glContext.createShader(this.glContext.VERTEX_SHADER);
        const fragmentShader = this.glContext.createShader(this.glContext.FRAGMENT_SHADER);
        const shaderProgram = this.glContext.createProgram();
        this.glContext.shaderSource(vertexShader, options.vshSource);
        this.glContext.compileShader(vertexShader);
        this.glContext.shaderSource(fragmentShader, options.fshSource);
        this.glContext.compileShader(fragmentShader);
        this.glContext.attachShader(shaderProgram, vertexShader);
        this.glContext.attachShader(shaderProgram, fragmentShader);
        this.glContext.linkProgram(shaderProgram);
        this.glContext.useProgram(shaderProgram);
        this.shaderProgram = shaderProgram;

        // retrieve locations
        this.positionLocation = this.glContext.getAttribLocation(shaderProgram, 'a_position');
        this.texcoordLocation = this.glContext.getAttribLocation(shaderProgram, 'a_texcoord');
        this.textureLocation = this.glContext.getUniformLocation(shaderProgram, 'u_texture');
        this.offsetLocation = this.glContext.getUniformLocation(shaderProgram, 'u_offset');
        this.projectionLocation = this.glContext.getUniformLocation(this.shaderProgram, 'u_projection');
        this.glContext.uniform1i(this.textureLocation, 0);
        this.glTextures = new Map();

        // create buffers
        this.positionBuffer = this.glContext.createBuffer();
        this.texcoordBuffer = this.glContext.createBuffer();
        this.indexBuffer = this.glContext.createBuffer();

        // init
        this.clear();
    }

    getGlContext() {
        return this.glContext;
    }

    getWidth() {
        return Math.trunc(this.xMax - this.xMin);
    }

    getHeight() {
        return Math.trunc(this.yMax - this.yMin);
    }

    resetBounds() {
        this.xMin = 0;
        this.xMax = 1;
        this.yMin = 0;
        this.yMax = 1;
        this.resize();
    }

    ensureBounds(x, y) {
        let resize = false;
        if (x < this.xMin) {
            this.xMin = x;
            resize = true;
        }
        if (x > this.xMax) {
            this.xMax = x;
            resize = true;
        }
        if (y < this.yMin) {
            this.yMin = y;
            resize = true;
        }
        if (y > this.yMax) {
            this.yMax = y;
            resize = true;
        }
        if (resize) {
            this.resize();
        }
    }

    resize() {
        const ext = this.glContext.getExtension('STACKGL_resize_drawingbuffer');
        ext.resize(this.getWidth(), this.getHeight());

        // Tell WebGL how to convert from clip space to pixels
        this.glContext.viewport(0, 0, this.getWidth(), this.getHeight());

        // init and set projection matrix
        const matrix = createOrthographicMatrix(0, this.getWidth(), this.getHeight(), 0, -1, 1);
        this.glContext.uniformMatrix4fv(this.projectionLocation, false, matrix);
    }

    bindTexture(texture) {
        const tex = this.glContext.createTexture();
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, tex);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_WRAP_S, this.glContext.CLAMP_TO_EDGE);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_WRAP_T, this.glContext.CLAMP_TO_EDGE);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_MAG_FILTER, this.glContext.LINEAR);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_MIN_FILTER, this.glContext.LINEAR);
        this.glContext.texImage2D(this.glContext.TEXTURE_2D, 0, this.glContext.RGBA, this.glContext.RGBA, this.glContext.UNSIGNED_BYTE, texture);
        this.glTextures.set(texture, tex);
    }

    draw(texture, positions, texcoords, triangles) {
        // select texture
        if (!this.glTextures.has(texture)) {
            this.bindTexture(texture);
        }
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, this.glTextures.get(texture));

        // turn on position
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.positionBuffer);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(positions), this.glContext.STATIC_DRAW);
        this.glContext.enableVertexAttribArray(this.positionLocation);
        this.glContext.vertexAttribPointer(this.positionLocation, 2, this.glContext.FLOAT, false, 0, 0);

        // turn on texcoord
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.texcoordBuffer);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(texcoords), this.glContext.STATIC_DRAW);
        this.glContext.enableVertexAttribArray(this.texcoordLocation);
        this.glContext.vertexAttribPointer(this.texcoordLocation, 2, this.glContext.FLOAT, false, 0, 0);

        // turn on indices
        this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.glContext.bufferData(this.glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangles), this.glContext.STATIC_DRAW);

        // translate to 0,0 coordinates
        this.glContext.uniform2fv(this.offsetLocation, [-(this.xMin), -(this.yMin)]);

        // draw
        this.glContext.drawElements(this.glContext.TRIANGLES, triangles.length, this.glContext.UNSIGNED_SHORT, 0);
    }

    clear() {
        // Clear the canvas
        this.glContext.clearColor(0, 0, 0, 0);
        this.glContext.clear(this.glContext.COLOR_BUFFER_BIT);
        this.glContext.disable(this.glContext.DEPTH_TEST);
        this.glContext.disable(this.glContext.CULL_FACE);
        this.glContext.disable(this.glContext.DITHER);
        this.glContext.disable(this.glContext.POLYGON_OFFSET_FILL);
        this.glContext.disable(this.glContext.STENCIL_TEST);
        this.glContext.disable(this.glContext.SAMPLE_ALPHA_TO_COVERAGE);
        this.glContext.disable(this.glContext.SAMPLE_COVERAGE);
        this.glContext.depthMask(this.glContext.NONE);
        this.glContext.disable(this.glContext.SCISSOR_TEST);
        this.glContext.enable(this.glContext.BLEND);
        this.glContext.blendEquation(this.glContext.FUNC_ADD);
        this.glContext.blendFunc(this.glContext.SRC_ALPHA, this.glContext.ONE_MINUS_SRC_ALPHA);
    }

    destroy() {
        this.glContext.getExtension('STACKGL_destroy_context').destroy();
    }
}

module.exports = Stage;
