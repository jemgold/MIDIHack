function isMobileSafari() {
  return navigator.userAgent.match(/(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i);
}


Router.configure({
  debug: true
});

Router.map(function() {
  this.route('gyro', {path: '/', action: function() {
    if (isMobileSafari()) {
      this.render();
    }
    else {
      this.render('notSupported');
    }
  }});
  this.route('config');
  this.route('members');
});
