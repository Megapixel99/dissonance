module.exports = function (count, k) {
  const sym = '1234567890';
  let str = '';

  while (str.length < 10) {
    str += sym[parseInt(Math.random() * (sym.length))];
  }
  return str;
};
