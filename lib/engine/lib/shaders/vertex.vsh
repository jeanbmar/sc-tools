attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_projection;
uniform vec2 u_offset;

varying vec2 v_texcoord;

void main() {
    gl_Position = u_projection * vec4(a_position.x + u_offset.x, a_position.y + u_offset.y, a_position.zw);
    v_texcoord = a_texcoord;
}
