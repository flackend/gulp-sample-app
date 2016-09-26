const $ = require('jquery');
const x = require('./x.js');

$('p').on('click', (e) => {
    // console.log('clicked', hat);
    $(e.target).css('color', '#339');
});

console.log(x());