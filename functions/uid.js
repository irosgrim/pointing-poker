let IDX = 36;
let HEX = '';
while (IDX--) HEX += IDX.toString(36);

module.exports = function uid(len) {
  let str = '', num = len || 11;
  while (num--) str += HEX[Math.random() * 36 | 0];
  return str;
}