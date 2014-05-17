Router.configure({
  debug: true
});

Router.map(function() {
  this.route('gyro', {path: '/'});
  this.route('config');
});
