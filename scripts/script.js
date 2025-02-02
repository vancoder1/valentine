$(document).ready(function(){
    const phrases = ['pleasee🥺', 'I beg you', ':c', ':\'(', 'pleaseee Moaa🥺', 'I know you want it..',
        'pretty pleasee🥺', 'babe pleaseee🥺'
    ];
    let multiplier = 2;
    let font_size = 16;
    $('#no-btn').click(function() {
        if (font_size >= 200) {
            $('#no-btn').css('display', 'none');
        }
        font_size += multiplier;
        multiplier *= 2;
        $('#yes-btn').css('font-size', `${font_size}px`);
        $('#no-btn').text(phrases[Math.floor(Math.random() * phrases.length)]);
    });
});