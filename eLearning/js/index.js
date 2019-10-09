var candies = Array.from(document.querySelectorAll('.candy'));
var hand = document.querySelector('.hand');
var message = document.querySelector('.no-more-candies');
var isActive = false;
var count = 1;

function handleClick() {var _this = this;
  if (!isActive) {
    isActive = true;
    count = count + 1;
    hand.classList.remove('grab');
    var rect = this.getBoundingClientRect();
    var top = rect.y + rect.height / 2 - 30;
    var left = rect.x + rect.width / 2 - 50;
    hand.style.cssText = 'left: ' + left + 'px; top: ' + top + 'px';
    var grab = setTimeout(function () {
      hand.classList.add('grab');
      window.clearTimeout(grab);
    }, 500);
    var pull = setTimeout(function () {
      hand.style.cssText = 'left: ' + left + 'px; top: 100%';
      _this.style.top = window.innerHeight + 'px';
      window.clearTimeout(pull);
      isActive = false;
      if (count > candies.length) {
        message.style.display = 'flex';
        message.classList.add('animated');
      }
    }, 600);
  }
}

candies.forEach(function (candy, i) {
  candy.addEventListener('click', handleClick);
  var appear = setTimeout(function () {
    candy.classList.add('visible', 'zoomIn', 'animated');
  }, i * 90);
});